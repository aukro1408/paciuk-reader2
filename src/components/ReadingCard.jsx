function ReadingCard() {
  return (
    <div className="reading-card">
      <div className="reading-card-circles">
        <div className="reading-card-circle reading-card-circle--top" />
        <div className="reading-card-circle reading-card-circle--bottom" />
      </div>
      <div className="reading-card-body">
        <div className="reading-card-cover" />
        <div className="reading-card-info">
          <h3 className="reading-card-title">Мизери</h3>
          <p className="reading-card-author">Стивен Кинг</p>
          <p className="reading-card-progress-text">42% прочитано</p>
          <div className="reading-card-bar">
            <div className="reading-card-bar-fill" />
          </div>
          <button className="reading-card-btn">Продолжить чтение</button>
        </div>
      </div>
    </div>
  )
}

export default ReadingCard
