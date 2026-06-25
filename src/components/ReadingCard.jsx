import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getAllBooks } from "../storage/booksDB"

function ReadingCard() {
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [progress, setProgress] = useState(null)

  useEffect(() => {
    const lastId = localStorage.getItem("lastOpenedBookId")
    if (!lastId) return

    getAllBooks().then((books) => {
      const found = books.find((b) => b.id === lastId)
      if (found) setBook(found)
    })

    try {
      const raw = localStorage.getItem(`reading_progress_${lastId}`)
      if (raw) setProgress(JSON.parse(raw))
    } catch {}
  }, [])

  if (!book) return null

  const progressPercent = progress
    ? Math.round((progress.currentPage / progress.totalPages) * 100)
    : 0

  const startPage = progress?.currentPage || 1

  return (
    <div className="reading-card">
      <div className="reading-card-circles">
        <div className="reading-card-circle reading-card-circle--top" />
        <div className="reading-card-circle reading-card-circle--bottom" />
      </div>
      <div className="reading-card-body">
        <div
          className="reading-card-cover"
          style={
            book.coverImage
              ? { backgroundImage: `url(${book.coverImage})`, backgroundSize: "cover", backgroundPosition: "center" }
              : {}
          }
        />
        <div className="reading-card-info">
          <h3 className="reading-card-title">{book.title}</h3>
          <p className="reading-card-author">{book.authors?.[0] || ""}</p>
          <p className="reading-card-progress-text">{progressPercent}% прочитано</p>
          <div className="reading-card-bar">
            <div className="reading-card-bar-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <button className="reading-card-btn" onClick={() => navigate(`/reader/${book.id}`, { state: { startPage } })}>
            Продолжить чтение
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReadingCard
