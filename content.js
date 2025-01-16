function addRotateButton() {
    // Videoları bul
    const video = document.querySelector('video');
    
    if (video) {
      // Video öğesinin bulunduğu üst div'i bul
      const videoDiv = video.closest('div');
      
      // Döndürme butonunu yalnızca bir kez ekleyebilmek için kontrol ediyoruz
      if (videoDiv && !videoDiv.querySelector('.rotate-btn')) {
        // "Döndür" butonunu oluştur
        const rotateButton = document.createElement('button');
        rotateButton.className = 'rotate-btn';
        rotateButton.setAttribute('aria-label', 'Videoyu döndür');
        rotateButton.style.cssText = `
        background-color: #262626;
        border: none;
        border-radius: 50%; /* Yuvarlak görünüm */
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 25px; /* Ses butonunun yatayda */
        right: 25px; /* Ses butonunun sağında */
        cursor: pointer;
        z-index: 9999;
      `;
    
        // Döndürme simgesi (SVG)
        rotateButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="white">
          <path d="M12 2v2.6c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6H4c0 4.4 3.6 8 8 8s8-3.6 8-8-3.6-8-8-8zm0 4l-4 4h3v6h2v-6h3l-4-4z"></path>
        </svg>
      `;
      
    
        // Döndürme işlevi
        rotateButton.addEventListener('click', () => {
          const currentRotation = video.style.transform || 'rotate(0deg)';
          const newRotation = currentRotation === 'rotate(90deg)' ? 'rotate(0deg)' : 'rotate(90deg)';
          video.style.transform = newRotation;
          video.style.transformOrigin = 'center';
        });
    
        // Döndürme butonunu videoDiv'e ekle
        videoDiv.appendChild(rotateButton);
      }
    }
  }
  
  // DOM değişikliklerini dinle
  const observer = new MutationObserver(() => {
    addRotateButton();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Sayfa yüklendiğinde başlat
  addRotateButton();
  