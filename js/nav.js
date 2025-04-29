import { supabase } from '/SephyLeaks/js/supabaseClient.js';

document.addEventListener("DOMContentLoaded", async () => {
  const navLinks = document.querySelector(".nav-links");
  const contribBtn = document.getElementById("contribuer-btn");

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session;
  const userId = session?.user?.id;

  let user = null;

  if (userId) {
    // Récupérer les infos de l’utilisateur pour avoir le rôle si nécessaire
    const { data, error } = await supabase
      .from("users")
      .select("email,pseudo,role")
      .eq("id", userId)
      .single();

    if (!error && data) {
      user = data;
    }
  }

  // Gérer bouton Contribuer (index uniquement)
  if (contribBtn) {
    if (user) {
      contribBtn.setAttribute("href", "/SephyLeaks/account/account.html#contribution");
    } else {
      contribBtn.setAttribute("href", "/SephyLeaks/account/register.html");
    }
  }

  // Gérer Connexion / Mon compte / Déconnexion (toutes pages)
  if (!navLinks) return;

  const existing = navLinks.querySelector('li[data-auth]');
  if (existing) existing.remove();

  const li = document.createElement("li");
  li.setAttribute("data-auth", "true");

  if (user) {
    li.innerHTML = `<a href="/SephyLeaks/account/account.html">👤 Mon compte</a>`;
    navLinks.appendChild(li);

    const logoutLi = document.createElement("li");
    logoutLi.innerHTML = `<a href="#" id="logout-link">Déconnexion</a>`;
    navLinks.appendChild(logoutLi);

    logoutLi.addEventListener("click", async (e) => {
      e.preventDefault();
      await supabase.auth.signOut();
      window.location.href = "/SephyLeaks/index.html";
    });
  } else {
    li.innerHTML = `<a href="/SephyLeaks/account/login.html">Connexion</a>`;
    navLinks.appendChild(li);
  }
});
