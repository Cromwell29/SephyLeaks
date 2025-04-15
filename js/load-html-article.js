document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("article-container");
  const params = new URLSearchParams(window.location.search);
  const articleId = params.get("id");

  if (!articleId) {
    container.innerHTML = "<p>❌ Aucun article spécifié.</p>";
    return;
  }

  const url = `articles/${articleId}.html`;

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error("Fichier non trouvé");
      return res.text();
    })
    .then(html => {
      container.innerHTML = html;
    })
    .catch(err => {
      console.error("Erreur :", err);
      container.innerHTML = "<p>❌ Article introuvable.</p>";
    });
});
