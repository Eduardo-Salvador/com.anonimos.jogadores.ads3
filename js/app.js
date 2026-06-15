'use strict';

let currentSlide = 0;
let sliderInterval = null;

const somRoleta = new Audio('assets/images/som/cash.mp3');
somRoleta.volume = 0.5;

// ── helpers ──
function getSlides() {
  return document.querySelectorAll('.slide');
}

function getDots() {
  return document.querySelectorAll('.dot');
}

// ── slider principal ──
function goSlide(idx) {
  const slides = getSlides();
  const dots = getDots();

  if (!slides.length) return;
  if (idx === currentSlide) return;

  const home = document.getElementById("page-home");

  if (home?.classList.contains("active")) {
    somRoleta.currentTime = 0;
    somRoleta.play().catch(() => {});
  }

  slides[currentSlide]?.classList.remove('active');
  dots[currentSlide]?.classList.remove('active');
  dots[currentSlide]?.setAttribute('aria-selected', 'false');

  currentSlide = idx;

  slides[currentSlide]?.classList.add('active');
  dots[currentSlide]?.classList.add('active');
  dots[currentSlide]?.setAttribute('aria-selected', 'true');
}

function nextSlide() {
  const slides = getSlides();
  const totalSlides = slides.length;

  goSlide((currentSlide + 1) % totalSlides);
}

// ── autoplay ──
function startSlider() {
  stopSlider();

  sliderInterval = setInterval(() => {
    const home = document.getElementById("page-home");

    if (!home?.classList.contains("active")) {
      stopSlider();
      return;
    }

    nextSlide();
  }, 10000);
}

function stopSlider() {
  if (sliderInterval) {
    clearInterval(sliderInterval);
    sliderInterval = null;
  }
}

// ── navegação SPA ──
function showPage(page) {
  document.querySelectorAll('.page-section').forEach(el => {
    el.classList.remove('active');
  });

  const section = document.getElementById('page-' + page);
  section?.classList.add('active');

  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
  closeMenu();

  if (page === 'videoteca') renderVideos?.();
  if (page === 'reunioes') initReunioes?.();
  if (page === 'dashboard') initDashboard?.();
  if (page === 'autoaval') {
    respostas = [];
    perguntaAtual = 0;
    const quiz = document.getElementById('autoaval-quiz');
    if (quiz) quiz.style.display = 'none';
  }
  if (page === 'home') startSlider();
  else stopSlider();
}

// ── menu ──
function toggleMenu() {
  const nav = document.getElementById('navLinks');
  const btn = document.getElementById('hamburger-btn');

  const isOpen = nav.classList.toggle('open');
  btn?.setAttribute('aria-expanded', String(isOpen));
}

function closeMenu() {
  const nav = document.getElementById('navLinks');
  const btn = document.getElementById('hamburger-btn');

  nav?.classList.remove('open');
  btn?.setAttribute('aria-expanded', 'false');
}

document.getElementById('hamburger-btn')?.addEventListener('click', toggleMenu);

// ── toast ──
let toastTimer = null;

function toast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;

  el.textContent = msg;
  el.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

// ── clicks globais SPA ──
document.addEventListener('click', (e) => {
  const link = e.target.closest('[data-page]');
  if (!link) return;

  e.preventDefault();

  const page = link.dataset.page;

  if (page === 'contato') {
    showPage('home');

    setTimeout(() => {
      document.getElementById('contato-home')
        ?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    return;
  }

  showPage(page);

  if (link.dataset.closeChat) {
    const chatWindow = document.getElementById('chatWindow');
    chatWindow?.classList.remove('open');
    chatWindow?.setAttribute('aria-hidden', 'true');
    document.getElementById('chatbot-toggle-btn')
      ?.setAttribute('aria-expanded', 'false');
  }
});

// ── chat ──
document.getElementById('chatbot-toggle-btn')
  ?.addEventListener('click', () => {
    const win = document.getElementById('chatWindow');
    const btn = document.getElementById('chatbot-toggle-btn');

    const isOpen = win.classList.toggle('open');

    win.setAttribute('aria-hidden', String(!isOpen));
    btn.setAttribute('aria-expanded', String(isOpen));
  });

// ── botão vídeo ──
document.getElementById('play-sobre-btn')
  ?.addEventListener('click', () => {
    toast('Vídeo em breve!');
  });

// ── dots click ──
document.querySelector('.slider-dots')
  ?.addEventListener('click', (e) => {
    const dot = e.target.closest('.dot');
    if (!dot) return;

    const idx = Number(dot.dataset.slide);

    stopSlider();
    goSlide(idx);
    startSlider();
  });

// ── init ──
startSlider();