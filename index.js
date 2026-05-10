/* ── NAVIGATION ── */
function showPage(page) {
  document.querySelectorAll('.page-section').forEach(el => el.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');

  // atualiza link ativo
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
  closeMenu();

  if (page === 'videoteca') renderVideos();
  if (page === 'reunioes') renderReunioes();
}

function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}

function closeMenu() {
  document.getElementById('navLinks').classList.remove('open');
}

/* ── HERO SLIDER ── */
let currentSlide = 0;
const totalSlides = 4;
let sliderInterval;

function goSlide(idx) {
  document.getElementById('slide-' + currentSlide).classList.remove('active');
  document.querySelectorAll('.dot')[currentSlide].classList.remove('active');
  currentSlide = idx;
  document.getElementById('slide-' + currentSlide).classList.add('active');
  document.querySelectorAll('.dot')[currentSlide].classList.add('active');
}

function nextSlide() {
  goSlide((currentSlide + 1) % totalSlides);
}

sliderInterval = setInterval(nextSlide, 5000);

/* ── FORM ETAPAS ── */
let etapaAtual = 1;

function nextEtapa() {
  if (etapaAtual < 3) {
    document.getElementById('etapa' + etapaAtual).style.display = 'none';
    etapaAtual++;
    document.getElementById('etapa' + etapaAtual).style.display = 'block';
    document.getElementById('etapaNum').textContent = etapaAtual;
    updateProgress();
  }
}

function prevEtapa() {
  if (etapaAtual > 1) {
    document.getElementById('etapa' + etapaAtual).style.display = 'none';
    etapaAtual--;
    document.getElementById('etapa' + etapaAtual).style.display = 'block';
    document.getElementById('etapaNum').textContent = etapaAtual;
    updateProgress();
  }
}

