'use strict';

// ═══════════════════════════════════════════════════════════════
//  CONFIGURAÇÃO — Google Sheets
// ═══════════════════════════════════════════════════════════════
const DASH_CONFIG = {
  API_KEY:   'AIzaSyBzvU3No2LDIk-hZkuKavkmJayA5GhU0Rs',
  SHEET_ID:  '1HN35g7Z5_wO5NDu_BJG6lczL6boopGUBoXPxiW_toa4',
  SHEET_TAB: 'Respostas ao formulário 1',
  RANGE:     'A:S',
};

// ── Mapeamento de colunas (igual ao test.html original) ──
const DASH_COL = {
  TIMESTAMP:  0,
  SEXO:       1,
  IDADE:      2,
  RENDA:      3,
  JA_APOSTOU: 4,
  Q1: 5, Q2: 6, Q3: 7, Q4: 8,
  Q5: 9, Q6: 10, Q7: 11, Q8: 12, Q9: 13,
  PERDAS_EST:  14,
  CONHECE:     15,
  PROXIMIDADE: 16,
  PERDAS_CON:  17,
  CONTATO:     18,
};

const PGSI_LABELS = [
  'Apostou mais do que poderia perder',
  'Precisou de quantias maiores para a mesma sensação',
  'Voltou para recuperar o dinheiro perdido',
  'Pediu emprestado ou vendeu algo para jogar',
  'Sentiu que pode ter problemas com jogos',
  'Críticas de outras pessoas sobre suas apostas',
  'Sentiu-se incomodado pela forma como joga',
  'Jogo causou problemas de saúde ou estresse',
  'Jogo causou problemas financeiros',
];

// ── Rótulos curtos das perguntas do quiz local ──
const DASH_LABELS_CURTOS = [
  'Jogou mais tempo que planejado',
  'Jogo como alívio emocional',
  'Pensa em jogar em outros momentos',
  '"Só mais uma rodada" recorrente',
  'Precisou apostar mais para mesma emoção',
  'Voltou para recuperar o que perdeu',
  'Tentou parar e não conseguiu',
  'Irritação/ansiedade ao não poder jogar',
  'Problemas financeiros por causa do jogo',
  'Familiar/amigo preocupado com o jogo',
  'Jogo ocupou espaço de outras atividades',
  'Escondeu tempo/dinheiro gasto',
  'Jogo gerou conflitos em relacionamentos',
  'Deixou de cumprir compromissos por jogar',
  'Pediu dinheiro emprestado para cobrir perdas',
];

// ═══════════════════════════════════════════════════════════════
//  ESTADO
// ═══════════════════════════════════════════════════════════════
let dashCharts = {};
let dashSheetTimer = null;

// ═══════════════════════════════════════════════════════════════
//  INICIALIZAÇÃO (chamada ao navegar para a página)
// ═══════════════════════════════════════════════════════════════
function initDashboard() {
  // ── Seção local ──
  const dadosLocais = typeof respostas !== 'undefined' ? respostas : [];
  if (!dadosLocais.length) {
    mostrarEstadoVazio();
  } else {
    esconderEstadoVazio();
    renderLocal(dadosLocais);
  }

  // ── Seção Sheets ──
  carregarSheets();
  if (dashSheetTimer) clearInterval(dashSheetTimer);
  dashSheetTimer = setInterval(carregarSheets, 60000);
}

// ═══════════════════════════════════════════════════════════════
//  SEÇÃO LOCAL
// ═══════════════════════════════════════════════════════════════
function mostrarEstadoVazio() {
  const empty    = document.getElementById('dash-empty');
  const conteudo = document.getElementById('dash-conteudo-local');
  if (empty)    empty.style.display    = 'block';
  if (conteudo) conteudo.style.display = 'none';
}

function esconderEstadoVazio() {
  const empty    = document.getElementById('dash-empty');
  const conteudo = document.getElementById('dash-conteudo-local');
  if (empty)    empty.style.display    = 'none';
  if (conteudo) conteudo.style.display = 'block';
}

