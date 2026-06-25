import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getAllBooks } from "../storage/booksDB"
import { getPageContent, getTotalChars } from "../engine/pagination"
import { ArrowLeft } from "lucide-react"

function renderParagraph(para, i) {
  switch (para.type) {
    case "title":
      return <h2 key={i} className="reader-para-title">{para.content}</h2>
    case "subtitle":
      return <h3 key={i} className="reader-para-subtitle">{para.content}</h3>
    case "p":
      return <p key={i} className="reader-para-p">{para.content}</p>
    case "empty-line":
      return <div key={i} className="reader-para-empty" />
    case "epigraph":
      return <p key={i} className="reader-para-epigraph">{para.content}</p>
    case "poem":
      return <pre key={i} className="reader-para-poem">{para.content}</pre>
    case "cite":
      return <blockquote key={i} className="reader-para-cite">{para.content}</blockquote>
    case "chapter-title":
      return <h2 key={i} className="reader-chapter-title">{para.content}</h2>
    default:
      return <p key={i} className="reader-para-p">{para.content}</p>
  }
}

function ReaderPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [pageItems, setPageItems] = useState([])
  const [currentOffset, setCurrentOffset] = useState(0)
  const [nextOffset, setNextOffset] = useState(0)
  const [totalChars, setTotalChars] = useState(0)
  const [uiVisible, setUiVisible] = useState(true)

  const offsetStack = useRef([])
  const readerRef = useRef(null)
  const touchX = useRef(null)
  const touchStartX = useRef(null)

  const loadPage = useCallback((bookData, fromChar) => {
    const el = readerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const height = Math.round(rect.height)
    const content = getPageContent(bookData, fromChar, height)
    setPageItems(content.items)
    setCurrentOffset(fromChar)
    setNextOffset(content.nextChar)

  }, [])

  useEffect(() => {
    getAllBooks().then((books) => {
      const found = books.find((b) => b.id === id)
      setBook(found || null)
      if (found) {
        const total = getTotalChars(found)
        setTotalChars(total)
      }
    })
  }, [id])

  useEffect(() => {
    if (book && readerRef.current) {
      loadPage(book, 0)
    }
  }, [book, loadPage])

  const goNext = useCallback(() => {
    if (!book || nextOffset >= totalChars) return
    offsetStack.current.push(currentOffset)
    loadPage(book, nextOffset)
  }, [book, nextOffset, totalChars, currentOffset, loadPage])

  const goPrev = useCallback(() => {
    if (offsetStack.current.length === 0) return
    const prev = offsetStack.current.pop()
    loadPage(book, prev)
  }, [book, loadPage])

  function handleTouchStart(e) {
    touchX.current = e.touches[0].clientX
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e) {
    const endX = e.changedTouches[0].clientX
    const dx = endX - touchX.current
    const startX = touchStartX.current
    const screenW = window.innerWidth

    if (Math.abs(dx) > 50) {
      if (dx < 0) goNext()
      else goPrev()
      return
    }

    const relX = startX / screenW
    if (relX < 0.33) {
      goPrev()
    } else if (relX > 0.66) {
      goNext()
    } else {
      setUiVisible((v) => !v)
    }
  }

  if (!book) {
    return (
      <div className="reader-page">
        <div className="reader-loading">Загрузка...</div>
      </div>
    )
  }

  const pageNum = totalChars > 0 ? Math.floor((currentOffset / totalChars) * 100) + 1 : 1

  return (
    <div className="reader-page"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className={`reader-header ${uiVisible ? "" : "reader-header--hidden"}`}>
        <button className="reader-back" onClick={() => navigate(`/book/${id}`)}>
          <ArrowLeft size={24} />
        </button>
        <p className="reader-header-title">{book.title}</p>
      </div>

      <div className="reader-content" ref={readerRef}>
        {pageItems.map((item, index) => renderParagraph(item, index))}
      </div>

      <div className={`reader-footer ${uiVisible ? "" : "reader-footer--hidden"}`}>
        <button
          className="reader-nav-btn"
          disabled={offsetStack.current.length === 0}
          onClick={(e) => { e.stopPropagation(); goPrev() }}
        >
          ← Previous
        </button>
        <span className="reader-page-num">~{pageNum}%</span>
        <button
          className="reader-nav-btn"
          disabled={nextOffset >= totalChars}
          onClick={(e) => { e.stopPropagation(); goNext() }}
        >
          Next →
        </button>
      </div>
    </div>
  )
}

export default ReaderPage