function updateProgress() {
  for (let i = 1; i <= 3; i++) {
    const el = document.getElementById('ps' + i);
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

/* ── REUNIÕES ── */
const reunioesData = [
  { nome: 'Grupo Nova História — Osasco', horario: '18h00 - 19h30', endereco: 'Av. Thereza Ana Cecon Breda, 1896', tipo: 'Reunião aberta', dist: '1,2 KM DE VOCÊ', dia: '16', mes: 'ABR', diasem: 'QUI' },
  { nome: 'Grupo Recomeço — São Paulo', horario: '19h00 - 20h30', endereco: 'Rua da Consolação, 451', tipo: 'Reunião aberta', dist: '3,5 KM DE VOCÊ', dia: '17', mes: 'ABR', diasem: 'SEX' },
  { nome: 'Grupo Esperança — Santo André', horario: '20h00 - 21h00', endereco: 'Av. Industrial, 2000', tipo: 'Reunião fechada', dist: '8,1 KM DE VOCÊ', dia: '18', mes: 'ABR', diasem: 'SAB' },
];

function renderReunioes() {
  const container = document.getElementById('lista-reunioes');
  if (!container) return;
  container.innerHTML = reunioesData.map(r => `
      <div class="reuniao-card">
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
          <button class="btn-detalhes" onclick="alert('Detalhes em breve!')">Detalhes</button>
        </div>
      </div>
    `).join('');
}

function setTab(btn, tab) {
  document.querySelectorAll('.reunioes-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('presenciais').style.display = tab === 'presenciais' ? 'block' : 'none';
  document.getElementById('online').style.display = tab === 'online' ? 'block' : 'none';
}

function setFilter(btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

/* ── AUTOAVALIAÇÃO QUIZ ── */
const quizPerguntas = [
  'Você apostou mais do que realmente poderia perder?',
  'Você precisa jogar com quantias maiores de dinheiro para ter a mesma sensação de paixão?',
  'Você voltou outro dia para tentar recuperar o dinheiro que perdeu?',
  'Você pediu dinheiro emprestado ou vendeu alguma coisa para jogar?',
  'Você já sentiu que pode ter problemas com jogos de azar?',
  'As pessoas criticaram suas apostas ou disseram-lhe que você tinha um problema com o jogo, quer você achasse que isso era verdade ou não?',
  'Você já se sentiu incomodado pela maneira como joga ou pelo que acontece quando você joga?',
  'O jogo envolveu algum problema de saúde, incluindo estresse ou ansiedade?',
  'O seu jogo causou algum problema financeiro para você ou sua família?'
];

let respostas = [];
let perguntaAtual = 0;

function startAutoaval() {
  respostas = [];
  perguntaAtual = 0;
  document.getElementById('autoaval-quiz').style.display = 'flex';
  renderQuiz();
}

function renderQuiz() {
  const container = document.getElementById('quiz-container');
  if (perguntaAtual >= quizPerguntas.length) {
    const sim = respostas.filter(r => r === 'sim').length;
    container.innerHTML = `
        <div style="text-align:center;">
          <h2 style="font-size:1.8rem;font-weight:800;margin-bottom:16px;">Resultado</h2>
          <div style="font-size:3rem;margin-bottom:16px;">${sim >= 7 ? '🔴' : sim >= 4 ? '🟡' : '🟢'}</div>
          <p style="font-size:1.1rem;line-height:1.75;color:#475569;margin-bottom:24px;">
            ${sim >= 7
        ? 'Você respondeu SIM a ' + sim + ' perguntas. Isso pode indicar que o jogo está causando problemas sérios. Recomendamos fortemente buscar apoio.'
        : sim >= 4
          ? 'Você respondeu SIM a ' + sim + ' perguntas. Há sinais de que o jogo pode estar afetando sua vida. Vale a pena conversar com alguém.'
          : 'Você respondeu SIM a apenas ' + sim + ' pergunta(s). Seu comportamento parece equilibrado, mas fique atento.'}
          </p>
          <a class="btn btn-blue" href="#" onclick="showPage('quem-somos')" style="margin-right:12px;">Primeiro passo</a>
          <a class="btn btn-yellow" href="#" onclick="showPage('reunioes')">Encontrar um grupo</a>
        </div>
      `;
    return;
  }

  const progresso = Math.round((perguntaAtual / quizPerguntas.length) * 100);
  container.innerHTML = `
      <div style="margin-bottom:8px;font-size:0.85rem;color:#64748b;font-weight:600;">Pergunta ${perguntaAtual + 1} de ${quizPerguntas.length}</div>
      <div style="height:6px;background:#e2e8f0;border-radius:3px;margin-bottom:32px;">
        <div style="height:6px;background:var(--blue);border-radius:3px;width:${progresso}%;transition:width 0.4s;"></div>
      </div>
      <h3 style="font-size:1.3rem;font-weight:700;margin-bottom:32px;line-height:1.5;">${quizPerguntas[perguntaAtual]}</h3>
      <div style="display:flex;gap:16px;">
        <button onclick="responder('sim')" class="btn btn-blue" style="flex:1;font-size:1.1rem;padding:16px;">SIM</button>
        <button onclick="responder('nao')" class="btn" style="flex:1;font-size:1.1rem;padding:16px;border:2px solid #e2e8f0;color:#475569;">NÃO</button>
      </div>
    `;
}

function responder(r) {
  respostas.push(r);
  perguntaAtual++;
  renderQuiz();
}

/* ── VIDEOS ── */
const videosData = [
  { titulo: '#015 Vício em Jogos e Saúde Pública', thumb: 'images-videoteca/Video1.jpg', canal: 'JA Brasil', views: '2.3K' },
  { titulo: 'Como funcionam as apostas online? Entenda os riscos', thumb: 'images-videoteca/Video2.jpeg', canal: 'JA Brasil', views: '1.8K' },
  { titulo: 'Os Doze Passos: O caminho para a recuperação', thumb: 'images-videoteca/Video3.jpg', canal: 'JA Brasil', views: '3.1K' },
  { titulo: 'Depoimento: Como parei de jogar', thumb: 'images-videoteca/Video4.jpg', canal: 'JA Brasil', views: '4.7K' },
  { titulo: 'Família e jogo compulsivo: como ajudar', thumb: 'images-videoteca/Video5.jpeg', canal: 'JA Brasil', views: '2.0K' },
  { titulo: 'Autoavaliação: Você é um jogador compulsivo?', thumb: 'images-videoteca/Video6.jpg', canal: 'JA Brasil', views: '5.5K' },
];

function renderVideos() {
  const grid = document.getElementById('videosGrid');
  if (!grid) return;
  grid.innerHTML = videosData.map(v => `
      <div class="video-card" onclick="alert('Vídeo em breve!')">
        <div class="video-thumbnail">
          <img src="${v.thumb}" alt="${v.titulo}" onerror="this.style.background='#334155';this.style.height='160px'">
          <div class="video-play"></div>
        </div>
        <div class="video-info">
          <h4>${v.titulo}</h4>
          <div class="video-meta">${v.canal} · ${v.views} visualizações</div>
        </div>
      </div>
    `).join('');
}

/* ── CHATBOT ── */
function toggleChat() {
  document.getElementById('chatWindow').classList.toggle('open');
}

/* Init */
renderReunioes();
