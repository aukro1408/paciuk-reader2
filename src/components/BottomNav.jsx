import { Home, Plus, Settings } from "lucide-react"
import { useRef } from "react"
import { parseFb2 } from "../parser/fb2Parser"
import { saveBook } from "../storage/booksDB"

function BottomNav() {
  const fileInputRef = useRef(null)

  function handlePlusClick() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const book = await parseFb2(file)
        await saveBook(book)
        console.log("book saved")
      } catch (err) {
        console.error("FB2 parsing failed", err)
      }
    }
    e.target.value = ""
  }

  return (
    <nav className="bottom-nav">
      <button className="bottom-nav-btn">
        <Home size={30} />
      </button>
      <button className="bottom-nav-btn bottom-nav-btn--center" onClick={handlePlusClick}>
        <Plus size={25} />
      </button>
      <button className="bottom-nav-btn">
        <Settings size={30} />
      </button>
      <input
        type="file"
        accept=".fb2"
        ref={fileInputRef}
        onChange={handleFileChange}
        hidden
      />
    </nav>
  )
}

export default BottomNav
