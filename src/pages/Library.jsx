import Header from "../components/Header"
import BottomNav from "../components/BottomNav"
import ReadingCard from "../components/ReadingCard"
import BooksGrid from "../components/BooksGrid"

function Library() {
  return (
    <div className="library">

      <Header />

      <ReadingCard />

      <BooksGrid />

      <BottomNav />

    </div>
  )
}

export default Library