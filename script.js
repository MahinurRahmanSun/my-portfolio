const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.getElementById("site-nav");
const navLinks = Array.from(document.querySelectorAll('#site-nav a[href^="#"]'));

function setMenu(open) {
  siteNav.classList.toggle("open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
}

menuToggle.addEventListener("click", () => setMenu(!siteNav.classList.contains("open")));
navLinks.forEach((link) => link.addEventListener("click", () => setMenu(false)));

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
      });
    });
  },
  { rootMargin: "-40% 0px -55% 0px" }
);
navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean)
  .forEach((section) => sectionObserver.observe(section));

const progress = document.getElementById("progress");
function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
}
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

const typed = document.getElementById("typed");
const words = ["CSE student", "frontend developer", "builder who ships"];
let wordIndex = 0;
let charIndex = 0;
let deleting = false;

function type() {
  const word = words[wordIndex];
  charIndex += deleting ? -1 : 1;
  typed.textContent = word.slice(0, charIndex);

  let delay = deleting ? 45 : 85;
  if (!deleting && charIndex === word.length) {
    deleting = true;
    delay = 1500;
  } else if (deleting && charIndex === 0) {
    deleting = false;
    wordIndex = (wordIndex + 1) % words.length;
    delay = 400;
  }
  setTimeout(type, delay);
}

if (reduceMotion) {
  typed.textContent = words[0];
} else {
  type();

  const hero = document.getElementById("hero");
  hero.addEventListener("mousemove", (event) => {
    const rect = hero.getBoundingClientRect();
    hero.style.setProperty("--mx", event.clientX - rect.left + "px");
    hero.style.setProperty("--my", event.clientY - rect.top + "px");
  });
}

document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("mousemove", (event) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--cx", event.clientX - rect.left + "px");
    card.style.setProperty("--cy", event.clientY - rect.top + "px");
  });
});