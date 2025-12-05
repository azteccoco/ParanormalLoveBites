// Simple lazy loader with low-res placeholder -> full image swap
// - Observes images with class 'lazy'
// - If the image has a `data-src` attribute, swaps it in when visible
// - Removes the blur placeholder by toggling classes once fully loaded

(function () {
  if (typeof window === 'undefined') return;

  var lazyClass = 'lazy';
  var loadedClass = 'lazy-loaded';

  function onIntersection(entries, observer) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var img = entry.target;
        // Avoid processing same image twice
        if (!img.dataset || img.dataset._lazyProcessed) return;
        img.dataset._lazyProcessed = '1';

        var src = img.dataset.src;
        var srcset = img.dataset.srcset;

        if (src) {
          // Start loading the full image
          var full = new Image();
          if (srcset) full.srcset = srcset;
          full.src = src;
          full.onload = function () {
            // Swap the src/srcset onto the actual image element
            if (srcset) img.srcset = srcset;
            img.src = src;
            img.classList.add(loadedClass);
            img.classList.remove(lazyClass);
            // remove data attributes
            try { delete img.dataset.src; } catch(e) {}
            try { delete img.dataset.srcset; } catch(e) {}
          };
          full.onerror = function () {
            img.classList.remove(lazyClass);
          };
        } else {
          // Nothing to load, just remove placeholder classes
          img.classList.add(loadedClass);
          img.classList.remove(lazyClass);
        }

        observer.unobserve(img);
      }
    });
  }

  function init() {
    var images = Array.prototype.slice.call(document.querySelectorAll('img.lazy'));
    if (!images.length) return;

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(onIntersection, {
        rootMargin: '200px 0px',
        threshold: 0.01
      });
      images.forEach(function (img) { io.observe(img); });
    } else {
      // Fallback: load all immediately
      images.forEach(function (img) {
        var src = img.dataset.src;
        if (src) img.src = src;
        img.classList.remove(lazyClass);
      });
    }
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(init, 0);
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
