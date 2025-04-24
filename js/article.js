document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const articleId = params.get("id");

  if (!articleId) {
    document.getElementById("article-content").innerHTML = "<p>❌ Aucun identifiant d’article fourni.</p>";
    return;
  }

  let article = null;

  fetch("data/articles.json")
    .then(res => res.json())
    .then(articles => {
      article = articles.find(a => a.id === articleId);

      if (!article) {
        document.getElementById("article-content").innerHTML = "<p>❌ Article introuvable.</p>";
        return;
      }

      const bannerUrl = article.banner || article.image;
      if (bannerUrl) {
        document.getElementById("cover-image").style.backgroundImage = `url(${bannerUrl})`;
      }

      document.getElementById("tag").textContent = article.tag;
      document.getElementById("date").textContent = article.date;
      document.getElementById("title").textContent = article.title;
      document.getElementById("article-content").innerHTML = article.content;

      return fetch("data/authors.json");
    })
    .then(res => res.json())
    .then(authors => {
      if (!article) return;

      const authorData = authors.find(a => a.id === article.author);
      if (!authorData) return;

      const authorBlock = document.createElement("div");
      authorBlock.className = "article-author";
      authorBlock.innerHTML = `
        <img src="${authorData.avatar}" alt="${authorData.name}" class="author-avatar">
        <div class="author-info">
          <h3>${authorData.name}</h3>
          <p>${authorData.bio}</p>
          ${authorData.website ? `<a href="${authorData.website}" target="_blank">🌐 Voir le profil</a>` : ""}
        </div>
      `;

      document.getElementById("article-container").appendChild(authorBlock);
    })
    .catch(err => {
      document.getElementById("article-content").innerHTML = "<p>❌ Erreur de chargement de l’article ou de l’auteur.</p>";
      console.error(err);
    });
window.nextSlide = function(button) {
  const container = button.closest(".carousel-buttons").previousElementSibling;
  if (!container || !container.classList.contains("carousel")) return;

  const track = container.querySelector(".carousel-track");
  track.appendChild(track.firstElementChild);
};

window.prevSlide = function(button) {
  const container = button.closest(".carousel-buttons").previousElementSibling;
  if (!container || !container.classList.contains("carousel")) return;

  const track = container.querySelector(".carousel-track");
  track.insertBefore(track.lastElementChild, track.firstElementChild);
};
function parseDate(dateStr) {
  // Essaye le format ISO
  const iso = Date.parse(dateStr);
  if (!isNaN(iso)) return new Date(iso);

  // Sinon, tente le format "7 avr. 2025"
  const moisFr = {
    janv: "01", févr: "02", mars: "03", avr: "04",
    mai: "05", juin: "06", juil: "07", août: "08",
    sept: "09", oct: "10", nov: "11", déc: "12"
  };

  const [jour, mois, année] = dateStr.split(" ");
  const mm = moisFr[mois.toLowerCase()] || "01";
  return new Date(`${année}-${mm}-${jour.padStart(2, "0")}`);
}


  // === Articles récents dans la sidebar ===
fetch("data/articles.json")
  .then(res => res.json())
  .then(articles => {
    const recentContainer = document.getElementById("recent-articles-list");
    if (!recentContainer) return;

    articles
      .sort((a, b) => parseDate(b.date) - parseDate(a.date))
      .slice(0, 3)
      .forEach(article => {
        const li = document.createElement("li");
        li.className = "recent-article-item";

        li.innerHTML = `
          <a href="article.html?id=${article.id}" class="recent-article-link" title="${article.title}">
            <img src="${article.image}" alt="${article.title}">
            <span class="recent-article-title">${article.title}</span>
          </a>
        `;

        recentContainer.appendChild(li);
      });
  })
  .catch(err => console.error("❌ Erreur lors du chargement des articles récents :", err));
});
