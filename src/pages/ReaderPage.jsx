import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { getAllBooks, saveBook } from "../storage/booksDB"
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
  const location = useLocation()
  const [book, setBook] = useState(null)
  const [pageItems, setPageItems] = useState([])
  const [currentOffset, setCurrentOffset] = useState(0)
  const [nextOffset, setNextOffset] = useState(0)
  const [totalChars, setTotalChars] = useState(0)
  const [uiVisible, setUiVisible] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animDirection, setAnimDirection] = useState(null)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [readingTheme, setReadingTheme] = useState(() => {
    try { return localStorage.getItem("readingTheme") || "default" } catch { return "default" }
  })
  const [nightMode, setNightMode] = useState(() => {
    try { return localStorage.getItem("nightMode") === "true" } catch { return false }
  })

  const offsetStack = useRef([])
  const readerRef = useRef(null)
  const touchX = useRef(null)
  const touchStartX = useRef(null)
  const charsPerPageRef = useRef(0)

  function stopTouch(e) {
    e.stopPropagation()
  }

  function handleThemeChange(theme) {
    setReadingTheme(theme)
    try { localStorage.setItem("readingTheme", theme) } catch {}
  }

  function handleNightToggle() {
    setNightMode((v) => {
      const next = !v
      try { localStorage.setItem("nightMode", next) } catch {}
      return next
    })
  }

  useEffect(() => {
    const colors = { default:"#fff", calm:"#EDE3CF", paper:"#F4F4F0" }
    const bg = nightMode ? "#1E1E1E" : (colors[readingTheme] || "#fff")
    const root = document.getElementById("root")
    if (root) root.style.background = bg
    document.body.style.background = bg
    document.documentElement.style.background = bg
    return () => {
      if (root) root.style.background = ""
      document.body.style.background = ""
      document.documentElement.style.background = ""
    }
  }, [readingTheme, nightMode])

  const loadPage = useCallback((bookData, fromChar) => {
    const el = readerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const height = Math.round(rect.height)
    const content = getPageContent(bookData, fromChar, height)
    setPageItems(content.items)
    setCurrentOffset(fromChar)
    setNextOffset(content.nextChar)
    const consumed = content.nextChar - fromChar
    if (consumed > 0) charsPerPageRef.current = consumed

  }, [])

  useEffect(() => {
    getAllBooks().then((books) => {
      const found = books.find((b) => b.id === id)
      setBook(found || null)
      if (found) {
        const total = getTotalChars(found)
        setTotalChars(total)
        localStorage.setItem("lastOpenedBookId", id)
        if (!found.hasStartedReading) {
          saveBook({ ...found, hasStartedReading: true })
        }
      }
    })
  }, [id])

  useEffect(() => {
    if (!book || !readerRef.current) return

    const navPage = location.state?.startPage
    if (navPage && navPage > 1 && totalChars > 0) {
      try {
        const raw = localStorage.getItem(`reading_progress_${id}`)
        if (raw) {
          const { totalPages } = JSON.parse(raw)
          if (totalPages > 0) {
            const cpp = totalChars / totalPages
            const offset = Math.round((navPage - 1) * cpp)
            loadPage(book, Math.min(offset, totalChars - 1))
            return
          }
        }
      } catch {}
    }

    try {
      const raw = localStorage.getItem(`reading_progress_${id}`)
      if (raw) {
        const { currentPage, totalPages } = JSON.parse(raw)
        if (currentPage > 1 && totalPages > 0 && totalChars > 0) {
          const cpp = totalChars / totalPages
          const offset = Math.round((currentPage - 1) * cpp)
          loadPage(book, Math.min(offset, totalChars - 1))
          return
        }
      }
    } catch {}

    loadPage(book, 0)
  }, [book, loadPage, location.state, id, totalChars])

  useEffect(() => {
    if (!book || totalChars === 0) return
    const cpp = charsPerPageRef.current
    if (!cpp) return
    const page = Math.floor(currentOffset / cpp) + 1
    const totalPages = Math.max(1, Math.ceil(totalChars / cpp))
    try {
      localStorage.setItem(`reading_progress_${id}`, JSON.stringify({ currentPage: page, totalPages }))
    } catch {}
  }, [currentOffset, book, id, totalChars])

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

  const animateTo = useCallback((direction) => {
    if (isAnimating) return
    setIsAnimating(true)
    setAnimDirection(direction)
    setDragX(0)

    setTimeout(() => {
      if (direction === 'left') goNext()
      else goPrev()
      setIsAnimating(false)
      setAnimDirection(null)
    }, 350)
  }, [isAnimating, goNext, goPrev])

  function handleTouchStart(e) {
    if (settingsOpen) return
    touchX.current = e.touches[0].clientX
    touchStartX.current = e.touches[0].clientX
    setDragX(0)
    setIsDragging(true)
  }

  function handleTouchMove(e) {
    if (settingsOpen) return
    if (!touchStartX.current) return
    const currentX = e.touches[0].clientX
    setDragX(currentX - touchStartX.current)
  }

  function handleTouchEnd(e) {
    if (settingsOpen) return
    const endX = e.changedTouches[0].clientX
    const dx = endX - touchX.current
    const startX = touchStartX.current
    const screenW = window.innerWidth

    setIsDragging(false)
    setDragX(0)

    if (Math.abs(dx) > 60) {
      if (dx < 0) animateTo('left')
      else animateTo('right')
      return
    }

    const relX = startX / screenW
    if (relX < 0.33) {
      animateTo('right')
    } else if (relX > 0.66) {
      animateTo('left')
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

  const pageTransform = isAnimating
    ? `translateX(${animDirection === 'left' ? -40 : 40}px) scale(0.97)`
    : isDragging
      ? `translateX(${dragX * 0.3}px)`
      : 'none'

  const pageTransition = isDragging
    ? 'none'
    : 'transform 0.38s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.35s ease'

  return (
    <div className={`reader-page ${readingTheme}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className={`reader-header ${uiVisible ? "" : "reader-header--hidden"}`}>
        <button className="reader-back" onClick={() => navigate(`/book/${id}`)}>
          <ArrowLeft size={24} />
        </button>
        <p className="reader-header-title">{book.title}</p>
        <button className="reader-settings-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSettingsOpen(true); }} onTouchStart={stopTouch} onTouchEnd={stopTouch}>
          Aa
        </button>
      </div>

      <div className="reader-content" ref={readerRef}>
        <div className="reader-page-anim" style={{
          transform: pageTransform,
          opacity: isAnimating ? 0 : 1,
          transition: pageTransition
        }}>
          {pageItems.map((item, index) => renderParagraph(item, index))}
        </div>
      </div>

      <div className={`reader-bottom-panel ${uiVisible ? "" : "reader-bottom-panel--hidden"}`}>
        <div className="reader-bottom-progress-bar">
          <div className="reader-bottom-progress-fill" style={{ width: `${(currentOffset / totalChars) * 100}%` }} />
        </div>
        <p className="reader-bottom-text">{Math.round((currentOffset / totalChars) * 100)}%</p>
      </div>

      {settingsOpen && (
        <div className="reader-settings-overlay" onClick={() => setSettingsOpen(false)} onTouchStart={stopTouch} onTouchEnd={stopTouch}>
          <div className="reader-settings-sheet" onClick={(e) => e.stopPropagation()} onTouchStart={stopTouch} onTouchEnd={stopTouch}>
            <button className="reader-settings-close" onClick={() => setSettingsOpen(false)} onTouchStart={stopTouch}>
              ✕
            </button>
            <h3 className="reader-settings-title">Reading Settings</h3>
            <div className="reader-theme-row">
              {[
                { id:"default", bg:"#FFFFFF", color:"#111111", name:"Default" },
                { id:"calm",    bg:"#EDE3CF", color:"#333333", name:"Calm" },
                { id:"paper",   bg:"#F4F4F0", color:"#333333", name:"Paper" },
              ].map((t) => (
                <button
                  key={t.id}
                  className={`reader-theme-card${readingTheme === t.id ? " reader-theme-card--active" : ""}`}
                  onClick={() => handleThemeChange(t.id)}
                  style={{ background: t.bg }}
                >
                  <span className="reader-theme-aa" style={{ color: t.color }}>Aa</span>
                  <span className="reader-theme-name">{t.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReaderPage
