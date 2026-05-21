'use strict';

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

  if (page === 'videoteca') {
    renderVideos();
  }

  if (page === 'reunioes') {

    if (!reunioesRendered) {
      renderReunioes();
      reunioesRendered = true;
    }

    setTimeout(() => {
      initMap();
    }, 100);
  }
}

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

let toastTimer = null;

function toast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;

  el.textContent = msg;
  el.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

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

  // Fechar chatbot ao navegar pelo chat
  if (link.dataset.closeChat) {
    const chatWindow = document.getElementById('chatWindow');
    chatWindow.classList.remove('open');
    chatWindow.setAttribute('aria-hidden', 'true');
    document.getElementById('chatbot-toggle-btn')?.setAttribute('aria-expanded', 'false');
  }
});

let currentSlide = 0;
const totalSlides = document.querySelectorAll('.slide').length;
let sliderInterval;

function goSlide(idx) {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');

  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');
  dots[currentSlide].setAttribute('aria-selected', 'false');

  currentSlide = idx;

  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
  dots[currentSlide].setAttribute('aria-selected', 'true');
}

function nextSlide() {
  goSlide((currentSlide + 1) % totalSlides);
}

sliderInterval = setInterval(nextSlide, 10000);

document.querySelector('.slider-dots')?.addEventListener('click', (e) => {
  const dot = e.target.closest('.dot');
  if (!dot) return;
  const idx = Number(dot.dataset.slide);
  clearInterval(sliderInterval);
  goSlide(idx);
  sliderInterval = setInterval(nextSlide, 10000);
});

document.getElementById('hamburger-btn')?.addEventListener('click', toggleMenu);

let etapaAtual = 1;

function nextEtapa() {
  if (etapaAtual >= 3) return;
  document.getElementById('etapa' + etapaAtual).style.display = 'none';
  etapaAtual++;
  document.getElementById('etapa' + etapaAtual).style.display = 'block';
  document.getElementById('etapaNum').textContent = etapaAtual;
  updateProgress();
}

function prevEtapa() {
  if (etapaAtual <= 1) return;
  document.getElementById('etapa' + etapaAtual).style.display = 'none';
  etapaAtual--;
  document.getElementById('etapa' + etapaAtual).style.display = 'block';
  document.getElementById('etapaNum').textContent = etapaAtual;
  updateProgress();
}

function updateProgress() {
  for (let i = 1; i <= 3; i++) {
    const el = document.getElementById('ps' + i);
    if (!el) continue;
    el.className = 'progress-step' + (i < etapaAtual ? ' done' : i === etapaAtual ? ' active' : '');
  }
}

function selectAge(el) {
  document.querySelectorAll('.age-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
}

function selectContact(el) {
  document.querySelectorAll('.contact-opt').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
}

const reunioesData = [
  { nome: 'Grupo Nova História — Osasco', horario: '18h00 - 19h30', endereco: 'Av. Thereza Ana Cecon Breda, 1896', tipo: 'Reunião aberta', dist: '1,2 KM DE VOCÊ', dia: '16', mes: 'ABR', diasem: 'QUI', cidade: 'Osasco — SP', contato: '(11) 99571-6942', descricao: 'Grupo voltado para iniciantes e veteranos. Ambiente acolhedor, café e água disponíveis. Chegue 10 minutos antes para se ambientar.' },
  { nome: 'Grupo Recomeço — São Paulo', horario: '19h00 - 20h30', endereco: 'Rua da Consolação, 451', tipo: 'Reunião aberta', dist: '3,5 KM DE VOCÊ', dia: '17', mes: 'ABR', diasem: 'SEX', cidade: 'São Paulo — SP', contato: '(11) 99571-6942', descricao: 'Reunião semanal com partilha aberta. Todos são bem-vindos, não é necessário avisar com antecedência.' },
  { nome: 'Grupo Esperança — Santo André', horario: '20h00 - 21h00', endereco: 'Av. Industrial, 2000', tipo: 'Reunião fechada', dist: '8,1 KM DE VOCÊ', dia: '18', mes: 'ABR', diasem: 'SAB', cidade: 'Santo André — SP', contato: '(11) 94321-0000', descricao: 'Reunião fechada exclusiva para membros em recuperação. Para participar pela primeira vez, entre em contato antes.' },
  { nome: 'Grupo Renascer — Campinas', horario: '19h00 - 20h30', endereco: 'Rua Barão de Jaguara, 1234', tipo: 'Reunião aberta', dist: '12,4 KM DE VOCÊ', dia: '19', mes: 'ABR', diasem: 'DOM', cidade: 'Campinas — SP', contato: '(19) 99876-5432', descricao: 'Grupo ativo há mais de 10 anos. Reuniões aos domingos com foco em estudo dos 12 Passos.' },
  { nome: 'Grupo Liberdade — Santos', horario: '18h30 - 20h00', endereco: 'Av. Ana Costa, 555', tipo: 'Reunião aberta', dist: '18,7 KM DE VOCÊ', dia: '20', mes: 'ABR', diasem: 'SEG', cidade: 'Santos — SP', contato: '(13) 99765-4321', descricao: 'Grupo próximo à praia com ambiente tranquilo. Estacionamento disponível no local.' },
  { nome: 'Grupo Horizonte — Guarulhos', horario: '20h00 - 21h30', endereco: 'Rua Sete de Setembro, 300', tipo: 'Reunião fechada', dist: '22,1 KM DE VOCÊ', dia: '21', mes: 'ABR', diasem: 'TER', cidade: 'Guarulhos — SP', contato: '(11) 98765-1234', descricao: 'Reunião fechada com foco em prevenção de recaída. Indicada para membros com pelo menos 30 dias de abstinência.' },
];
 
let reunioesRendered = false;
 
function renderReunioes() {
  const container = document.getElementById('lista-reunioes');
  if (!container) return;
 
  container.innerHTML = reunioesData.map((r, i) => `
    <div class="reuniao-card" role="listitem" data-index="${i}">
      <div class="reuniao-date">
        <div class="day">${r.dia}</div>
        <div class="month">${r.mes}</div>
        <div class="weekday">${r.diasem}</div>
      </div>
      <div class="reuniao-info">
        <h4>${r.nome}</h4>
        <div class="time">${r.horario} &nbsp; ${r.endereco}</div>
        <div class="tipo">${r.tipo}</div>
        <div class="dist-badge">${r.dist}</div>
      </div>
      <div class="reuniao-action">
        <button class="btn-detalhes" data-action="detalhes" data-index="${i}">Detalhes</button>
      </div>
    </div>
  `).join('');
 
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="detalhes"]');
    if (!btn) return;
    const idx = Number(btn.dataset.index);
    if (idx >= 0 && idx < reunioesData.length) {
      openReuniaoModal(reunioesData[idx]);
    }
  });
}
 
/* ── Modal de detalhes da reunião ── */
 
function openReuniaoModal(r) {
  const modal = document.getElementById('reuniao-modal');
  if (!modal || !r) return;
 
  const tipo = r.tipo || '';
  const contato = r.contato || '';
  const tipoClass = tipo.includes('fechada') ? 'tipo-fechada' : 'tipo-aberta';
 
  document.getElementById('modal-nome').textContent = r.nome || 'Reunião';
  document.getElementById('modal-tipo').textContent = tipo;
  document.getElementById('modal-tipo').className = 'modal-tipo-badge ' + tipoClass;
  document.getElementById('modal-dia').textContent = `${r.diasem || ''}, ${r.dia || ''} ${r.mes || ''}`.trim();
  document.getElementById('modal-horario').textContent = r.horario || '—';
  document.getElementById('modal-endereco').textContent = r.endereco || '—';
  document.getElementById('modal-cidade').textContent = r.cidade || '—';
  document.getElementById('modal-dist').textContent = r.dist || '';
  document.getElementById('modal-descricao').textContent = r.descricao || 'Sem informações adicionais no momento.';
 
  const contatoEl = document.getElementById('modal-contato');
  const whatsappEl = document.getElementById('modal-whatsapp');
 
  if (contato) {
    contatoEl.textContent = contato;
    contatoEl.href = 'tel:' + contato.replace(/[^\d+]/g, '');
    contatoEl.style.display = '';
    whatsappEl.href = 'https://wa.me/55' + contato.replace(/\D/g, '');
    whatsappEl.style.display = '';
  } else {
    contatoEl.style.display = 'none';
    whatsappEl.style.display = 'none';
  }
 
  const distBar = document.querySelector('.modal-dist-bar');
  if (distBar) distBar.style.display = r.dist ? '' : 'none';
 
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
 
  modal.querySelector('.modal-close').focus();
}
 
function closeReuniaoModal() {
  const modal = document.getElementById('reuniao-modal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
 
document.addEventListener('click', (e) => {
  if (e.target.closest('.modal-close')) closeReuniaoModal();
  if (e.target.id === 'reuniao-modal') closeReuniaoModal();
});
 
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeReuniaoModal();
});
 
document.querySelector('.reunioes-tabs')?.addEventListener('click', (e) => {
  const tab = e.target.closest('.reunioes-tab');
  if (!tab) return;
 
  const tabName = tab.dataset.tab;
 
  document.querySelectorAll('.reunioes-tab').forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });
 
  tab.classList.add('active');
  tab.setAttribute('aria-selected', 'true');
 
  document.getElementById('presenciais').hidden = tabName !== 'presenciais';
  document.getElementById('online').hidden = tabName !== 'online';
});
 
document.querySelector('.filter-btns')?.addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
 
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
});

const quizPerguntas = [
  'Você já perdeu horas de trabalho da escola devido ao jogo?',
  'Alguma vez o jogo já causou infelicidade na sua vida familiar?',
  'O jogo afetou a sua reputação?',
  'Você já sentiu remorso após jogar?',
  'Alguma vez você já jogou para obter dinheiro para pagar dívidas ou então resolver dificuldades financeiras?',
  'O jogo causou uma diminuição na sua ambição ou eficiência?',
  'Após ter perdido você se sentiu como se necessitasse voltar o mais cedo possível e recuperar as suas perdas?',
  'Após um ganho você sentiu uma forte vontade de voltar e ganhar mais?',
  'Você geralmente jogava até que seu último centavo acabasse?',
  'Você já pediu dinheiro emprestado para financiar seu jogo?',
  'Alguma vez você já vendeu alguma coisa para financiar o jogo?',
  'Você relutava em usar o "dinheiro de jogo" para as despesas normais?',
  'O jogo o tornou descuidado com o seu bem estar e o de sua família?',
  'Alguma vez você já jogou por mais tempo do que planejava?',
  'Alguma vez você já jogou para fugir das preocupações ou problemas?',
  'Alguma vez você já cometeu, ou pensou em cometer um ato ilegal para financiar o jogo?',
  'O jogo fez com que você tivesse dificuldades para dormir?',
  'As discussões, desapontamentos ou frustrações fizeram com que você tivesse vontade de jogar?',
  'Alguma vez você já teve vontade de celebrar alguma boa sorte com algumas horas de jogo?',
  'Alguma vez você já pensou em se auto-destruir como resultado de seu jogo?',
];

let respostas = [];
let perguntaAtual = 0;

