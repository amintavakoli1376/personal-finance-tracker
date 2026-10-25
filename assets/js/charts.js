/**
 * Chart Manager for Category Breakdown (Chart.js Wrapper)
 */

let categoryChartInstance = null;

// Notion-styled muted category color palette
const CHART_COLORS = [
  "#e16b5a", // Terracotta Red
  "#e89a3c", // Muted Amber
  "#d4b138", // Ochre Yellow
  "#4dab9a", // Sage Green
  "#2383e2", // Notion Blue
  "#9065b0", // Plum Purple
  "#c15c8a", // Dusky Rose
  "#787774", // Warm Gray
  "#4472c4", // Steel Blue
  "#548235"  // Olive Green
];

/**
 * Renders or updates the category expense donut chart
 * @param {Array<{ label: string, amount: number, color?: string }>} data 
 */
function renderCategoryChart(data = []) {
  const canvas = document.getElementById("category-chart");
  const emptyMsg = document.getElementById("chart-empty-msg");
  if (!canvas) return;

  const validItems = data.filter(item => Number(item.amount) > 0);

  if (validItems.length === 0) {
    if (categoryChartInstance) {
      categoryChartInstance.destroy();
      categoryChartInstance = null;
    }
    canvas.style.display = "none";
    if (emptyMsg) emptyMsg.style.display = "block";
    return;
  }

  canvas.style.display = "block";
  if (emptyMsg) emptyMsg.style.display = "none";

  const labels = validItems.map(i => i.label);
  const amounts = validItems.map(i => i.amount);
  const colors = validItems.map((item, idx) => item.color || CHART_COLORS[idx % CHART_COLORS.length]);

  if (categoryChartInstance) {
    categoryChartInstance.data.labels = labels;
    categoryChartInstance.data.datasets[0].data = amounts;
    categoryChartInstance.data.datasets[0].backgroundColor = colors;
    categoryChartInstance.update();
    return;
  }

  if (typeof Chart === "undefined") {
    console.warn("Chart.js is not loaded yet.");
    return;
  }

  const ctx = canvas.getContext("2d");
  categoryChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: amounts,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: document.documentElement.getAttribute("data-theme") === "dark" ? "#202020" : "#ffffff",
          hoverOffset: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "68%",
      animation: {
        duration: 400
      },
      plugins: {
        legend: {
          position: "bottom",
          rtl: true,
          labels: {
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true,
            pointStyle: "circle",
            font: {
              family: "Vazirmatn, sans-serif",
              size: 11
            },
            color: document.documentElement.getAttribute("data-theme") === "dark" ? "rgba(255,255,255,0.7)" : "#787774"
          }
        },
        tooltip: {
          rtl: true,
          titleFont: { family: "Vazirmatn", size: 12 },
          bodyFont: { family: "Vazirmatn", size: 12 },
          callbacks: {
            label: function(context) {
              const val = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const pct = total > 0 ? Math.round((val / total) * 100) : 0;
              const formatted = window.DateUtils ? window.DateUtils.formatCurrency(val) : val;
              const pctFa = window.DateUtils ? window.DateUtils.toPersianDigits(pct) : pct;
              return ` ${context.label}: ${formatted} (${pctFa}٪)`;
            }
          }
        }
      }
    }
  });
}

// Watch theme changes to update chart border color
if (typeof MutationObserver !== "undefined") {
  const observer = new MutationObserver(() => {
    if (categoryChartInstance) {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      categoryChartInstance.data.datasets[0].borderColor = isDark ? "#202020" : "#ffffff";
      if (categoryChartInstance.options.plugins?.legend?.labels) {
        categoryChartInstance.options.plugins.legend.labels.color = isDark ? "rgba(255,255,255,0.7)" : "#787774";
      }
      categoryChartInstance.update();
    }
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
}

window.ChartManager = {
  renderCategoryChart,
  CHART_COLORS
};
