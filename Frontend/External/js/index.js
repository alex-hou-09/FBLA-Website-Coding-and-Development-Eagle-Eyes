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
      accordionDescription.style.maxHeight =
        accordionDescription.scrollHeight + "px";
      plusIcon.style.display = "none";
      minusIcon.style.display = "block";
    }
  });
});

// Carousel functionality
document.addEventListener("DOMContentLoaded", () => {
  const text = document.querySelector(".rotating-text");

  if (text) {
    text.addEventListener("mouseenter", () => {
      text.style.animationPlayState = "paused";
    });

    text.addEventListener("mouseleave", () => {
      text.style.animationPlayState = "running";
    });
  }

  const track = document.querySelector(".carousel-track");
  const nextBtn = document.querySelector(".carousel-btn.next");
  const prevBtn = document.querySelector(".carousel-btn.prev");

  if (!track || !nextBtn || !prevBtn) return;

  let carouselImages = [];
  let currentIndex = 0;
  let interval;

  fetch("/api/items/latest?limit=5")
    .then((res) => res.json())
    .then((data) => {
      if (!data.success || !data.items || data.items.length === 0) return;

      carouselImages = data.items;

      console.log("Carousel items received:", carouselImages);

      const fragment = document.createDocumentFragment();

      carouselImages.forEach((item, index) => {
        console.log("Item ID:", item.id, "Item name:", item.name); // DEBUG

        const img = document.createElement("img");
        img.src = item.image;
        img.alt = item.name;
        img.className = "carousel-img";
        img.loading = "eager";
        img.style.cursor = "pointer";
        img.addEventListener("click", () => {
          const clickedItem = carouselImages[currentIndex]; // Get the currently visible item
          console.log("Clicked item with ID:", clickedItem.id); // DEBUG
          localStorage.setItem("selectedItemId", String(clickedItem.id));
          localStorage.setItem("selectedItemName", clickedItem.name);
          window.location.href = "details.html";
        });
        fragment.appendChild(img);
      });

      track.appendChild(fragment);
      showImage(currentIndex);
      startAutoRotate();
    })
    .catch((err) => console.error("Failed to load carousel images:", err));

  function showImage(index) {
    const images = track.querySelectorAll(".carousel-img");
    images.forEach((img, i) => {
      if (i === index && img.style.opacity !== "1") {
        img.style.opacity = "1";
      } else if (i !== index && img.style.opacity !== "0") {
        img.style.opacity = "0";
      }
    });
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
    currentIndex =
      (currentIndex - 1 + carouselImages.length) % carouselImages.length;
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

if (indicatorsContainer && totalSlides > 0) {
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < totalSlides; i++) {
    const indicator = document.createElement("div");
    indicator.classList.add("indicator");
    if (i === 0) indicator.classList.add("active");
    indicator.addEventListener("click", () => goToSlide(i));
    fragment.appendChild(indicator);
  }

  indicatorsContainer.appendChild(fragment);
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

if (slidePrevBtn && slideNextBtn) {
  slidePrevBtn.addEventListener("click", prevSlide);
  slideNextBtn.addEventListener("click", nextSlide);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") prevSlide();
  if (e.key === "ArrowRight") nextSlide();
});

const canvas = document.getElementById("floatingCanvas");
if (canvas) {
  const ctx = canvas.getContext("2d", {alpha: false}); // Disable alpha for better performance
  const parent = canvas.parentElement;
  let width = (canvas.width = parent.offsetWidth);
  let height = (canvas.height = parent.offsetHeight);
  let time = 0;
  let animationId;

  const colors = [
    "rgba(119, 141, 169, 1)",
    "rgba(224, 225, 221, 1)",
    "rgba(65, 90, 119, 1)",
    "rgba(119, 141, 169, 1)",
  ];

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!animationId) animate();
        } else {
          if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
          }
        }
      });
    },
    {threshold: 0.1},
  );

  observer.observe(canvas);

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

      for (let x = 0; x <= width; x += 4) {
        const y =
          height / 2 +
          Math.sin(x * 0.006 + time + i * 1.2) * 120 +
          Math.sin(x * 0.012 + time * 0.7 + i * 0.8) * 80 +
          Math.sin(x * 0.02 + time * 1.5 + i * 0.5) * 40;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    time += 0.015;
    animationId = requestAnimationFrame(animate);
  }

  animate();

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      width = canvas.width = parent.offsetWidth;
      height = canvas.height = parent.offsetHeight;
    }, 150);
  });
}

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

const form = document.querySelector(".contact-form");

const feedback = document.createElement("div");
feedback.style.marginTop = "1rem";
feedback.style.fontWeight = "600";
form.appendChild(feedback);

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  const payload = {
    email: formData.get("email"),
    studentId: formData.get("studentId"),
    subject: formData.get("subject"),
    category: formData.get("category"),
    message: formData.get("message"),
  };

  const {email, studentId, subject, category, message} = payload;

  if (!email || !studentId || !subject || !category || !message) {
    feedback.textContent = "Please fill in all required fields.";
    feedback.style.color = "red";
    return;
  }

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.success) {
      feedback.textContent = result.message;
      feedback.style.color = "green";
      feedback.style.fontFamily = "Quicksand, sans-serif";
      feedback.style.fontWeight = "400";

      setTimeout(() => {
        form.reset();
        feedback.textContent = "";
      }, 3000);
    } else {
      feedback.textContent = result.error || "Failed to submit message.";
      feedback.style.color = "red";
    }
  } catch (err) {
    console.error(err);
    feedback.textContent = "An error occurred while submitting the message.";
    feedback.style.color = "red";
  }
});
