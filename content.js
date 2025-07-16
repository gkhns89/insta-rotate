(function() {
  'use strict';
  
  // Processed videos tracker
  const processedVideos = new WeakSet();
  
  // Debounce function for performance
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  function addRotateButton(video) {
    // Skip if already processed
    if (processedVideos.has(video)) return;
    
    // Find the correct container
    const container = video.closest('div[role="button"]') || 
                     video.closest('div[style*="position"]') || 
                     video.parentElement;
    
    if (!container) return;
    
    // Mark as processed
    processedVideos.add(video);
    
    // Create rotate button
    const rotateButton = document.createElement('button');
    rotateButton.className = 'instagram-video-rotator-btn';
    rotateButton.setAttribute('aria-label', 'Videoyu döndür');
    rotateButton.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 12px;
      left: 12px;
      cursor: pointer;
      z-index: 9999;
      transition: all 0.3s ease;
      opacity: 0;
      pointer-events: none;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(10px);
    `;
    
    // Rotate icon - Daha belirgin dönen ok ikonu
    rotateButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
        <path d="M1 4v6h6"/>
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
        <path d="M23 20v-6h-6"/>
        <path d="M20.49 9a9 9 0 1 0-2.13 9.36L23 14"/>
      </svg>
    `;
    
    // Click handler
    rotateButton.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      
      let currentRotation = parseInt(video.dataset.rotation || '0', 10);
      currentRotation = (currentRotation + 90) % 360;
      
      video.style.transform = `rotate(${currentRotation}deg)`;
      video.style.transformOrigin = 'center';
      video.dataset.rotation = currentRotation.toString();
      
      // Adjust container size if needed
      if (currentRotation === 90 || currentRotation === 270) {
        const article = video.closest('article');
        if (article) {
          const mediaContainer = article.querySelector('div[style*="max-width"], div[style*="width"]');
          if (mediaContainer) {
            mediaContainer.style.maxWidth = '600px';
            mediaContainer.style.width = '600px';
          }
        }
      } else {
        const article = video.closest('article');
        if (article) {
          const mediaContainer = article.querySelector('div[style*="max-width"], div[style*="width"]');
          if (mediaContainer) {
            mediaContainer.style.maxWidth = '';
            mediaContainer.style.width = '';
          }
        }
      }
    });
    
    // Show/hide button on hover with scale effect
    const showButton = () => {
      rotateButton.style.opacity = '1';
      rotateButton.style.pointerEvents = 'auto';
      rotateButton.style.transform = 'scale(1)';
    };
    
    const hideButton = () => {
      rotateButton.style.opacity = '0';
      rotateButton.style.pointerEvents = 'none';
      rotateButton.style.transform = 'scale(0.8)';
    };
    
    // Hover effect for the button itself
    rotateButton.addEventListener('mouseenter', () => {
      rotateButton.style.transform = 'scale(1.1)';
      rotateButton.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.6)';
    });
    
    rotateButton.addEventListener('mouseleave', () => {
      rotateButton.style.transform = 'scale(1)';
      rotateButton.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.4)';
    });
    
    // Set container position if needed
    if (getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }
    
    // Add hover listeners
    container.addEventListener('mouseenter', showButton);
    container.addEventListener('mouseleave', hideButton);
    
    // Add button to container
    container.appendChild(rotateButton);
  }
  
  function processVideos() {
    const videos = document.querySelectorAll('video:not([data-rotator-processed])');
    
    videos.forEach(video => {
      video.setAttribute('data-rotator-processed', 'true');
      
      // Wait for video to be ready
      if (video.readyState >= 1) {
        addRotateButton(video);
      } else {
        video.addEventListener('loadedmetadata', () => addRotateButton(video), { once: true });
      }
    });
  }
  
  // Debounced process function
  const debouncedProcess = debounce(processVideos, 100);
  
  // Initial process
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', processVideos);
  } else {
    processVideos();
  }
  
  // Observer for dynamic content
  const observer = new MutationObserver((mutations) => {
    let shouldProcess = false;
    
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        for (let node of mutation.addedNodes) {
          if (node.nodeType === 1 && (node.tagName === 'VIDEO' || node.querySelector('video'))) {
            shouldProcess = true;
            break;
          }
        }
      }
    });
    
    if (shouldProcess) {
      debouncedProcess();
    }
  });
  
  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    observer.disconnect();
  });
})();