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

}

document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("mousemove", (event) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--cx", event.clientX - rect.left + "px");
    card.style.setProperty("--cy", event.clientY - rect.top + "px");
  });
});

document.querySelectorAll(".skill-group li").forEach((li, index) => li.style.setProperty("--i", index % 4));

const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (finePointer && !reduceMotion) {
  const spotlight = document.getElementById("spotlight");
  const orbs = document.querySelector(".orbs");
  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 3;
  let x = targetX;
  let y = targetY;

  window.addEventListener("mousemove", (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    spotlight.classList.add("on");
  }, { passive: true });

  document.addEventListener("mouseleave", () => spotlight.classList.remove("on"));

  function follow() {
    x += (targetX - x) * 0.12;
    y += (targetY - y) * 0.12;
    spotlight.style.transform = "translate3d(" + x + "px," + y + "px,0)";
    const px = (x / window.innerWidth - 0.5) * -30;
    const py = (y / window.innerHeight - 0.5) * -30;
    orbs.style.transform = "translate3d(" + px + "px," + py + "px,0)";
    requestAnimationFrame(follow);
  }
  follow();

  document.querySelectorAll(".card, .code-window").forEach((el) => {
    el.classList.add("tilt");
    el.addEventListener("mousemove", (event) => {
      const rect = el.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      el.style.setProperty("--ry", px * 8 + "deg");
      el.style.setProperty("--rx", py * -8 + "deg");
    });
    el.addEventListener("mouseleave", () => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    });
  });

  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("mousemove", (event) => {
      const rect = btn.getBoundingClientRect();
      btn.style.setProperty("--bx", (event.clientX - rect.left - rect.width / 2) * 0.2 + "px");
      btn.style.setProperty("--by", (event.clientY - rect.top - rect.height / 2) * 0.3 + "px");
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.setProperty("--bx", "0px");
      btn.style.setProperty("--by", "0px");
    });
  });
}