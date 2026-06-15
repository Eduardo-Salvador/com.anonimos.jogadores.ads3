const videos = [
  {
    title: "Da Diversão ao Vício: A História de Rogérinho",
    url: "https://www.youtube.com/watch?v=9V19WR9g0is"
  },
  {
    title: "Lucas, a Linha da Aposta",
    url: "https://www.youtube.com/watch?v=fgR6p-2KGUg"
  },
  {
    title: "Meu Vício em Apostas: Um Relato Real",
    url: "https://www.youtube.com/watch?v=eFJGg9-JsVM"
  },
  {
    title: "Entendendo o Vício em Apostas",
    url: "https://www.youtube.com/watch?v=pWIi7I-cajc"
  }
];

function getYouTubeID(url) {
  return new URL(url).searchParams.get("v");
}

function renderVideos() {
  const grid = document.getElementById("videosGrid");

  grid.innerHTML = videos.map(v => {
    const id = getYouTubeID(v.url);

    return `
      <div class="video-card" onclick="openModal('${v.url}', '${v.title.replace(/'/g, "\\'")}')">
        
        <div class="thumb-wrapper">
          <img src="https://img.youtube.com/vi/${id}/mqdefault.jpg">

          <div class="play-overlay">▶</div>
        </div>

        <div class="video-info">
          <h3 class="video-title">${v.title}</h3>
          <p class="video-subtitle">YouTube • Educação</p>
        </div>

      </div>
    `;
  }).join("");
}

function openModal(url, title) {
  const id = getYouTubeID(url);

  document.getElementById("videoModal").style.display = "flex";
  document.getElementById("modalTitle").innerText = title;

  document.getElementById("videoFrame").innerHTML = `
    <iframe src="https://www.youtube.com/embed/${id}?autoplay=1"
      frameborder="0"
      allow="autoplay; encrypted-media"
      allowfullscreen>
    </iframe>
  `;
}

function closeModal() {
  document.getElementById("videoModal").style.display = "none";
  document.getElementById("videoFrame").innerHTML = "";
}

renderVideos();