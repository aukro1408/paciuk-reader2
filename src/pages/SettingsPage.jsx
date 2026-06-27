import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

function SettingsPage() {
  const navigate = useNavigate()
  const [keepAwake, setKeepAwake] = useState(() => {
    return localStorage.getItem("reader_keep_awake") === "true"
  })

  function handleToggle() {
    const newValue = !keepAwake
    setKeepAwake(newValue)
    localStorage.setItem("reader_keep_awake", newValue)
  }

  return (
    <div className="settings-page">
      <header className="settings-header">
        <button className="settings-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="settings-title">Настройки</h1>
      </header>

      <div className="settings-body">
        <div className="settings-section">
          <h2 className="settings-section-title">Чтение</h2>
          <div className="settings-card">
            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Не выключать экран</span>
                <span className="settings-row-desc">
                  Экран устройства останется активным во время чтения книги
                </span>
              </div>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={keepAwake}
                  onChange={handleToggle}
                />
                <span className="settings-toggle-slider" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
