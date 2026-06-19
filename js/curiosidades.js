// ======================================
// CONFIGURAÇÃO DAS LABELS
// ======================================

const LABELS = {
  estudo: {
    texto: "ESTUDO",
    classe: "label-estudo"
  },

  saudeMental: {
    texto: "SAÚDE MENTAL",
    classe: "label-saude-mental"
  },

  leis: {
    texto: "LEIS",
    classe: "label-leis"
  },

  noticias: {
    texto: "NOTÍCIAS",
    classe: "label-noticias"
  },

  historiaReal: {
    texto: "HISTÓRIA REAL",
    classe: "label-historia-real"
  }
};

function criarLabelCard(tipo) {

  const config = LABELS[tipo];

  const span = document.createElement("span");

  span.classList.add(
    "label-card",
    config.classe
  );

  span.textContent = config.texto;

  return span;
}

function criarCard(cardData) {

  const card = document.createElement("article");
  card.classList.add("card-curiosidade");

  // Imagem
  const containerImg = document.createElement("div");
  containerImg.classList.add("container-img-card");

  const imagem = document.createElement("img");

  imagem.src = cardData.imagem;
  imagem.alt = cardData.titulo;

  containerImg.appendChild(imagem);

  // Label
  const label = criarLabelCard(cardData.tipo);

  containerImg.appendChild(label);

  // Conteúdo
  const content = document.createElement("div");
  content.classList.add("card-content");

  const data = document.createElement("span");
  data.classList.add("feed-date");
  data.textContent = cardData.data;

  const titulo = document.createElement("h4");
  titulo.classList.add("card-title");
  titulo.textContent = cardData.titulo;

  const descricao = document.createElement("p");
  descricao.classList.add("card-description");
  descricao.textContent = cardData.descricao;

  const link = document.createElement("a");
  link.classList.add("card-link");
  link.href = "#";
  link.textContent = "Ler mais";

  content.append(
    data,
    titulo,
    descricao,
    link
  );

  card.append(
    containerImg,
    content
  );

  return card;
}

async function fetchNewsFromBackend(query = '') {
  try {
    const qs = new URLSearchParams({ query: query || '', page: '0', size: '100' });
    const res = await fetch('http://localhost:8081' + `/api/news?${qs.toString()}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json;
  } catch (err) {
    console.error('Error fetching news from backend', err);
    return null;
  }
}

async function renderNewsFeed({ query = '' } = {}) {
  const feed = document.getElementById('curiosidades-feed');
  feed.innerHTML = '';

  // mostrar loading
  const loading = document.createElement('p');
  loading.className = 'empty';
  loading.textContent = 'Carregando notícias...';
  feed.appendChild(loading);

  const pageResp = await fetchNewsFromBackend(query);

  feed.innerHTML = '';

  if (!pageResp || !Array.isArray(pageResp) || pageResp.length === 0) {
    const msg = document.createElement('p');
    msg.className = 'empty';
    msg.textContent = 'Nenhuma notícia encontrada.';
    feed.appendChild(msg);
    return;
  }


  const items = pageResp.map(a => ({
    tipo: 'noticias',
    data: a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric'}) : '',
    titulo: a.title || '',
    descricao: a.description || '',
    imagem: a.imageUrl || './assets/images/curiosidades/card-economy.jpg',
    url: a.url
  }));

  items.forEach(cardData => {
    const card = criarCard(cardData);
    if (cardData.url) {
      const a = card.querySelector('.card-link');
      if (a) {
        a.href = cardData.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
    }
    feed.appendChild(card);
  });
}

function configurarFiltros() {

  const botoes = document.querySelectorAll(
    ".btn-curiosidades-feed"
  );

  botoes.forEach(botao => {

    botao.addEventListener("click", (event) => {

      botoes.forEach(btn => {
        btn.classList.remove("feed-active-button");
      });

      const botaoClicado =
        event.currentTarget;

      botaoClicado.classList.add(
        "feed-active-button"
      );

      const categoria = botaoClicado.id;
      // Map button id to a search query for the backend
      const queryMap = {
        todas: '',
        noticias: 'apostas',
        estudos: 'estudo',
        leis: 'leis',
        saude: 'saude mental',
        historias: 'historia real',
        recuperacao: 'recuperacao'
      };

      const q = queryMap[categoria] ?? '';
      renderNewsFeed({ query: q });
    });

  });

}

document.addEventListener("DOMContentLoaded", () => {
    renderNewsFeed({ query: '' });

  configurarFiltros();

  // Setup search input if exists
  const input = document.querySelector('#curiosidades-search') || document.querySelector('.search-input');
  if (input) {
    let t;
    input.addEventListener('input', (e) => {
      clearTimeout(t);
      t = setTimeout(() => {
        const q = e.target.value.trim();
        renderNewsFeed({ query: q });
      }, 400);
    });
  }

});