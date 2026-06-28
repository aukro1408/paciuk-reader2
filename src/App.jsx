import { useEffect } from "react"
import { Routes, Route } from "react-router-dom"
import Library from './pages/Library'
import BookPage from './pages/BookPage'
import ReaderPage from './pages/ReaderPage'
import SettingsPage from './pages/SettingsPage'
import StatisticsPage from './pages/StatisticsPage'
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
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/stats" element={<StatisticsPage />} />
    </Routes>
  )
}

export default App