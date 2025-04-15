// === SephyLeaks - JS de base ===

document.addEventListener("DOMContentLoaded", () => {
  console.log("SephyLeaks ready.");

  fetch("data/articles.json")
    .then(res => res.json())
    .then(articles => {
      const container = document.getElementById("articles-container");
      articles.forEach(article => {
        const section = document.createElement("section");
        section.classList.add("article");

        section.innerHTML = `
          <div class="tag">${article.tag}</div>
          <h2>« ${article.title} »</h2>
          <p>${article.content}</p>
        `;
        container.appendChild(section);
      });
    })
    .catch(err => {
      console.error("Erreur de chargement des articles :", err);
    });
});
