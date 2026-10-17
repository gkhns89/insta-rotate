(() => {
  'use strict';

  if (window.__instagramVideoRotator) return;
  window.__instagramVideoRotator = true;

  const EDGE = 12;            // buton ile video kenarı arasındaki boşluk
  const MIN_VIDEO_SIZE = 120; // bundan küçük videolara (ör. önizleme) buton gösterme
  const SIZE_TOLERANCE = 2;   // "aynı boyutta" sayılacak piksel farkı

  const states = new WeakMap(); // video -> durum
  const active = new Set();     // şu an döndürülmüş videoların durumları
  const placements = new WeakMap(); // video -> butonun video içindeki yeri
  const videos = document.getElementsByTagName('video'); // canlı liste, MutationObserver gerekmez

  let current = null;   // butonun gösterildiği video
  let pointer = null;   // { x, y, target }
  let rafPending = false;

  // ---------------------------------------------------------------------------
  // Buton
  // ---------------------------------------------------------------------------

  const style = document.createElement('style');
  style.textContent = `
    .ivr-btn {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 2147483646;
      width: 44px;
      height: 44px;
      margin: 0;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      border: 1.5px solid rgba(255, 255, 255, 0.22);
      border-radius: 50%;
      background: rgba(19, 23, 25, 0.55);
      -webkit-backdrop-filter: blur(14px) saturate(160%);
      backdrop-filter: blur(14px) saturate(160%);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
      cursor: pointer;
      opacity: 0;
      pointer-events: none;
      transform: scale(0.85);
      transition: opacity 0.18s ease, transform 0.18s ease, background-color 0.18s ease;
    }
    .ivr-btn.ivr-show {
      opacity: 1;
      pointer-events: auto;
      transform: scale(1);
    }
    .ivr-btn.ivr-show:hover {
      background-color: rgba(19, 23, 25, 0.72);
      transform: scale(1.08);
    }
    .ivr-btn.ivr-show:active {
      transform: scale(0.94);
    }
    /* Döndürülmüşken kenar G.Codes mavisi halkaya döner. */
    .ivr-btn::before {
      content: '';
      position: absolute;
      inset: -1.5px;
      padding: 2px;
      border-radius: 50%;
      background: linear-gradient(45deg, #1e87b4, #7cc4e3, #d6ecf5);
      -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      opacity: 0;
      transition: opacity 0.18s ease;
      pointer-events: none;
    }
    .ivr-btn.ivr-on::before {
      opacity: 1;
    }
    .ivr-btn svg {
      width: 32px;
      height: 32px;
      pointer-events: none;
    }
  `;
  (document.head || document.documentElement).appendChild(style);

  // Metinler _locales/<dil>/messages.json'dan gelir; uzantı dışında (test
  // sayfası) chrome.i18n yoksa İngilizce yedeğe düşer.
  function t(key, fallback) {
    try {
      return chrome.i18n.getMessage(key) || fallback;
    } catch {
      return fallback;
    }
  }

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'ivr-btn';
  button.setAttribute('aria-label', t('rotateLabel', 'Rotate video'));
  button.title = t('rotateTitle', 'Rotate video (Shift + click: other direction)');
  // logo.svg'nin dış çerçeve ve "90" rozeti olmadan hali. viewBox, ok
  // ucu dahil her şey yuvarlak butonun içine sığacak şekilde ortalanmış.
  button.innerHTML = `
    <svg viewBox="18 18 92 92" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ivr-arc" gradientUnits="userSpaceOnUse" x1="100" y1="28" x2="34" y2="98">
          <stop offset="0" stop-color="#d6ecf5"/>
          <stop offset="0.35" stop-color="#7cc4e3"/>
          <stop offset="1" stop-color="#1e87b4"/>
        </linearGradient>
      </defs>
      <path d="M34.5 64A29.5 29.5 0 1 0 39.26 47.93L36.5 34.5" fill="none" stroke="url(#ivr-arc)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M56.5 56L56.5 72L71.5 64Z" fill="#a9c2c9" stroke="#a9c2c9" stroke-width="7" stroke-linejoin="round"/>
    </svg>
  `;
  (document.body || document.documentElement).appendChild(button);

  // Buton Instagram'ın ağacının dışında; yine de olayların document'a
  // ulaşıp videoyu durdurmasını / dialog'u kapatmasını engelle.
  for (const type of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'dblclick']) {
    button.addEventListener(type, (e) => e.stopPropagation());
  }
  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (current) rotate(current, e.shiftKey ? 90 : -90);
  });

  // ---------------------------------------------------------------------------
  // Stil kaydetme / geri yükleme
  // ---------------------------------------------------------------------------

  // Sadece dokunduğumuz özellikleri saklar; Instagram'ın kendi inline
  // stillerine geri yüklemede dokunmayız.
  function setStyles(st, el, props) {
    let saved = st.touched.get(el);
    if (!saved) {
      saved = {};
      st.touched.set(el, saved);
    }
    for (const [prop, value] of Object.entries(props)) {
      if (!(prop in saved)) {
        saved[prop] = [el.style.getPropertyValue(prop), el.style.getPropertyPriority(prop)];
      }
      el.style.setProperty(prop, value, 'important');
    }
  }

  function restoreStyles(st) {
    for (const [el, saved] of st.touched) {
      for (const [prop, [value, priority]] of Object.entries(saved)) {
        if (value) el.style.setProperty(prop, value, priority);
        else el.style.removeProperty(prop);
      }
    }
    st.touched.clear();
  }

  // ---------------------------------------------------------------------------
  // Döndürme
  // ---------------------------------------------------------------------------

  const visibilityObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      // Video ekrandan tamamen çıktıysa (sonraki reels'e geçildi, sayfa
      // değişti, video DOM'dan kaldırıldı) eski haline dön.
      if (!entry.isIntersecting) {
        const st = states.get(entry.target);
        if (st) reset(st);
      }
    }
  });

  function getState(video) {
    let st = states.get(video);
    if (!st) {
      st = { video, angle: 0, touched: new Map() };
      states.set(video, st);
      // Instagram aynı <video> öğesine başka bir kaynak yüklerse sıfırla.
      video.addEventListener('emptied', () => reset(st));
    }
    return st;
  }

  function rotate(video, delta) {
    const st = getState(video);
    st.angle = (st.angle + delta + 360) % 360;

    if (st.angle === 0) {
      reset(st);
    } else if (!video.videoWidth) {
      video.addEventListener('loadedmetadata', () => {
        if (st.angle) apply(st);
      }, { once: true });
    } else {
      apply(st);
    }
    refreshButton();
  }

  function reset(st) {
    restoreStyles(st);
    st.angle = 0;
    if (active.delete(st)) visibilityObserver.unobserve(st.video);
    if (st.video === current) refreshButton();
  }

  function sameSize(a, b) {
    return Math.abs(a.width - b.width) <= SIZE_TOLERANCE &&
           Math.abs(a.height - b.height) <= SIZE_TOLERANCE;
  }

  function isInDialog(el) {
    return !!el.closest('[role="dialog"]');
  }

  // Ana sayfa akışı: sütun genişliği sabit, sadece kutunun içinde döndür.
  function isFeedPost(video) {
    return !isInDialog(video) &&
           !location.pathname.startsWith('/reels') &&
           !!video.closest('article');
  }

  function apply(st) {
    const video = st.video;

    // Her zaman orijinal yerleşimden ölçmek için önce geri al.
    restoreStyles(st);

    if (!active.has(st)) {
      active.add(st);
      visibilityObserver.observe(video);
    }

    if (st.angle === 180) {
      setStyles(st, video, { transform: 'rotate(180deg)' });
      return;
    }

    const videoRect = video.getBoundingClientRect();
    if (!videoRect.width || !videoRect.height || !video.parentElement) return;

    // Videoyla birebir aynı boyuttaki sarmalayıcılar = video "çerçevesi".
    // Instagram'ın ses / etiket gibi butonları bu çerçeveye göre konumlanır.
    const chain = [];
    for (let el = video.parentElement, i = 0; el && el !== document.body && i < 12; el = el.parentElement, i++) {
      if (!sameSize(el.getBoundingClientRect(), videoRect)) break;
      chain.push(el);
    }
    if (!chain.length) chain.push(video.parentElement);

    const frame = chain[chain.length - 1];
    const frameRect = frame.getBoundingClientRect();
    const W = frameRect.width;
    const H = frameRect.height;

    // Döndürülmüş içeriğin en-boy oranı (genişlik / yükseklik).
    const ratio = video.videoHeight / video.videoWidth;

    // Reels / dialog'da çerçeveyi Instagram'ın yatay video moduna benzer
    // şekilde genişlet. Yükseklik hiç değişmez; böylece kaydırma ve
    // snap konumları bozulmaz.
    let targetW = W;
    if (!isFeedPost(video)) {
      const maxW = Math.max(W, window.innerWidth * (isInDialog(video) ? 0.5 : 0.6));
      targetW = Math.round(Math.min(Math.max(W, H * ratio), maxW));
    }

    // Genişlik verilmeden önce ölç: çerçeveyle aynı genişlikteki sabit
    // sarmalayıcılar da genişlemeli, yoksa çerçeve taşar ve yan butonların
    // üstüne biner. İlk farklı genişlikte durulur (butonları içeren satır).
    const wrappers = [];
    if (targetW > W + SIZE_TOLERANCE) {
      for (let el = frame.parentElement, i = 0; el && el !== document.body && i < 6; el = el.parentElement, i++) {
        if (Math.abs(el.getBoundingClientRect().width - W) > SIZE_TOLERANCE) break;
        wrappers.push(el);
      }
    }

    const widthProps = {
      width: `${targetW}px`,
      'min-width': `${targetW}px`,
      'max-width': 'none',
      'flex-shrink': '0'
    };

    for (const el of chain) {
      // Video absolute olacağı için yüksekliği sabitle; aksi halde
      // yüksekliği videodan gelen sarmalayıcılar çöker.
      setStyles(st, el, { ...widthProps, height: `${H}px` });
    }
    for (const el of wrappers) {
      setStyles(st, el, widthProps);
    }

    if (getComputedStyle(video.parentElement).position === 'static') {
      setStyles(st, video.parentElement, { position: 'relative' });
    }
    setStyles(st, frame, { 'background-color': '#000' });

    // Video kutusunu yan çevrilmiş boyutlarla kur ve döndür; dönünce
    // çerçeveyi tam olarak kaplar.
    setStyles(st, video, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      margin: '0',
      width: `${H}px`,
      height: `${targetW}px`,
      'min-width': '0',
      'min-height': '0',
      'max-width': 'none',
      'max-height': 'none',
      'object-fit': 'contain',
      'transform-origin': 'center center',
      transform: `translate(-50%, -50%) rotate(${st.angle}deg)`
    });
  }

  // ---------------------------------------------------------------------------
  // Butonun hangi videoda gösterileceği
  // ---------------------------------------------------------------------------

  function pickVideo(x, y, target) {
    if (target === button || button.contains(target)) return current;

    // Açık bir dialog varsa sadece onun içindeki videolar; arkada kalan
    // akış videolarına buton gösterme.
    const dialog = target instanceof Element ? target.closest('[role="dialog"]') : null;

    let best = null;
    let bestArea = Infinity;
    for (const video of videos) {
      const rect = video.getBoundingClientRect();
      if (rect.width < MIN_VIDEO_SIZE || rect.height < MIN_VIDEO_SIZE) continue;
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) continue;
      if (dialog ? !dialog.contains(video) : isInDialog(video)) continue;

      const area = rect.width * rect.height;
      if (area < bestArea) {
        best = video;
        bestArea = area;
      }
    }
    return best;
  }

  // Instagram'ın video üstündeki öğeleri (paylaşan kişi, "...", ses,
  // etiketler) o noktada mı? Videoyu tamamen kaplayan şeffaf katmanlar sayılmaz.
  function isSpotFree(video, rect, cx, cy, half) {
    const fullArea = rect.width * rect.height;
    const points = [[cx, cy], [cx - half, cy - half], [cx + half, cy - half], [cx - half, cy + half], [cx + half, cy + half]];
    for (const [x, y] of points) {
      for (const el of document.elementsFromPoint(rect.left + x, rect.top + y)) {
        if (el === video) break;
        if (button.contains(el)) continue;
        const r = el.getBoundingClientRect();
        if (r.width * r.height < fullArea * 0.5) return false;
      }
    }
    return true;
  }

  // Butonun video içindeki konumu (merkezi, videoya göre). Video başına
  // bir kez hesaplanır; boyut değişince (döndürme, pencere) yeniden.
  function findSpot(video, rect, size) {
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    const cached = placements.get(video);
    if (cached && cached.w === w && cached.h === h) return cached;

    const half = size / 2;
    const m = EDGE + half;
    const spots = [
      { x: w - m, y: h / 2 }, // sağ orta
      { x: m, y: h / 2 },     // sol orta
      { x: w - m, y: m },     // sağ üst
      { x: m, y: m }          // sol üst
    ];
    const spot = spots.find((s) => isSpotFree(video, rect, s.x, s.y, half)) || spots[0];
    const placement = { w, h, x: spot.x, y: spot.y };
    placements.set(video, placement);
    return placement;
  }

  function refreshButton() {
    const video = pointer && pickVideo(pointer.x, pointer.y, pointer.target);
    current = video;

    if (!video || document.fullscreenElement) {
      button.classList.remove('ivr-show');
      return;
    }

    const rect = video.getBoundingClientRect();
    const size = button.offsetWidth;
    const spot = findSpot(video, rect, size);

    // Video ekranın dışına taşıyorsa butonu görünen kısmın içinde tut.
    const minTop = Math.max(rect.top, 0) + EDGE;
    const maxTop = Math.min(rect.bottom, window.innerHeight) - EDGE - size;
    if (maxTop < minTop) {
      button.classList.remove('ivr-show');
      return;
    }

    button.style.left = `${rect.left + spot.x - size / 2}px`;
    button.style.top = `${Math.min(Math.max(rect.top + spot.y - size / 2, minTop), maxTop)}px`;
    button.classList.toggle('ivr-on', !!states.get(video)?.angle);
    button.classList.add('ivr-show');
  }

  function scheduleRefresh() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      refreshButton();
    });
  }

  window.addEventListener('pointermove', (e) => {
    pointer = { x: e.clientX, y: e.clientY, target: e.target };
    scheduleRefresh();
  }, { capture: true, passive: true });

  document.documentElement.addEventListener('mouseleave', () => {
    pointer = null;
    scheduleRefresh();
  });

  // Reels kendi iç kaydırıcısında kayar; capture ile hepsini yakala.
  document.addEventListener('scroll', scheduleRefresh, { capture: true, passive: true });

  let resizePending = false;
  window.addEventListener('resize', () => {
    if (resizePending) return;
    resizePending = true;
    requestAnimationFrame(() => {
      resizePending = false;
      for (const st of active) apply(st);
      refreshButton();
    });
  });
})();
