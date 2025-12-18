window.App = window.App || {};

(function (App) {
  const ready = App.dom?.domReady || ((fn) => document.addEventListener("DOMContentLoaded", fn));
  const formatValue = App.util?.formatValue || ((value, suffix = "") => (suffix ? `${value} ${suffix}` : value));
  const planetsEndpoint = App.api?.config?.planets?.url || "https://swapi.py4e.com/api/planets/";
  const populationFilters = {
    all: { label: "Par population", test: () => true },
    low: { label: "0 à 100.000", test: (value) => value < 100000 },
    mid: { label: "100.000 à 100.000.000", test: (value) => value >= 100000 && value <= 100000000 },
    high: { label: "+100.000.000", test: (value) => value > 100000000 },
  };

  let planetsCache = [];

  const getPlanetUI = () => ({
    body: document.getElementById("planet-body"),
    status: document.getElementById("planet-status"),
    count: document.getElementById("planet-count"),
    filters: {
      population: document.getElementById("population-filter"),
      search: document.getElementById("planet-search"),
    },
    detail: {
      root: document.getElementById("planet-detail"),
      name: document.getElementById("detail-name"),
      population: document.getElementById("detail-population"),
      diameter: document.getElementById("detail-diameter"),
      gravity: document.getElementById("detail-gravity"),
      climate: document.getElementById("detail-climate"),
      terrain: document.getElementById("detail-terrain"),
    },
  });

  function parsePopulation(population) {
    const value = Number(population);
    return Number.isFinite(value) ? value : null;
  }

  function filterByPopulation(planets, rangeKey) {
    if (!Array.isArray(planets) || !planets.length) return [];
    const range = populationFilters[rangeKey];
    if (!range || rangeKey === "all") return planets;
    return planets.filter((planet) => {
      const value = parsePopulation(planet.population);
      if (value === null) return false;
      return range.test(value);
    });
  }

  function filterBySearch(planets, term) {
    const query = term?.trim().toLowerCase();
    if (!query) return planets;
    return planets.filter((planet) => {
      const name = planet.name?.toLowerCase() || "";
      const terrain = planet.terrain?.toLowerCase() || "";
      const climate = planet.climate?.toLowerCase() || "";
      return name.includes(query) || terrain.includes(query) || climate.includes(query);
    });
  }

  function renderDetail(planet, ui) {
    const d = ui.detail;
    if (!d.root) return;
    if (!planet) {
      d.name.textContent = "Sélectionnez une planète";
      d.population.textContent = d.diameter.textContent = d.gravity.textContent = d.climate.textContent = d.terrain.textContent = "-";
      return;
    }
    d.name.textContent = planet.name || "Inconnue";
    d.population.textContent = formatValue(planet.population);
    d.diameter.textContent = formatValue(planet.diameter, "km");
    d.gravity.textContent = planet.gravity && planet.gravity !== "unknown" ? planet.gravity : "NC";
    d.climate.textContent = planet.climate && planet.climate !== "unknown" ? planet.climate : "NC";
    d.terrain.textContent = planet.terrain && planet.terrain !== "unknown" ? planet.terrain : "NC";
  }

  function markActiveRow(targetRow) {
    document.querySelectorAll(".planet-body .planet-row").forEach((row) => row.classList.toggle("is-active", row === targetRow));
  }

  function onPlanetRowClick(event, ui) {
    const row = event.currentTarget;
    const planet = planetsCache.find((pl) => pl.name === row.dataset.planetName);
    markActiveRow(row);
    renderDetail(planet, ui);
  }

  function renderPlanetRows(planets, ui) {
    const { body } = ui;
    if (!body) return;
    body.innerHTML = "";

    if (!planets.length) {
      const emptyRow = document.createElement("div");
      emptyRow.className = "planet-row planet-row--empty";
      emptyRow.innerHTML = `<span>Aucun résultat</span><span>-</span><span>-</span>`;
      body.appendChild(emptyRow);
      renderDetail(null, ui);
      return;
    }

    planets.forEach((planet, idx) => {
      const row = document.createElement("div");
      row.className = "planet-row";
      row.dataset.planetName = planet.name || "";
      row.addEventListener("click", (event) => onPlanetRowClick(event, ui));
      row.innerHTML = `
        <span>${planet.name || "Inconnu"}</span>
        <span>${planet.terrain || "NC"}</span>
        <span>${formatValue(planet.population)}</span>
      `;
      body.appendChild(row);
      if (idx === 0) {
        markActiveRow(row);
        renderDetail(planets[0], ui);
      }
    });
  }

  function updateCount(ui, total, filterKey, searchTerm) {
    if (!ui.count) return;
    const parts = [`${total} resultat(s)`];
    const label = filterKey && filterKey !== "all" ? populationFilters[filterKey]?.label : null;
    const searchLabel = searchTerm?.trim();
    if (label) parts.push(label);
    if (searchLabel) parts.push(`Recherche: "${searchLabel}"`);
    ui.count.textContent = parts.join(" • ");
  }

  async function fetchAllPlanets(url = planetsEndpoint) {
    const results = [];
    let next = url;
    while (next) {
      const res = await fetch(next);
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      results.push(...data.results);
      console.log(`Fetched ${results.length} planets...`);
      next = data.next;
    }
    return results;
  }

  async function loadAllPlanets() {
    const ui = getPlanetUI();
    const { status, body, count } = ui;
    if (!status || !body || !count) return;

    status.textContent = "Chargement des planetes...";
    status.classList.remove("error");
    body.innerHTML = "";
    count.textContent = "";

    try {
      const planets = await fetchAllPlanets();
      planetsCache = planets;
      status.textContent = "";
      applyFilters(ui);
      if (!planets.length) renderDetail(null, ui);
    } catch (err) {
      status.textContent = "Erreur lors du chargement des planetes.";
      status.classList.add("error");
      console.error("SWAPI planets error:", err);
    }
  }

  function applyFilters(ui) {
    const { status, filters } = ui;
    const filterKey = filters.population?.value || "all";
    const searchTerm = filters.search?.value || "";

    let filtered = filterByPopulation(planetsCache, filterKey);
    filtered = filterBySearch(filtered, searchTerm);
    renderPlanetRows(filtered, ui);
    updateCount(ui, filtered.length, filterKey, searchTerm);

    if (!status) return;
    if (filterKey !== "all" || searchTerm.trim()) {
      const parts = [];
      if (filterKey !== "all") parts.push(populationFilters[filterKey]?.label);
      if (searchTerm.trim()) parts.push(`Recherche: "${searchTerm.trim()}"`);
      status.textContent = filtered.length ? `Filtré (${parts.join(" • ")})` : "Aucun résultat pour ce filtre";
      status.classList.remove("error");
    } else {
      status.textContent = "";
      status.classList.remove("error");
    }
  }

  function bindFilters(ui) {
    const { population, search } = ui.filters;
    if (population) population.addEventListener("change", () => applyFilters(ui));
    if (search) search.addEventListener("input", () => applyFilters(ui));
  }

  function initPlanetPage() {
    const ui = getPlanetUI();
    if (!ui.body && !ui.status && !ui.count) return;
    bindFilters(ui);
    loadAllPlanets();
  }

  App.planets = { fetchAllPlanets, loadAllPlanets, filterByPopulation, filterBySearch };
  ready(initPlanetPage);
})(window.App);
