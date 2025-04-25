document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("register-form");
  const errorBox = document.getElementById("register-error");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    errorBox.textContent = "";

    const email = form.elements["email"].value.trim().toLowerCase();
    const password = form.elements["password"].value;
    const confirm = form.elements["confirm-password"].value;

    if (!email || !password || !confirm) {
      errorBox.textContent = "Veuillez remplir tous les champs.";
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      errorBox.textContent = "Adresse e-mail invalide.";
      return;
    }

    if (password.length < 6) {
      errorBox.textContent = "Le mot de passe doit contenir au moins 6 caractères.";
      return;
    }

    if (password !== confirm) {
      errorBox.textContent = "Les mots de passe ne correspondent pas.";
      return;
    }

    // Récupérer les comptes existants (array)
    const accounts = JSON.parse(localStorage.getItem("sephyAccounts") || "[]");

    if (accounts.some(acc => acc.email === email)) {
      errorBox.textContent = "Un compte existe déjà avec cette adresse.";
      return;
    }

    // Créer un nouvel utilisateur avec rôle "auteur"
    const newAccount = { email, password, role: "auteur" };
    accounts.push(newAccount);
    localStorage.setItem("sephyAccounts", JSON.stringify(accounts));

    // Connexion immédiate (optionnel mais pratique)
    localStorage.setItem("sephyUser", JSON.stringify({ email, role: "auteur" }));

    // Redirection vers la page compte
    window.location.href = "/SephyLeaks/account/account.html";
  });
});