function renderLocal(dados) {
  const n          = dados.length;
  const nPerguntas = typeof quizPerguntas !== 'undefined' ? quizPerguntas.length : 15;
  const totalSim   = dados.reduce((acc, r) => acc + (r === 'sim' ? 1 : 0), 0);
  const classif    = classificarResultado(totalSim);
  const simArr     = dados.map(r => r === 'sim' ? 1 : 0);

  // Métricas locais
  setDashText('dm-total-val',    n);
  setDashText('dm-total-sub',    `de ${nPerguntas} perguntas respondidas`);
  setDashText('dm-sim-val',      totalSim);
  setDashText('dm-sim-sub',      pctDash(totalSim, n) + ' das respostas');
  setDashText('dm-alerta-val',   classif.nivel === 'alerta'  ? '⚠ Sim' : '—');
  setDashText('dm-atencao-val',  classif.nivel === 'atencao' ? '⚠ Sim' : '—');
  setDashText('dm-ok-val',       classif.nivel === 'ok'      ? '✓ Sim' : '—');
  setDashText('dm-classif-label', classif.texto);

  // Pizza sim/não
  mkDashChart('dash-c-simnao', {
    type: 'doughnut',
    data: {
      labels: ['Sim', 'Não'],
      datasets: [{
        data: [totalSim, n - totalSim],
        backgroundColor: ['#742C24', '#D4A843'],
        borderWidth: 0, hoverOffset: 6,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '62%',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => ` ${c.label}: ${c.raw} (${pctDash(c.raw, n)})` } },
      },
    },
  });

  // Barras por pergunta
  const labels    = DASH_LABELS_CURTOS.slice(0, nPerguntas);
  const naoCounts = simArr.map(s => 1 - s);
  mkDashChart('dash-c-porpergunta', {
    type: 'bar',
    data: {
      labels: labels.map((_, i) => `P${i + 1}`),
      datasets: [
        { label: 'Sim', data: simArr,    backgroundColor: '#742C24' },
        { label: 'Não', data: naoCounts, backgroundColor: '#D4A843' },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { title: items => labels[items[0].dataIndex] } },
      },
      scales: {
        x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.04)' } },
        y: {
          beginAtZero: true, max: 1,
          ticks: { color: '#94a3b8', font: { size: 10 }, callback: v => v === 1 ? 'Sim' : v === 0 ? 'Não' : '', stepSize: 1 },
          grid: { color: 'rgba(0,0,0,0.06)' },
        },
      },
    },
  });

  renderBarrasLocal(simArr, nPerguntas);
  renderTabelaLocal(dados);
  renderRisco(totalSim, nPerguntas);
}

function renderBarrasLocal(simArr, nPerguntas) {
  const lista = document.getElementById('dash-pgsi-list');
  if (!lista) return;
  const labels = DASH_LABELS_CURTOS.slice(0, nPerguntas);
  lista.innerHTML = simArr.slice(0, nPerguntas).map((val, i) => {
    const cor  = val === 1 ? '#742C24' : '#16a34a';
    const resp = val === 1 ? 'Sim' : 'Não';
    return `
      <div class="dash-pgsi-row" title="${labels[i]}">
        <span class="dash-pgsi-q">P${i + 1}</span>
        <span class="dash-pgsi-label">${labels[i]}</span>
        <div class="dash-pgsi-track">
          <div class="dash-pgsi-fill" style="width:${val * 100}%;background:${cor}"></div>
        </div>
        <span class="dash-pgsi-val" style="color:${cor}">${resp}</span>
      </div>`;
  }).join('');
}

function renderTabelaLocal(dados) {
  const tbody    = document.getElementById('dash-tbody');
  if (!tbody) return;
  const nPerguntas = typeof quizPerguntas !== 'undefined' ? quizPerguntas.length : 15;
  const labels     = DASH_LABELS_CURTOS.slice(0, nPerguntas);
  tbody.innerHTML = dados.map((resp, i) => {
    const isSim = resp === 'sim';
    return `
      <tr>
        <td style="color:var(--dash-faint);font-weight:700">P${i + 1}</td>
        <td style="font-size:12px;color:var(--dash-muted)">${labels[i] || '—'}</td>
        <td><span class="dash-pill ${isSim ? 'dash-pill-red' : 'dash-pill-green'}">${isSim ? 'Sim' : 'Não'}</span></td>
      </tr>`;
  }).join('');
}

