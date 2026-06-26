import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Search } from "lucide-react"
import { getAllBooks } from "../storage/booksDB"

const FALLBACK_GRADIENT = "linear-gradient(135deg,#7B61FF,#5B8DFF)"

function SearchBar() {
  const [query, setQuery] = useState("")
  const [books, setBooks] = useState([])
  const [results, setResults] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const ref = useRef(null)

  useEffect(() => {
    getAllBooks().then((all) => setBooks(all.filter((b) => !b.hidden)))
  }, [])

  useEffect(() => {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) {
      setResults([])
      setIsOpen(false)
      return
    }

    const filtered = books.filter((book) => {
      const title = (book.title || "").toLowerCase()
      const author = (book.authors || []).join(" ").toLowerCase()
      return title.includes(trimmed) || author.includes(trimmed)
    })

    setResults(filtered.slice(0, 5))
    setIsOpen(true)
  }, [query, books])

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function handleSelect(bookId) {
    setIsOpen(false)
    setQuery("")
    navigate(`/book/${bookId}`)
  }

  return (
    <div className="search-bar" ref={ref}>
      <div className="search-box">
        <Search size={18} className="search-icon" />
        <input
          type="search"
          placeholder="Поиск книги..."
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {isOpen && (
        <div className="search-dropdown">
          {results.length === 0 ? (
            <div className="search-dropdown-empty">Ничего не найдено</div>
          ) : (
            results.map((book) => (
              <div key={book.id} className="search-result" onClick={() => handleSelect(book.id)}>
                <div
                  className="search-result-cover"
                  style={
                    book.coverImage
                      ? { backgroundImage: `url(${book.coverImage})`, backgroundSize: "cover", backgroundPosition: "center" }
                      : { background: FALLBACK_GRADIENT }
                  }
                />
                <div className="search-result-info">
                  <p className="search-result-title">{book.title}</p>
                  <p className="search-result-author">{book.authors?.join(", ") || ""}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar
