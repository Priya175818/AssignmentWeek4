
const viewport = document.querySelector("#sliderViewport");
const track = document.querySelector("#slideTrack");
const previousButton = document.querySelector("#previousButton");
const nextButton = document.querySelector("#nextButton");
const indicators = document.querySelector("#slideIndicators");
const counter = document.querySelector("#slideCounter");

const originalSlides = [...track.children];
const totalSlides = originalSlides.length;

let currentPosition = 1;
let slideWidth = 0;
let isAnimating = false;

// Duplicate the boundary slides to create seamless looping.
const firstClone = originalSlides[0].cloneNode(true);
const lastClone = originalSlides[totalSlides - 1].cloneNode(true);

firstClone.setAttribute("aria-hidden", "true");
lastClone.setAttribute("aria-hidden", "true");

track.prepend(lastClone);
track.append(firstClone);

function createIndicators() {
  originalSlides.forEach((slide, index) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "indicator";
    button.setAttribute(
      "aria-label",
      `Show image ${index + 1}`
    );
    button.setAttribute("aria-current", "false");

    button.addEventListener("click", () => {
      moveTo(index + 1);
    });

    indicators.appendChild(button);
  });
}

function measureSlider() {
  slideWidth = viewport.getBoundingClientRect().width;

  [...track.children].forEach((slide) => {
    slide.style.width = `${slideWidth}px`;
    slide.style.flexBasis = `${slideWidth}px`;
  });

  // Reposition without animation after resizing.
  track.style.transition = "none";
  track.style.transform =
    `translateX(${-currentPosition * slideWidth}px)`;

  track.offsetHeight;
  track.style.transition = "";
}

function updateInterface() {
  const activeIndex =
    (currentPosition - 1 + totalSlides) % totalSlides;

  [...indicators.children].forEach((button, index) => {
    button.setAttribute(
      "aria-current",
      String(index === activeIndex)
    );
  });

  counter.textContent =
    `${String(activeIndex + 1).padStart(2, "0")} / ` +
    `${String(totalSlides).padStart(2, "0")}`;

  originalSlides.forEach((slide, index) => {
    slide.setAttribute(
      "aria-hidden",
      String(index !== activeIndex)
    );
  });
}

function moveTo(position) {
  if (isAnimating) return;

  currentPosition = position;
  isAnimating = true;

  track.style.transform =
    `translateX(${-currentPosition * slideWidth}px)`;

  updateInterface();
}

function showNext() {
  moveTo(currentPosition + 1);
}

function showPrevious() {
  moveTo(currentPosition - 1);
}

track.addEventListener("transitionend", (event) => {
  if (event.propertyName !== "transform") return;

  // The first clone follows the final original slide.
  if (currentPosition === totalSlides + 1) {
    currentPosition = 1;
    resetTrackPosition();
  }

  // The last clone comes before the first original slide.
  if (currentPosition === 0) {
    currentPosition = totalSlides;
    resetTrackPosition();
  }

  isAnimating = false;
  updateInterface();
});

function resetTrackPosition() {
  track.style.transition = "none";
  track.style.transform =
    `translateX(${-currentPosition * slideWidth}px)`;

  // Apply the position before restoring the animation.
  track.offsetHeight;
  track.style.transition = "";
}

previousButton.addEventListener("click", showPrevious);
nextButton.addEventListener("click", showNext);

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") showNext();
  if (event.key === "ArrowLeft") showPrevious();
});

createIndicators();
measureSlider();
updateInterface();

if ("ResizeObserver" in window) {
  const observer = new ResizeObserver(measureSlider);
  observer.observe(viewport);
} else {
  window.addEventListener("resize", measureSlider);
}
