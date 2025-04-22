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
    .then(res => res.json())
    .then(articles => {
      console.log("📄 Données JSON :", articles);
	  
const latestArticle = [...articles].sort((a, b) => parseDate(b.date) - parseDate(a.date))[0];
const filteredArticles = articles.filter(a => a.id !== latestArticle.id);
      // Injection d'articles
	filteredArticles.forEach(article => {
        const tag = article.tag.trim().toLowerCase();

        const section = document.createElement("section");
        section.classList.add("article", "article-card");
        section.setAttribute("data-tag", tag);

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

      if (latestArticle && featured) {
        featured.innerHTML = `
          <a href="article.html?id=${latestArticle.id}" class="featured-card">
            <img src="${latestArticle.image}" alt="${latestArticle.title}" class="featured-image">
            <div class="featured-info">
              <div class="featured-meta">${latestArticle.date} – ${latestArticle.tag}</div>
              <h2>${latestArticle.title}</h2>
            </div>
          </a>
        `;
      }

      // Filtres
      const formatLabel = tag => {
        if (tag.toLowerCase() === "make a gils") return "Make a Gil$";
        return tag.charAt(0).toUpperCase() + tag.slice(1);
      };

      const createButton = (label, isActive = false) => {
        const btn = document.createElement("button");
        btn.textContent = formatLabel(label);
        btn.dataset.filter = label.toLowerCase();
        btn.className = "filter-btn";
        if (isActive) btn.classList.add("active");
        filtersContainer.appendChild(btn);
      };

      createButton("Tous", true);
      [...uniqueTags].forEach(tag => createButton(tag));

      document.querySelectorAll(".article").forEach(article => {
        article.style.display = "block";
      });

      document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          document.querySelector(".filter-btn.active")?.classList.remove("active");
          btn.classList.add("active");

          const filter = btn.dataset.filter;
          document.querySelectorAll(".article").forEach(article => {
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

// Fonction utilitaire pour trier les dates FR ou ISO
function parseDate(dateStr) {
  const iso = Date.parse(dateStr);
  if (!isNaN(iso)) return new Date(iso);

  const moisFr = {
    janv: "01", févr: "02", mars: "03", avr: "04",
    mai: "05", juin: "06", juil: "07", août: "08",
    sept: "09", oct: "10", nov: "11", déc: "12"
  };

  const [jour, mois, année] = dateStr.split(" ");
  const mm = moisFr[mois.toLowerCase()] || "01";
  return new Date(`${année}-${mm}-${jour.padStart(2, "0")}`);
}
// === Derniers articles dans #latest-list (exclure l'article en vedette)
fetch("data/articles.json")
  .then(res => res.json())
  .then(articles => {
    const latestList = document.getElementById("latest-list");
    if (!latestList) return;

    const sorted = [...articles].sort((a, b) => parseDate(b.date) - parseDate(a.date));
    
    // Identifier l'article en vedette (même critère qu’au-dessus)
    const featured = sorted[0];

    // Exclure l’article vedette ici aussi
    const filtered = sorted.filter(a => a.id !== featured.id);

    filtered.slice(0, 4).forEach(article => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="article.html?id=${article.id}">${article.title}</a> <span style="font-size:0.85rem; color:#aaa;">(${article.date})</span>`;
      latestList.appendChild(li);
    });
  })
  .catch(err => console.error("❌ Erreur chargement derniers articles :", err));
