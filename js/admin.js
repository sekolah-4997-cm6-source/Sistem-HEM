// js/admin.js

document.addEventListener("DOMContentLoaded", () => {
  initCharts();
});

function initCharts() {
  // 1. Donut Chart: Enrolmen Murid Tahap 1 & Tahap 2
  const ctxEnrolmen = document.getElementById("enrolmenChart");
  if (ctxEnrolmen) {
    new Chart(ctxEnrolmen, {
      type: "doughnut",
      data: {
        labels: ["Tahap 1 (410)", "Tahap 2 (440)"],
        datasets: [{
          data: [410, 440],
          backgroundColor: ["#3b82f6", "#0284c7"],
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom"
          }
        }
      }
    });
  }

  // 2. Bar Chart: Trend Kehadiran Bulanan
  const ctxKehadiran = document.getElementById("kehadiranChart");
  if (ctxKehadiran) {
    new Chart(ctxKehadiran, {
      type: "bar",
      data: {
        labels: ["Ogos", "Sept"],
        datasets: [{
          label: "Peratus Kehadiran (%)",
          data: [95.2, 96.2],
          backgroundColor: ["#3b82f6", "#10b981"],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            min: 60,
            max: 100
          }
        }
      }
    });
  }
}
