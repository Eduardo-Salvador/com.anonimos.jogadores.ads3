// const input = document.querySelector("search-input");
// const noticias = document.querySelectorAll(".news-item");


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

// ======================================
// DADOS DOS CARDS
// ======================================

const cards = [
  {
    tipo: "estudo",
    data: "9 de maio de 2024",
    titulo: "Vício em apostas ativa os mesmos mecanismos de dependência química, diz estudo.",
    descricao: "Pesquisa com neuroimagem mostra alterações significativos no cérebro.",
    imagem: "./assets/images/curiosidades/card-brain.jpg"
  },

  {
    tipo: "saudeMental",
    data: "12 de maio de 2024",
    titulo: "A relação entre apostas, ansiedade e depressão.",
    descricao: "Especialistas alertam para os impactos emocionais do jogo compulsivo.",
    imagem: "./assets/images/curiosidades/card-depression.jpg"
  },

  {
    tipo: "leis",
    data: "18 de maio de 2024",
    titulo: "Câmara dos deputados discute regulamentação das apostas esportivas.",
    descricao: "Texto prevê tributação e medidas de proteção ao consumidor.",
    imagem: "./assets/images/curiosidades/card-parliament.jpg"
  },

  {
    tipo: "noticias",
    data: "18 de maio de 2024",
    titulo: "Endividamento por aposta cresce mais de 300% em três anos",
    descricao: "Levantamento mostra aumento expressivo de famílias endividadas.",
    imagem: "./assets/images/curiosidades/card-economy.jpg"
  },

  {
    tipo: "historiaReal",
    data: "18 de maio de 2024",
    titulo: "Perdi tudo, menos a vontade de mudar",
    descricao: "Relato de um membro sobre como encontrou apoio nos Jogadores Anônimos.",
    imagem: "./assets/images/curiosidades/card-depressed-person.jpg"
  },

  {
    tipo: "estudo",
    data: "18 de maio de 2024",
    titulo: "Efeito das apostas online no desempenho escolar",
    descricao: "Estudo aponta queda no rendimento de estudantes envolvidos com apostas.",
    imagem: "./assets/images/curiosidades/card-college.jpg"
  },

  {
    tipo: "saudeMental",
    data: "18 de maio de 2024",
    titulo: "Terapia cognitivo-comportamental ajuda no tratamento do vício",
    descricao: "Abordagem tem mostrado bons resultados na recuperação de jogadores.",
    imagem: "./assets/images/curiosidades/card-cognitive-therapy.jpg"
  },

  {
    tipo: "noticias",
    data: "18 de maio de 2024",
    titulo: "Patrocínio de bets no esporte preocupa especialistas",
    descricao: "Associações médicas pedem restrições à publicidade durante eventos esportivos.",
    imagem: "./assets/images/curiosidades/card-bets.jpg"
  }
];

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

// function renderizarCards() {

//   const feed = document.getElementById(
//     "curiosidades-feed"
//   );

//   feed.innerHTML = "";

//   cards.forEach(cardData => {

//     const card = criarCard(cardData);

//     feed.appendChild(card);

//   });

// }

function renderizarCards(tipo = "todas") {

  const feed = document.getElementById(
    "curiosidades-feed"
  );

  feed.innerHTML = "";

  const cardsFiltrados = tipo === "todas"
    ? cards
    : cards.filter(card => card.tipo === tipo);

  cardsFiltrados.forEach(cardData => {

    const card = criarCard(cardData);

    feed.appendChild(card);

  });

}

// function configurarFiltros() {

//   const botoes = document.querySelectorAll(
//     ".btn-curiosidades-feed"
//   );

//   botoes.forEach(botao => {

//     botao.addEventListener("click", (event) => {

//       // Remove o ativo de todos
//       botoes.forEach(btn => {
//         btn.classList.remove("feed-active-button");
//       });

//       // Adiciona no clicado
//       event.currentTarget.classList.add(
//         "feed-active-button"
//       );

//     });

//   });

// }


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

      const categoria =
        botaoClicado.id;

      switch (categoria) {

        case "todas":
          renderizarCards("todas");
          break;

        case "noticias":
          renderizarCards("noticias");
          break;

        case "estudos":
          renderizarCards("estudo");
          break;

        case "leis":
          renderizarCards("leis");
          break;

        case "saude":
          renderizarCards("saudeMental");
          break;

        case "historias":
          renderizarCards("historiaReal");
          break;

        case "recuperacao":
          // quando criar os cards desse tipo
          renderizarCards("recuperacao");
          break;
      }

    });

  });

}

document.addEventListener("DOMContentLoaded", () => {

  renderizarCards();

  configurarFiltros();

});