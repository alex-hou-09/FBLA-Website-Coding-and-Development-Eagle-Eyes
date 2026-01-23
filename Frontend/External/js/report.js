document.querySelectorAll(".report-card").forEach((card) => {
  card.addEventListener("click", () => {
    const targetPage = card.dataset.target;
    window.location.href = targetPage;
  });
});
