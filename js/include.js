function setupBurgerMenu() {
  const burgerBtn = document.getElementById("burger-btn");
  const navLinks = document.querySelector(".nav-links");

  if (burgerBtn && navLinks) {
    burgerBtn.addEventListener("click", () => {
      navLinks.classList.toggle("show");
    });

    document.querySelectorAll(".nav-links a").forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("show");
      });
    });
  }
}

function activateStickyEffect() {
  const headerBlock = document.querySelector('.sticky-header');
  if (!headerBlock) return;

  if (window.scrollY > 20) {
    headerBlock.classList.add('scrolled');
  }

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      headerBlock.classList.add('scrolled');
    } else {
      headerBlock.classList.remove('scrolled');
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const targets = document.querySelectorAll('[data-include]');

  targets.forEach(el => {
    const file = el.getAttribute("data-include");

    fetch(file)
      .then(res => {
        if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
        return res.text();
      })
      .then(html => {
        el.innerHTML = html;

        if (html.includes("main-nav")) {
          const nav = document.querySelector(".main-nav");
          if (nav) {
            nav.style.position = "sticky";
            nav.offsetHeight;
          }

          // Appelle les fonctions après inclusion
          activateStickyEffect();
          setupBurgerMenu();
        }
      })
      .catch(err => console.error("Erreur d'inclusion:", file, err));
  });
});