function getResultadoTexto(sim) {
  if (sim >= 7) {
    return `Você respondeu SIM a ${sim} perguntas. A maioria dos jogadores compulsivos respondeu SIM a pelo menos 7 dessas perguntas.`;
  }
  if (sim >= 4) {
    return `Você respondeu SIM a ${sim} perguntas. A maioria dos jogadores compulsivos respondeu SIM a pelo menos 7 dessas perguntas.`;
  }
  return `Você respondeu SIM a apenas ${sim} pergunta(s). A maioria dos jogadores compulsivos respondeu SIM a pelo menos 7 dessas perguntas.`;
}

function getResultadoEmoji(sim) {
  if (sim >= 7) return '🔴';
  if (sim >= 4) return '🟡';
  return '🟢';
}

function startAutoaval() {
  respostas = [];
  perguntaAtual = 0;
  const quiz = document.getElementById('autoaval-quiz');
  quiz.style.display = 'flex';
  renderQuiz();
}

function renderQuiz() {
  const container = document.getElementById('quiz-container');
  if (!container) return;

  if (perguntaAtual >= quizPerguntas.length) {
    const sim = respostas.filter(r => r === 'sim').length;

    container.innerHTML = `
      <div style="text-align:center;">
        <h2 style="font-size:1.8rem;font-weight:800;margin-bottom:16px;">Resultado</h2>
        <div style="font-size:3rem;margin-bottom:16px;">${getResultadoEmoji(sim)}</div>
        <p style="font-size:1.1rem;line-height:1.75;color:#475569;margin-bottom:24px;">
          ${getResultadoTexto(sim)}
        </p>
        <div style="display:flex;gap:16px;justify-content:center;margin-top:8px;flex-wrap:wrap;">
          <a class="btn btn-red"    href="#" data-page="quem-somos" style="padding:16px 40px;white-space:nowrap;">Primeiro passo</a>
          <a class="btn btn-yellow" href="#" data-page="reunioes"   style="padding:16px 40px;white-space:nowrap;">Encontrar um grupo</a>
        </div>
      </div>
    `;
    return;
  }

  const progresso = Math.round((perguntaAtual / quizPerguntas.length) * 100);

  container.innerHTML = `
    <div style="margin-bottom:8px;font-size:0.85rem;color:#64748b;font-weight:600;">
      Pergunta ${perguntaAtual + 1} de ${quizPerguntas.length}
    </div>
    <div style="height:6px;background:#e2e8f0;border-radius:3px;margin-bottom:32px;">
      <div style="height:6px;background:#742C24;border-radius:3px;width:${progresso}%;transition:width 0.4s;"></div>
    </div>
    <h3 style="font-size:1.3rem;font-weight:700;margin-bottom:32px;line-height:1.5;">
      ${quizPerguntas[perguntaAtual]}
    </h3>
    <div style="display:flex;gap:16px;">
      <button data-resposta="sim" class="btn btn-yellow" style="flex:1;font-size:1.1rem;padding:16px;color:#ffffff;">SIM</button>
      <button data-resposta="nao" class="btn btn-red"    style="flex:1;font-size:1.1rem;padding:16px;color:#ffffff;">NÃO</button>
    </div>
  `;

  container.addEventListener('click', handleQuizClick, { once: true });
}

function handleQuizClick(e) {
  const btn = e.target.closest('[data-resposta]');
  if (!btn) return;
  respostas.push(btn.dataset.resposta);
  perguntaAtual++;
  renderQuiz();
}

document.getElementById('start-autoaval-btn')?.addEventListener('click', (e) => {
  e.preventDefault();
  startAutoaval();
});

document.getElementById('play-sobre-btn')?.addEventListener('click', () => {
  toast('Vídeo em breve!');
});

