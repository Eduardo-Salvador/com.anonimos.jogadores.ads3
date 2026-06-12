'use strict';

let reunioesRendered = false;
let reunioesCache = []; // guarda os dados para o modal usar

function initReunioes() {
  if (!reunioesRendered) {
    renderReunioes();
    reunioesRendered = true;
  }
  setTimeout(() => initMap(), 100);
}

// ── Helpers ──

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function geocodificar(endereco) {
  const q = encodeURIComponent(endereco + ', Brasil');
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'pt-BR' } }
    );
    const data = await res.json();
    if (data.length > 0)
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch (e) {
    console.warn('Geocodificação falhou para:', endereco);
  }
  return null;
}

function getPosicaoAtual() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 6000 }
    );
  });
}

function formatarData(dataHoraStr) {
  const d = new Date(dataHoraStr);
  const diasSem = ['DOM','SEG','TER','QUA','QUI','SEX','SAB'];
  const meses   = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
  return {
    dia:     String(d.getDate()).padStart(2, '0'),
    mes:     meses[d.getMonth()],
    diasem:  diasSem[d.getDay()],
    horario: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  };
}

// ── Render principal ──

async function renderReunioes(endpoint = 'http://localhost:8081/reunioes?size=50&sort=dataHora,asc') {
  const container = document.getElementById('lista-reunioes');
  if (!container) return;

  container.innerHTML = '<p style="padding:16px;color:#64748b">Carregando reuniões...</p>';

  // 1. GPS do usuário
  const posicaoUsuario = await getPosicaoAtual();

  // 2. Busca do backend
  let reunioes = [];
  try {
    const res = await fetch(endpoint);
    const data = await res.json();
    reunioes = data.content ?? data ?? [];
  } catch (e) {
    container.innerHTML = '<p style="padding:16px;color:#742C24">Erro ao carregar reuniões.</p>';
    console.error(e);
    return;
  }

  // 3. Geocodifica e calcula distância
  const processadas = await Promise.all(
    reunioes.map(async (r) => {
      let distKm = null;
      if (posicaoUsuario) {
        const coords = await geocodificar(r.endereco);
        if (coords) {
          distKm = haversine(posicaoUsuario.lat, posicaoUsuario.lng, coords.lat, coords.lng);
        }
      }
      return { ...r, distKm };
    })
  );

  // 4. Ordena por distância
  if (posicaoUsuario) {
    processadas.sort((a, b) => {
      if (a.distKm === null) return 1;
      if (b.distKm === null) return -1;
      return a.distKm - b.distKm;
    });
  }

  reunioesCache = processadas; // salva para o modal

  // 5. Renderiza cards
  container.innerHTML = processadas.map((r, i) => {
    const { dia, mes, diasem, horario } = formatarData(r.dataHora);
    const distLabel = r.distKm !== null
      ? `${r.distKm.toFixed(1).replace('.', ',')} KM DE VOCÊ`
      : '';

    return `
      <div class="reuniao-card" role="listitem" data-index="${i}">
        <div class="reuniao-date">
          <div class="day">${dia}</div>
          <div class="month">${mes}</div>
          <div class="weekday">${diasem}</div>
        </div>
        <div class="reuniao-info">
          <h4>${r.titulo}</h4>
          <div class="time">${horario} &nbsp; ${r.endereco}</div>
          ${distLabel ? `<div class="dist-badge">${distLabel}</div>` : ''}
        </div>
        <div class="reuniao-action">
          <button class="btn-detalhes" data-action="detalhes" data-index="${i}">Detalhes</button>
        </div>
      </div>
    `;
  }).join('');

  // 6. Clique nos cards
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="detalhes"]');
    if (!btn) return;
    const idx = Number(btn.dataset.index);
    if (reunioesCache[idx]) openReuniaoModal(reunioesCache[idx]);
  });
}

// ── Modal ──

function openReuniaoModal(r) {
  const modal = document.getElementById('reuniao-modal');
  if (!modal || !r) return;

  const data = new Date(r.dataHora);

  document.getElementById('modal-nome').textContent =
    r.titulo || 'Reunião';

  document.getElementById('modal-dia').textContent =
    data.toLocaleDateString('pt-BR');

  document.getElementById('modal-horario').textContent =
    data.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });

  document.getElementById('modal-endereco').textContent =
    r.endereco
        ? r.endereco.split(',').slice(0, 2).join(',')
        : '—';

  document.getElementById('modal-descricao').textContent =
    r.descricao || 'Sem informações adicionais no momento.';

  document.getElementById('modal-cidade').textContent =
    r.nomeCidade + " - " + r.uf || '—';

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

// ── Tabs presenciais / online ──

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

// ── Filtros ──

document.querySelector('.filter-btns')?.addEventListener('click', async (e) => {

  const btn = e.target.closest('.filter-btn');
  if (!btn) return;

  document.querySelectorAll('.filter-btn')
    .forEach(b => b.classList.remove('active'));

  btn.classList.add('active');

  const filtro = btn.dataset.filter;

  switch (filtro) {

    case 'hoje':
      await renderReunioes(
        'http://localhost:8081/reunioes/hoje'
      );
      break;

    case 'semana':
      await renderReunioes(
        'http://localhost:8081/reunioes/semana'
      );
      break;

    default:
      await renderReunioes(
        'http://localhost:8081/reunioes?size=50&sort=dataHora,asc'
      );
  }

});
