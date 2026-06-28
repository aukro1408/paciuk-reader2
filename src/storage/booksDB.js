const DB_NAME = "AtlasReaderDB"
const STORE_NAME = "books"
const STATS_STORE = "stats"
const DB_VERSION = 2

let db = null

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (e) => {
      const database = e.target.result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" })
      }
      if (!database.objectStoreNames.contains(STATS_STORE)) {
        database.createObjectStore(STATS_STORE, { keyPath: "id" })
      }
    }

    request.onsuccess = (e) => {
      db = e.target.result
      resolve(db)
    }

    request.onerror = () => {
      reject(new Error("Failed to open IndexedDB"))
    }
  })
}

export async function initDB() {
  await openDB()
}

export async function saveBook(book) {
  if (!db) await openDB()
  if (!book.id) {
    book.id = Date.now().toString()
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    const store = tx.objectStore(STORE_NAME)
    const request = store.put(book)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(new Error("Failed to save book"))
  })
}

export async function getAllBooks() {
  if (!db) await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly")
    const store = tx.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error("Failed to get books"))
  })
}

export async function deleteBook(id) {
  if (!db) await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    const store = tx.objectStore(STORE_NAME)
    const request = store.delete(id)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(new Error("Failed to delete book"))
  })
}

export async function getStats() {
  if (!db) await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STATS_STORE, "readonly")
    const store = tx.objectStore(STATS_STORE)
    const request = store.get("globalStats")

    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result)
      } else {
        resolve(null)
      }
    }
    request.onerror = () => reject(new Error("Failed to get stats"))
  })
}

export async function saveStats(stats) {
  if (!db) await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STATS_STORE, "readwrite")
    const store = tx.objectStore(STATS_STORE)
    const request = store.put(stats)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(new Error("Failed to save stats"))
  })
}
