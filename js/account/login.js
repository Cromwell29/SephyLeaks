document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const messageBox = document.getElementById("login-message");
  const errorDisplay = document.getElementById("login-error");

  const dummyAccount = {
    email: "admin@sephyleaks.com",
    password: "azerty123",
    role: "admin"
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    errorDisplay.textContent = "";

    const email = form.elements["email"].value.trim().toLowerCase();
    const password = form.elements["password"].value;

    if (!email || !password) {
      errorDisplay.textContent = "Veuillez remplir tous les champs.";
      return;
    }

    // Essayer de trouver dans les comptes enregistrés
    const accounts = JSON.parse(localStorage.getItem("sephyAccounts") || "[]");
    const user = accounts.find(acc => acc.email === email && acc.password === password);

    // Si trouvé dans les comptes enregistrés
    if (user) {
      localStorage.setItem("sephyUser", JSON.stringify({
        email: user.email,
        role: user.role || "auteur"
      }));

      messageBox.textContent = "✅ Connexion réussie ! Redirection...";
      messageBox.className = "login-success";
      setTimeout(() => {
        window.location.href = "/SephyLeaks/account/account.html";
      }, 1000);
      return;
    }

    // Sinon, vérifier si c’est le compte admin hardcodé
    if (email === dummyAccount.email && password === dummyAccount.password) {
      localStorage.setItem("sephyUser", JSON.stringify(dummyAccount));
      messageBox.textContent = "✅ Connexion administrateur !";
      messageBox.className = "login-success";
      setTimeout(() => {
        window.location.href = "/SephyLeaks/account/account.html";
      }, 1000);
      return;
    }

    // Sinon : échec
    errorDisplay.textContent = "❌ Identifiants incorrects.";
  });
});
