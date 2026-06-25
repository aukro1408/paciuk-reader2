const STYLES = {
  container: {
    padding: "24px 20px",
    boxSizing: "border-box",
    overflow: "hidden",
    visibility: "hidden",
    position: "fixed",
    top: "-9999px",
    left: "-9999px",
    width: "430px",
    fontFamily: "Arial, sans-serif",
    fontSize: "16px",
    lineHeight: "1.7",
    color: "#333",
  },
  "chapter-title": {
    fontSize: "24px",
    fontWeight: "700",
    margin: "0 0 20px",
    textAlign: "center",
    lineHeight: "1.3",
  },
  title: {
    fontSize: "20px",
    fontWeight: "700",
    margin: "24px 0 12px",
    lineHeight: "1.3",
  },
  subtitle: {
    fontSize: "17px",
    fontWeight: "600",
    margin: "20px 0 10px",
    lineHeight: "1.4",
  },
  p: {
    fontSize: "16px",
    lineHeight: "1.7",
    margin: "0 0 14px",
  },
  "empty-line": {
    height: "20px",
    margin: "0",
  },
  epigraph: {
    fontSize: "15px",
    fontStyle: "italic",
    margin: "16px 24px",
    lineHeight: "1.6",
    color: "#777",
  },
  poem: {
    fontSize: "15px",
    lineHeight: "1.8",
    margin: "12px 0",
    whiteSpace: "pre-wrap",
    fontFamily: "inherit",
    color: "#444",
  },
  cite: {
    fontSize: "15px",
    fontStyle: "italic",
    margin: "16px 24px",
    padding: "12px 16px",
    borderLeft: "3px solid #ccc",
    lineHeight: "1.6",
    color: "#555",
  },
}

function buildItemList(book) {
  const items = []
  for (const chapter of book.chapters) {
    if (chapter.title) {
      items.push({ type: "chapter-title", content: chapter.title })
    }
    for (const para of chapter.paragraphs) {
      items.push(para)
    }
  }
  return items
}

function createElement(para) {
  const el = document.createElement("div")
  const style = STYLES[para.type] || STYLES.p
  Object.assign(el.style, style)
  el.textContent = para.content
  return el
}

let sharedContainer = null

function getContainer() {
  if (!sharedContainer) {
    sharedContainer = document.createElement("div")
    Object.assign(sharedContainer.style, STYLES.container)
    document.body.appendChild(sharedContainer)
  }
  return sharedContainer
}

function offsetToItem(items, offset) {
  let pos = 0
  for (let i = 0; i < items.length; i++) {
    const end = pos + items[i].content.length
    if (offset < end) {
      return { index: i, itemPos: pos, skipChars: offset - pos }
    }
    pos = end
  }
  return { index: items.length, itemPos: pos, skipChars: 0 }
}

export function getTotalChars(book) {
  let total = 0
  for (const chapter of book.chapters) {
    if (chapter.title) total += chapter.title.length
    for (const para of chapter.paragraphs) {
      total += para.content.length
    }
  }
  return total
}

export function getPageContent(book, fromChar, viewportHeight) {
  const items = buildItemList(book)
  const container = getContainer()
  container.style.height = viewportHeight + "px"
  container.innerHTML = ""

  const start = offsetToItem(items, fromChar)
  if (start.index >= items.length) {
    return { items: [], nextChar: fromChar }
  }

  const result = []
  let charPos = fromChar

  for (let i = start.index; i < items.length; i++) {
    const item = items[i]
    let text = item.content

    if (i === start.index && start.skipChars > 0) {
      text = text.substring(start.skipChars)
    }

    const el = createElement({ type: item.type, content: text })
    container.appendChild(el)

    if (container.scrollHeight <= container.clientHeight) {
      result.push({ type: item.type, content: text })
      charPos += text.length
      continue
    }

    container.removeChild(el)

    if (text.length === 0) break

    let low = 0
    let high = text.length
    while (low < high) {
      const mid = Math.ceil((low + high) / 2)
      el.textContent = text.substring(0, mid)
      container.appendChild(el)
      const fits = container.scrollHeight <= container.clientHeight
      container.removeChild(el)
      if (fits) {
        low = mid
      } else {
        high = mid - 1
      }
    }

    if (low > 0) {
      const BACKTRACK_LIMIT = 20
      let breakPos = -1
      const searchStart = Math.max(0, low - BACKTRACK_LIMIT)
      for (const ch of [" ", "\n", "\t"]) {
        const pos = text.lastIndexOf(ch, low - 1)
        if (pos >= searchStart && pos > breakPos) {
          breakPos = pos
        }
      }
      if (breakPos >= 0) {
        low = breakPos
      }
    }

    if (low > 0) {
      const part = text.substring(0, low)
      el.textContent = part
      container.appendChild(el)
      result.push({ type: item.type, content: part })
      charPos += low
    }

    break
  }

  return { items: result, nextChar: charPos }
}
