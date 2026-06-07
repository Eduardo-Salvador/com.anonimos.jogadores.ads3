'use strict';

// ── Navegação SPA ──

function showPage(page) {
  document.querySelectorAll('.page-section').forEach(el => {
    el.classList.remove('active');
  });

  const section = document.getElementById('page-' + page);
  if (section) section.classList.add('active');

  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
  closeMenu();

  if (page === 'videoteca') renderVideos();
  if (page === 'reunioes') initReunioes();
  if (page === 'dashboard')  initDashboard();
}

// ── Menu hamburger ──

function toggleMenu() {
  const nav = document.getElementById('navLinks');
  const btn = document.getElementById('hamburger-btn');
  const isOpen = nav.classList.toggle('open');
  btn.setAttribute('aria-expanded', String(isOpen));
}

function closeMenu() {
  const nav = document.getElementById('navLinks');
  const btn = document.getElementById('hamburger-btn');
  nav.classList.remove('open');
  btn.setAttribute('aria-expanded', 'false');
}

document.getElementById('hamburger-btn')?.addEventListener('click', toggleMenu);

// ── Toast ──

let toastTimer = null;

function toast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;

  el.textContent = msg;
  el.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

// ── Navegação global por data-page ──

document.addEventListener('click', (e) => {
  const link = e.target.closest('[data-page]');
  if (!link) return;

  e.preventDefault();
  const page = link.dataset.page;

  if (page === 'contato') {
    showPage('home');
    setTimeout(() => {
      const el = document.getElementById('contato-home');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return;
  }

  showPage(page);

  if (link.dataset.closeChat) {
    const chatWindow = document.getElementById('chatWindow');
    chatWindow.classList.remove('open');
    chatWindow.setAttribute('aria-hidden', 'true');
    document.getElementById('chatbot-toggle-btn')?.setAttribute('aria-expanded', 'false');
  }
});

// ── Chatbot toggle ──

document.getElementById('chatbot-toggle-btn')?.addEventListener('click', () => {
  const win = document.getElementById('chatWindow');
  const btn = document.getElementById('chatbot-toggle-btn');
  const isOpen = win.classList.toggle('open');
  win.setAttribute('aria-hidden', String(!isOpen));
  btn.setAttribute('aria-expanded', String(isOpen));
});

// ── Botão "Sobre" vídeo ──

document.getElementById('play-sobre-btn')?.addEventListener('click', () => {
  toast('Vídeo em breve!');
});