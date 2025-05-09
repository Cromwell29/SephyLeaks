import { supabase } from '/SephyLeaks/js/supabaseClient.js';

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const articleId = params.get("id");
    const isPreview = params.get("preview") === "true";

    const content = document.getElementById("article-content");
    const container = document.getElementById("article-container");

    if (!articleId || !content || !container) {
      content.innerHTML = "<p>❌ Aucun identifiant d’article ou conteneur manquant.</p>";
      return;
    }

    let article;

    if (isPreview) {
      // 🔐 Check session et rôle
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      if (!session) {
        content.innerHTML = "<p>⛔ Prévisualisation réservée aux administrateurs.</p>";
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (!userData || userData.role !== "admin") {
        content.innerHTML = "<p>⛔ Prévisualisation réservée aux administrateurs.</p>";
        return;
      }

      const { data: draft, error: draftErr } = await supabase
        .from("propositions")
        .select("*")
        .eq("id", articleId)
        .single();

      if (draftErr || !draft) {
        content.innerHTML = "<p>❌ Brouillon introuvable.</p>";
        return;
      }

      article = draft;

      const previewNotice = document.createElement("div");
      previewNotice.className = "preview-banner";
      previewNotice.innerHTML = "⚠️ <strong>Aperçu d’un article en attente</strong> – visible uniquement par un administrateur";
      container.prepend(previewNotice);
    } else {
      const { data: finalArticle, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", articleId)
        .single();

      if (error || !finalArticle) {
        content.innerHTML = "<p>❌ Article introuvable.</p>";
        return;
      }

      article = finalArticle;
    }

    // 🎯 Remplir le contenu de l’article
    const bannerUrl = article.banner || article.image;
    if (bannerUrl) {
      document.getElementById("cover-image").style.backgroundImage = `url(${bannerUrl})`;
    }

    document.getElementById("tag").textContent = article.tag || "Sans tag";
    document.getElementById("date").textContent = article.date || "";
    document.getElementById("title").textContent = article.titre || "Sans titre";
    content.innerHTML = article.contenu || "<p>(Pas de contenu)</p>";

    if (article.author_id) {
      const { data: author, error: authorError } = await supabase
        .from("users")
        .select("id, pseudo, bio, avatar_url")
        .eq("id", article.author_id)
        .single();

      if (!authorError && author) {
        const authorBlock = document.createElement("div");
        authorBlock.className = "article-author";
        authorBlock.innerHTML = `
          <a href="profile.html?id=${author.id}" class="author-link">
            <img src="${author.avatar_url || 'assets/avatar-placeholder.png'}" alt="${author.pseudo}" class="author-avatar">
          </a>
          <div class="author-info">
            <h3><a href="profile.html?id=${author.id}" class="author-link">${author.pseudo}</a></h3>
            <p>${author.bio || "Cet auteur n'a pas encore de bio."}</p>
          </div>
        `;
        container.appendChild(authorBlock);
      }
    }
  } catch (err) {
    document.getElementById("article-content").innerHTML = "<p>❌ Erreur de chargement de l’article ou de l’auteur.</p>";
    console.error(err);
  }
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
try {
  const { data: recentArticles, error: recentError } = await supabase
    .from("articles")
    .select("id, titre, image, date")
    .order("date", { ascending: false })
    .limit(3);

  if (recentError) {
    console.error("❌ Erreur Supabase – articles récents :", recentError);
  } else {
    const recentContainer = document.getElementById("recent-articles-list");
    if (recentContainer) {
      recentArticles.forEach(article => {
        const li = document.createElement("li");
        li.className = "recent-article-item";

        li.innerHTML = `
          <a href="article.html?id=${article.id}" class="recent-article-link" title="${article.titre}">
            <img src="${article.image || 'assets/img-placeholder.webp'}" alt="${article.titre}">
            <span class="recent-article-title">${article.titre}</span>
          </a>
        `;

        recentContainer.appendChild(li);
      });
    }
  }
} catch (err) {
  console.error("❌ Erreur lors du chargement des articles récents :", err);
}
