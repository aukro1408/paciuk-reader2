import { useEffect } from "react"
import { Routes, Route } from "react-router-dom"
import Library from './pages/Library'
import BookPage from './pages/BookPage'
import ReaderPage from './pages/ReaderPage'
import { initDB } from "./storage/booksDB"

function App() {
  useEffect(() => {
    initDB()
  }, [])

  return (
    <Routes>
      <Route path="/" element={<Library />} />
      <Route path="/book/:id" element={<BookPage />} />
      <Route path="/reader/:id" element={<ReaderPage />} />
    </Routes>
  )
}

export default App