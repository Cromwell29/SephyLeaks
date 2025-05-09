import { supabase } from '/SephyLeaks/js/supabaseClient.js';

document.addEventListener("DOMContentLoaded", async () => {
  const logoutBtn = document.getElementById("logout-btn");
  const popup = document.getElementById("welcome-popup");
  const popupUser = document.getElementById("popup-user");
  const editBtn = document.getElementById("edit-profile-btn");
  const editSection = document.getElementById("edit-form-section");
  const profileForm = document.getElementById("profile-form");
  const bioField = document.getElementById("edit-bio");
  const displayBio = document.getElementById("user-bio");
  const msg = document.getElementById("profile-msg");
  const adminActions = document.getElementById("admin-actions");
  const articleCountField = document.getElementById("article-count");
  const commentCountField = document.getElementById("comment-count");


  // 🔐 Vérifier la session active
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session;

  if (!session) {
    document.body.innerHTML = "<p>❌ Aucun utilisateur connecté.</p>";
    return;
  }

  const userId = session.user.id;

  // 🔎 Charger les infos utilisateur
  const { data: users, error: userError } = await supabase
    .from("users")
    .select("email,pseudo,role,bio,avatar_url,created_at")
    .eq("id", userId)
    .single();

  if (userError || !users) {
    document.body.innerHTML = "<p>❌ Impossible de récupérer les infos utilisateur.</p>";
    return;
  }

  const { email, pseudo, role, bio, avatar_url, created_at } = users;

// 🗓️ Afficher la date d'inscription formatée en français
const inscriptionField = document.getElementById("join-date");
if (created_at && inscriptionField) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const dateFr = new Date(created_at).toLocaleDateString('fr-FR', options);
  inscriptionField.textContent = `Inscription : ${dateFr}`;
}


// 🧮 Compter les articles publiés
const { count: articleCount } = await supabase
  .from("articles")
  .select("*", { count: "exact", head: true })
  .eq("author_id", userId);

if (articleCountField) {
  articleCountField.textContent = `Articles publiés : ${articleCount}`;
}

// 🧮 Compter les commentaires
const { count: commentCount } = await supabase
  .from("commentaires")
  .select("*", { count: "exact", head: true })
  .eq("auteur_id", userId);

if (commentCountField) {
  commentCountField.textContent = `Commentaires : ${commentCount}`;
}

  // ✅ Remplir les champs
  document.getElementById("user-pseudo").textContent = pseudo;
  document.getElementById("user-email").textContent = email;
  document.getElementById("user-role").textContent = role;
  displayBio.textContent = bio || "Aucune bio pour le moment.";
  bioField.value = bio || "";

if (adminActions) {
  let html = "";

  if (role === "admin") {
    html += `<a href="/SephyLeaks/admin/admin.html" class="format-btn">🛠️ Panneau admin</a>`;
  }

  if (["admin", "auteur"].includes(role)) {
    html += `<a href="/SephyLeaks/editor.html" class="format-btn">🖋️ Nouvel article</a>`;
  }

  adminActions.innerHTML = html;
}

  
document.querySelectorAll('.tab-link').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-link').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));

    const key = btn.dataset.tab;
    const targetTab = document.getElementById(`tab-${key}`);
    if (targetTab) targetTab.classList.remove('hidden');
  });
});
const avatar = document.getElementById("account-avatar");
avatar.src = users.avatar_url || "/SephyLeaks/assets/default-avatar.webp";


// et dans le formulaire :
document.getElementById("edit-avatar").value = users.avatar_url || "";

// 👉 Afficher le premier onglet (Profil) par défaut
document.getElementById("tab-profile").classList.remove("hidden");


const editOverlay = document.getElementById("edit-overlay");
const closeEdit = document.getElementById("close-edit");

// Quand on clique sur “Modifier mon profil”
editBtn.addEventListener("click", () => {
  editOverlay.classList.remove("hidden");
});

// Quand on clique sur ✖
closeEdit.addEventListener("click", () => {
  editOverlay.classList.add("hidden");
});


  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
	const newBio = bioField.value.trim();
	const newAvatarUrl = document.getElementById("edit-avatar").value.trim();

	const { error: updateError } = await supabase
	  .from("users")
	  .update({ 
		bio: newBio,
		avatar_url: newAvatarUrl
	  })
	  .eq("id", userId);

    if (updateError) {
      msg.textContent = "❌ Échec de la mise à jour.";
      msg.style.color = "crimson";
    } else {
      displayBio.textContent = newBio || "Aucune bio pour le moment.";
      msg.textContent = "✅ Bio mise à jour avec succès !";
      msg.style.color = "#7fffd4";
    }
  });
