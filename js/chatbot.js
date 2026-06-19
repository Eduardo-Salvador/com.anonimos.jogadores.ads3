let awaitingName = false;

function getName() {
  return sessionStorage.getItem("chat_name");
}

function setName(name) {
  sessionStorage.setItem("chat_name", name);
}

const routes = [
  {
    page: "quem-somos",
    keywords: ["quem somos", "sobre o site", "o que é esse site", "o que é o site", "sobre vocês", "quem é vocês", "site"],
    reply: "Somos uma plataforma de apoio e informação sobre jogos e recuperação."
  },
  {
    page: "reunioes",
    keywords: ["reunião", "reunioes", "grupo", "ajuda", "perto de mim"],
    reply: "Aqui você encontra reuniões e grupos de apoio próximos."
  },
  {
    page: "autoaval",
    keywords: ["auto avaliação", "autoavaliacao", "teste", "viciado", "dependência"],
    reply: "Faça sua autoavaliação para entender sua relação com jogos."
  },
  {
    page: "doze-passos",
    keywords: ["12 passos", "doze passos", "passos", "recuperação"],
    reply: "O programa dos 12 passos ajuda na recuperação."
  },
  {
    page: "curiosidades",
    keywords: ["curiosidades", "curiosidade", "informações", "dados", "info", "influencer", "influenciador", "influenciadora"],
    reply: "Veja curiosidades e informações importantes sobre o tema."
  },
  {
    page: "videoteca",
    keywords: ["vídeo", "videos", "videoteca", "assistir", "youtube", "aprender"],
    reply: "Veja vídeos educativos na videoteca."
  },
  {
    page: "relatos",
    keywords: ["relato", "história", "experiência", "depoimento"],
    reply: "Leia relatos reais de pessoas que passaram por isso."
  },
  {
    page: "contato",
    keywords: ["contato", "falar com alguém", "suporte", "ajuda"],
    reply: "Você pode falar com nossa equipe na página de contato."
  },
  {
    page: "dashboard",
    keywords: ["painel", "dashboard", "minha conta", "resultados"],
    reply: "Aqui está seu painel de controle."
  }
];

function findRoute(text) {
  text = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  for (const route of routes) {
    if (route.keywords.some(k => text.includes(k))) {
      return route;
    }
  }

  return null;
}

function addMessage(type, text) {
  const box = document.getElementById("chat-messages");

  const div = document.createElement("div");
  div.classList.add("msg", type);
  div.innerText = text;

  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function goToPage(page) {
  const link = document.querySelector(`[data-page="${page}"]`);
  if (link) link.click();
}

function sendMessage(text) {
  if (!text.trim()) return; // ignora entradas vazias ou só com espaços

  addMessage("user", text);

  const name = getName();

  if (!name) {

    if (!awaitingName) {
      addMessage("bot", "Antes de continuar, qual é o seu nome?");
      awaitingName = true;
      return;
    }

    let cleanName = text.trim();

    // remove "oi", "olá", etc no começo
    cleanName = cleanName
      .replace(/^(oi|olá|ola|eai|opa)[,\s]*/i, "")
      .replace(/meu nome e/i, "")
      .trim();

    if (cleanName.length < 2 || cleanName.length > 20) {
      addMessage("bot", "Pode me dizer seu nome corretamente?");
      return;
    }

    setName(cleanName);
    awaitingName = false;

    addMessage("bot", `Prazer, ${cleanName}! Como posso te ajudar?`);
    return;
  }

  // resto do chat normal
  const route = findRoute(text);

  if (route) {
    addMessage("bot", `${name}, ${route.reply}`);
    setTimeout(() => goToPage(route.page), 500);
    return;
  }

  addMessage("bot", `${name}, não entendi. Tente algo como reuniões, autoavaliação ou vídeos.`);
}

document.getElementById("chatInput").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    sendMessage(this.value);
    this.value = "";
  }
});

document.getElementById("chatSend").addEventListener("click", () => {
  const input = document.getElementById("chatInput");
  sendMessage(input.value);
  input.value = "";
});

function initChat() {
  const name = getName();

  if (name) {
    addMessage("bot", `Olá ${name}, em que posso te ajudar?`);
    awaitingName = false;
  } else {
    addMessage("bot", "👋 Olá! Antes de começar, qual é o seu nome?");
    awaitingName = true;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initChat();
});