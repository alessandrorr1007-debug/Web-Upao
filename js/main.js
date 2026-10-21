/**
 * UPAO S - Script Principal de la Landing Page
 * - Soporte de tema claro / oscuro con sincronización entre pestañas (Best practice modern-web-guidance)
 * - Carrusel interactivo de capturas de pantalla con soporte táctil y teclado
 * - Navegación fluida y enlaces accesibles
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initScreenshotsCarousel();
  initSmoothScroll();
  initLiveCounters();
  initApkUpdateMeta();
});

/* ==========================================================================
   1. GESTIÓN DE TEMA (CLARO / OSCURO)
   ========================================================================== */
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
  const docRoot = document.documentElement;

  if (!toggleBtn) return;

  // Determinar tema actual (localStorage o preferencia del sistema)
  function getCurrentScheme() {
    const saved = localStorage.getItem('color-scheme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // Actualizar UI del botón según el tema activo
  function updateToggleButton(theme) {
    const sunIcon = toggleBtn.querySelector('.icon-sun');
    const moonIcon = toggleBtn.querySelector('.icon-moon');
    
    if (theme === 'dark') {
      if (sunIcon) sunIcon.style.display = 'block';
      if (moonIcon) moonIcon.style.display = 'none';
      toggleBtn.setAttribute('aria-label', 'Cambiar a modo claro');
      toggleBtn.setAttribute('title', 'Modo oscuro activo (clic para modo claro)');
    } else {
      if (sunIcon) sunIcon.style.display = 'none';
      if (moonIcon) moonIcon.style.display = 'block';
      toggleBtn.setAttribute('aria-label', 'Cambiar a modo oscuro');
      toggleBtn.setAttribute('title', 'Modo claro activo (clic para modo oscuro)');
    }
  }

  // Aplicar tema en <meta>, atributo data-theme y CSS
  function applyTheme(theme, persist = false) {
    if (persist) {
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      // Si el usuario elige exactamente la preferencia del sistema, eliminamos la anulación para seguir el sistema
      if (theme === systemPreference) {
        localStorage.removeItem('color-scheme');
        if (metaColorScheme) metaColorScheme.content = 'light dark';
      } else {
        localStorage.setItem('color-scheme', theme);
        if (metaColorScheme) metaColorScheme.content = theme;
      }
    } else {
      if (metaColorScheme) {
        const saved = localStorage.getItem('color-scheme');
        metaColorScheme.content = saved ?? 'light dark';
      }
    }

    docRoot.setAttribute('data-theme', theme);
    updateToggleButton(theme);
  }

  // Evento de clic en el botón
  toggleBtn.addEventListener('click', () => {
    const current = getCurrentScheme();
    const nextTheme = current === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme, true);
  });

  // Sincronizar si cambia en otra pestaña
  window.addEventListener('storage', (e) => {
    if (e.key === 'color-scheme') {
      const newTheme = e.newValue || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      applyTheme(newTheme, false);
    }
  });

  // Reaccionar a cambios en la preferencia del sistema si no hay override guardado
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('color-scheme')) {
      applyTheme(e.matches ? 'dark' : 'light', false);
    }
  });

  // Inicializar estado visual del botón al cargar
  updateToggleButton(getCurrentScheme());
}

/* ==========================================================================
   2. CARRUSEL INTERACTIVO DE CAPTURAS DE PANTALLA
   ========================================================================== */
function initScreenshotsCarousel() {
  const track = document.getElementById('carousel-track');
  const slides = document.querySelectorAll('.carousel-slide');
  const tabBtns = document.querySelectorAll('.carousel-tab-btn');
  const dots = document.querySelectorAll('.carousel-dot');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  const totalSlides = slides.length;

  function goToSlide(index) {
    if (index < 0) {
      currentIndex = totalSlides - 1;
    } else if (index >= totalSlides) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }

    // Mover el carrusel
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    // Actualizar Pestañas
    tabBtns.forEach((tab, i) => {
      if (i === currentIndex) {
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
      } else {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
      }
    });

    // Actualizar Puntos
    dots.forEach((dot, i) => {
      if (i === currentIndex) {
        dot.classList.add('active');
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.classList.remove('active');
        dot.removeAttribute('aria-current');
      }
    });
  }

  // Botones Anterior / Siguiente
  if (prevBtn) {
    prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
  }

  // Clic en Pestañas
  tabBtns.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetIndex = parseInt(tab.getAttribute('data-slide-to'), 10);
      if (!isNaN(targetIndex)) goToSlide(targetIndex);
    });
  });

  // Clic en Puntos indicadores
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const targetIndex = parseInt(dot.getAttribute('data-slide-to'), 10);
      if (!isNaN(targetIndex)) goToSlide(targetIndex);
    });
  });

  // Navegación con Teclado
  track.parentElement.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      goToSlide(currentIndex - 1);
    } else if (e.key === 'ArrowRight') {
      goToSlide(currentIndex + 1);
    }
  });

  // Soporte de Deslizamiento Táctil (Touch Swipe) en Móviles
  let touchStartX = 0;
  let touchEndX = 0;

  track.parentElement.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  track.parentElement.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    if (diff > swipeThreshold) {
      // Deslizó hacia la izquierda -> siguiente
      goToSlide(currentIndex + 1);
    } else if (diff < -swipeThreshold) {
      // Deslizó hacia la derecha -> anterior
      goToSlide(currentIndex - 1);
    }
  }
}

/* ==========================================================================
   3. NAVEGACIÓN Y DESPLAZAMIENTO FLUIDO
   ========================================================================== */
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/* ==========================================================================
   4. CONTADOR REAL DE VISUALIZACIONES Y DESCARGAS (EN TIEMPO REAL)
   ========================================================================== */
