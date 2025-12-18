window.App = window.App || {};

(function (App) {
  const ready = App.dom?.domReady || ((fn) => document.addEventListener("DOMContentLoaded", fn));

  const API = {
    people: { url: "https://swapi.py4e.com/api/people/", list: "people-list", status: "people-status" },
    vehicles: { url: "https://swapi.py4e.com/api/vehicles/", list: "vehicles-list", status: "vehicles-status" },
    planets: { url: "https://swapi.py4e.com/api/planets/", list: "planets-list", status: "planets-status" },
  };

  const getConfig = (key) => API[key];

  async function loadResource(key, formatter) {
    const cfg = getConfig(key);
    if (!cfg) return;
    const statusEl = document.getElementById(cfg.status);
    const listEl = document.getElementById(cfg.list);
    if (!statusEl || !listEl) return;

    statusEl.textContent = "Chargement...";
    statusEl.classList.remove("error");
    listEl.innerHTML = "";

    try {
      const res = await fetch(cfg.url);
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      const items = Array.isArray(data.results) ? data.results.slice(0, 5) : [];
      if (!items.length) {
        statusEl.textContent = "Aucun resultat";
        return;
      }
      statusEl.textContent = "";
      items.forEach((item) => {
        const li = document.createElement("li");
        li.className = "data-item";
        li.innerHTML = formatter(item);
        listEl.appendChild(li);
      });
    } catch (err) {
      statusEl.textContent = "Erreur lors du chargement.";
      statusEl.classList.add("error");
      console.error(`SWAPI ${key} error:`, err);
    }
  }

  function loadSwapiData() {
    loadResource("people", (p) => `<p class="item-title">${p.name || "Inconnu"}</p><p class="item-meta">Naissance: ${p.birth_year || "NC"} - Genre: ${p.gender || "NC"}</p>`);
    loadResource("vehicles", (v) => `<p class="item-title">${v.name || "Inconnu"}</p><p class="item-meta">Modele: ${v.model || "NC"} - Fabricant: ${v.manufacturer || "NC"}</p>`);
    loadResource("planets", (pl) => `<p class="item-title">${pl.name || "Inconnu"}</p><p class="item-meta">Climat: ${pl.climate || "NC"} - Population: ${pl.population || "NC"}</p>`);
  }

  function initSwapiBlocks() {
    const refreshBtn = document.querySelector("[data-refresh]");
    if (refreshBtn) refreshBtn.addEventListener("click", loadSwapiData);
    loadSwapiData();
  }

  App.api = { config: API, loadResource, loadSwapiData };
  ready(initSwapiBlocks);
})(window.App);
