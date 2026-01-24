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


let currentSlide = 0;
const slides = document.querySelectorAll(".slide");
const totalSlides = slides.length;
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
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

prevBtn.addEventListener("click", prevSlide);
nextBtn.addEventListener("click", nextSlide);

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") prevSlide();
  if (e.key === "ArrowRight") nextSlide();
});

//STICKS BACKGROUND

const canvas = document.getElementById('floatingCanvas');
const ctx = canvas.getContext('2d');

// Get the parent container's size
const parent = canvas.parentElement;
let width = canvas.width = parent.offsetWidth;
let height = canvas.height = parent.offsetHeight;

// Bezier curve string class
class BezierString {
    constructor(cluster) {
        this.cluster = cluster;
        this.generate();
    }

    generate() {
        const clusterX = this.cluster.x + (Math.random() - 0.5) * this.cluster.spread;
        const clusterY = this.cluster.y + (Math.random() - 0.5) * this.cluster.spread;
        
        // Start point
        this.x1 = clusterX;
        this.y1 = clusterY;
        
        // Control points for curve
        const angle = Math.random() * Math.PI * 2;
        const length = Math.random() * 300 + 150;
        
        this.cp1x = clusterX + Math.cos(angle) * length * 0.3;
        this.cp1y = clusterY + Math.sin(angle) * length * 0.3;
        
        this.cp2x = clusterX + Math.cos(angle) * length * 0.7;
        this.cp2y = clusterY + Math.sin(angle) * length * 0.7;
        
        // End point
        this.x2 = clusterX + Math.cos(angle) * length;
        this.y2 = clusterY + Math.sin(angle) * length;
        
        this.opacity = Math.random() * 0.5 + 0.2;
        this.width = Math.random() * 2 + 0.8;
        
        // Color variations from the color scheme
        const colors = ['#1b263b', '#415a77', '#778da9', '#e0e1dd'];
        const baseColor = colors[Math.floor(Math.random() * colors.length)];
        this.color = baseColor + Math.floor(this.opacity * 255).toString(16).padStart(2, '0');
        
        // Blur effect for glow
        this.blur = Math.random() * 4 + 2;
    }

    draw() {
        ctx.save();
        ctx.shadowBlur = this.blur;
        ctx.shadowColor = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.width;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        ctx.bezierCurveTo(
            this.cp1x, this.cp1y,
            this.cp2x, this.cp2y,
            this.x2, this.y2
        );
        ctx.stroke();
        ctx.restore();
    }
}

// Create clusters with different densities
const clusters = [
    { x: width * 0.25, y: height * 0.55, spread: 350, hue: 270, count: 18 },
    { x: width * 0.7, y: height * 0.35, spread: 280, hue: 280, count: 14 },
    { x: width * 0.5, y: height * 0.25, spread: 220, hue: 260, count: 12 },
    { x: width * 0.15, y: height * 0.75, spread: 180, hue: 290, count: 10 },
    { x: width * 0.8, y: height * 0.7, spread: 200, hue: 250, count: 10 },
    { x: width * 0.6, y: height * 0.6, spread: 150, hue: 275, count: 8 }
];

const strings = [];
clusters.forEach(cluster => {
    for (let i = 0; i < cluster.count; i++) {
        strings.push(new BezierString(cluster));
    }
});

// Draw once
function draw() {
    // Create gradient on canvas to match body
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#0a0a0a');
    gradient.addColorStop(1, '#778da9');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    strings.forEach(string => {
        string.draw();
    });
}

draw();

window.addEventListener('resize', () => {
    const parent = canvas.parentElement;
    width = canvas.width = parent.offsetWidth;
    height = canvas.height = parent.offsetHeight;
    
    // Update cluster positions proportionally
    clusters[0].x = width * 0.25;
    clusters[0].y = height * 0.55;
    clusters[1].x = width * 0.7;
    clusters[1].y = height * 0.35;
    clusters[2].x = width * 0.5;
    clusters[2].y = height * 0.25;
    clusters[3].x = width * 0.15;
    clusters[3].y = height * 0.75;
    clusters[4].x = width * 0.8;
    clusters[4].y = height * 0.7;
    clusters[5].x = width * 0.6;
    clusters[5].y = height * 0.6;
    
    // Regenerate all strings
    strings.length = 0;
    clusters.forEach(cluster => {
        for (let i = 0; i < cluster.count; i++) {
            strings.push(new BezierString(cluster));
        }
    });
    
    draw();
});