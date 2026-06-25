import { useState, useRef, useEffect } from "react"

function BookMenu({ book, onHide, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [popupPos, setPopupPos] = useState({ top: 0, right: 0 })
  const popupRef = useRef(null)
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

  useEffect(() => {
    const popup = popupRef.current
    function stopNative(e) {
      e.stopPropagation()
    }
    const opts = { passive: true }
    if (popup && menuOpen) {
      popup.addEventListener("touchstart", stopNative, opts)
      popup.addEventListener("pointerdown", stopNative, opts)
    }
    return () => {
      if (popup) {
        popup.removeEventListener("touchstart", stopNative, opts)
        popup.removeEventListener("pointerdown", stopNative, opts)
      }
    }
  }, [menuOpen])

  useEffect(() => {
    function handleClick(e) {
      if (e.target.closest(".book-card-menu-btn")) return
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function handleMenuToggle(e) {
    e.stopPropagation()
    e.nativeEvent?.stopImmediatePropagation?.()
    if (!menuOpen) {
      const rect = btnRef.current.getBoundingClientRect()
      const gap = 4
      let top = rect.bottom + gap
      let right = window.innerWidth - rect.right

      if (top + 100 > window.innerHeight) {
        top = rect.top - 100 - gap
      }
      if (right + 190 > window.innerWidth) {
        right = 8
      }

      setPopupPos({ top, right })
    }
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
        ⋯
      </button>

      {menuOpen && (
        <div
          className="book-card-menu-popup"
          ref={popupRef}
          style={{ top: popupPos.top, right: popupPos.right }}
          onMouseDown={stopProp}
          onTouchStart={stopProp}
          onTouchEnd={stopProp}
          onPointerDown={stopProp}
          onPointerUp={stopProp}
          onClick={stopProp}
        >
          <div className="book-card-menu-item" onClick={handleHide}>
            Убрать с полки
          </div>
          <div className="book-card-menu-item book-card-menu-item--danger" onClick={handleDeleteClick}>
            Удалить с устройства
          </div>
        </div>
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
