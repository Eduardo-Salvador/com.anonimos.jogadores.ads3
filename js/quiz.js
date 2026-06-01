'use strict';

let respostas = [];
let perguntaAtual = 0;

function getResultadoTexto(sim) {
  if (sim >= 9) {
    return `Você respondeu SIM a ${sim} perguntas. Vários sinais importantes estão presentes. Buscar apoio de um profissional de saúde é um passo de coragem e cuidado com você mesmo.`;
  }
  if (sim >= 4) {
    return `Você respondeu SIM a ${sim} perguntas. Alguns sinais merecem atenção. Conversar com alguém de confiança ou um profissional pode ajudar muito.`;
  }
  return `Você respondeu SIM a apenas ${sim} pergunta(s). Nenhum sinal preocupante no momento. Continue atento ao seu bem-estar.`;
}

function getResultadoIcon(sim) {
  if (sim >= 9) {
    // Ícone vermelho com "X"
    return `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#EF4444"/>
              <path d="M15 9L9 15" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 9L15 15" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`;
  }
  if (sim >= 4) {
    // Ícone amarelo com "-"
    return `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#F59E0B"/>
              <path d="M8 12H16" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`;
  }
  // Ícone verde com "✓"
  return `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#10B981"/>
            <path d="M8 12L11 15L16 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>`;
}

function startAutoaval() {
  respostas = [];
  perguntaAtual = 0;
  const quiz = document.getElementById('autoaval-quiz');
  quiz.style.display = 'flex';
  renderQuiz();
}

function handleQuizClick(e) {
  const btn = e.target.closest('[data-resposta]');
  if (!btn) return;

  respostas.push(btn.dataset.resposta);
  perguntaAtual++;
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
        <div style="margin-bottom:16px;">${getResultadoIcon(sim)}</div>
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
      <button data-resposta="sim" class="btn btn-yellow fade-in" style="flex:1;font-size:1.1rem;padding:16px;color:#ffffff;opacity:0;">SIM</button>
      <button data-resposta="nao" class="btn btn-red fade-in"    style="flex:1;font-size:1.1rem;padding:16px;color:#ffffff;opacity:0;">NÃO</button>
    </div>
  `;

  // Desativa os botões inicialmente
  disableButtons();

  // Adiciona o evento de clique aos botões
  container.querySelectorAll('[data-resposta]').forEach(btn => {
    btn.addEventListener('click', handleQuizClick);
  });

  // Reativa os botões após 1 segundo
  setTimeout(enableButtons, 1000);
}

function disableButtons() {
  const buttons = document.querySelectorAll('[data-resposta]');
  buttons.forEach(btn => {
    btn.disabled = true; // Desativa o botão
    btn.style.pointerEvents = 'none'; // Remove eventos de clique
  });
}

function enableButtons() {
  const buttons = document.querySelectorAll('[data-resposta]');
  buttons.forEach(btn => {
    btn.disabled = false; // Reativa o botão
    btn.style.pointerEvents = 'auto'; // Permite eventos de clique
    btn.style.transition = 'opacity 0.5s'; // Adiciona transição suave
    btn.style.opacity = '1'; // Faz o botão aparecer gradualmente
  });
}

document.getElementById('start-autoaval-btn')?.addEventListener('click', (e) => {
  e.preventDefault();
  startAutoaval();
});
