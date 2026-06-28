import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getAllBooks, saveBook, deleteBook } from "../storage/booksDB"
import BookMenu from "./BookMenu"

const gradients = [
  "linear-gradient(135deg,#FF6B6B,#C44AFF)",
  "linear-gradient(135deg,#4A7BFF,#35B6FF)",
  "linear-gradient(135deg,#FF8A65,#FF4081)",
  "linear-gradient(135deg,#7B61FF,#5B8DFF)",
  "linear-gradient(135deg,#FFD54F,#FF8A65)",
  "linear-gradient(135deg,#E040FB,#7C4DFF)",
  "linear-gradient(135deg,#43E97B,#38F9D7)",
  "linear-gradient(135deg,#FA709A,#FEE140)",
]

function fallbackGradient(id) {
  return gradients[(id?.length || 0) % gradients.length]
}

function BooksGrid() {
  const navigate = useNavigate()
  const [books, setBooks] = useState([])
  const [ready, setReady] = useState(false)
  const [progressMap, setProgressMap] = useState({})

  useEffect(() => {
    getAllBooks().then((all) => {
      const visible = all.filter((b) => !b.hidden)
      setBooks(visible)
      // Load reading progress from localStorage for each book
      const map = {}
      visible.forEach((book) => {
        try {
          const raw = localStorage.getItem(`reading_progress_${book.id}`)
          if (raw) {
            const saved = JSON.parse(raw)
            if (saved.currentPage && saved.totalPages) {
              map[book.id] = Math.round((saved.currentPage / saved.totalPages) * 100)
            }
          }
        } catch {
          // ignore invalid data
        }
      })
      setProgressMap(map)
      setReady(true)
    })
  }, [])

  if (!ready) return null

  function handleHide(book) {
    saveBook({ ...book, hidden: true }).then(() => {
      setBooks((prev) => prev.filter((b) => b.id !== book.id))
    })
  }

  function handleDelete(book) {
    deleteBook(book.id).then(() => {
      setBooks((prev) => prev.filter((b) => b.id !== book.id))
    })
  }

  return (
    <section className="books-grid">
      <div className="books-grid-header">
        <h2 className="books-grid-title">Коллекция</h2>
        <span className="books-grid-count">{books.length} книг</span>
      </div>
      <div className="books-grid-list">
        {books.map((book) => (
          <div key={book.id} className="book-card" onClick={() => navigate(`/book/${book.id}`)}>
            <div
              className="book-card-cover"
              style={
                book.coverImage
                  ? { backgroundImage: `url(${book.coverImage})`, backgroundSize: "cover", backgroundPosition: "center" }
                  : { background: fallbackGradient(book.id) }
              }
            >
              {book.isNew && <span className="book-card-badge">НОВИНКА</span>}
            
              {progressMap[book.id] > 0 && (
                <div className="book-card-progress">
                  <svg width="28" height="28" viewBox="0 0 28 28">
                    <circle cx="14" cy="14" r="11" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" />
                    <circle
                      cx="14"
                      cy="14"
                      r="11"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeDasharray={`${(progressMap[book.id] / 100) * 69} 69`}
                      strokeLinecap="round"
                      transform="rotate(-90 14 14)"
                    />
                  </svg>
                  <span className="book-card-progress-text">{progressMap[book.id]}%</span>
                </div>
              )}
            </div>
            <BookMenu book={book} onHide={handleHide} onDelete={handleDelete} />
            <p className="book-card-title">{book.title}</p>
            <p className="book-card-author">{book.authors?.join(", ") || ""}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default BooksGrid
