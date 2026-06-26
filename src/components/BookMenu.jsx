import { useState, useRef, useEffect } from "react"

function BookMenu({ book, onHide, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const btnRef = useRef(null)

  useEffect(() => {
    const btn = btnRef.current
    function stopNative(e) {
      e.stopPropagation()
    }
    const opts = { passive: true }
    if (btn) {
      btn.addEventListener("touchstart", stopNative, opts)
      btn.addEventListener("pointerdown", stopNative, opts)
    }
    return () => {
      if (btn) {
        btn.removeEventListener("touchstart", stopNative, opts)
        btn.removeEventListener("pointerdown", stopNative, opts)
      }
    }
  }, [])

  function handleBackdropClick(e) {
    e.stopPropagation()
    setMenuOpen(false)
  }

  function handleMenuToggle(e) {
    e.stopPropagation()
    e.nativeEvent?.stopImmediatePropagation?.()
    setMenuOpen((v) => !v)
  }

  function stopProp(e) {
    e.stopPropagation()
  }

  function handleHide(e) {
    e.stopPropagation()
    setMenuOpen(false)
    onHide(book)
  }

  function handleDeleteClick(e) {
    e.stopPropagation()
    setMenuOpen(false)
    setConfirmOpen(true)
  }

  function handleConfirmDelete(e) {
    e.stopPropagation()
    setConfirmOpen(false)
    onDelete(book)
  }

  function handleCancelDelete(e) {
    e.stopPropagation()
    setConfirmOpen(false)
  }

  return (
    <>
      <button
        ref={btnRef}
        className="book-card-menu-btn"
        onClick={handleMenuToggle}
        onMouseDown={stopProp}
        onTouchStart={stopProp}
        onPointerDown={stopProp}
      >
        ⋮
      </button>

      {menuOpen && (
        <>
          <div className="book-menu-backdrop" onClick={handleBackdropClick} />
          <div className="book-bottom-sheet" onClick={stopProp}>
            <div className="book-bottom-sheet-handle" />
            <div className="book-bottom-sheet-btn" onClick={handleHide}>
              Убрать с полки
            </div>
            <div className="book-bottom-sheet-btn book-bottom-sheet-btn--danger" onClick={handleDeleteClick}>
              Удалить с устройства
            </div>
          </div>
        </>
      )}

      {confirmOpen && (
        <div className="book-menu-overlay" onClick={handleCancelDelete}>
          <div className="book-menu-confirm" onClick={(e) => e.stopPropagation()}>
            <p className="book-menu-confirm-title">Удалить книгу с устройства?</p>
            <p className="book-menu-confirm-text">Это действие нельзя отменить.</p>
            <div className="book-menu-confirm-btns">
              <button className="book-menu-confirm-btn book-menu-confirm-btn--delete" onClick={handleConfirmDelete}>
                Удалить
              </button>
              <button className="book-menu-confirm-btn book-menu-confirm-btn--cancel" onClick={handleCancelDelete}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default BookMenu