const videosData = [
  { titulo: '#015 Vício em Jogos e Saúde Pública', thumb: 'images-videoteca/Video1.jpg', canal: 'JA Brasil', views: '2.3K' },
  { titulo: 'Como funcionam as apostas online?', thumb: 'images-videoteca/Video2.jpeg', canal: 'JA Brasil', views: '1.8K' },
  { titulo: 'Os Doze Passos: O caminho para a recuperação', thumb: 'images-videoteca/Video3.jpg', canal: 'JA Brasil', views: '3.1K' },
  { titulo: 'Depoimento: Como parei de jogar', thumb: 'images-videoteca/Video4.jpg', canal: 'JA Brasil', views: '4.7K' },
  { titulo: 'Família e jogo compulsivo: como ajudar', thumb: 'images-videoteca/Video5.jpeg', canal: 'JA Brasil', views: '2.0K' },
  { titulo: 'Autoavaliação: Você é um jogador compulsivo?', thumb: 'images-videoteca/Video6.jpg', canal: 'JA Brasil', views: '5.5K' },
];

let videosRendered = false;

function renderVideos() {
  if (videosRendered) return;

  const grid = document.getElementById('videosGrid');
  if (!grid) return;

  grid.innerHTML = videosData.map(v => `
    <div class="video-card" data-action="play-video">
      <div class="video-thumbnail">
        <img src="${v.thumb}" alt="${v.titulo}" loading="lazy" onerror="this.style.background='#334155';this.style.height='160px'">
        <div class="video-play" aria-hidden="true"></div>
      </div>
      <div class="video-info">
        <h4>${v.titulo}</h4>
        <div class="video-meta">${v.canal} · ${v.views} visualizações</div>
      </div>
    </div>
  `).join('');

  grid.addEventListener('click', (e) => {
    if (e.target.closest('[data-action="play-video"]')) {
      toast('Vídeo em breve!');
    }
  });

  videosRendered = true;
}

document.getElementById('chatbot-toggle-btn')?.addEventListener('click', () => {
  const win = document.getElementById('chatWindow');
  const btn = document.getElementById('chatbot-toggle-btn');
  const isOpen = win.classList.toggle('open');
  win.setAttribute('aria-hidden', String(!isOpen));
  btn.setAttribute('aria-expanded', String(isOpen));
});

renderReunioes();
reunioesRendered = true;


// ===============================
// MAPA LEAFLET
// ===============================

let mapaInicializado = false;
let map;

function initMap() {

  if (mapaInicializado) return;

  mapaInicializado = true;

  // Centro inicial
  map = L.map('map').setView([-23.5505, -46.6333], 11);

  // Camada do mapa
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  // Reuniões convertidas em pontos

  const pontos = [
    {
      nome: 'Grupo Nova História — Osasco',
      lat: -22.850469029797484,
      lng: -47.230679185318635,
      endereco: 'Av. Thereza Ana Cecon Breda, 1896'
    },

    {
      nome: 'Grupo Recomeço — São Paulo',
      lat: -23.547646905646168,
      lng: -46.64575216401267,
      endereco: 'Rua da Consolação, 451'
    },

    {
      nome: 'Grupo Esperança — Santo André',
      lat: -23.638222862947,
      lng: -46.53930309132927,
      endereco: 'Av. Industrial, 2000'
    },

    {
      nome: 'Grupo Renascer — Campinas',
      lat: -22.903498189812275,
      lng: -47.0591845744453,
      endereco: 'Rua Barão de Jaguara, 1234'
    },


    {
      nome: 'Grupo Liberdade — Santos',
      lat: -23.96878119099821,
      lng: -46.3326912762638,
      endereco: 'Av. Ana Costa, 555'
    },

    {
      nome: 'Grupo Horizonte — Guarulhos',
      lat: -23.468878460731343,
      lng: -46.528630066012575,
      endereco: 'Rua Sete de Setembro, 300'
    }
  ];

  // Adiciona marcadores
  pontos.forEach(p => {

    L.marker([p.lat, p.lng])
      .addTo(map)
      .bindPopup(`
        <div style="min-width:220px">
          <strong>${p.nome}</strong><br>
          ${p.endereco}
        </div>
      `);

  });

  // Corrige renderização
  setTimeout(() => {
    map.invalidateSize();
  }, 300);
}