const STORAGE_KEY = "photobooth_history";
const MAX_ENTRIES = 20; // keep this modest — each entry is a full PNG data URL

export function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function persist(history) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function saveToHistory(dataUrl) {
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    dataUrl,
    timestamp: Date.now(),
  };

  const history = loadHistory();
  const updated = [entry, ...history].slice(0, MAX_ENTRIES);

  try {
    persist(updated);
    return updated;
  } catch (e) {
    // Storage quota exceeded — trim harder and try once more. If it
    // still fails, just keep the new entry in memory for this session
    // without persisting, rather than losing the photo entirely.
    try {
      const trimmed = [entry, ...history.slice(0, Math.floor(history.length / 2))];
      persist(trimmed);
      return trimmed;
    } catch (e2) {
      console.warn("Gagal menyimpan riwayat ke localStorage (kemungkinan penuh).");
      return updated;
    }
  }
}

export function deleteFromHistory(id) {
  const history = loadHistory().filter((item) => item.id !== id);
  try {
    persist(history);
  } catch (e) { /* ignore — deletion at least reflects in memory via caller's state */ }
  return history;
}

export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) { /* ignore */ }
  return [];
}