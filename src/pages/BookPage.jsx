import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getAllBooks } from "../storage/booksDB"
import { ArrowLeft, Heart } from "lucide-react"

function BookPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)

  useEffect(() => {
    getAllBooks().then((books) => {
      const found = books.find((b) => b.id === id)
      setBook(found || null)
    })
  }, [id])

  if (!book) {
    return (
      <div className="book-page">
        <div className="book-page-loading">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="book-page">
      <div
        className="book-page-cover-section"
        style={
          book.coverImage
            ? { backgroundImage: `url(${book.coverImage})` }
            : { background: "linear-gradient(135deg,#7B61FF,#5B8DFF)" }
        }
      >
        <div className="book-page-cover-overlay" />
        <button className="book-page-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <button className="book-page-fav">
          <Heart size={24} />
        </button>
        <div className="book-page-cover-wrapper">
          <div
            className="book-page-cover-img"
            style={
              book.coverImage
                ? { backgroundImage: `url(${book.coverImage})`, backgroundSize: "cover", backgroundPosition: "center" }
                : { background: "linear-gradient(135deg,#7B61FF,#5B8DFF)" }
            }
          />
        </div>
      </div>

      <div className="book-page-info">
        <h1 className="book-page-title">{book.title}</h1>
        <p className="book-page-author">{book.authors?.[0] || ""}</p>
        <span className="book-page-pages">398 стр</span>

        <div className="book-page-progress">
          <div className="book-page-progress-left">
            <p className="book-page-progress-label">Прогресс чтения</p>
            <p className="book-page-progress-sub">Продолжайте с того же места</p>
          </div>
          <div className="book-page-progress-circle">
            <svg width="52" height="52" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="22" fill="none" stroke="#eee" strokeWidth="4" />
              <circle
                cx="26"
                cy="26"
                r="22"
                fill="none"
                stroke="#4A7BFF"
                strokeWidth="4"
                strokeDasharray={`${(book.progress / 100) * 138} 138`}
                strokeLinecap="round"
                transform="rotate(-90 26 26)"
              />
            </svg>
            <span className="book-page-progress-text">{book.progress}%</span>
          </div>
        </div>

        <div className="book-page-desc">
          <h3 className="book-page-desc-title">Описание</h3>
          <p className="book-page-desc-text">{book.description || "Описание отсутствует"}</p>
        </div>

        <button className="book-page-btn" onClick={() => navigate(`/reader/${id}`)}>Продолжить чтение</button>
      </div>
    </div>
  )
}

export default BookPage
