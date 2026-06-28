import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import bgVideo from "../assets/background/video-test1.mp4"

function StatisticsPage() {
  const navigate = useNavigate()

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
      </header>
      <div className="stats-test-card">
        <div className="stats-test-card-inner">
          <div className="stats-test-label">СЕГОДНЯ</div>
          <div className="stats-test-row">14 мин / 30 мин</div>
        </div>
        <div className="stats-test-track">
          <div className="stats-test-fill" style={{ width: "46%" }} />
        </div>
      </div>
      <div className="stats-grid">
        <div className="stats-card-small">
          <div className="stats-card-small-inner">
            <span className="material-symbols-rounded stats-card-icon">schedule</span>
            <div className="stats-card-small-label">Всего</div>
            <div className="stats-card-small-value">0 мин</div>
          </div>
        </div>
        <div className="stats-card-small">
          <div className="stats-card-small-inner">
            <span className="material-symbols-rounded stats-card-icon">local_fire_department</span>
            <div className="stats-card-small-label">Серия</div>
            <div className="stats-card-small-value">0 дн.</div>
          </div>
        </div>
        <div className="stats-card-small">
          <div className="stats-card-small-inner">
            <span className="material-symbols-rounded stats-card-icon">menu_book</span>
            <div className="stats-card-small-label">Прочитано</div>
            <div className="stats-card-small-value">0</div>
          </div>
        </div>
        <div className="stats-card-small">
          <div className="stats-card-small-inner">
            <span className="material-symbols-rounded stats-card-icon">auto_stories</span>
            <div className="stats-card-small-label">В процессе</div>
            <div className="stats-card-small-value">0</div>
          </div>
        </div>
      </div>
      <div className="stats-card-chart">
        <div className="stats-card-chart-inner">
          <div className="stats-chart-header">
            <span className="stats-chart-title">Последние 30 дней</span>
            <span className="stats-chart-value">0k символов</span>
          </div>
          <div className="stats-chart-box" />
        </div>
      </div>
      <div className="stats-week-card">
        <div className="stats-week-inner">
          <div className="stats-week-title">ЭТА НЕДЕЛЯ</div>
          <div className="stats-week-bars">
            <div className="stats-week-bar-col">
              <div className="stats-week-bar" style={{ height: "28px" }} />
              <span className="stats-week-bar-label">Пн</span>
            </div>
            <div className="stats-week-bar-col">
              <div className="stats-week-bar" style={{ height: "52px" }} />
              <span className="stats-week-bar-label">Вт</span>
            </div>
            <div className="stats-week-bar-col">
              <div className="stats-week-bar" style={{ height: "8px" }} />
              <span className="stats-week-bar-label">Ср</span>
            </div>
            <div className="stats-week-bar-col">
              <div className="stats-week-bar" style={{ height: "38px" }} />
              <span className="stats-week-bar-label">Чт</span>
            </div>
            <div className="stats-week-bar-col">
              <div className="stats-week-bar" style={{ height: "68px" }} />
              <span className="stats-week-bar-label">Пт</span>
            </div>
            <div className="stats-week-bar-col">
              <div className="stats-week-bar" style={{ height: "18px" }} />
              <span className="stats-week-bar-label">Сб</span>
            </div>
            <div className="stats-week-bar-col">
              <div className="stats-week-bar" style={{ height: "22px" }} />
              <span className="stats-week-bar-label">Вс</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatisticsPage
