const accordionBtns = document.querySelectorAll(".accordion-btn");

accordionBtns.forEach((btn) => {
  btn.addEventListener("click", function () {
    this.classList.toggle("active");
    const accordionDescription = this.nextElementSibling;
    const plusIcon = this.querySelector(".plus-icon");
    const minusIcon = this.querySelector(".minus-icon");

    if (accordionDescription.style.maxHeight) {
      accordionDescription.style.maxHeight = null;
      plusIcon.style.display = "block";
      minusIcon.style.display = "none";
    } else {
      accordionDescription.style.maxHeight =
        accordionDescription.scrollHeight + "px";
      plusIcon.style.display = "none";
      minusIcon.style.display = "block";
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector(".carousel-track");
  const nextBtn = document.querySelector(".carousel-btn.next");
  const prevBtn = document.querySelector(".carousel-btn.prev");

  let carouselImages = [];
  let currentIndex = 0;
  let interval;

  // Fetch the 5 newest found items
  fetch("/api/items/latest?limit=5")
    .then((res) => res.json())
    .then((data) => {
      if (!data.success || !data.items || data.items.length === 0) return;

      carouselImages = data.items;

      carouselImages.forEach((item) => {
        const img = document.createElement("img");
        img.src = item.image;
        img.alt = item.name;
        img.className = "carousel-img";
        track.appendChild(img);
      });

      showImage(currentIndex);
      startAutoRotate();
    })
    .catch((err) => console.error("Failed to load carousel images:", err));

  function showImage(index) {
    const images = track.querySelectorAll(".carousel-img");
    images.forEach((img) => (img.style.opacity = "0"));
    if (images[index]) images[index].style.opacity = "1";
  }

  function startAutoRotate() {
    interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % carouselImages.length;
      showImage(currentIndex);
    }, 4000);
  }

  function resetAutoRotate() {
    clearInterval(interval);
    startAutoRotate();
  }

  nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % carouselImages.length;
    showImage(currentIndex);
    resetAutoRotate();
  });

  prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + carouselImages.length) % carouselImages.length;
    showImage(currentIndex);
    resetAutoRotate();
  });

  window.addEventListener("resize", () => showImage(currentIndex));
});
