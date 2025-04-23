document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const messageBox = document.getElementById("login-message");

  // Simuler un compte existant
  const dummyAccount = {
    email: "admin@sephyleaks.com",
    password: "azerty123"
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = form.elements["email"].value.trim();
    const password = form.elements["password"].value;
	const errorDisplay = document.getElementById("login-error");
	errorDisplay.textContent = ""; // Réinitialiser

	if (!email || !password) {
	  errorDisplay.textContent = "Veuillez remplir tous les champs.";
	  return;
	}

	if (!email.includes("@") || !email.includes(".")) {
	  errorDisplay.textContent = "Adresse e-mail invalide.";
	  return;
	}

	if (email !== "admin@sephyleaks.com" || password !== "azerty123") {
	  errorDisplay.textContent = "Identifiants incorrects.";
	  return;
	}

// Si tout est bon :
localStorage.setItem("user", JSON.stringify({ email }));
window.location.href = "../account/account.html";

    if (email === dummyAccount.email && password === dummyAccount.password) {
      // Connexion réussie
      messageBox.textContent = "✅ Connexion réussie ! Redirection...";
      messageBox.className = "login-success";

      // Simuler un token utilisateur en localStorage
      localStorage.setItem("sephyUser", JSON.stringify({
        email,
        role: "admin"
      }));

      setTimeout(() => {
        window.location.href = "account.html";
      }, 1000);
    } else {
      // Échec de connexion
      messageBox.textContent = "❌ Identifiants incorrects.";
      messageBox.className = "login-error";
    }
  });
});
