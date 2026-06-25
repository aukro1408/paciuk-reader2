import SearchBar from "./SearchBar"

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

      <SearchBar />

    </header>
  )
}

export default Header