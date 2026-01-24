// Accordion functionality
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
      accordionDescription.style.maxHeight = accordionDescription.scrollHeight + "px";
      plusIcon.style.display = "none";
      minusIcon.style.display = "block";
    }
  });
});

// Carousel functionality
document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector(".carousel-track");
  const nextBtn = document.querySelector(".carousel-btn.next");
  const prevBtn = document.querySelector(".carousel-btn.prev");

  let carouselImages = [];
  let currentIndex = 0;
  let interval;

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
    }, 5000);
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
});

// Slides functionality
let currentSlide = 0;
const slides = document.querySelectorAll(".slide");
const totalSlides = slides.length;
const slidePrevBtn = document.getElementById("prevBtn");
const slideNextBtn = document.getElementById("nextBtn");
const indicatorsContainer = document.getElementById("indicators");

// Create indicators
for (let i = 0; i < totalSlides; i++) {
  const indicator = document.createElement("div");
  indicator.classList.add("indicator");
  if (i === 0) indicator.classList.add("active");
  indicator.addEventListener("click", () => goToSlide(i));
  indicatorsContainer.appendChild(indicator);
}

const indicators = document.querySelectorAll(".indicator");

function updateSlides() {
  slides.forEach((slide, index) => {
    slide.classList.remove("active", "prev");
    if (index === currentSlide) {
      slide.classList.add("active");
    } else if (index < currentSlide) {
      slide.classList.add("prev");
    }
  });

  indicators.forEach((indicator, index) => {
    indicator.classList.toggle("active", index === currentSlide);
  });
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % totalSlides;
  updateSlides();
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
  updateSlides();
}

function goToSlide(index) {
  currentSlide = index;
  updateSlides();
}

slidePrevBtn.addEventListener("click", prevSlide);
slideNextBtn.addEventListener("click", nextSlide);

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") prevSlide();
  if (e.key === "ArrowRight") nextSlide();
});

// Aurora wave background
const canvas = document.getElementById("floatingCanvas");
const ctx = canvas.getContext("2d");
const parent = canvas.parentElement;
let width = (canvas.width = parent.offsetWidth);
let height = (canvas.height = parent.offsetHeight);
let time = 0;

const colors = [
  'rgba(119, 141, 169, 1)',
  'rgba(224, 225, 221, 1)',
  'rgba(65, 90, 119, 1)',
  'rgba(119, 141, 169, 1)'
];

function animate() {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#415a77");
  gradient.addColorStop(1, "#0a0a0a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.strokeStyle = colors[i];
    ctx.lineWidth = 4;
    ctx.shadowBlur = 20;
    ctx.shadowColor = colors[i];
    
    for (let x = 0; x <= width; x += 2) {
      const y = height / 2 + 
              Math.sin((x * 0.006) + time + i * 1.2) * 120 +
              Math.sin((x * 0.012) + time * 0.7 + i * 0.8) * 80 +
              Math.sin((x * 0.02) + time * 1.5 + i * 0.5) * 40;
      
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  time += 0.015;
  requestAnimationFrame(animate);
}

animate();

window.addEventListener("resize", () => {
  width = canvas.width = parent.offsetWidth;
  height = canvas.height = parent.offsetHeight;
});

// Dynamic word animation
document.addEventListener("DOMContentLoaded", () => {
  const wordEl = document.querySelector(".dynamic-word");
  if (!wordEl) return;

  const words = ["Official", "Digital", "Secure", "Efficient", "Trusted"];
  let i = 0;

  setInterval(() => {
    wordEl.classList.add("fade-up");

    setTimeout(() => {
      i = (i + 1) % words.length;
      wordEl.textContent = words[i];
      wordEl.classList.remove("fade-up");
    }, 500);
  }, 3412);
});