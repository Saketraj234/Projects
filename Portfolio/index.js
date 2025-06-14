// Check visibility when the element comes into view on scroll
// const fadeInElements = document.querySelectorAll('.fade-in-left, .fade-in-up, .profile-img, .btn-primary, .btn-secondary');

// const observer = new IntersectionObserver((entries) => {
//   entries.forEach(entry => {
//     if (entry.isIntersecting) {
//       entry.target.classList.add('visible');
//     }
//   });
// }, { threshold: 0.5 });

// fadeInElements.forEach(element => {
//   observer.observe(element);
// });

// Projects Section Animation
function animateOnScroll(sectionClass) {
  const section = document.querySelector(sectionClass);
  if (!section) return;
  const rect = section.getBoundingClientRect();
  if (rect.top < window.innerHeight - 100) {
    section.classList.add("show");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  animateOnScroll(".skills");
  animateOnScroll(".projects");
});

window.addEventListener("scroll", () => {
  animateOnScroll(".skills");
  animateOnScroll(".projects");
});

//  Skills Section Animation
function animateSkills() {
  const skills = document.querySelector(".skills");
  const rect = skills.getBoundingClientRect();
  if (rect.top < window.innerHeight - 100) {
    skills.classList.add("show");
  }
}

// Run on load and scroll both
window.addEventListener("DOMContentLoaded", animateSkills);
window.addEventListener("scroll", animateSkills);

// Achievements Section Animation
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.animationDelay = `${entry.target.dataset.delay}s`;
      entry.target.classList.add("animate");
    }
  });
});

document.querySelectorAll(".achievement-card").forEach((el, index) => {
  el.dataset.delay = index * 0.2;
  observer.observe(el);
});

// About Section Animation
function animateOnScroll(selector) {
  const element = document.querySelector(selector);
  if (!element) return;
  const rect = element.getBoundingClientRect();
  if (rect.top <= window.innerHeight - 100) {
    element.classList.add("show");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  animateOnScroll(".about");
});

window.addEventListener("scroll", () => {
  animateOnScroll(".about");
});

document.addEventListener("DOMContentLoaded", () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    },
    {
      threshold: 0.1,
    }
  );

  const animatedSections = document.querySelectorAll(".animate-on-scroll");
  animatedSections.forEach((section) => observer.observe(section));
});

