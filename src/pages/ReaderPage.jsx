import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getAllBooks } from "../storage/booksDB"
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
    default:
      return <p key={i} className="reader-para-p">{para.content}</p>
  }
}

function ReaderPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)

  useEffect(() => {
    getAllBooks().then((books) => {
      const found = books.find((b) => b.id === id)
      setBook(found || null)
      if (found) {
        console.log(found.chapters)
      }
    })
  }, [id])

  if (!book) {
    return (
      <div className="reader-page">
        <div className="reader-loading">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="reader-page">
      <div className="reader-header">
        <button className="reader-back" onClick={() => navigate(`/book/${id}`)}>
          <ArrowLeft size={24} />
        </button>
        <p className="reader-header-title">{book.title}</p>
      </div>
      <div className="reader-content">
        {book.chapters.map((chapter, ci) => (
          <div key={chapter.id || ci} className="reader-chapter">
            {chapter.title && <h2 className="reader-chapter-title">{chapter.title}</h2>}
            {chapter.paragraphs.map((para, pi) => renderParagraph(para, pi))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ReaderPage
