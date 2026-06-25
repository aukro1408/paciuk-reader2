import SearchBar from "./SearchBar"

function Header() {
  return (
    <header className="header">

      <div className="hero-card">
        <div className="hero-paws">
          <img src="/media/paw.png" className="paw paw-1" />
          <img src="/media/paw.png" className="paw paw-2" />
          <img src="/media/paw.png" className="paw paw-3" />
          <img src="/media/paw.png" className="paw paw-4" />
          <img src="/media/paw.png" className="paw paw-5" />
          <img src="/media/paw.png" className="paw paw-6" />
          <img src="/media/paw.png" className="paw paw-7" />
          <img src="/media/paw.png" className="paw paw-8" />
          <img src="/media/paw.png" className="paw paw-9" />
          <img src="/media/paw.png" className="paw paw-10" />
          <img src="/media/paw.png" className="paw paw-11" />
          <img src="/media/paw.png" className="paw paw-12" />
        </div>
        <img className="hero-cat" src="/media/paciuk.png" alt="" />
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