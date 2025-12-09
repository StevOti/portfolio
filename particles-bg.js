(function () {
  // Initialize particles background for non-React (vanilla) site
  function initParticles(isDark) {
    try {
      // remove any old canvas belonging to particles.js
      const oldCanvas = document.querySelector('#particles-js canvas');
      if (oldCanvas) oldCanvas.remove();

      if (window.pJSDom && window.pJSDom.length > 0) {
        window.pJSDom.forEach(function (p) {
          try {
            p.pJS.fn.vendors.destroypJS();
          } catch (e) {
            // ignore
          }
        });
        window.pJSDom = [];
      }

      var colors = isDark
        ? {
            particles: '#00f5ff',
            lines: '#00d9ff',
            accent: '#0096c7',
          }
        : {
            particles: '#0277bd',
            lines: '#0288d1',
            accent: '#039be5',
          };

      if (typeof window.particlesJS !== 'function') return;

      window.particlesJS('particles-js', {
        particles: {
          number: { value: 100, density: { enable: true, value_area: 800 } },
          color: { value: colors.particles },
          shape: { type: 'circle', stroke: { width: 0.5, color: colors.accent } },
          opacity: {
            value: 0.7,
            random: true,
            anim: { enable: true, speed: 1, opacity_min: 0.3 },
          },
          size: { value: 3, random: true, anim: { enable: true, speed: 2, size_min: 1 } },
          line_linked: {
            enable: true,
            distance: 160,
            color: colors.lines,
            opacity: 0.4,
            width: 1.2,
          },
          move: { enable: true, speed: 2, random: true, out_mode: 'bounce' },
        },
        interactivity: {
          detect_on: 'canvas',
          events: {
            onhover: { enable: true, mode: 'grab' },
            onclick: { enable: true, mode: 'push' },
            resize: true,
          },
          modes: {
            grab: { distance: 220, line_linked: { opacity: 0.8 } },
            push: { particles_nb: 4 },
            repulse: { distance: 180, duration: 0.4 },
          },
        },
        retina_detect: true,
      });
    } catch (err) {
      // swallow errors to avoid breaking page
      // console.error('particles init error', err);
    }
  }

  function detectDarkMode() {
    var body = document.body;
    // Your site uses `body.light-mode` to indicate light theme.
    // Return true if we should use the "dark" palette (i.e., not light-mode).
    if (body.classList.contains('light-mode')) return false;
    var html = document.documentElement;
    return html.classList.contains('dark') || html.getAttribute('data-theme') === 'dark';
  }

  function loadParticlesScript(callback) {
    // don't load twice
    if (document.querySelector('script[data-particles-cdn]')) {
      if (typeof callback === 'function') callback();
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
    script.async = true;
    script.setAttribute('data-particles-cdn', '1');
    script.onload = function () {
      if (typeof callback === 'function') callback();
    };
    script.onerror = function () {
      // failed to load CDN — do nothing
    };
    document.body.appendChild(script);
  }

  function setup() {
    loadParticlesScript(function () {
      // init first time
      initParticles(detectDarkMode());

      // observe theme toggles on <html> and <body>
      var html = document.documentElement;

      var observer = new MutationObserver(function (mutationsList) {
        // re-init particles when theme-related attributes/classes change
        initParticles(detectDarkMode());
      });

      try {
        observer.observe(html, { attributes: true, attributeFilter: ['class', 'data-theme'] });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-theme'] });
      } catch (e) {
        // ignore
      }

      // keep references for cleanup if needed
      window.__particlesBgObserver = observer;
    });
  }

  // Run when DOM ready — but also run immediately if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }

  // cleanup on unload
  window.addEventListener('beforeunload', function () {
    try {
      if (window.__particlesBgObserver) {
        window.__particlesBgObserver.disconnect();
      }
      var script = document.querySelector('script[data-particles-cdn]');
      if (script) script.remove();
      if (window.pJSDom && window.pJSDom.length > 0) {
        window.pJSDom.forEach(function (p) {
          try {
            p.pJS.fn.vendors.destroypJS();
          } catch (e) {}
        });
        window.pJSDom = [];
      }
    } catch (e) {}
  });
})();
