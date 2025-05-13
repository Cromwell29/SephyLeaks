import { supabase } from '/SephyLeaks/js/supabaseClient.js';

document.addEventListener("DOMContentLoaded", async () => {
  const navLinks = document.querySelector(".nav-links");
  const contribBtn = document.getElementById("contribuer-btn");

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session;
  const userId = session?.user?.id;

  let user = null;

  if (userId) {
    const { data, error } = await supabase
      .from("users")
      .select("email,pseudo,role")
      .eq("id", userId)
      .single();

    if (!error && data) {
      user = data;
    }
  }

  // 🎯 Bouton Contribuer
  if (contribBtn) {
    contribBtn.setAttribute(
      "href",
      user ? "/SephyLeaks/account/account.html#contribution" : "/SephyLeaks/account/register.html"
    );
  }

  // 🎯 Barre de navigation dynamique
  if (!navLinks) return;

  // Supprimer ancien lien dynamique
  navLinks.querySelectorAll('li[data-auth]').forEach(el => el.remove());

  // 👤 Lien "Mon compte"
  const accountLi = document.createElement("li");
  accountLi.setAttribute("data-auth", "true");

  if (user) {
    accountLi.innerHTML = `<a href="/SephyLeaks/account/account.html">👤 Mon compte</a>`;
    navLinks.appendChild(accountLi);

// 🔔 Cloche de notifications
const notifLi = document.createElement("li");
notifLi.setAttribute("data-auth", "true");

notifLi.innerHTML = `
  <div class="notif-wrapper" id="notif-wrapper">
    <button class="notif-icon" id="notif-button" title="Notifications">
      🔔<span id="notif-badge" class="notif-badge"></span>
    </button>
    <div class="notif-dropdown hidden" id="notif-dropdown">
      <p class="notif-empty">Chargement...</p>
    </div>
  </div>
`;

navLinks.appendChild(notifLi);

// 📬 Charger les notifications
const { data: notifs, error } = await supabase
  .from("notifications")
  .select("id, lu, message, type, created_at, proposition_id, propositions (titre, image)")
  .eq("recipient_id", userId)
  .order("created_at", { ascending: false })
  .limit(10);

const dropdown = notifLi.querySelector("#notif-dropdown");
dropdown.innerHTML = "";

if (error || !notifs || notifs.length === 0) {
  dropdown.innerHTML = `<p class="notif-empty">Aucune notification.</p>`;
} else {
  notifs.forEach((notif) => {
  const p = notif.propositions;

  const notifItem = document.createElement("div");
  notifItem.className = "notif-card";

  notifItem.innerHTML = `
    <div class="notif-card-img">
      <img src="${p?.image || '/SephyLeaks/img/default.jpg'}" alt="Image de couverture">
    </div>
    <div class="notif-card-body">
      <h4 class="notif-card-title">${p?.titre || "Proposition inconnue"}</h4>
      <p class="notif-card-message">${notif.message}</p>
      <div class="notif-card-date">${new Date(notif.created_at).toLocaleDateString()}</div>
    </div>
  `;
  dropdown.appendChild(notifItem);
});
}
// 🔴 Affichage du badge si non lues
const unreadCount = notifs.filter(n => !n.lu).length;
const badge = notifLi.querySelector("#notif-badge");
if (unreadCount > 0) {
  badge.textContent = unreadCount;
  badge.style.display = "inline-block";
} else {
  badge.style.display = "none";
}

// 🎯 Toggle menu au clic
const notifBtn = notifLi.querySelector("#notif-button");
notifBtn.addEventListener("click", async () => {
  dropdown.classList.toggle("hidden");

  // Si ouverture du menu ➜ marquer toutes comme lues
  if (!dropdown.classList.contains("hidden")) {
    const { error } = await supabase
      .from("notifications")
      .update({ lu: true })
      .eq("recipient_id", userId)
      .eq("lu", false);

    if (error) {
      console.error("Erreur marquage notifications :", error);
    } else {
      console.log("Notifications marquées comme lues");
      badge.style.display = "none"; // Retirer badge
    }
  }
});



// ❌ Fermer si clic ailleurs
document.addEventListener("click", (e) => {
  if (!notifLi.contains(e.target)) {
    dropdown.classList.add("hidden");
  }
});

    // 🛠️ Si admin ➔ lien vers panneau admin
    if (user.role === "admin") {
      const adminLi = document.createElement("li");
      adminLi.setAttribute("data-auth", "true");
      adminLi.innerHTML = `<a href="/SephyLeaks/admin/admin.html">🛠️ Admin</a>`;
      navLinks.appendChild(adminLi);
    }

    // 🔓 Déconnexion
    const logoutLi = document.createElement("li");
    logoutLi.setAttribute("data-auth", "true");
    logoutLi.innerHTML = `<a href="#" id="logout-link">Déconnexion</a>`;
    navLinks.appendChild(logoutLi);

    logoutLi.addEventListener("click", async (e) => {
      e.preventDefault();
      await supabase.auth.signOut();
      window.location.href = "/SephyLeaks/index.html";
    });
  } else {
    // Si pas connecté ➔ lien "Connexion"
    accountLi.innerHTML = `<a href="/SephyLeaks/account/login.html">Connexion</a>`;
    navLinks.appendChild(accountLi);
  }
});
