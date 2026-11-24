const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

document.querySelectorAll("[data-split]").forEach((line, lineIndex) => {
  const text = line.textContent;
  line.textContent = "";
  Array.from(text).forEach((char, index) => {
    const span = document.createElement("span");
    span.className = "ch";
    span.setAttribute("aria-hidden", "true");
    span.style.setProperty("--i", index + lineIndex * 7);
    span.textContent = char === " " ? "\u00a0" : char;
    line.append(span);
  });
});

function finishLoading() {
  root.classList.add("loaded");
}

const counter = document.getElementById("count");
if (reduceMotion) {
  finishLoading();
} else {
  const startTime = performance.now();
  const duration = 1200;
  const tick = (now) => {
    const progress = clamp((now - startTime) / duration, 0, 1);
    counter.textContent = Math.round(progress * 100);
    if (progress < 1) requestAnimationFrame(tick);
    else setTimeout(finishLoading, 200);
  };
  requestAnimationFrame(tick);
  setTimeout(finishLoading, 4000);
}

const themeButton = document.getElementById("theme");
themeButton.addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch (error) {
    console.error("Could not save theme", error);
  }
});

const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.getElementById("site-nav");
const navLinks = Array.from(siteNav.querySelectorAll("a"));
function setMenu(open) {
  siteNav.classList.toggle("open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
}
menuToggle.addEventListener("click", () => setMenu(!siteNav.classList.contains("open")));
navLinks.forEach((link) => link.addEventListener("click", () => setMenu(false)));

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id));
  });
}, { rootMargin: "-40% 0px -55% 0px" });
navLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean).forEach((section) => sectionObserver.observe(section));

const statement = document.getElementById("statement");
const words = statement.textContent.trim().split(/\s+/);
statement.textContent = "";
const wordEls = words.map((word) => {
  const span = document.createElement("span");
  span.className = "w";
  span.textContent = word;
  statement.append(span, " ");
  return span;
});

const progress = document.getElementById("progress");
function onScroll() {
  const max = root.scrollHeight - window.innerHeight;
  progress.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
  const start = window.innerHeight * 0.88;
  const end = window.innerHeight * 0.4;
  wordEls.forEach((el) => {
    const top = el.getBoundingClientRect().top;
    const amount = clamp((start - top) / (start - end), 0, 1);
    el.style.opacity = 0.18 + amount * 0.82;
  });
}
let scrollTicking = false;
window.addEventListener("scroll", () => {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    onScroll();
    scrollTicking = false;
  });
}, { passive: true });
window.addEventListener("resize", onScroll);
onScroll();

const timeEl = document.getElementById("time");
const formatter = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit", hour12: false });
function updateTime() {
  timeEl.textContent = formatter.format(new Date());
}
updateTime();
setInterval(updateTime, 15000);

const toast = document.getElementById("toast");
document.getElementById("copy").addEventListener("click", async (event) => {
  const email = event.currentTarget.dataset.email;
  try {
    await navigator.clipboard.writeText(email);
    toast.textContent = "Email copied";
  } catch (error) {
    toast.textContent = email;
  }
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
});

if (finePointer && !reduceMotion) {
  root.classList.add("cursor-on");
  const dot = document.getElementById("cursor");
  const ring = document.getElementById("ring");
  const preview = document.getElementById("preview");
  const previewTitle = document.getElementById("preview-title");
  let mouseX = -100, mouseY = -100, ringX = -100, ringY = -100, previewX = -100, previewY = -100;

  window.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    dot.style.transform = "translate3d(" + mouseX + "px," + mouseY + "px,0)";
  }, { passive: true });

  (function animate() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    previewX += (mouseX - previewX) * 0.12;
    previewY += (mouseY - previewY) * 0.12;
    ring.style.transform = "translate3d(" + ringX + "px," + ringY + "px,0)";
    preview.style.transform = "translate3d(" + previewX + "px," + previewY + "px,0)";
    requestAnimationFrame(animate);
  })();

  document.querySelectorAll("a, button, .row").forEach((el) => {
    el.addEventListener("mouseenter", () => ring.classList.add("grow"));
    el.addEventListener("mouseleave", () => ring.classList.remove("grow"));
  });

  document.querySelectorAll(".row").forEach((row) => {
    row.addEventListener("mouseenter", () => {
      preview.style.setProperty("--c1", row.dataset.c1);
      preview.style.setProperty("--c2", row.dataset.c2);
      previewTitle.textContent = row.dataset.title;
      preview.classList.add("on");
    });
    row.addEventListener("mouseleave", () => preview.classList.remove("on"));
  });

  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("mousemove", (event) => {
      const rect = btn.getBoundingClientRect();
      btn.style.setProperty("--bx", (event.clientX - rect.left - rect.width / 2) * 0.22 + "px");
      btn.style.setProperty("--by", (event.clientY - rect.top - rect.height / 2) * 0.3 + "px");
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.setProperty("--bx", "0px");
      btn.style.setProperty("--by", "0px");
    });
  });
}