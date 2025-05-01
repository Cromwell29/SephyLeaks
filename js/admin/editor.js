import { supabase } from '/SephyLeaks/js/supabaseClient.js';

document.addEventListener("DOMContentLoaded", async () => {
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session;

  if (!session) {
    document.body.innerHTML = "<p>❌ Accès refusé. Veuillez vous connecter.</p>";
    return;
  }

  const userId = session.user.id;
  document.getElementById("delete-proposal").disabled = true;

  const { data: userData, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

	const role = userData.role;
	if (error || !userData || !(role === "auteur" || role === "admin")) {
	  document.body.innerHTML = "<p>❌ Accès restreint aux auteurs et admins uniquement.</p>";
	  return;
	}
	const params = new URLSearchParams(window.location.search);
	const editId = params.get("id");
	let loadedFromDb = false;
	let isEditing = false;
 	const inputs = ['title', 'tag', 'date', 'image', 'resume', 'content'];


  // 🧠 Récupérer un brouillon si présent
  inputs.forEach(id => {
    const saved = localStorage.getItem(`draft_${id}`);
    if (saved !== null) document.getElementById(id).value = saved;
  });
  
function populateFields(data, readOnly = false) {
  document.getElementById("title").value = data.titre || "";
  document.getElementById("tag").value = data.tag || "";
  document.getElementById("date").value = data.date || "";
  document.getElementById("image").value = data.image || "";
  document.getElementById("resume").value = data.resume || "";
  document.getElementById("content").value = data.contenu || "";
  
  updatePreview();

  if (readOnly) {
    ['title', 'tag', 'date', 'image', 'resume', 'content'].forEach(id => {
      document.getElementById(id).setAttribute("disabled", "true");
    });
    document.getElementById("publish-article").disabled = true;
    document.getElementById("export-json").disabled = true;
    document.getElementById("clear-preview").disabled = true;
    showToast("👁️ Article affiché en lecture seule");
  }
}
try {
  if (editId) {
    const { data: proposition, error: propErr } = await supabase
      .from("propositions")
      .select("*")
      .eq("id", editId)
      .single();

if (proposition && !propErr) {
  populateFields(proposition, false);
  loadedFromDb = true;
  isEditing = true;

  const publishBtn = document.getElementById("publish-article");
  publishBtn.textContent = "💾 Mettre à jour";
  document.getElementById("edit-info")?.classList.remove("hidden");
  showToast("✏️ Brouillon chargé depuis Supabase");
  
 if (proposition.author_id !== userId) {
  populateFields(proposition, true); // lecture seule
  showToast("⛔ Ce brouillon ne vous appartient pas");
  return;
}
if (proposition && proposition.author_id === userId) {
  document.getElementById("delete-proposal").disabled = false;
  document.getElementById("delete-proposal").classList.remove("hidden");
}
}

	else {
      const { data: article, error: artErr } = await supabase
        .from("articles")
        .select("*")
        .eq("id", editId)
        .single();

      if (article && !artErr) {
        populateFields(article, true);
        loadedFromDb = true;
        showToast("👁️ Article publié affiché");
      }
    }
  }
} catch (err) {
  console.error("❌ Erreur lors du chargement de l'article :", err);
  showToast("❌ Impossible de charger l’article");
}

if (!loadedFromDb) {
  inputs.forEach(id => {
    const saved = localStorage.getItem(`draft_${id}`);
    if (saved !== null) document.getElementById(id).value = saved;
  });

  updatePreview();
  showToast("📝 Brouillon local chargé");
}


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
	const resume = document.getElementById('resume').value || '';
    const content = document.getElementById('content').value;
	const bannerImage = image ? `<div class="banner-image"><img src="${image}" alt="Bannière de l'article" /></div>` : "";

    const contentFormatted = (content || 'Contenu de l\'article...')
      .replace(/\n/g, '<br>')
      .replace(/  /g, '&nbsp;&nbsp;'); // 👈 Ici on gère les espaces multiples
let notice = "";
if (content.includes("carousel")) {
  notice = `<div class="preview-info"><span class="icon">ℹ️</span> Les boutons du carrousel sont désactivés dans l’aperçu. Consultez la version article pour tester.</div>`;
}
document.getElementById('preview-content').innerHTML = `
  ${notice}
  ${bannerImage}
  <h1>${title || 'Titre de l\'article'}</h1>
      <div>
	  <div class="article-resume">${resume}</div>
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
// 🎨 Application d'une couleur prédéfinie
document.querySelectorAll(".color-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const color = btn.dataset.color;
    wrapSelectionWith(`<span style="color:${color};">`, "</span>");
  });
});
// 🎯 Format rapide
document.querySelectorAll(".format-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const before = btn.dataset.before;
    const after = btn.dataset.after;

    if (before && after) {
      wrapSelectionWith(before, after);
    } else if (btn.id === "insert-hr") {
      const textarea = document.getElementById("content");
      const pos = textarea.selectionStart;
      const beforeText = textarea.value.substring(0, pos);
      const afterText = textarea.value.substring(pos);
      textarea.value = beforeText + "<hr>\n" + afterText;
      textarea.dispatchEvent(new Event("input"));
    }
  });
});

document.getElementById("clear-preview").addEventListener("click", () => {
  const textarea = document.getElementById("content");
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  if (start === end) return; // Rien de sélectionné

  let before = textarea.value.substring(0, start);
  let selected = textarea.value.substring(start, end);
  let after = textarea.value.substring(end);

// Nettoyage des balises ouvertes juste avant ou juste après la sélection
before = before
  .replace(/<strong>\s*$/, '')
  .replace(/<em>\s*$/, '')
  .replace(/<span[^>]*?>\s*$/, '')
  .replace(/style\s*=\s*".*?"\s*$/, '')
  .replace(/class\s*=\s*".*?"\s*$/, '')
  .replace(/<span[^>]*?>\s*$/, '');
  
after = after
  .replace(/^\s*<\/strong>/, '')
  .replace(/^\s*<\/em>/, '')
  .replace(/^\s*<\/span>/, '')
  .replace(/^\s*style\s*=\s*".*?"/, '')
  .replace(/^\s*class\s*=\s*".*?"/, '')
  .replace(/^\s*<\/span>/, '');
  
  selected = selected
  .replace(/<\/?(strong|em)>/gi, '')                         // Supprime <strong>, <em>
  .replace(/<span[^>]*?>/gi, '')                             // Supprime les <span ...>
  .replace(/<\/span>/gi, '')                                 // Supprime </span>
  .replace(/style\s*=\s*"(.*?)"/gi, '')                      // Supprime tout attribut style
  .replace(/class\s*=\s*"(.*?)"/gi, '')                     // Supprime les class éventuelles
   .replace(/<span[^>]*?font-family[^>]*?>/gi, '')
  .replace(/<span[^>]*?font-size[^>]*?>/gi, '')
  .replace(/<\/span>/gi, '')
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
document.getElementById("font-family-select").addEventListener("change", (e) => {
  const font = e.target.value;
  if (!font) return;

  const spanTag = `<span style="font-family:${font};">`;
  wrapSelectionWith(spanTag, "</span>");

  e.target.selectedIndex = 0;
});


// 🎨 Appliquer la couleur personnalisée
document.getElementById("apply-custom-color").addEventListener("click", () => {
  const colorInput = document.getElementById("custom-color").value;
  const hexInput = document.getElementById("custom-color-hex").value.trim();
  const color = hexInput || colorInput;
  if (/^#[0-9a-fA-F]{6}$/.test(color)) {
    wrapSelectionWith(`<span style="color:${color};">`, "</span>");
  } else {
    showToast("⚠️ Couleur hex invalide");
  }
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
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.remove('toast-hidden');
  toast.classList.add('toast-visible');

  setTimeout(() => {
    toast.classList.remove('toast-visible');
    toast.classList.add('toast-hidden');
  }, 2500); // disparaît après 2.5 sec
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
document.getElementById("clear-preview").addEventListener("click", () => {
  const confirmMsg = isEditing
    ? "❗ Vous êtes en train de modifier un brouillon. Effacer et revenir à zéro ?"
    : "🧼 Réinitialiser tous les champs de l’aperçu ?";

  showCustomConfirm(confirmMsg, () => {
    // Réinitialiser les champs
    inputs.forEach(id => {
      document.getElementById(id).value = "";
      localStorage.removeItem(`draft_${id}`);
    });

    updatePreview();

    // 🔁 Revenir en mode "nouvel article"
    isEditing = false;
    history.replaceState(null, "", "/SephyLeaks/editor.html");
    document.getElementById("publish-article").textContent = "📤 Publier l’article";
    document.getElementById("edit-info")?.classList.add("hidden");

    // ⛔ Masquer le bouton supprimer
    const delBtn = document.getElementById("delete-proposal");
    delBtn.classList.add("hidden");
    delBtn.disabled = true;
	editId = null;

    showToast("Prévisualisation réinitialisée.");
  });
});
document.getElementById("delete-proposal").addEventListener("click", () => {
  showCustomConfirm("❌ Supprimer ce brouillon ? Cette action est définitive.", async () => {
    const { error } = await supabase
      .from("propositions")
      .delete()
      .eq("id", editId)
      .eq("author_id", userId); // sécurité double

    if (error) {
      showToast("❌ Erreur lors de la suppression.");
    } else {
      showToast("🗑 Brouillon supprimé.");
      window.location.href = "/SephyLeaks/editor.html"; // ou rediriger où tu veux
    }
  });
});


document.getElementById("image").addEventListener("input", () => {
  const url = document.getElementById("image").value;
  const preview = document.getElementById("banner-preview");
  preview.innerHTML = url ? `<img src="${url}" alt="Bannière" />` : "";
});


  // 📤 Exporter JSON dans une boîte stylisée
  document.getElementById("export-json").addEventListener("click", () => {
  const article = {
    id: crypto.randomUUID(),
    title: document.getElementById("title").value,
    tag: document.getElementById("tag").value,
    date: document.getElementById("date").value,
    image: document.getElementById("image").value,
    resume: document.getElementById("resume").value,
    content: document.getElementById("content").value,
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
function showCustomConfirm(message, onConfirm) {
  const modal = document.getElementById("custom-confirm");
  document.getElementById("confirm-message").textContent = message;

  modal.classList.remove("hidden");

  const yes = document.getElementById("confirm-yes");
  const no = document.getElementById("confirm-no");

  const cleanup = () => {
    modal.classList.add("hidden");
    yes.removeEventListener("click", onYes);
    no.removeEventListener("click", onNo);
  };

  const onYes = () => {
    cleanup();
    onConfirm();
  };
  const onNo = cleanup;

  yes.addEventListener("click", onYes);
  no.addEventListener("click", onNo);
}

document.getElementById("publish-article").addEventListener("click", () => {
  const confirmMsg = isEditing
    ? "💾 Mettre à jour cette proposition ?"
    : "📤 Publier ce nouvel article ?";

  showCustomConfirm(confirmMsg, async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;
    if (!session) return;

    const userId = session.user.id;

    const article = {
      titre: document.getElementById('title').value,
      tag: document.getElementById('tag').value,
      date: document.getElementById('date').value,
      image: document.getElementById('image').value,
      resume: document.getElementById("resume").value,
      contenu: document.getElementById('content').value,
      author_id: userId,
      status: "en attente"
    };

    if (isEditing && editId) {
      const { error } = await supabase
        .from("propositions")
        .update(article)
        .eq("id", editId);

      if (error) {
        showToast("❌ Erreur lors de la mise à jour : " + error.message);
      } else {
        showToast("✅ Proposition mise à jour !");
        inputs.forEach(id => localStorage.removeItem(`draft_${id}`));
      }
    } else {
      const { error } = await supabase.from("propositions").insert(article);
      if (error) {
        showToast("❌ Erreur lors de l'envoi : " + error.message);
      } else {
        showToast("✅ Article envoyé à l'équipe !");
        inputs.forEach(id => localStorage.removeItem(`draft_${id}`));
      }
    }
  });
});
});