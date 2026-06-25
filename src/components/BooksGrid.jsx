import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getAllBooks } from "../storage/booksDB"

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

  useEffect(() => {
    getAllBooks().then(setBooks)
  }, [])

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
              {book.progress > 0 && (
                <div className="book-card-badge">{book.progress}%</div>
              )}
            </div>
            <p className="book-card-title">{book.title}</p>
            <p className="book-card-author">{book.authors?.join(", ") || ""}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default BooksGrid