function renderRisco(totalSim, nPerguntas) {
  const pct   = Math.round((totalSim / nPerguntas) * 100);
  const cor   = totalSim >= 9 ? '#742C24' : totalSim >= 4 ? '#D4A843' : '#16a34a';
  const label = totalSim >= 9 ? 'Alto risco' : totalSim >= 4 ? 'Risco moderado' : 'Baixo risco';
  const barra = document.getElementById('dash-risco-fill');
  const texto = document.getElementById('dash-risco-label');
  const pctEl = document.getElementById('dash-risco-pct');
  if (barra) { barra.style.width = pct + '%'; barra.style.background = cor; }
  if (texto) { texto.textContent = label; texto.style.color = cor; }
  if (pctEl) { pctEl.textContent = totalSim + ' de ' + nPerguntas + ' sinais'; }
}

function classificarResultado(totalSim) {
  if (totalSim >= 9) return { nivel: 'alerta',  texto: 'Vários sinais importantes presentes' };
  if (totalSim >= 4) return { nivel: 'atencao', texto: 'Alguns sinais merecem atenção'        };
  return                    { nivel: 'ok',       texto: 'Nenhum sinal preocupante no momento'  };
}

// ═══════════════════════════════════════════════════════════════
//  SEÇÃO GOOGLE SHEETS
// ═══════════════════════════════════════════════════════════════
async function carregarSheets() {
  const iconEl   = document.getElementById('dash-sheet-refresh-icon');
  const statusEl = document.getElementById('dash-sheet-status');

  if (iconEl) iconEl.classList.add('dash-spin');
  if (statusEl) statusEl.textContent = 'Atualizando...';

  const range = encodeURIComponent(`${DASH_CONFIG.SHEET_TAB}!${DASH_CONFIG.RANGE}`);
  const url   = `https://sheets.googleapis.com/v4/spreadsheets/${DASH_CONFIG.SHEET_ID}/values/${range}?key=${DASH_CONFIG.API_KEY}`;

  try {
    const res  = await fetch(url);
    const json = await res.json();

    if (json.error) {
      mostrarErroSheets(`Erro da API: ${json.error.message}`);
      return;
    }

    esconderErroSheets();
    const rows = (json.values || []).slice(1);
    renderSheets(rows);

    if (statusEl) statusEl.textContent = `${rows.length} respostas · ${new Date().toLocaleTimeString('pt-BR')}`;

  } catch (err) {
    mostrarErroSheets(`Falha na requisição: ${err.message}`);
  } finally {
    if (iconEl) iconEl.classList.remove('dash-spin');
  }
}

function pgsiScoreSheet(val) {
  const v = (val || '').toLowerCase().trim();
  if (v.includes('nunca')         || v === '0') return 0;
  if (v.includes('às vezes')      || v === '1') return 1;
  if (v.includes('maior parte')   || v.includes('na maioria') || v === '2') return 2;
  if (v.includes('quase sempre')  || v.includes('sempre') || v === '3') return 3;
  const n = parseInt(v);
  return isNaN(n) ? 0 : Math.min(3, Math.max(0, n));
}

function pgsiClassSheet(score) {
  if (score <= 2) return { label: 'Sem risco',      cls: 'dash-pill-green' };
  if (score <= 4) return { label: 'Risco baixo',    cls: 'dash-pill-gold'  };
  if (score <= 7) return { label: 'Risco moderado', cls: 'dash-pill-gold'  };
  return                 { label: 'Problemático',   cls: 'dash-pill-red'   };
}

