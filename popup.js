document.getElementById('rotate-btn').addEventListener('click', () => {
    chrome.scripting.executeScript({
      target: { allFrames: true },
      files: ['content.js']
    });
  });
  