import { Search } from "lucide-react"

function Header() {
  return (
    <header className="header">

      <div className="hero-card">
        <div className="hero-placeholder" />
        <div className="hero-text">
          <h1 className="hero-title">Paciuk Reader</h1>
          <p className="hero-subtitle">0 книг • 0 читается сейчас</p>
        </div>
      </div>

      <div className="search-box">
        <Search size={18} className="search-icon" />
        <input type="search" placeholder="Поиск книги..." className="search-input" />
      </div>

    </header>
  )
}

export default Header