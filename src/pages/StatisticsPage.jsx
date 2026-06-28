import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, RotateCcw } from "lucide-react"
import bgVideo from "../assets/background/video-test1.mp4"
import { getStats, getAllBooks, saveStats, deleteBook } from "../storage/booksDB"

function StatisticsPage() {
  const navigate = useNavigate()
  const [todayMinutes, setTodayMinutes] = useState(0)
  const [totalMinutes, setTotalMinutes] = useState(0)
  const [bookCount, setBookCount] = useState(0)
  const [completedBooks, setCompletedBooks] = useState(0)
  const [inProgressCount, setInProgressCount] = useState(0)
  const [weeklyData, setWeeklyData] = useState([])
  const [yearlyGoal, setYearlyGoal] = useState(20)
  const [menuOpen, setMenuOpen] = useState(false)
  const [goalInput, setGoalInput] = useState("")
  const [resetSheet, setResetSheet] = useState(false)
  const [pinSheet, setPinSheet] = useState(false)
  const [pinInput, setPinInput] = useState("")
  const [pinError, setPinError] = useState("")

  useEffect(() => {
    getStats()
      .catch(() => null)
      .then((s) => {
      if (s) {
        setTodayMinutes(s.todayMinutes)
        setTotalMinutes(s.totalMinutes)
        setCompletedBooks(s.completedBooks || 0)
        if (s.yearlyGoal) setYearlyGoal(s.yearlyGoal)
      }
    })
  }, [])

  useEffect(() => {
    getAllBooks()
      .then((books) => {
        const visible = books.filter((b) => !b.hidden)
        setBookCount(visible.length)
        let inProgress = 0
        visible.forEach((book) => {
          try {
            const raw = localStorage.getItem(`reading_progress_${book.id}`)
            if (raw) {
              const { currentPage, totalPages } = JSON.parse(raw)
              if (currentPage && totalPages) {
                const pct = Math.round((currentPage / totalPages) * 100)
                if (pct > 0 && pct < 99) inProgress++
              }
            }
          } catch {}
        })
        setInProgressCount(inProgress)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    getStats()
      .catch(() => null)
      .then((s) => {
        const wr = s?.weeklyReading || {}
        const tm = s?.todayMinutes || 0
        const keys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
        const labels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
        const weekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
        const todayKey = weekdays[new Date().getDay()]
        console.log("Today card:", tm)
        console.log("Weekly chart today bar:", wr[todayKey] || 0)
        setWeeklyData(keys.map((key, i) => ({
          key,
          label: labels[i],
          minutes: key === todayKey ? tm : (wr[key] || 0),
        })))
      })
  }, [])

  function handleMenuToggle(e) {
    e.stopPropagation()
    setMenuOpen((v) => !v)
  }

  function handleSave() {
    const val = parseInt(goalInput, 10)
    if (isNaN(val) || val < 1) return
    setYearlyGoal(val)
    setMenuOpen(false)
    getStats().then((s) => {
      const stats = s || { id: "globalStats", todayMinutes: 0, totalMinutes: 0, lastReadDate: null }
      stats.yearlyGoal = val
      saveStats(stats)
    })
  }

  function handleCancel() {
    setMenuOpen(false)
  }

  function handleResetConfirm() {
    setResetSheet(false)
    setPinInput("")
    setPinError("")
    setPinSheet(true)
  }

  function handleResetCancel() {
    setResetSheet(false)
  }

  function handlePinSubmit() {
    if (pinInput === "140809") {
      const defaults = { id: "globalStats", todayMinutes: 0, totalMinutes: 0, lastReadDate: new Date().toISOString().slice(0, 10), weeklyReading: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 }, yearlyGoal: 20, completedBooks: 0 }
      saveStats(defaults)
      getAllBooks().then((books) => {
        books.forEach((b) => deleteBook(b.id))
      })
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith("reading_progress_")) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k))
      localStorage.removeItem("lastOpenedBookId")
      setTodayMinutes(0)
      setTotalMinutes(0)
      setCompletedBooks(0)
      setYearlyGoal(20)
      setBookCount(0)
      setInProgressCount(0)
      setWeeklyData([])
      setPinSheet(false)
      setPinInput("")
      setPinError("")
    } else {
      setPinError("Неверный PIN")
    }
  }

  function handlePinBack() {
    setPinSheet(false)
    setResetSheet(true)
    setPinInput("")
    setPinError("")
  }

  const goalRemaining = Math.max(0, yearlyGoal - completedBooks)
  const goalPct = yearlyGoal > 0 ? Math.min(100, (completedBooks / yearlyGoal) * 100) : 0

  const daysLeft = Math.round((new Date(new Date().getFullYear(), 11, 31) - new Date()) / 86400000)

  return (
    <div className="stats-page">
      <video className="stats-video" autoPlay muted loop playsInline>
        <source src={bgVideo} type="video/mp4" />
      </video>
      <div className="stats-overlay" />
      <header className="stats-header">
        <button className="stats-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="stats-title">Статистика</h1>
        <button className="stats-reset-btn" onClick={() => { setPinInput(""); setPinError(""); setResetSheet(true); }}>
          <RotateCcw size={20} />
        </button>
      </header>
      <div className="stats-goal-card">
        <div className="stats-goal-inner">
          <div className="stats-goal-glow">
            <div className="stats-goal-glow-circle stats-goal-glow--blue" />
            <div className="stats-goal-glow-circle stats-goal-glow--purple" />
            <div className="stats-goal-glow-circle stats-goal-glow--cyan" />
          </div>
          <div className="stats-goal-header">
            <div className="stats-goal-header-left">
              <svg className="stats-goal-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="4" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="1.5" fill="rgba(255,255,255,0.9)" />
                <line x1="12" y1="3" x2="12" y2="6" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="12" y1="18" x2="12" y2="21" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="3" y1="12" x2="6" y2="12" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="18" y1="12" x2="21" y2="12" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="stats-goal-title">ЦЕЛЬ ЧТЕНИЯ 2026</span>
            </div>
            <div className="stats-goal-menu" onClick={handleMenuToggle}>
              <span className="stats-goal-menu-dot" />
              <span className="stats-goal-menu-dot" />
              <span className="stats-goal-menu-dot" />
            </div>
          </div>
          <div className="stats-goal-value">{completedBooks} / {yearlyGoal} КНИГ</div>
          <div className="stats-goal-bar">
            <div className="stats-goal-bar-track">
              <div className="stats-goal-bar-fill" style={{ width: `${goalPct}%` }} />
            </div>
          </div>
          <div className="stats-goal-footer">
            <span className="stats-goal-remaining">Осталось: {goalRemaining} книг</span>
            <span className="stats-goal-days">{daysLeft} дней осталось</span>
          </div>
        </div>
      </div>
      <div className="stats-test-card">
        <div className="stats-test-card-inner">
          <div className="stats-test-label">СЕГОДНЯ</div>
          <div className="stats-test-row">{todayMinutes} мин</div>
        </div>
        <div className="stats-dots">
          {[0,1,2,3,4,5].map((i) => (
            <span key={i} className="stats-dot" style={{ animationDelay: `${i * 0.333}s` }} />
          ))}
        </div>
      </div>
      <div className="stats-grid">
        <div className="stats-card-small">
          <div className="stats-card-small-inner">
            <span className="material-symbols-rounded stats-card-icon">schedule</span>
            <div className="stats-card-small-label">Всего</div>
            <div className="stats-card-small-value">{totalMinutes} мин</div>
          </div>
        </div>
        <div className="stats-card-small">
          <div className="stats-card-small-inner">
            <span className="material-symbols-rounded stats-card-icon">library_books</span>
            <div className="stats-card-small-label">Библиотека</div>
            <div className="stats-card-small-value">{bookCount} {bookCount % 10 === 1 && bookCount % 100 !== 11 ? "книга" : (bookCount % 10 >= 2 && bookCount % 10 <= 4 && (bookCount % 100 < 10 || bookCount % 100 >= 20) ? "книги" : "книг")}</div>
          </div>
        </div>
      </div>
      <div className="stats-grid">
        <div className="stats-card-small">
          <div className="stats-card-small-inner">
            <span className="material-symbols-rounded stats-card-icon">menu_book</span>
            <div className="stats-card-small-label">Прочитано</div>
            <div className="stats-card-small-value">{completedBooks} {completedBooks % 10 === 1 && completedBooks % 100 !== 11 ? "книга" : (completedBooks % 10 >= 2 && completedBooks % 10 <= 4 && (completedBooks % 100 < 10 || completedBooks % 100 >= 20) ? "книги" : "книг")}</div>
          </div>
        </div>
        <div className="stats-card-small">
          <div className="stats-card-small-inner">
            <span className="material-symbols-rounded stats-card-icon">auto_stories</span>
            <div className="stats-card-small-label">В процессе</div>
            <div className="stats-card-small-value">{inProgressCount} {inProgressCount % 10 === 1 && inProgressCount % 100 !== 11 ? "книга" : (inProgressCount % 10 >= 2 && inProgressCount % 10 <= 4 && (inProgressCount % 100 < 10 || inProgressCount % 100 >= 20) ? "книги" : "книг")}</div>
          </div>
        </div>
      </div>
      <div className="stats-week-card">
        <div className="stats-week-inner">
          <div className="stats-week-title">ЭТА НЕДЕЛЯ</div>
          <div className="stats-week-chart">
            <div className="stats-week-yaxis">
              {[5,4,3,2,1].map(h => (
                <span key={h} className="stats-week-yaxis-label">{h}ч</span>
              ))}
            </div>
            <div className="stats-week-bars">
              {(() => {
                const weekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
                const todayKey = weekdays[new Date().getDay()]
                const MAX_H = 100
                return weeklyData.map((day) => {
                  const barH = Math.min(day.minutes, 300) / 300 * MAX_H
                  return (
                    <div key={day.key} className="stats-week-bar-col">
                      {day.minutes > 0 && (
                        <div
                          className={`stats-week-bar${day.key === todayKey ? " stats-week-bar--today" : ""}`}
                          style={{ height: `${barH}px` }}
                        />
                      )}
                      <span className="stats-week-bar-label">{day.label}</span>
                    </div>
                  )
                })
              })()}
            </div>
          </div>
        </div>
      </div>
      {menuOpen && (
        <div className="stats-goal-overlay" onClick={() => setMenuOpen(false)}>
          <div className="stats-goal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="stats-goal-sheet-header">
              <div className="stats-goal-sheet-title">Изменить цель</div>
              <div className="stats-goal-sheet-subtitle">Сколько книг хотите прочитать в этом году?</div>
            </div>
            <input
              className="stats-goal-sheet-input"
              type="number"
              min="1"
              placeholder="Введите число"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
            />
            <div className="stats-goal-sheet-presets">
              {[10, 20, 30, 50].map((n) => (
                <button
                  key={n}
                  className="stats-goal-sheet-preset"
                  onClick={() => setGoalInput(String(n))}
                >{n}</button>
              ))}
            </div>
            <button className="stats-goal-sheet-save" onClick={handleSave}>Сохранить</button>
            <button className="stats-goal-sheet-cancel" onClick={handleCancel}>Отмена</button>
          </div>
        </div>
      )}
      {resetSheet && (
        <div className="stats-goal-overlay" onClick={handleResetCancel}>
          <div className="stats-goal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="stats-goal-sheet-header">
              <div className="stats-goal-sheet-title">Сброс статистики</div>
              <div className="stats-goal-sheet-subtitle">Все данные чтения будут удалены.</div>
            </div>
            <button className="stats-goal-sheet-save" onClick={handleResetConfirm}>Продолжить</button>
            <button className="stats-goal-sheet-cancel" onClick={handleResetCancel}>Отмена</button>
          </div>
        </div>
      )}
      {pinSheet && (
        <div className="stats-goal-overlay" onClick={() => { setPinSheet(false); setPinInput(""); setPinError(""); }}>
          <div className="stats-goal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="stats-goal-sheet-header">
              <div className="stats-goal-sheet-title">Подтверждение</div>
              <div className="stats-goal-sheet-subtitle">Введите PIN-код для сброса</div>
            </div>
            <input
              className="stats-goal-sheet-input"
              type="password"
              maxLength={6}
              placeholder="••••••"
              value={pinInput}
              onChange={(e) => { setPinInput(e.target.value.replace(/\D/g, "").slice(0, 6)); setPinError(""); }}
              autoFocus
            />
            {pinError && <div className="stats-goal-sheet-error">{pinError}</div>}
            <div className="stats-goal-sheet-pin-grid">
              <button className="stats-goal-sheet-pin-num" onClick={() => { const next = (pinInput + "1").slice(0, 6); setPinInput(next); setPinError(""); }}>1</button>
              <button className="stats-goal-sheet-pin-num" onClick={() => { const next = (pinInput + "2").slice(0, 6); setPinInput(next); setPinError(""); }}>2</button>
              <button className="stats-goal-sheet-pin-num" onClick={() => { const next = (pinInput + "3").slice(0, 6); setPinInput(next); setPinError(""); }}>3</button>
              <button className="stats-goal-sheet-pin-num" onClick={() => { const next = (pinInput + "4").slice(0, 6); setPinInput(next); setPinError(""); }}>4</button>
              <button className="stats-goal-sheet-pin-num" onClick={() => { const next = (pinInput + "5").slice(0, 6); setPinInput(next); setPinError(""); }}>5</button>
              <button className="stats-goal-sheet-pin-num" onClick={() => { const next = (pinInput + "6").slice(0, 6); setPinInput(next); setPinError(""); }}>6</button>
              <button className="stats-goal-sheet-pin-num" onClick={() => { const next = (pinInput + "7").slice(0, 6); setPinInput(next); setPinError(""); }}>7</button>
              <button className="stats-goal-sheet-pin-num" onClick={() => { const next = (pinInput + "8").slice(0, 6); setPinInput(next); setPinError(""); }}>8</button>
              <button className="stats-goal-sheet-pin-num" onClick={() => { const next = (pinInput + "9").slice(0, 6); setPinInput(next); setPinError(""); }}>9</button>
              <div />
              <button className="stats-goal-sheet-pin-num" onClick={() => { const next = (pinInput + "0").slice(0, 6); setPinInput(next); setPinError(""); }}>0</button>
              <button className="stats-goal-sheet-pin-back" onClick={() => { setPinInput(pinInput.slice(0, -1)); setPinError(""); }}>⌫</button>
            </div>
            <button className="stats-goal-sheet-pin-submit" onClick={handlePinSubmit} disabled={pinInput.length < 6}>Подтвердить</button>
            <button className="stats-goal-sheet-cancel" onClick={() => { setPinSheet(false); setPinInput(""); setPinError(""); }}>Назад</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default StatisticsPage
