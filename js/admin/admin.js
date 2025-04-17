document.addEventListener("DOMContentLoaded", () => {
  const inputs = ['title', 'tag', 'date', 'image', 'content'];

  // 🧠 Récupérer un brouillon si présent
  inputs.forEach(id => {
    const saved = localStorage.getItem(`draft_${id}`);
    if (saved !== null) document.getElementById(id).value = saved;
  });

  updatePreview();
  showToast("📝 Brouillon chargé");

  inputs.forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
      updatePreview();
      localStorage.setItem(`draft_${id}`, document.getElementById(id).value);
    });
  });

  function updatePreview() {
    const title = document.getElementById('title').value;
    const tag = document.getElementById('tag').value;
    const date = document.getElementById('date').value;
    const image = document.getElementById('image').value;
    const content = document.getElementById('content').value;

    document.getElementById('preview-content').innerHTML = `
      <h1>${title || 'Titre de l\'article'}</h1>
      <div>
        <span class="tag-badge">${tag || 'TAG'}</span>
        <span class="date">${date || 'Date'}</span>
      </div>
      <div class="cover-image" style="background-image: url('${image || 'https://via.placeholder.com/800x200'}');"></div>
      ${content || '<p>Contenu de l\'article...</p>'}
    `;
  }

  document.getElementById("insert-ffxiv-link").addEventListener("click", () => {
    const name = prompt("Nom de l'objet ou compétence :");
    const url = prompt("URL complète Lodestone (ex: https://fr.finalfantasyxiv.com/item/12345)");

    if (!name || !url) return;

    const link = `<a href="${url}" class="eorzeadb_link">${name}</a>`;
    const textarea = document.getElementById("content");
    const cursorPos = textarea.selectionStart;
    const textBefore = textarea.value.substring(0, cursorPos);
    const textAfter = textarea.value.substring(cursorPos);
    textarea.value = textBefore + link + textAfter;

    document.getElementById("content").dispatchEvent(new Event("input"));
    localStorage.setItem("lastLodestoneName", name);
    localStorage.setItem("lastLodestoneURL", url);
    showToast("✨ Lien Lodestone inséré !");
  });

  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast-confirm";
    toast.innerHTML = `<span class="icon">✨</span> ${message}`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("show");
    }, 50);

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 2200);
  }

  // 🧼 Effacer l'aperçu et les champs
  document.getElementById("clear-preview").addEventListener("click", () => {
    inputs.forEach(id => {
      document.getElementById(id).value = "";
      localStorage.removeItem(`draft_${id}`);
    });
    updatePreview();
    showToast("Prévisualisation réinitialisée.");
  });

  // 📤 Exporter JSON dans une boîte stylisée
  document.getElementById("export-json").addEventListener("click", () => {
    const article = {
      id: crypto.randomUUID(),
      title: document.getElementById('title').value,
      tag: document.getElementById('tag').value,
      date: document.getElementById('date').value,
      image: document.getElementById('image').value,
      resume: "À remplir…",
      content: document.getElementById('content').value,
      author: "sephy"
    };

    const modal = document.createElement("div");
    modal.className = "json-modal";
    modal.innerHTML = `
      <div class="json-box">
        <h3>🧾 JSON exporté</h3>
        <textarea readonly id="json-output">${JSON.stringify(article, null, 2)}</textarea>
        <button id="copy-json">📋 Copier</button>
        <button id="close-json">✖ Fermer</button>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById("copy-json").addEventListener("click", () => {
      const textarea = document.getElementById("json-output");
      textarea.select();
      document.execCommand("copy");
      showToast("📋 JSON copié dans le presse-papier");
    });

    document.getElementById("close-json").addEventListener("click", () => {
      modal.remove();
    });
  });
// 🖼 Insertion d'une icône depuis la banque
    document.querySelectorAll(".icon-thumb").forEach(icon => {
      icon.addEventListener("click", () => {
        const html = icon.dataset.insert;
        const textarea = document.getElementById("content");
        const cursorPos = textarea.selectionStart;
        const before = textarea.value.substring(0, cursorPos);
        const after = textarea.value.substring(cursorPos);
        textarea.value = before + html + after;

    // Mise à jour de l'aperçu
        textarea.dispatchEvent(new Event("input"));
        showToast("🧩 Icône insérée !");
      });
    });

  // 📌 Publier dans localStorage
  document.getElementById("publish-article").addEventListener("click", () => {
    const article = {
      id: crypto.randomUUID(),
      title: document.getElementById('title').value,
      tag: document.getElementById('tag').value,
      date: document.getElementById('date').value,
      image: document.getElementById('image').value,
      resume: "À compléter automatiquement plus tard",
      content: document.getElementById('content').value,
      author: "sephy"
    };

    const current = JSON.parse(localStorage.getItem("articles") || "[]");
    current.push(article);
    localStorage.setItem("articles", JSON.stringify(current));
    showToast("✅ Article publié (stocké localement)");
  });
});