import { Home, Plus, Settings } from "lucide-react"
import { useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import JSZip from "jszip"
import { parseFb2 } from "../parser/fb2Parser"
import { saveBook } from "../storage/booksDB"

function BottomNav() {
  const fileInputRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  function handleHomeClick() {
    if (location.pathname === "/") {
      window.dispatchEvent(new Event("home-refresh"))
    } else {
      navigate("/")
      window.dispatchEvent(new Event("home-refresh"))
    }
  }

  function handlePlusClick() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (file) {
      try {
        if (file.name.endsWith(".zip")) {
          const zip = await JSZip.loadAsync(file)
          const fb2Entry = Object.keys(zip.files).find(
            (name) => name.endsWith(".fb2") && !zip.files[name].dir
          )
          if (!fb2Entry) {
            alert("Архив не содержит FB2 книгу")
            return
          }
          const text = await zip.files[fb2Entry].async("text")
          const book = await parseFb2(text, fb2Entry)
          await saveBook(book)
          console.log("book saved from zip")
        } else {
          const book = await parseFb2(file)
          await saveBook(book)
          console.log("book saved")
        }
      } catch (err) {
        console.error("FB2 parsing failed", err)
      }
    }
    e.target.value = ""
  }

  return (
    <nav className="bottom-nav">
      <button className="bottom-nav-btn" onClick={handleHomeClick}>
        <Home size={30} />
      </button>
      <button className="bottom-nav-btn bottom-nav-btn--center" onClick={handlePlusClick}>
        <Plus size={25} />
      </button>
      <button className="bottom-nav-btn" onClick={() => navigate("/settings")}>
        <Settings size={30} />
      </button>
      <input
        type="file"
        accept=".fb2,.zip"
        ref={fileInputRef}
        onChange={handleFileChange}
        hidden
      />
    </nav>
  )
}

export default BottomNav