// 📄 Charger les propositions personnelles
const propList = document.getElementById("proposition-list");
if (propList) {
  const { data: propositions, error: propError } = await supabase
    .from("propositions")
    .select("id,titre,resume,date,image,status")
    .eq("author_id", userId)
    .order("date", { ascending: false });

  if (propError || !propositions || propositions.length === 0) {
    propList.innerHTML = "<p>Aucune proposition pour le moment.</p>";
  } else {
    propList.innerHTML = ""; // Clear
	propositions.forEach((prop) => {
	  const statusBadge = (() => {
		switch (prop.status) {
		  case "validee": return `<span class="badge badge-green">Validée</span>`;
		  case "refusee": return `<span class="badge badge-red">Refusée</span>`;
		  default: return `<span class="badge badge-yellow">En attente</span>`;
		}
  })();	
      const card = document.createElement("div");
      card.className = "proposition-card";
	card.innerHTML = `
	  ${statusBadge}
	  <img src="${prop.image || '/SephyLeaks/assets/placeholder.webp'}" alt="Image de l’article" style="width:100%; height:140px; object-fit:cover; border-radius:6px; margin-bottom:0.5rem;">
	  <h4>${prop.titre || "Sans titre"}</h4>
	  <p>${prop.resume || "Pas de résumé."}</p>
	  <small>📅 ${prop.date || "Date inconnue"}</small>
	  <button onclick="window.location.href='/SephyLeaks/editor.html?id=${prop.id}'">✏️ Modifier</button>
	`;

      propList.appendChild(card);
    });
  }
}
// 📚 Charger les articles publiés
const pubList = document.getElementById("published-articles-list");

if (pubList) {
  const { data: published, error: pubError } = await supabase
    .from("articles")
    .select("id, titre, date, image")
    .eq("author_id", userId)
    .order("date", { ascending: false });

  if (pubError || !published || published.length === 0) {
    pubList.innerHTML = "<p>Aucun article publié pour le moment.</p>";
  } else {
    pubList.innerHTML = ""; // Clear
	published.forEach((article) => {
	  const card = document.createElement("div");
	  card.className = "proposition-card"; // même style visuel

	  card.innerHTML = `
		<img src="${article.image || '/SephyLeaks/assets/placeholder.webp'}" alt="Image de l’article"
		  style="width:100%; height:140px; object-fit:cover; border-radius:6px; margin-bottom:0.5rem;">
		<h4>${article.titre || "Sans titre"}</h4>
		<small>📅 ${article.date || "Date inconnue"}</small>
		<div style="margin-top: 0.5rem;">
		  <button onclick="window.location.href='/SephyLeaks/article.html?id=${article.id}'">🔍 Lire</button>
		  ${role === "admin" 
			? `<button onclick="window.location.href='/SephyLeaks/editor.html?id=${article.id}'">✏️ Éditer</button>` 
			: ""}
		</div>
	  `;

	  pubList.appendChild(card);
	});
  }
}
const commentList = document.getElementById("comment-list");
if (commentList) {
  const { data: comments, error: commentError } = await supabase
    .from("commentaires")
    .select("id, contenu, article_id, articles(titre)")
    .eq("auteur_id", userId)
    .order("created_at", { ascending: false });

  if (commentError || !comments || comments.length === 0) {
    commentList.innerHTML = "<p>Aucun commentaire pour le moment.</p>";
  } else {
    commentList.innerHTML = ""; // Clear
    comments.forEach((c) => {
      const item = document.createElement("div");
      item.className = "comment-item";
      const preview = c.contenu.length > 100 ? c.contenu.slice(0, 100) + "..." : c.contenu;
      item.innerHTML = `
        <div class="comment-block">
          <h4>${c.articles?.titre || "Article inconnu"}</h4>
          <p>${preview}</p>
          <button onclick="window.location.href='/SephyLeaks/article.html?id=${c.article_id}#comment-${c.id}'">🔍 Voir</button>
        </div>
      `;
      commentList.appendChild(item);
    });
  }
}


  // 🎉 Popup de bienvenue
  if (popup && popupUser) {
    popupUser.textContent = pseudo;
    popup.classList.remove("popup-hidden");
    popup.classList.add("popup-show");

    setTimeout(() => {
      popup.classList.remove("popup-show");
    }, 4000);
  }

  // 🔓 Déconnexion
  logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "/SephyLeaks/index.html";
  });
});
