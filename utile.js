window.App = window.App || {};

(function (App) {
  const formatValue = (value, suffix = "") => {
    if (!value || value === "unknown") return "NC";
    const num = Number(value);
    const base = Number.isFinite(num) ? num.toLocaleString("en-US") : String(value);
    return suffix ? `${base} ${suffix}` : base;
  };

  App.util = { formatValue };
})(window.App);
