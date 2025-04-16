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
    <div class="article-content"></div>
  </article>
`;

document.querySelector(".article-content").innerHTML = article.content;
    })
    .catch(err => {
      container.innerHTML = "<p>❌ Erreur de chargement de l’article.</p>";
      console.error(err);
    });
// === Articles récents dans la sidebar ===
fetch("data/articles.json")
  .then(res => res.json())
  .then(articles => {
    const recentContainer = document.getElementById("recent-articles-list");
    if (!recentContainer) return;

    // Trier par date descendante (si jamais on passe au tri auto)
    const sorted = [...articles].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Prendre les 3 derniers
    sorted.slice(0, 3).forEach(article => {
      const li = document.createElement("li");

      li.innerHTML = `
        <a href="article.html?id=${article.id}" title="${article.title}">
          <img src="${article.image}" alt="${article.title}" style="width:60px; height:60px; object-fit:cover; border-radius:4px; margin-right:0.5rem;">
          ${article.title}
        </a>
      `;

      li.style.display = "flex";
      li.style.alignItems = "center";
      li.style.marginBottom = "0.5rem";

      recentContainer.appendChild(li);
    });
  })
  .catch(err => console.error("❌ Erreur lors du chargement des articles récents :", err));

});
