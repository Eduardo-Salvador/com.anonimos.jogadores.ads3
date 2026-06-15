const API = 'https://comanonimosjogadoresads3-production.up.railway.app';

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const login = document.getElementById("login").value;
  const password = document.getElementById("senha").value;

  try {
    const response = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password })
    });

    if (!response.ok) {
      alert("Login ou senha inválidos");
      return;
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);
    window.location.href = "admin.html";
  } catch (error) {
    console.error(error);
    alert("Erro ao conectar com o servidor");
  }
});