/**
 * Personal Finance Tracker — Main Application Bootstrapper
 * Zero-build, vanilla JavaScript architecture
 */

document.addEventListener("DOMContentLoaded", () => {
  // Theme initialization
  const savedTheme = localStorage.getItem("pft_theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "light";
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("pft_theme", next);
      themeToggleBtn.textContent = next === "dark" ? "حالت روشن" : "حالت تاریک";
    });
    themeToggleBtn.textContent = savedTheme === "dark" ? "حالت روشن" : "حالت تاریک";
  }

  console.log("Personal Finance Tracker initialized successfully.");
});
