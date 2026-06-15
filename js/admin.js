const API = 'http://localhost:8081';

/* ══════════════════════════════════
   AUTH
══════════════════════════════════ */
function getToken() {
  return localStorage.getItem('token');
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + getToken(),
  };
}

/* ══════════════════════════════════
   TOAST
══════════════════════════════════ */
let toastTimer;

function toast(msg, type = 'ok') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = ''; }, 3000);
}

/* ══════════════════════════════════
   MODALS
══════════════════════════════════ */
function openModal(id) {
  document.getElementById(id).classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.dataset.close));
});

document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(m => closeModal(m.id));
  }
});

/* ══════════════════════════════════
   HELPERS
══════════════════════════════════ */
function fmtDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function toISOLocal(date, time) {
  return date + 'T' + time + ':00';
}

function splitDateTime(iso) {
  if (!iso) return { date: '', time: '' };
  const d = new Date(iso);
  const date = d.toISOString().slice(0, 10);
  const time = d.toTimeString().slice(0, 5);
  return { date, time };
}

function escAttr(s) {
  return String(s).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

/* ══════════════════════════════════
   CIDADES
══════════════════════════════════ */
let cidades = [];

function renderCidades() {
  const tbody = document.getElementById('tbodyCidades');

  if (!tbody) return;

  if (!cidades.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="empty">
          Nenhuma cidade cadastrada
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = cidades.map(c => `
    <tr>
      <td>${c.id}</td>
      <td>${c.nome}</td>
      <td>${c.estado}</td>

      <td>
        <div class="td-actions">

          <button
            class="btn btn--gold btn--sm"
            onclick="editarCidade(${c.id}, '${escAttr(c.nome)}', '${escAttr(c.estado)}')">
            Editar
          </button>

          <button
            class="btn btn--danger btn--sm"
            onclick="deletarCidade(${c.id})">
            Excluir
          </button>

        </div>
      </td>
    </tr>
  `).join('');
}

async function loadCidades() {
  try {
    const res = await fetch(`${API}/cidades?size=100`, {
      headers: authHeaders()
    });
    const data = await res.json();
    document.getElementById('statCidades').textContent = data.totalElements ?? 0;
    cidades = Array.isArray(data) ? data : (data.content || []);
    populateCidadeSelects();
    renderCidades();

  } catch (e) {
    console.error("Erro:", e);
  }
}

function populateCidadeSelects() {
  const opts = cidades.map(c => `<option value="${c.id}">${c.nome} — ${c.estado}</option>`).join('');
  document.getElementById('novaCidade').innerHTML = opts;
  document.getElementById('editCidade').innerHTML = opts;
}

/* ══════════════════════════════════
   REUNIÕES
══════════════════════════════════ */
async function loadReunioes() {
  try {
    const res  = await fetch(`${API}/reunioes?size=100`, { headers: authHeaders() });
    const data = await res.json();
    document.getElementById('statReunioes').textContent = data.totalElements ?? 0;
    renderReunioes(data.content || []);
  } catch {
    document.getElementById('tbodyReunioes').innerHTML =
      '<tr><td colspan="6" class="empty">Erro ao carregar reuniões.</td></tr>';
  }
}

function renderReunioes(list) {
  const tbody = document.getElementById('tbodyReunioes');

  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty">Nenhuma reunião cadastrada.</td></tr>';
    return;
  }

  tbody.innerHTML = list.map(r => `
    <tr>
      <td>${r.titulo}</td>
      <td>${r.nomeCidade ?? '—'} — ${r.uf ?? ''}</td>
      <td>${r.endereco}</td>
      <td>${fmtDateTime(r.dataHora)}</td>
      <td>${r.descricao ?? '—'}</td>
      <td>
        <div class="td-actions">
          <button class="btn btn--gold btn--sm"
            onclick="abrirEditarReuniao(${r.id}, '${escAttr(r.titulo)}', ${r.idCidade}, '${escAttr(r.endereco)}', '${r.dataHora}', '${escAttr(r.descricao ?? '')}')">
            Editar
          </button>
          <button class="btn btn--danger btn--sm" onclick="deletarReuniao(${r.id})">Excluir</button>
        </div>
      </td>
    </tr>
  `).join('');
}

/* Nova Reunião */
document.getElementById('btnNovaReuniao').addEventListener('click', () => openModal('modalNovaReuniao'));

document.getElementById('btnSalvarNova').addEventListener('click', async () => {
  const titulo    = document.getElementById('novaTitulo').value.trim();
  const idCidade  = document.getElementById('novaCidade').value;
  const endereco  = document.getElementById('novaEndereco').value.trim();
  const data      = document.getElementById('novaData').value;
  const hora      = document.getElementById('novaHora').value;
  const descricao = document.getElementById('novaDescricao').value.trim();

  if (!titulo || !idCidade || !endereco || !data || !hora) {
    toast('Preencha todos os campos obrigatórios.', 'err');
    return;
  }

  const body = { titulo, descricao, endereco, idCidade: Number(idCidade), dataHora: toISOLocal(data, hora) };

  try {
    const res = await fetch(`${API}/reunioes`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error();
    toast('Reunião criada com sucesso!');
    closeModal('modalNovaReuniao');
    loadReunioes();
  } catch {
    toast('Erro ao criar reunião.', 'err');
  }
});

/* Editar Reunião */
function abrirEditarReuniao(id, titulo, idCidade, endereco, dataHora, descricao) {
  document.getElementById('editId').value       = id;
  document.getElementById('editTitulo').value   = titulo;
  document.getElementById('editEndereco').value = endereco;
  document.getElementById('editDescricao').value = descricao;
  const { date, time } = splitDateTime(dataHora);
  document.getElementById('editData').value   = date;
  document.getElementById('editHora').value   = time;
  document.getElementById('editCidade').value = idCidade;
  openModal('modalEditarReuniao');
}

document.getElementById('btnSalvarEdit').addEventListener('click', async () => {
  const id        = document.getElementById('editId').value;
  const titulo    = document.getElementById('editTitulo').value.trim();
  const idCidade  = document.getElementById('editCidade').value;
  const endereco  = document.getElementById('editEndereco').value.trim();
  const data      = document.getElementById('editData').value;
  const hora      = document.getElementById('editHora').value;
  const descricao = document.getElementById('editDescricao').value.trim();

  if (!titulo || !idCidade || !endereco || !data || !hora) {
    toast('Preencha todos os campos obrigatórios.', 'err');
    return;
  }

  const body = { titulo, descricao, endereco, idCidade: Number(idCidade), dataHora: toISOLocal(data, hora) };

  try {
    const res = await fetch(`${API}/reunioes/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error();
    toast('Reunião atualizada!');
    closeModal('modalEditarReuniao');
    loadReunioes();
  } catch {
    toast('Erro ao atualizar reunião.', 'err');
  }
});

/* Deletar Reunião */
async function deletarReuniao(id) {
  if (!confirm('Excluir esta reunião?')) return;
  try {
    const res = await fetch(`${API}/reunioes/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error();
    toast('Reunião excluída.');
    loadReunioes();
  } catch {
    toast('Erro ao excluir reunião.', 'err');
  }
}

/* ══════════════════════════════════
   FEEDBACKS
══════════════════════════════════ */
async function loadFeedbacks() {
  try {
    const res  = await fetch(`${API}/feedbacks?size=100`, { headers: authHeaders() });
    const data = await res.json();
    const list = data.content || [];
    document.getElementById('statFeedbacks').textContent  = data.totalElements ?? list.length;
    document.getElementById('badgeFeedbacks').textContent = `${list.length} relato${list.length !== 1 ? 's' : ''}`;
    renderFeedbacks(list);
  } catch {
    document.getElementById('gridFeedbacks').innerHTML = '<p class="empty">Erro ao carregar relatos.</p>';
  }
}

function renderFeedbacks(list) {
  const grid = document.getElementById('gridFeedbacks');

  if (!list.length) {
    grid.innerHTML = '<p class="empty">Nenhum relato cadastrado.</p>';
    return;
  }

  grid.innerHTML = list.map(f => `
    <div class="relato-card">
      <h4>${f.nome}</h4>
      <p class="relato-meta">${f.idade} anos</p>
      <p>${f.descricao}</p>
      <div class="relato-actions">
        <button class="btn btn--gold btn--sm"
          onclick="abrirEditarFeedback(${f.id}, '${escAttr(f.nome)}', ${f.idade}, '${escAttr(f.descricao)}')">
          Editar
        </button>
        <button class="btn btn--danger btn--sm" onclick="deletarFeedback(${f.id})">Excluir</button>
      </div>
    </div>
  `).join('');
}

/* Editar Feedback */
function abrirEditarFeedback(id, nome, idade, descricao) {
  document.getElementById('fbEditId').value       = id;
  document.getElementById('fbEditNome').value     = nome;
  document.getElementById('fbEditIdade').value    = idade;
  document.getElementById('fbEditDescricao').value = descricao;
  openModal('modalEditarFeedback');
}

document.getElementById('btnSalvarFbEdit').addEventListener('click', async () => {
  const id        = document.getElementById('fbEditId').value;
  const nome      = document.getElementById('fbEditNome').value.trim();
  const idade     = Number(document.getElementById('fbEditIdade').value);
  const descricao = document.getElementById('fbEditDescricao').value.trim();

  if (!nome || !idade || !descricao) {
    toast('Preencha todos os campos.', 'err');
    return;
  }

  const body = { nome, idade, descricao };

  try {
    const res = await fetch(`${API}/feedbacks/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error();
    toast('Relato atualizado!');
    closeModal('modalEditarFeedback');
    loadFeedbacks();
  } catch {
    toast('Erro ao atualizar relato.', 'err');
  }
});

/* Deletar Feedback */
async function deletarFeedback(id) {
  if (!confirm('Excluir este relato?')) return;
  try {
    const res = await fetch(`${API}/feedbacks/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error();
    toast('Relato excluído.');
    loadFeedbacks();
  } catch {
    toast('Erro ao excluir relato.', 'err');
  }
}

/* ══════════════════════════════════
   LOGOUT
══════════════════════════════════ */
document.getElementById('btnLogout').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'adminLogin.html';
});

/* ══════════════════════════════════
   INIT
══════════════════════════════════ */
async function init() {
  if (!getToken()) {
    window.location.href = 'adminLogin.html';
    return;
  }
  await loadCidades();
  await loadReunioes();
  await loadFeedbacks();
}
document.getElementById('btnNovaCidade')?.addEventListener('click', () => {

  document.getElementById('cidadeId').value = '';
  document.getElementById('cidadeNome').value = '';
  document.getElementById('cidadeEstado').value = '';

  openModal('modalCidade');
});

function editarCidade(id, nome, estado) {

  document.getElementById('cidadeId').value = id;
  document.getElementById('cidadeNome').value = nome;
  document.getElementById('cidadeEstado').value = estado;

  openModal('modalCidade');
}

document.getElementById('btnSalvarCidade')?.addEventListener('click', async () => {

  const id = document.getElementById('cidadeId').value;

  const body = {
    nome: document.getElementById('cidadeNome').value.trim(),
    estado: document.getElementById('cidadeEstado').value.trim().toUpperCase()
  };

  if (!body.nome || !body.estado) {
    toast('Preencha todos os campos.', 'err');
    return;
  }

  const method = id ? 'PUT' : 'POST';

  const url = id
    ? `${API}/cidades/${id}`
    : `${API}/cidades`;

  try {

    const res = await fetch(url, {
      method,
      headers: authHeaders(),
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error();

    toast('Cidade salva com sucesso');

    closeModal('modalCidade');

    await loadCidades();

  } catch {

    toast('Erro ao salvar cidade', 'err');
  }
});

async function deletarCidade(id) {

  if (!confirm('Excluir cidade?')) return;

  try {

    const res = await fetch(`${API}/cidades/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });

    if (!res.ok) throw new Error();

    toast('Cidade excluída');

    await loadCidades();

  } catch {

    toast('Erro ao excluir cidade', 'err');
  }
}
init();