function renderSheets(rows) {
  const get = (row, col) => (row[col] || '').trim();
  const n   = rows.length;
  if (!n) return;

  const records = rows.map((row, i) => {
    const apostou = get(row, DASH_COL.JA_APOSTOU).toLowerCase().startsWith('sim');
    let total = 0;
    const items = [];
    for (let q = 0; q < 9; q++) {
      const s = apostou ? pgsiScoreSheet(get(row, DASH_COL.Q1 + q)) : 0;
      items.push(s); total += s;
    }
    return {
      idx: i + 1,
      timestamp:   get(row, DASH_COL.TIMESTAMP),
      sexo:        get(row, DASH_COL.SEXO),
      idade:       get(row, DASH_COL.IDADE),
      renda:       get(row, DASH_COL.RENDA),
      apostou, pgsi: total, items,
      conhece:     get(row, DASH_COL.CONHECE),
      proximidade: get(row, DASH_COL.PROXIMIDADE),
    };
  });

  const semRisco = records.filter(r => r.pgsi <= 2).length;
  const baixo    = records.filter(r => r.pgsi >= 3 && r.pgsi <= 4).length;
  const moderado = records.filter(r => r.pgsi >= 5 && r.pgsi <= 7).length;
  const prob     = records.filter(r => r.pgsi >= 8).length;
  const nAp      = records.filter(r => r.apostou).length;

  // Métricas Sheets
  setDashText('sh-total',    n);
  setDashText('sh-apostou',  pctDash(nAp, n));
  setDashText('sh-apostou-sub', `${nAp} de ${n} respondentes`);
  setDashText('sh-prob',     pctDash(prob, n));
  setDashText('sh-mod',      pctDash(moderado + baixo, n));
  setDashText('sh-sem',      pctDash(semRisco, n));

  // Pizza PGSI
  mkDashChart('sh-c-pgsi', {
    type: 'doughnut',
    data: {
      labels: ['Sem risco (0–2)', 'Risco baixo (3–4)', 'Risco moderado (5–7)', 'Problemático (≥8)'],
      datasets: [{
        data: [semRisco, baixo, moderado, prob],
        backgroundColor: ['#16a34a', '#D4A843', '#742C24', '#3b0e09'],
        borderWidth: 0, hoverOffset: 6,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '62%',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => ` ${c.label}: ${c.raw} (${pctDash(c.raw, n)})` } },
      },
    },
  });

  // Barras sexo
  const masc = records.filter(r => r.sexo.toLowerCase().includes('masc')).length;
  const fem  = records.filter(r => r.sexo.toLowerCase().includes('fem')).length;
  mkDashChart('sh-c-sexo', {
    type: 'doughnut',
    data: {
      labels: ['Masculino', 'Feminino'],
      datasets: [{
        data: [masc, fem],
        backgroundColor: ['#742C24', '#D4A843'],
        borderWidth: 0, hoverOffset: 6,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '62%',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => ` ${c.label}: ${c.raw} (${pctDash(c.raw, n)})` } },
      },
    },
  });

  // Barras faixa etária
  const idadeKeys   = ['Menor de 16','16 a 17','18 a 24','25 a 34','35 a 44','45'];
  const idadeLabels = ['<16','16–17','18–24','25–34','35–44','45+'];
  mkDashChart('sh-c-idade', {
    type: 'bar',
    data: {
      labels: idadeLabels,
      datasets: [
        { label: 'Apostadores',     data: idadeKeys.map(k => records.filter(r => r.apostou && r.idade.includes(k)).length), backgroundColor: '#742C24' },
        { label: 'Não apostadores', data: idadeKeys.map(k => records.filter(r => !r.apostou && r.idade.includes(k)).length), backgroundColor: '#D4A843' },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.04)' } },
        y: { beginAtZero: true, ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.06)' } },
      },
    },
  });

  // Barras empilhadas renda × risco
  const rendaKeys   = ['Até R$ 1.621','De R$ 1.621','De R$ 3.242','De R$ 8.105','Acima','Prefiro'];
  const rendaLabels = ['≤R$1.6k','R$1.6–3.2k','R$3.2–8.1k','R$8.1–16k','>R$16k','Não inf.'];
  mkDashChart('sh-c-renda', {
    type: 'bar',
    data: {
      labels: rendaLabels,
      datasets: [
        { label: 'Sem risco',    data: rendaKeys.map(k => records.filter(r => r.renda.includes(k) && r.pgsi <= 2).length),                         backgroundColor: '#16a34a' },
        { label: 'Baixo',        data: rendaKeys.map(k => records.filter(r => r.renda.includes(k) && r.pgsi >= 3 && r.pgsi <= 4).length),           backgroundColor: '#D4A843' },
        { label: 'Moderado',     data: rendaKeys.map(k => records.filter(r => r.renda.includes(k) && r.pgsi >= 5 && r.pgsi <= 7).length),           backgroundColor: '#742C24' },
        { label: 'Problemático', data: rendaKeys.map(k => records.filter(r => r.renda.includes(k) && r.pgsi >= 8).length),                         backgroundColor: '#3b0e09' },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { stacked: true, ticks: { color: '#94a3b8', font: { size: 10 }, maxRotation: 30 }, grid: { color: 'rgba(0,0,0,0.04)' } },
        y: { stacked: true, beginAtZero: true, ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.06)' } },
      },
    },
  });

  // Linha de tempo
  const byDate = {};
  records.forEach(r => {
    if (!r.timestamp) return;
    const d = r.timestamp.split(' ')[0] || r.timestamp.split('T')[0];
    byDate[d] = (byDate[d] || 0) + 1;
  });
  const dateKeys = Object.keys(byDate).sort();
  mkDashChart('sh-c-tempo', {
    type: 'line',
    data: {
      labels: dateKeys.map(d => { const p = d.split('/'); return p.length === 3 ? `${p[0]}/${p[1]}` : d.slice(5); }),
      datasets: [{
        label: 'Respostas no dia',
        data: dateKeys.map(k => byDate[k]),
        borderColor: '#742C24',
        backgroundColor: 'rgba(116,44,36,0.08)',
        fill: true, tension: 0.4,
        pointRadius: 4, pointBackgroundColor: '#742C24', pointHoverRadius: 6,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#94a3b8', font: { size: 10 }, maxRotation: 40 }, grid: { color: 'rgba(0,0,0,0.04)' } },
        y: { beginAtZero: true, ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.06)' } },
      },
    },
  });

  // Barras PGSI por questão
  const pgsiAvg = PGSI_LABELS.map((_, qi) => {
    const vals = records.map(r => r.items[qi]);
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  });
  const shPgsiList = document.getElementById('sh-pgsi-list');
  if (shPgsiList) {
    shPgsiList.innerHTML = pgsiAvg.map((v, i) => {
      const pctBar = Math.round(v / 3 * 100);
      const cor    = v < 0.5 ? '#16a34a' : v < 1.5 ? '#D4A843' : '#742C24';
      return `
        <div class="dash-pgsi-row" title="${PGSI_LABELS[i]}">
          <span class="dash-pgsi-q">Q${i + 1}</span>
          <span class="dash-pgsi-label">${PGSI_LABELS[i]}</span>
          <div class="dash-pgsi-track">
            <div class="dash-pgsi-fill" style="width:${pctBar}%;background:${cor}"></div>
          </div>
          <span class="dash-pgsi-val" style="color:${cor}">${v.toFixed(2)}</span>
        </div>`;
    }).join('');
  }

  // Tabela últimas respostas
  const shTbody = document.getElementById('sh-tbody');
  if (shTbody) {
    shTbody.innerHTML = records.slice(-10).reverse().map(r => {
      const cls = pgsiClassSheet(r.pgsi);
      return `
        <tr>
          <td style="color:var(--dash-faint);font-weight:700">${r.idx}</td>
          <td style="color:var(--dash-muted);font-size:11px">${r.timestamp || '—'}</td>
          <td>${r.sexo  || '—'}</td>
          <td>${r.idade || '—'}</td>
          <td style="font-size:11px;color:var(--dash-muted)">${r.renda || '—'}</td>
          <td>${r.apostou ? '<span style="color:#742C24;font-weight:700">Sim</span>' : '<span style="color:var(--dash-faint)">Não</span>'}</td>
          <td style="font-weight:700">${r.pgsi}</td>
          <td><span class="dash-pill ${cls.cls}">${cls.label}</span></td>
        </tr>`;
    }).join('');
  }
}

// ── Erros Sheets ──
function mostrarErroSheets(msg) {
  const el = document.getElementById('dash-sheet-alert');
  if (!el) return;
  el.style.display = 'block';
  el.innerHTML = `<strong>⚠ Erro ao carregar planilha:</strong> ${msg}`;
  const st = document.getElementById('dash-sheet-status');
  if (st) st.textContent = 'Erro de conexão';
}

function esconderErroSheets() {
  const el = document.getElementById('dash-sheet-alert');
  if (el) el.style.display = 'none';
}

// ═══════════════════════════════════════════════════════════════
//  UTILITÁRIOS
// ═══════════════════════════════════════════════════════════════
function mkDashChart(id, cfg) {
  if (dashCharts[id]) { dashCharts[id].destroy(); }
  const ctx = document.getElementById(id);
  if (!ctx) return;
  if (typeof Chart === 'undefined') { console.warn('Chart.js não carregado'); return; }
  dashCharts[id] = new Chart(ctx, cfg);
}

function setDashText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function pctDash(a, b) {
  return b ? Math.round(a / b * 100) + '%' : '0%';
}