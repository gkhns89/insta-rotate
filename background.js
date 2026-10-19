// Klavye kısayollarını (manifest "commands") aktif sekmedeki content script'e iletir.
// Kısayollar chrome://extensions/shortcuts sayfasından değiştirilebilir.

// Alt+Shift+← sola (saat yönünün tersine), Alt+Shift+→ sağa döndürür.
const DELTAS = {
  'rotate-video': -90,
  'rotate-video-reverse': 90
};

chrome.commands.onCommand.addListener((command, tab) => {
  if (!(command in DELTAS) || !tab?.id) return;
  // Instagram dışındaki sekmelerde content script yok; hatayı yok say.
  chrome.tabs.sendMessage(tab.id, { type: 'ivr-rotate', delta: DELTAS[command] }).catch(() => {});
});
