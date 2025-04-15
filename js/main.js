// === SephyLeaks - JS de base ===

document.addEventListener("DOMContentLoaded", () => {
  console.log("SephyLeaks ready.");

  const container = document.getElementById("articles-container");

  fetch("data/articles.json")
    .then(res => res.json())
    .then(articles => {
      articles.forEach(article => {
        const section = document.createElement("section");
        section.classList.add("article");
        section.setAttribute("data-tag", article.tag); // important pour le filtrage

        section.innerHTML = `
          <div class="tag">${article.tag}</div>
          <h2>« ${article.title} »</h2>
          <p>${article.content}</p>
        `;

        container.appendChild(section);
      });

      // Filtrage par tag
      const buttons = document.querySelectorAll(".filter-btn");
      buttons.forEach(btn => {
        btn.addEventListener("click", () => {
          document.querySelector(".filter-btn.active")?.classList.remove("active");
          btn.classList.add("active");

          const filter = btn.dataset.filter;
          const articles = document.querySelectorAll(".article");

          articles.forEach(article => {
            const tag = article.dataset.tag;
            if (filter === "All" || tag === filter) {
              article.style.display = "block";
            } else {
              article.style.display = "none";
            }
          });
        });
      });
    });
});
