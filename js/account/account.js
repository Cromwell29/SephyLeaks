document.addEventListener("DOMContentLoaded", () => {
  const userData = JSON.parse(localStorage.getItem("sephyUser"));
  const info = document.getElementById("account-info");
  const logoutBtn = document.getElementById("logout-btn");

  if (!userData) {
    info.innerHTML = "<p>❌ Aucun utilisateur connecté.</p>";
    logoutBtn.style.display = "none";
    return;
  }

  info.innerHTML = `
    <p><strong>Email :</strong> ${userData.email}</p>
    <p><strong>Rôle :</strong> ${userData.role}</p>
    ${userData.role === "admin" ? `
      <a href="../admin.html" class="admin-link">🛠️ Accéder au panneau admin</a>
    ` : `
      <p>Vous êtes connecté en tant qu’auteur.</p>
    `}
  `;
const popup = document.getElementById("welcome-popup");
const popupUser = document.getElementById("popup-user");

if (popup && popupUser) {
  popupUser.textContent = userData.email;
  popup.classList.remove("popup-hidden");
  popup.classList.add("popup-show");

  setTimeout(() => {
    popup.classList.remove("popup-show");
  }, 4000);
}


  // Déconnexion
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("sephyUser");
    window.location.href = "../account/login.html";
  });
});
