document.addEventListener("DOMContentLoaded", function() {
  const kofiContainer = document.getElementById("kofi-container");

  if (kofiContainer) {
    const script = document.createElement("script");
    script.src = "https://storage.ko-fi.com/cdn/widget/Widget_2.js";
    script.onload = () => {
      kofiwidget2.init('Soutenez SephyLeaks 💜', '#c573f5', 'Y8Y41E6NZ8');
      kofiwidget2.draw();
    };
    document.body.appendChild(script);
  }
});
