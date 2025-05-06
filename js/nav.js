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
