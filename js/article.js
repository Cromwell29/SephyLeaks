document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("article-container");

  const params = new URLSearchParams(window.location.search);
  const articleId = params.get("id");

  if (!articleId) {
    container.innerHTML = "<p>❌ Aucun identifiant d’article fourni.</p>";
    return;
  }

  fetch("data/articles.json")
    .then(res => res.json())
    .then(articles => {
      const article = articles.find(a => a.id === articleId);

      if (!article) {
        container.innerHTML = "<p>❌ Article introuvable.</p>";
        return;
      }

      container.innerHTML = `
        <article class="article-full">
          <h2>${article.title}</h2>
          <p class="date">${article.date}</p>
          <div class="tag-badge">${article.tag}</div>
          <div class="cover-image" style="background-image: url('${article.image}');"></div>
          <p>${article.content}</p>
        </article>
      `;
    })
    .catch(err => {
      container.innerHTML = "<p>❌ Erreur de chargement de l’article.</p>";
      console.error(err);
    });
});
