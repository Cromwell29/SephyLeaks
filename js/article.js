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
 	<article class="article-page-wrapper">
    	<div class="article-cover" style="background-image: url('${article.image}');"></div>
    	<div class="article-meta">
      	<span class="tag-badge">${article.tag}</span>
      	<span class="date">${article.date}</span>
    	</div>
        <h1 class="article-title">${article.title}</h1>
    <div class="article-content">
      <p>${article.content}</p>
    </div>
  </article>
      `;
    })
    .catch(err => {
      container.innerHTML = "<p>❌ Erreur de chargement de l’article.</p>";
      console.error(err);
    });
});