function initLiveCounters() {
  const viewsEl = document.getElementById('stats-views-val');
  const downloadsEl = document.getElementById('stats-downloads-val');

  if (!viewsEl || !downloadsEl) return;

  const API_BASE = 'https://countapi.mileshilliard.com/api/v1';
  const VISITS_KEY = 'upaos_landing_visits';
  const DOWNLOADS_KEY = 'upaos_landing_downloads';

  const numberFormatter = new Intl.NumberFormat('es-PE');
  let currentDownloads = 0;

  // Animación suave de números
  function animateValue(element, start, end, duration = 800) {
    if (isNaN(end)) return;
    if (start === end) {
      element.textContent = numberFormatter.format(end);
      return;
    }

    const range = end - start;
    let startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Easing out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + range * easeProgress);
      element.textContent = numberFormatter.format(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        element.textContent = numberFormatter.format(end);
      }
    }

    window.requestAnimationFrame(step);
  }

  // 1. Manejo de Visualizaciones Reales (1 conteo por sesión)
  async function trackVisits() {
    const sessionKey = 'upaos_session_visited';
    const isCountedThisSession = sessionStorage.getItem(sessionKey);

    const endpoint = isCountedThisSession 
      ? `${API_BASE}/get/${VISITS_KEY}`
      : `${API_BASE}/hit/${VISITS_KEY}`;

    try {
      const res = await fetch(endpoint, { cache: 'no-cache' });
      if (res.ok) {
        const data = await res.json();
        const count = typeof data.value === 'number' ? data.value : 1;
        sessionStorage.setItem(sessionKey, 'true');
        localStorage.setItem('upaos_cache_visits', String(count));
        animateValue(viewsEl, 0, count, 1000);
      } else if (res.status === 404 && !isCountedThisSession) {
        // La clave aún no fue creada, inicializar con hit
        const initRes = await fetch(`${API_BASE}/hit/${VISITS_KEY}`, { cache: 'no-cache' });
        const initData = await initRes.json();
        const count = initData.value || 1;
        sessionStorage.setItem(sessionKey, 'true');
        localStorage.setItem('upaos_cache_visits', String(count));
        animateValue(viewsEl, 0, count, 1000);
      } else {
        throw new Error('Respuesta no satisfactoria');
      }
    } catch (e) {
      // Fallback usando caché local o 1
      const cached = parseInt(localStorage.getItem('upaos_cache_visits') || '1', 10);
      viewsEl.textContent = numberFormatter.format(cached);
    }
  }

  // 2. Manejo de Descargas Reales
  async function fetchDownloads() {
    try {
      const res = await fetch(`${API_BASE}/get/${DOWNLOADS_KEY}`, { cache: 'no-cache' });
      if (res.ok) {
        const data = await res.json();
        currentDownloads = typeof data.value === 'number' ? data.value : 0;
        localStorage.setItem('upaos_cache_downloads', String(currentDownloads));
        animateValue(downloadsEl, 0, currentDownloads, 1000);
      } else if (res.status === 404) {
        // Clave aún no inicializada (0 descargas)
        currentDownloads = 0;
        downloadsEl.textContent = '0';
      } else {
        throw new Error('Error al consultar descargas');
      }
    } catch (e) {
      const cached = parseInt(localStorage.getItem('upaos_cache_downloads') || '0', 10);
      currentDownloads = cached;
      downloadsEl.textContent = numberFormatter.format(cached);
    }
  }

  // 3. Registrar descarga al hacer clic en los botones
  function setupDownloadTracking() {
    const downloadButtons = document.querySelectorAll('a[download], a[href*="downloads/app.apk"]');

    downloadButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Incrementar valor local de inmediato para feedback instantáneo
        currentDownloads += 1;
        downloadsEl.textContent = numberFormatter.format(currentDownloads);
        downloadsEl.classList.remove('bump');
        // Trigger reflow para reiniciar animación CSS
        void downloadsEl.offsetWidth;
        downloadsEl.classList.add('bump');

        setTimeout(() => {
          downloadsEl.classList.remove('bump');
        }, 500);

        localStorage.setItem('upaos_cache_downloads', String(currentDownloads));

        // Registrar en la nube
        try {
          fetch(`${API_BASE}/hit/${DOWNLOADS_KEY}`, {
            method: 'GET',
            cache: 'no-cache',
            keepalive: true
          }).catch(() => {});
        } catch (e) {}
      });
    });
  }

  trackVisits();
  fetchDownloads();
  setupDownloadTracking();
}

/* ==========================================================================
   5. FECHA Y HORA DE ÚLTIMA ACTUALIZACIÓN DEL APK
   ========================================================================== */
function initApkUpdateMeta() {
  const timestampEls = document.querySelectorAll('.apk-update-timestamp-text');
  if (timestampEls.length === 0) return;

  const defaultFormatted = '20 de octubre de 2026, 19:00 hrs';

  async function checkApkTimestamp() {
    try {
      const response = await fetch('downloads/app.apk', {
        method: 'HEAD',
        cache: 'no-cache'
      });

      if (!response.ok) return;

      const lastModified = response.headers.get('Last-Modified');
      if (!lastModified) return;

      const date = new Date(lastModified);
      if (isNaN(date.getTime())) return;

      const formatted = new Intl.DateTimeFormat('es-PE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(date);

      const finalString = `${formatted} hrs`;
      timestampEls.forEach(el => {
        el.textContent = finalString;
      });
    } catch (e) {
      // Si falla (por ejemplo en protocolo file:// o CORS local), se mantiene el valor por defecto
      timestampEls.forEach(el => {
        if (!el.textContent.trim()) {
          el.textContent = defaultFormatted;
        }
      });
    }
  }

  checkApkTimestamp();
}

