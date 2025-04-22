// === SephyLeaks - JS de base ===
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ SephyLeaks prêt");

  const container = document.getElementById("articles-container");
  const filtersContainer = document.getElementById("filters");

  if (!container) {
    console.error("❌ Pas de conteneur #articles-container trouvé !");
    return;
  }

  const uniqueTags = new Set();

  fetch("data/articles.json")
    .then(res => {
      console.log("📦 Fichier JSON récupéré :", res.status);
      return res.json();
    })
    .then(articles => {
      console.log("📄 Données JSON :", articles);

      // Injection d'articles
      articles.forEach(article => {
        console.log("🖋️ Injection article :", article.title);

        const tag = article.tag.trim().toLowerCase();

        const section = document.createElement("section");
        section.classList.add("article");
        section.setAttribute("data-tag", tag);
	section.classList.add("article-card");

	section.innerHTML = `
  	<div class="card-image" style="background-image: url('${article.image}');"></div>
  	<div class="card-content">
   	 <div class="tag">${article.tag}</div>
   	 <h2>${article.title}</h2>
   	 <p>${article.resume}</p>
         <div class="date">${article.date}</div>
         <a href="article.html?id=${article.id}" class="read-more" title="${article.title}">→ Lire l’article</a>
        </div>
	`;


        container.appendChild(section);
        uniqueTags.add(tag);
      });

      console.log("✅ Nombre d'articles injectés :", document.querySelectorAll(".article").length);

      // Génération des boutons de filtre
      const createButton = (label, isActive = false) => {
        const btn = document.createElement("button");
        btn.textContent = label;
        btn.dataset.filter = label.toLowerCase();
        btn.className = "filter-btn";
        if (isActive) btn.classList.add("active");
        filtersContainer.appendChild(btn);
      };

      createButton("Tous", true);
      [...uniqueTags].forEach(tag => {
        const label = tag
          .split(" ")
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        createButton(label);
      });

      // Affichage de tous les articles au démarrage
      document.querySelectorAll(".article").forEach(article => {
        article.style.display = "block";
      });

      // Filtrage
      const buttons = document.querySelectorAll(".filter-btn");
      buttons.forEach(btn => {
        btn.addEventListener("click", () => {
          document.querySelector(".filter-btn.active")?.classList.remove("active");
          btn.classList.add("active");

          const filter = btn.dataset.filter;
          const articles = document.querySelectorAll(".article");

          articles.forEach(article => {
            const tag = article.dataset.tag;
            article.style.display = (filter === "tous" || tag === filter) ? "block" : "none";
          });
        });
      });
    })
    .catch(err => {
      console.error("❌ Erreur de chargement JSON :", err);
    });
});
