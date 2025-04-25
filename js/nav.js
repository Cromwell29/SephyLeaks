document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelector(".nav-links");
  const contribBtn = document.getElementById("contribuer-btn");

  const user = JSON.parse(localStorage.getItem("sephyUser"));

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

    logoutLi.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("sephyUser");
      window.location.href = "/SephyLeaks/index.html";
    });
  } else {
    li.innerHTML = `<a href="/SephyLeaks/account/login.html">Connexion</a>`;
    navLinks.appendChild(li);
  }
});

