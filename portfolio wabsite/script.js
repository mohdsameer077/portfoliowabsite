/* ============================================================
   SAMEER KHAN — Portfolio JavaScript
   Features: Particles, Navbar, Scroll Reveal, Skill Bars,
             Hamburger, Back-to-Top, Form Validation
============================================================ */

/* ── DOM Ready ─────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initNavbar();
  initHamburger();
  initScrollReveal();
  initSkillBars();
  initBackToTop();
  initContactForm();
  setFooterYear();
});

/* ═══════════════════════════════════════════════════════════
   1. PARTICLE CANVAS BACKGROUND
═══════════════════════════════════════════════════════════ */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const COUNT = 65;
  const BLUE  = '37,99,235';

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x     = Math.random() * W;
      this.y     = Math.random() * H;
      this.r     = Math.random() * 1.6 + .4;
      this.vx    = (Math.random() - .5) * .35;
      this.vy    = (Math.random() - .5) * .35;
      this.alpha = Math.random() * .45 + .1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${BLUE},${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const MAX  = 130;
        if (dist < MAX) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${BLUE},${.15 * (1 - dist / MAX)})`;
          ctx.lineWidth   = .8;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(loop);
  }
  loop();
}

/* ═══════════════════════════════════════════════════════════
   2. STICKY NAVBAR — scroll class + active link
═══════════════════════════════════════════════════════════ */
function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 40);

    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    links.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ═══════════════════════════════════════════════════════════
   3. HAMBURGER MENU (mobile)
═══════════════════════════════════════════════════════════ */
function initHamburger() {
  const btn     = document.getElementById('hamburger');
  const menu    = document.getElementById('nav-links');
  const overlay = document.getElementById('mobile-overlay');

  function close() {
    btn.classList.remove('open');
    menu.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('open');
    menu.classList.toggle('open', open);
    overlay.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  overlay.addEventListener('click', close);
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
}

/* ═══════════════════════════════════════════════════════════
   4. SCROLL REVEAL ANIMATIONS (IntersectionObserver)
═══════════════════════════════════════════════════════════ */
function initScrollReveal() {
  const targets = document.querySelectorAll('[class*="reveal-"]');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );

  targets.forEach(el => observer.observe(el));
}

/* ═══════════════════════════════════════════════════════════
   5. ANIMATED SKILL BARS
═══════════════════════════════════════════════════════════ */
function initSkillBars() {
  const fills = document.querySelectorAll('.skill-fill');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  fills.forEach(f => observer.observe(f));
}

/* ═══════════════════════════════════════════════════════════
   6. BACK TO TOP BUTTON
═══════════════════════════════════════════════════════════ */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ═══════════════════════════════════════════════════════════
   7. CONTACT FORM VALIDATION + WHATSAPP REDIRECT
═══════════════════════════════════════════════════════════ */
function initContactForm() {
  const form      = document.getElementById('contact-form');
  if (!form) return;

  const nameInput  = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const msgInput   = document.getElementById('message');
  const submitBtn  = document.getElementById('submit-btn');
  const success    = document.getElementById('form-success');

  /* Live validation */
  nameInput.addEventListener('input',  () => validateField(nameInput,  'name-error',    validateName));
  emailInput.addEventListener('input', () => validateField(emailInput, 'email-error',   validateEmail));
  msgInput.addEventListener('input',   () => validateField(msgInput,   'message-error', validateMessage));

  form.addEventListener('submit', e => {
    e.preventDefault();

    const nameOk  = validateField(nameInput,  'name-error',    validateName);
    const emailOk = validateField(emailInput, 'email-error',   validateEmail);
    const msgOk   = validateField(msgInput,   'message-error', validateMessage);

    if (!nameOk || !emailOk || !msgOk) return;

    const name    = nameInput.value.trim();
    const email   = emailInput.value.trim();
    const message = msgInput.value.trim();

    /* Send via WhatsApp */
    const phoneNumber = "917466913603";
    const whatsappMessage =
      "Hello Sameer,%0A%0A" +
      "Name: " + encodeURIComponent(name) + "%0A" +
      "Email: " + encodeURIComponent(email) + "%0A" +
      "Message: " + encodeURIComponent(message);

    const whatsappURL = "https://wa.me/" + phoneNumber + "?text=" + whatsappMessage;

    /* Simulate sending */
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'Sending…';

    setTimeout(() => {
      window.open(whatsappURL, "_blank");
      form.reset();
      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent = 'Send Message';
      success.classList.add('show');
      setTimeout(() => success.classList.remove('show'), 5000);
    }, 800);
  });
}

/* ── Validators ─────────────────────────────────────────── */
function validateField(input, errorId, validatorFn) {
  const errEl = document.getElementById(errorId);
  const msg   = validatorFn(input.value.trim());
  errEl.textContent = msg;
  input.classList.toggle('error', !!msg);
  return !msg;
}

function validateName(v) {
  if (!v)           return 'Name is required.';
  if (v.length < 2) return 'Name must be at least 2 characters.';
  return '';
}

function validateEmail(v) {
  if (!v) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address.';
  return '';
}

function validateMessage(v) {
  if (!v)            return 'Message is required.';
  if (v.length < 15) return 'Message must be at least 15 characters.';
  return '';
}

/* ═══════════════════════════════════════════════════════════
   8. FOOTER YEAR
═══════════════════════════════════════════════════════════ */
function setFooterYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ═══════════════════════════════════════════════════════════
   9. SMOOTH SCROLL for all anchor links
═══════════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ═══════════════════════════════════════════════════════════
   10. CURSOR GLOW (desktop only)
═══════════════════════════════════════════════════════════ */
if (window.matchMedia('(pointer: fine)').matches) {
  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    width: 380px;
    height: 380px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(37,99,235,.07) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
    transform: translate(-50%, -50%);
    transition: left .12s ease, top .12s ease;
  `;
  document.body.appendChild(glow);

  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });
}
