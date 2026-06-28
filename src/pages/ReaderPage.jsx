import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getAllBooks, saveBook, getStats, saveStats } from "../storage/booksDB"
import { getPageContent, getTotalChars } from "../engine/pagination"
import { ArrowLeft, Moon } from "lucide-react"

function renderParagraph(para, i) {
  switch (para.type) {
    case "title":
      return <h2 key={i} className="reader-para-title">{para.content}</h2>
    case "subtitle":
      return <h3 key={i} className="reader-para-subtitle">{para.content}</h3>
    case "p":
      return <p key={i} className="reader-para-p">{para.content}</p>
    case "empty-line":
      return <div key={i} className="reader-para-empty" />
    case "epigraph":
      return <p key={i} className="reader-para-epigraph">{para.content}</p>
    case "poem":
      return <pre key={i} className="reader-para-poem">{para.content}</pre>
    case "cite":
      return <blockquote key={i} className="reader-para-cite">{para.content}</blockquote>
    case "chapter-title":
      return <h2 key={i} className="reader-chapter-title">{para.content}</h2>
    default:
      return <p key={i} className="reader-para-p">{para.content}</p>
  }
}

function ReaderPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [pageItems, setPageItems] = useState([])
  const [currentOffset, setCurrentOffset] = useState(0)
  const [nextOffset, setNextOffset] = useState(0)
  const [totalChars, setTotalChars] = useState(0)
  const [uiVisible, setUiVisible] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animDirection, setAnimDirection] = useState(null)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [readingTheme, setReadingTheme] = useState(() => {
    try { return localStorage.getItem("readingTheme") || "default" } catch { return "default" }
  })
  const [nightMode, setNightMode] = useState(() => {
    try { return localStorage.getItem("nightMode") === "true" } catch { return false }
  })
  const [readingFont, setReadingFont] = useState(() => {
    try { return localStorage.getItem("readingFont") || "georgia" } catch { return "georgia" }
  })
  const [fontSizePx, setFontSizePx] = useState(() => {
    try { return parseInt(localStorage.getItem("readerFontSize")) || 20 } catch { return 20 }
  })

  const fontRef = useRef(readingFont)
  useEffect(() => { fontRef.current = readingFont }, [readingFont])
  const sizeRef = useRef(fontSizePx)
  useEffect(() => { sizeRef.current = fontSizePx }, [fontSizePx])

  const offsetStack = useRef([])
  const readerRef = useRef(null)
  const touchX = useRef(null)
  const touchStartX = useRef(null)
  const sessionStartRef = useRef(null)
  const completedTrackedRef = useRef(false)

  useEffect(() => {
    getStats()
      .catch(() => null)
      .then((s) => {
      const now = new Date()
      const today = now.toISOString().slice(0, 10)

      const stats = s || { id: "globalStats", todayMinutes: 0, totalMinutes: 0, lastReadDate: null }
      if (stats.todayMinutes === undefined) stats.todayMinutes = 0
      if (stats.totalMinutes === undefined) stats.totalMinutes = 0

      if (stats.lastReadDate !== today) {
        stats.todayMinutes = 0
      }

      stats.lastReadDate = today
      saveStats(stats).catch(() => {})
    })
  }, [])

  useEffect(() => {
    sessionStartRef.current = Date.now()

    return () => {
      const elapsed = Math.round((Date.now() - sessionStartRef.current) / 60000)
      if (elapsed < 1) return

      getStats().then((s) => {
        const stats = s || { id: "globalStats", todayMinutes: 0, totalMinutes: 0, lastReadDate: null }
        stats.todayMinutes += elapsed
        stats.totalMinutes += elapsed
        stats.lastReadDate = new Date().toISOString().slice(0, 10)
        if (!stats.weeklyReading) stats.weeklyReading = { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 }
        const weekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
        stats.weeklyReading[weekdays[new Date().getDay()]] = stats.todayMinutes
        saveStats(stats)
      })
    }
  }, [])

  function stopTouch(e) {
    e.stopPropagation()
  }

  function handleThemeChange(theme) {
    setReadingTheme(theme)
    try { localStorage.setItem("readingTheme", theme) } catch {}
  }

  function handleNightToggle() {
    setNightMode((v) => {
      const next = !v
      try { localStorage.setItem("nightMode", next) } catch {}
      return next
    })
  }

  function handleFontChange(font) {
    setReadingFont(font)
    try { localStorage.setItem("readingFont", font) } catch {}
  }

  function handleFontSizeDown() {
    const px = Math.max(16, fontSizePx - 1)
    setFontSizePx(px)
    try { localStorage.setItem("readerFontSize", px) } catch {}
  }

  function handleFontSizeUp() {
    const px = Math.min(35, fontSizePx + 1)
    setFontSizePx(px)
    try { localStorage.setItem("readerFontSize", px) } catch {}
  }

  useEffect(() => {
    const colors = { default:"#fff", calm:"#EDE3CF", paper:"#D8D5CE" }
    const bg = nightMode ? "#1E1E1E" : (colors[readingTheme] || "#fff")
    const root = document.getElementById("root")
    if (root) root.style.background = bg
    document.body.style.background = bg
    document.documentElement.style.background = bg
    return () => {
      if (root) root.style.background = ""
      document.body.style.background = ""
      document.documentElement.style.background = ""
    }
  }, [readingTheme, nightMode])

  useEffect(() => {
    let wakeLock = null

    async function acquire() {
      const enabled = localStorage.getItem("reader_keep_awake") === "true"
      if (!enabled) return
      try {
        wakeLock = await navigator.wakeLock.request("screen")
      } catch {}
    }

    acquire()

    return () => {
      if (wakeLock) {
        wakeLock.release().catch(() => {})
      }
    }
  }, [])

  useEffect(() => {
    if (book) loadPage(book, currentOffset)
  }, [readingFont, fontSizePx])

  const loadPage = useCallback((bookData, fromChar) => {
    const el = readerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const height = Math.round(rect.height)
    const px = sizeRef.current
    const content = getPageContent(bookData, fromChar, height, fontRef.current, px + "px", Math.round(px * 1.45) + "px")
    setPageItems(content.items)
    setCurrentOffset(fromChar)
    setNextOffset(content.nextChar)
  }, [])

  const buildOffsetStack = useCallback((bookData, targetOffset) => {
    const el = readerRef.current
    if (!el || targetOffset <= 0) return []
    const rect = el.getBoundingClientRect()
    const height = Math.round(rect.height)
    const px = sizeRef.current
    const stack = []
    let offset = 0

    while (offset < targetOffset) {
      const content = getPageContent(bookData, offset, height, fontRef.current, px + "px", Math.round(px * 1.45) + "px")
      if (content.nextChar <= offset) break
      if (content.nextChar >= targetOffset) {
        stack.push(offset)
        break
      }
      stack.push(offset)
      offset = content.nextChar
    }

    return stack
  }, [])

  useEffect(() => {
    getAllBooks().then((books) => {
      const found = books.find((b) => b.id === id)
      setBook(found || null)
      if (found) {
        const total = getTotalChars(found)
        setTotalChars(total)
        localStorage.setItem("lastOpenedBookId", id)
        if (!found.hasStartedReading) {
          saveBook({ ...found, hasStartedReading: true, isNew: false })
        }
      }
    })
  }, [id])

  useEffect(() => {
    if (!book || !readerRef.current) return

    try {
      const raw = localStorage.getItem(`reading_progress_${id}`)
      if (raw) {
        const { currentOffset: savedOffset } = JSON.parse(raw)
        if (savedOffset > 0 && totalChars > 0) {
          const offset = Math.min(savedOffset, totalChars - 1)
          offsetStack.current = buildOffsetStack(book, offset)
          loadPage(book, offset)
          return
        }
      }
    } catch {}

    offsetStack.current = []
    loadPage(book, 0)
  }, [book, loadPage, buildOffsetStack, id, totalChars])

  useEffect(() => {
    if (!book || totalChars === 0) return
    try {
      localStorage.setItem(`reading_progress_${id}`, JSON.stringify({ currentOffset }))
    } catch {}

    const percent = Math.round((currentOffset / totalChars) * 100)
    if (percent >= 99 && !book.completedTracked && !completedTrackedRef.current) {
      completedTrackedRef.current = true
      getAllBooks().then((books) => {
        const dbBook = books.find((b) => b.id === id)
        if (dbBook && !dbBook.completedTracked) {
          saveBook({ ...dbBook, completedTracked: true })
          getStats().then((s) => {
            const stats = s || { id: "globalStats", todayMinutes: 0, totalMinutes: 0, lastReadDate: null }
            stats.completedBooks = (stats.completedBooks || 0) + 1
            saveStats(stats)
          })
        }
      })
    }
  }, [currentOffset, book, id, totalChars])

  const goNext = useCallback(() => {
    if (!book || nextOffset >= totalChars) return
    offsetStack.current.push(currentOffset)
    loadPage(book, nextOffset)
  }, [book, nextOffset, totalChars, currentOffset, loadPage])

  const goPrev = useCallback(() => {
    if (offsetStack.current.length === 0) return
    const prev = offsetStack.current.pop()
    loadPage(book, prev)
  }, [book, loadPage])

  const animateTo = useCallback((direction) => {
    if (isAnimating) return
    setIsAnimating(true)
    setAnimDirection(direction)
    setDragX(0)

    setTimeout(() => {
      if (direction === 'left') goNext()
      else goPrev()
      setIsAnimating(false)
      setAnimDirection(null)
    }, 350)
  }, [isAnimating, goNext, goPrev])

  function handleTouchStart(e) {
    if (settingsOpen) return
    touchX.current = e.touches[0].clientX
    touchStartX.current = e.touches[0].clientX
    setDragX(0)
    setIsDragging(true)
  }

  function handleTouchMove(e) {
    if (settingsOpen) return
    if (!touchStartX.current) return
    const currentX = e.touches[0].clientX
    setDragX(currentX - touchStartX.current)
  }

  function handleTouchEnd(e) {
    if (settingsOpen) return
    const endX = e.changedTouches[0].clientX
    const dx = endX - touchX.current
    const startX = touchStartX.current
    const screenW = window.innerWidth

    setIsDragging(false)
    setDragX(0)

    if (Math.abs(dx) > 60) {
      if (dx < 0) animateTo('left')
      else animateTo('right')
      return
    }

    const relX = startX / screenW
    if (relX < 0.33) {
      animateTo('right')
    } else if (relX > 0.66) {
      animateTo('left')
    } else {
      setUiVisible((v) => !v)
    }
  }

  if (!book) {
    return (
      <div className="reader-page">
        <div className="reader-loading">Загрузка...</div>
      </div>
    )
  }

  const pageTransform = isAnimating
    ? `translateX(${animDirection === 'left' ? -40 : 40}px) scale(0.97)`
    : isDragging
      ? `translateX(${dragX * 0.3}px)`
      : 'none'

  const pageTransition = isDragging
    ? 'none'
    : 'transform 0.38s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.35s ease'
  const progressPercent = totalChars > 0
    ? Math.min(100, Math.round((currentOffset / totalChars) * 100))
    : 0

  return (
    <div className={`reader-page ${readingTheme}${nightMode ? " night-mode" : ""}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className={`reader-header ${uiVisible ? "" : "reader-header--hidden"}`}>
        <button className="reader-back" onClick={() => navigate(`/book/${id}`)}>
          <ArrowLeft size={24} />
        </button>
        <p className="reader-header-title">{book.title}</p>
        <button className="reader-settings-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSettingsOpen(true); }} onTouchStart={stopTouch} onTouchEnd={stopTouch}>
          Aa
        </button>
      </div>

      <div className={`reader-content ${readingFont}`} style={{ "--fs": fontSizePx + "px", "--lh": Math.round(fontSizePx * 1.45) + "px" }} ref={readerRef}>
        <div className="reader-page-anim" style={{
          transform: pageTransform,
          opacity: isAnimating ? 0 : 1,
          transition: pageTransition
        }}>
          {pageItems.map((item, index) => renderParagraph(item, index))}
        </div>
      </div>

      <div className={`reader-bottom-panel ${uiVisible ? "" : "reader-bottom-panel--hidden"}`}>
        <div className="reader-bottom-progress-bar">
          <div className="reader-bottom-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <p className="reader-bottom-text">{progressPercent}% осилено</p>
      </div>

      {settingsOpen && (
        <div className="reader-settings-overlay" onClick={() => setSettingsOpen(false)} onTouchStart={stopTouch} onTouchEnd={stopTouch}>
          <div className="reader-settings-sheet" onClick={(e) => e.stopPropagation()} onTouchStart={stopTouch} onTouchEnd={stopTouch}>
            <button className={`reader-night-toggle${nightMode ? " reader-night-toggle--active" : ""}`} onClick={handleNightToggle} onTouchStart={stopTouch}>
              <Moon size={20} />
            </button>
            <button className="reader-settings-close" onClick={() => setSettingsOpen(false)} onTouchStart={stopTouch}>
              ✕
            </button>
            <h3 className="reader-settings-title">Настройки чтения</h3>
            <div className="reader-size-control">
              <button className="reader-size-btn" onClick={handleFontSizeDown} disabled={fontSizePx <= 16}>−</button>
              <span className="reader-size-value">{fontSizePx}px</span>
              <button className="reader-size-btn" onClick={handleFontSizeUp} disabled={fontSizePx >= 35}>+</button>
            </div>
            <div className="reader-theme-row">
              {[
                { id:"default", bg:"#FFFFFF", color:"#111111", name:"Обычная" },
                { id:"calm",    bg:"#EDE3CF", color:"#333333", name:"Спокойная" },
                { id:"paper",   bg:"#F4F4F0", color:"#333333", name:"Бумага" },
              ].map((t) => (
                <button
                  key={t.id}
                  className={`reader-theme-card${readingTheme === t.id ? " reader-theme-card--active" : ""}`}
                  onClick={() => handleThemeChange(t.id)}
                  style={{ background: t.bg }}
                >
                  <span className="reader-theme-aa" style={{ color: t.color }}>Aa</span>
                  <span className="reader-theme-name">{t.name}</span>
                </button>
              ))}
            </div>
            <p className="reader-font-label">Шрифт</p>
            <div className="reader-font-row">
              {[
                { id:"georgia", name:"Georgia" },
                { id:"literata", name:"Literata" },
                { id:"merriweather", name:"Merriweather" },
              ].map((f) => (
                <button
                  key={f.id}
                  className={`reader-font-btn${readingFont === f.id ? " reader-font-btn--active" : ""}`}
                  onClick={() => handleFontChange(f.id)}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReaderPage
