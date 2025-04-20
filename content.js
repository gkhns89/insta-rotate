function addRotateButtonsToAllVideos() {
  // Sayfadaki tüm <video> etiketlerini seç
  const videos = document.querySelectorAll("video");

  videos.forEach((video) => {
    const videoWrapper = video.closest("div");

    if (videoWrapper && !videoWrapper.querySelector(".rotate-btn")) {
      // Döndür butonunu oluştur
      const rotateButton = document.createElement("button");
      rotateButton.className = "rotate-btn";
      rotateButton.setAttribute("aria-label", "Videoyu döndür");
      rotateButton.style.cssText = `
        background-color: #262626;
        border: none;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 25px;
        right: 25px;
        cursor: pointer;
        z-index: 9999;
      `;

      // Simge: sola dönen ok
      rotateButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="white">
          <path d="M12 2v2.6c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6H4c0 4.4 3.6 8 8 8s8-3.6 8-8-3.6-8-8-8zm0 4l-4 4h3v6h2v-6h3l-4-4z"/>
        </svg>
      `;

      rotateButton.addEventListener("click", () => {
        // Mevcut dönüş değerini al (yoksa 0)
        let currentRotation = parseInt(video.dataset.rotation || "0", 10);
      
        // Saat yönünde döndürmek için 90 derece azalt
        currentRotation = (currentRotation + 270) % 360; // 360 - 90 = 270
      
        // Uygula
        video.style.transform = `rotate(${currentRotation}deg)`;
        video.style.transformOrigin = "center";
        video.dataset.rotation = currentRotation.toString();
      
        // Genişlik kontrolü (90 veya 270 derecede genişlet)
        const article = video.closest("article");
        if (article) {
          const topLevelDivs = Array.from(article.children);
          if (topLevelDivs.length > 0) {
            const mainDiv = topLevelDivs[0];
            const innerDivs = Array.from(mainDiv.children);
            const secondColumn = innerDivs[1];
      
            if (secondColumn) {
              if (currentRotation === 90 || currentRotation === 270) {
                secondColumn.style.width = "585px";
              } else {
                secondColumn.style.width = "";
              }
            }
          }
        }
      });

      // Butonu wrapper'a ekle
      videoWrapper.style.position = "relative"; // Butonun konumlandırılması için gerekli olabilir
      videoWrapper.appendChild(rotateButton);
    }
  });
}

// DOM değişikliklerini dinle
const observer = new MutationObserver(() => {
  addRotateButtonsToAllVideos();
});
observer.observe(document.body, { childList: true, subtree: true });

// Sayfa ilk yüklendiğinde başlat
addRotateButtonsToAllVideos();
