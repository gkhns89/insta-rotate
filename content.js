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
      background: rgba(0, 0, 0, 0.8);
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 10px;
      right: 10px;
      cursor: pointer;
      z-index: 9999;
      transition: all 0.3s ease;
      opacity: 0;
      pointer-events: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    `;
    
    // Rotate icon
    rotateButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
        <path d="M12 2l3.09 3.09L9.91 10.4l-.7-.7L12 7.76V2zm3.09 15.91L12 14.76V20l-2.79-2.79-.7.7 5.18 5.18L18.18 18.18l-.7-.7L12 22.24V17.76l3.09 3.09z"/>
        <path d="M7.34 6.41l.7-.7L12 9.66l3.96-3.95.7.7L12 11.07 7.34 6.41z"/>
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
    
    // Show/hide button on hover
    const showButton = () => {
      rotateButton.style.opacity = '1';
      rotateButton.style.pointerEvents = 'auto';
    };
    
    const hideButton = () => {
      rotateButton.style.opacity = '0';
      rotateButton.style.pointerEvents = 'none';
    };
    
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