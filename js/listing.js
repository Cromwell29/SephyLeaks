document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("listing-container");
  if (!container) return console.error("❌ Conteneur #listing-container introuvable.");

  fetch("data/articles.json")
    .then(res => res.json())
    .then(articles => {
      articles.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      articles.forEach(article => {
        const section = document.createElement("section");
        section.classList.add("article-card");

        section.innerHTML = `
          <div class="card-image" style="background-image: url('${article.image}')"></div>
          <div class="card-content">
            <div class="tag">${article.tag}</div>
            <h2>${article.title}</h2>
            <p>${article.resume}</p>
            <div class="date">${article.date}</div>
            <a href="article.html?id=${article.id}" class="read-more">→ Lire l’article</a>
          </div>
        `;

        container.appendChild(section);
      });
    })
    .catch(err => {
      console.error("❌ Erreur de chargement des articles :", err);
    });
});
