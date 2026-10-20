(() => {
  const translations = window.SITE_I18N || { zh: {}, en: {} };
  const root = document.documentElement;
  const page = document.body.dataset.page || 'home';
  const storage = {
    get(key) { try { return localStorage.getItem(key); } catch (_) { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (_) {} }
  };

  let language = storage.get('site-language-v2');
  if (language !== 'zh' && language !== 'en') {
    language = 'en';
  }

  const text = (key) => translations[language]?.[key] ?? translations.zh?.[key] ?? key;

  function applyLanguage(nextLanguage, persist = false) {
    language = nextLanguage === 'en' ? 'en' : 'zh';
    root.lang = language === 'en' ? 'en' : 'zh-CN';

    document.querySelectorAll('[data-i18n]').forEach((element) => {
      element.textContent = text(element.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((element) => {
      element.setAttribute('aria-label', text(element.dataset.i18nAria));
    });

    const titleKey = `meta.${page}.title`;
    const descriptionKey = `meta.${page}.description`;
    if (translations[language]?.[titleKey]) document.title = text(titleKey);
    const description = document.querySelector('meta[name="description"]');
    if (description && translations[language]?.[descriptionKey]) description.content = text(descriptionKey);

    document.querySelectorAll('[data-lang-toggle]').forEach((button) => {
      button.hidden = false;
      button.setAttribute('aria-pressed', String(language === 'en'));
      button.setAttribute('aria-label', text('lang.switch'));
      button.querySelector('[data-lang-zh]')?.classList.toggle('is-active', language === 'zh');
      button.querySelector('[data-lang-en]')?.classList.toggle('is-active', language === 'en');
    });

    updateMotionControl();
    if (persist) storage.set('site-language-v2', language);
  }

  document.querySelectorAll('[data-lang-toggle]').forEach((button) => {
    button.addEventListener('click', () => applyLanguage(language === 'zh' ? 'en' : 'zh', true));
  });

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let motionEnabled = storage.get('motion') !== 'off' && !reducedMotion.matches;
  let field = null;

  function updateMotionControl() {
    document.querySelectorAll('[data-motion-toggle]').forEach((button) => {
      button.hidden = false;
      button.disabled = reducedMotion.matches;
      button.setAttribute('aria-pressed', String(motionEnabled));
      button.setAttribute('aria-label', text(motionEnabled ? 'motion.disable' : 'motion.enable'));
      const state = button.querySelector('[data-motion-state]');
      if (state) state.textContent = text(motionEnabled ? 'motion.on' : 'motion.off');
    });
  }

  document.querySelectorAll('[data-motion-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      if (reducedMotion.matches) return;
      motionEnabled = !motionEnabled;
      storage.set('motion', motionEnabled ? 'on' : 'off');
      updateMotionControl();
      field?.setMotion(motionEnabled);
    });
  });

  class SignalField {
    constructor(canvas) {
      this.canvas = canvas;
      this.context = canvas.getContext('2d', { alpha: true });
      this.host = canvas.parentElement;
      this.nodes = [];
      this.pointer = { x: -1000, y: -1000, active: false };
      this.frame = 0;
      this.running = false;
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.host);
      this.host.addEventListener('pointermove', (event) => this.movePointer(event), { passive: true });
      this.host.addEventListener('pointerleave', () => { this.pointer.active = false; });
      document.addEventListener('visibilitychange', () => this.visibility());
      this.resize();
    }

    resize() {
      const bounds = this.host.getBoundingClientRect();
      this.width = Math.max(1, bounds.width);
      this.height = Math.max(1, bounds.height);
      this.ratio = Math.min(devicePixelRatio || 1, 2);
      this.canvas.width = Math.round(this.width * this.ratio);
      this.canvas.height = Math.round(this.height * this.ratio);
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;
      this.context.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
      this.buildNodes();
      this.draw();
    }

    buildNodes() {
      const count = this.width < 600 ? 22 : Math.min(58, Math.round(this.width / 24));
      this.nodes = Array.from({ length: count }, (_, index) => ({
        x: ((index * 97) % 101) / 101 * this.width,
        y: ((index * 53 + 17) % 103) / 103 * this.height,
        vx: (((index * 29) % 11) - 5) * 0.018,
        vy: (((index * 37) % 13) - 6) * 0.016,
        size: index % 9 === 0 ? 2.2 : 1.15
      }));
    }

    movePointer(event) {
      const bounds = this.canvas.getBoundingClientRect();
      this.pointer.x = event.clientX - bounds.left;
      this.pointer.y = event.clientY - bounds.top;
      this.pointer.active = true;
    }

    visibility() {
      if (document.hidden) this.stop();
      else if (motionEnabled) this.start();
    }

    setMotion(enabled) {
      enabled ? this.start() : this.stop();
      this.draw();
    }

    start() {
      if (this.running || document.hidden || reducedMotion.matches) return;
      this.running = true;
      const tick = () => {
        if (!this.running) return;
        this.step();
        this.draw();
        this.frame = requestAnimationFrame(tick);
      };
      this.frame = requestAnimationFrame(tick);
    }

    stop() {
      this.running = false;
      cancelAnimationFrame(this.frame);
    }

    step() {
      this.nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > this.width) node.vx *= -1;
        if (node.y < 0 || node.y > this.height) node.vy *= -1;
        if (this.pointer.active) {
          const dx = this.pointer.x - node.x;
          const dy = this.pointer.y - node.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 170 && distance > 1) {
            node.x -= (dx / distance) * 0.07;
            node.y -= (dy / distance) * 0.07;
          }
        }
      });
    }

    draw() {
      const ctx = this.context;
      if (!ctx) return;
      ctx.clearRect(0, 0, this.width, this.height);
      const connection = this.width < 600 ? 105 : 145;

      for (let i = 0; i < this.nodes.length; i += 1) {
        const a = this.nodes[i];
        for (let j = i + 1; j < this.nodes.length; j += 1) {
          const b = this.nodes[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance < connection) {
            ctx.strokeStyle = `rgba(108,124,255,${(1 - distance / connection) * 0.23})`;
            ctx.lineWidth = 0.65;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        if (this.pointer.active) {
          const pointerDistance = Math.hypot(a.x - this.pointer.x, a.y - this.pointer.y);
          if (pointerDistance < 190) {
            ctx.strokeStyle = `rgba(139,92,246,${(1 - pointerDistance / 190) * 0.5})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(this.pointer.x, this.pointer.y);
            ctx.stroke();
          }
        }

        ctx.fillStyle = a.size > 2 ? '#8b5cf6' : 'rgba(244,244,240,.48)';
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  const canvas = document.querySelector('#signal-canvas');
  if (canvas) {
    field = new SignalField(canvas);
    if (motionEnabled) field.start();
  }

  function openHashTarget() {
    if (!location.hash) return;
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target instanceof HTMLDetailsElement) target.open = true;
  }

  openHashTarget();
  addEventListener('hashchange', openHashTarget);
  reducedMotion.addEventListener?.('change', () => {
    if (reducedMotion.matches) {
      motionEnabled = false;
      field?.setMotion(false);
    }
    updateMotionControl();
  });

  applyLanguage(language);
  updateMotionControl();
})();
