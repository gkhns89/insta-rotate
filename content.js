function addRotateButtonToVideos() {
    const videoElements = document.querySelectorAll('video');
  
    videoElements.forEach((video) => {
      const parent = video.closest('div[data-instancekey]');
      if (parent && !parent.querySelector('.rotate-btn')) {
        // Buton zaten ekliyse tekrar ekleme
        const button = document.createElement('button');
        button.innerText = 'Döndür';
        button.className = 'rotate-btn';
        button.style.position = 'absolute';
        button.style.top = '10px';
        button.style.right = '10px';
        button.style.zIndex = '1000';
        button.style.padding = '10px';
        button.style.backgroundColor = '#007bff';
        button.style.color = '#fff';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
  
        button.addEventListener('click', () => {
          const currentRotation = parent.style.transform || 'rotate(0deg)';
          parent.style.transform =
            currentRotation === 'rotate(90deg)' ? 'rotate(0deg)' : 'rotate(90deg)';
          parent.style.transformOrigin = 'center';
        });
  
        parent.style.position = 'relative'; // Parent'in konumlandırmasını düzenle
        parent.appendChild(button);
      }
    });
  }
  
  // DOM değişikliklerini dinle
  const observer = new MutationObserver(() => {
    addRotateButtonToVideos();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Sayfa yüklendiğinde başlat
  addRotateButtonToVideos();
  