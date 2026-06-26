import { useState, useEffect } from "react"
import Header from "../components/Header"
import BottomNav from "../components/BottomNav"
import ReadingCard from "../components/ReadingCard"
import BooksGrid from "../components/BooksGrid"

function Library() {
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    function handleRefresh() {
      setRefreshKey((k) => k + 1)
    }
    window.addEventListener("home-refresh", handleRefresh)
    return () => window.removeEventListener("home-refresh", handleRefresh)
  }, [])

  return (
    <div className="library">

      <Header key={`header-${refreshKey}`} />

      <ReadingCard key={`reading-${refreshKey}`} />

      <BooksGrid key={`grid-${refreshKey}`} />

      <BottomNav />

    </div>
  )
}

export default Library
