window.App = window.App || {};

(function (App) {
  const domReady = App.dom?.domReady;
  const qsa = App.dom?.qsa;
  if (!domReady || !qsa) return;

  domReady(() => {
    const triggers = qsa("[data-target]");
    const sections = qsa("[data-section]");
    if (!triggers.length || !sections.length) return;

    const setActive = (targetId) => {
      triggers.forEach((el) => el.classList.toggle("active", el.dataset.target === targetId));
    };

    const scrollToTarget = (targetId) => {
      const targetSection = document.getElementById(targetId);
      if (!targetSection) return;
      const offsetTop = targetSection.getBoundingClientRect().top + window.scrollY - 10;
      window.scrollTo({ top: offsetTop, behavior: "smooth" });
    };

    triggers.forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        event.preventDefault();
        const targetId = trigger.dataset.target;
        setActive(targetId);
        scrollToTarget(targetId);
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { threshold: 0.4 }
    );

    sections.forEach((section) => observer.observe(section));
  });
})(window.App);
