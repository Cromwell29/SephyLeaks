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

    const contentFormatted = (content || 'Contenu de l\'article...')
      .replace(/\n/g, '<br>')
      .replace(/  /g, '&nbsp;&nbsp;'); // 👈 Ici on gère les espaces multiples

    document.getElementById('preview-content').innerHTML = `
      <h1>${title || 'Titre de l\'article'}</h1>
      <div>
        <span class="tag-badge">${tag || 'TAG'}</span>
        <span class="date">${date || 'Date'}</span>
      </div>
      <div class="cover-image" style="background-image: url('${image || 'https://via.placeholder.com/800x200'}');"></div>
      ${contentFormatted}
    `;
  }

function wrapSelectionWith(before, after) {
  const textarea = document.getElementById("content");
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end);
  const beforeText = textarea.value.substring(0, start);
  const afterText = textarea.value.substring(end);

  textarea.value = beforeText + before + selected + after + afterText;

  // Remettre le curseur autour du texte sélectionné
  textarea.focus();
  textarea.selectionStart = start + before.length;
  textarea.selectionEnd = end + before.length;

  // Rafraîchir l’aperçu live
  textarea.dispatchEvent(new Event("input"));
}
document.getElementById("bold-btn").addEventListener("click", () => {
  wrapSelectionWith("<strong>", "</strong>");
});

document.getElementById("italic-btn").addEventListener("click", () => {
  wrapSelectionWith("<em>", "</em>");
});

document.getElementById("clear-formatting").addEventListener("click", () => {
  const textarea = document.getElementById("content");
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  if (start === end) return; // Rien de sélectionné

  let before = textarea.value.substring(0, start);
  let selected = textarea.value.substring(start, end);
  let after = textarea.value.substring(end);

  // 🔍 Supprimer les balises autour ET dans la sélection
  before = before.replace(/<strong>\s*$/, '');
  after = after.replace(/^\s*<\/strong>/, '');
  before = before.replace(/<em>\s*$/, '');
  after = after.replace(/^\s*<\/em>/, '');
  before = before.replace(/<span[^>]*?>\s*$/, '');
  after = after.replace(/^\s*<\/span>/, '');

  selected = selected
    .replace(/<\/?(strong|em)>/gi, '')
    .replace(/<span[^>]*?>/gi, '')
    .replace(/<\/span>/gi, '');

  // 🔁 Réinjection du texte propre
  textarea.value = before + selected + after;

  const newPos = before.length;
  textarea.focus();
  textarea.selectionStart = newPos;
  textarea.selectionEnd = newPos + selected.length;

  textarea.dispatchEvent(new Event("input"));
});
document.getElementById("insert-img-btn").addEventListener("click", () => {
  const url = document.getElementById("external-img-url").value;
  let width = document.getElementById("external-img-width").value.trim() || "100%";
  const align = document.getElementById("img-align").value;

  if (!width.endsWith("px") && !width.endsWith("%")) {
    width += "px";
  }

  if (!url) return;

  let alignClass = '';
  if (align === 'left') alignClass = 'align-left';
  if (align === 'center') alignClass = 'align-center';
  if (align === 'right') alignClass = 'align-right';

  const html = `<img src="${url}" alt="" style="width:${width};" class="${alignClass}">`;

  const textarea = document.getElementById("content");
  const cursor = textarea.selectionStart;
  const before = textarea.value.substring(0, cursor);
  const after = textarea.value.substring(cursor);
  textarea.value = before + html + after;

  textarea.dispatchEvent(new Event("input"));
  showToast("🖼️ Image insérée avec alignement !");
});
document.getElementById("external-img-url").addEventListener("input", () => {
  const url = document.getElementById("external-img-url").value;
  const preview = document.getElementById("img-preview");
  preview.innerHTML = url ? `<img src="${url}" alt="Aperçu image" />` : "";
});

document.getElementById("font-size-select").addEventListener("change", (e) => {
  const size = e.target.value;
  if (!size) return;

  const spanTag = `<span style="font-size:${size};">`;
  wrapSelectionWith(spanTag, "</span>");

  // Reset la sélection dans le menu
  e.target.selectedIndex = 0;
});
document.getElementById("insert-gallery-btn").addEventListener("click", () => {
  const url1 = document.getElementById("gallery-url-1").value.trim();
  const url2 = document.getElementById("gallery-url-2").value.trim();
  const url3 = document.getElementById("gallery-url-3").value.trim();
  const size = document.getElementById("carousel-size").value;

  if (!url1 || !url2) {
    alert("⚠️ Les deux premières images sont obligatoires !");
    return;
  }

  let html = `
<div class="carousel ${size}">
  <div class="carousel-track">
    <img src="${url1}" alt="">
    <img src="${url2}" alt="">
    ${url3 ? `<img src="${url3}" alt="">` : ""}
  </div>
</div>
<div class="carousel-buttons">
  <button onclick="prevSlide(this)">◀</button>
  <button onclick="nextSlide(this)">▶</button>
</div>
`;

  const textarea = document.getElementById("content");
  const cursor = textarea.selectionStart;
  const before = textarea.value.substring(0, cursor);
  const after = textarea.value.substring(cursor);
  textarea.value = before + html + after;

  textarea.dispatchEvent(new Event("input"));
  showToast("🎠 Carrousel inséré !");
});

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
function adjustLastImageSize(delta) {
  const preview = document.getElementById("preview-content");
  const images = preview.querySelectorAll("img.resizable-img");
  if (images.length === 0) return;

  const lastImage = images[images.length - 1];
  const currentWidth = parseInt(lastImage.style.width || "100");
  const newWidth = Math.max(10, currentWidth + delta); // Limite à 10px min
  lastImage.style.width = newWidth + "px";
  showToast(`📏 Taille ajustée : ${newWidth}px`);
}
  
document.getElementById("resize-up").addEventListener("click", () => adjustLastImageSize(10));
document.getElementById("resize-down").addEventListener("click", () => adjustLastImageSize(-10));  

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