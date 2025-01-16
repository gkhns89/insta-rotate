function rotateVideo() {
    const videoContainer = document.querySelector('video');
  
    if (videoContainer) {
      const parent = videoContainer.closest('[role="dialog"]'); // Video dialogunu bul
      if (parent) {
        parent.style.transform = parent.style.transform === 'rotate(90deg)' ? '' : 'rotate(90deg)';
        parent.style.transformOrigin = 'center';
      } else {
        alert("Video alanı bulunamadı.");
      }
    } else {
      alert("Video bulunamadı.");
    }
  }
  
  // Video döndürme fonksiyonunu çağır
  rotateVideo();
  