const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const EMAIL = "md.mahinur.rahman.sun@gmail.com";

function typeInto(el, text, speed = 55) {
  if (reduceMotion) {
    el.textContent = text;
    return;
  }
  let index = 0;
  el.textContent = "";
  const timer = setInterval(() => {
    index += 1;
    el.textContent = text.slice(0, index);
    if (index >= text.length) clearInterval(timer);
  }, speed);
}

document.querySelectorAll(".typed").forEach((el, i) => {
  const text = el.dataset.type;
  if (i === 0) {
    setTimeout(() => typeInto(el, text), 400);
    return;
  }
  el.textContent = "";
  const observer = new IntersectionObserver((entries, obs) => {
    if (entries[0].isIntersecting) {
      typeInto(el, text);
      obs.disconnect();
    }
  }, { threshold: 0.8 });
  observer.observe(el);
});

const swatches = document.querySelectorAll(".swatches button");
swatches.forEach((button) => {
  button.addEventListener("click", () => setAccent(button.dataset.accent));
});
function setAccent(name) {
  root.dataset.accent = name;
  try {
    localStorage.setItem("accent", name);
  } catch (error) {
    console.error("Could not save accent", error);
  }
}

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
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id));
  });
}, { rootMargin: "-40% 0px -55% 0px" });
navLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean).forEach((section) => sectionObserver.observe(section));

const progress = document.getElementById("progress");
window.addEventListener("scroll", () => {
  const max = root.scrollHeight - window.innerHeight;
  progress.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
}, { passive: true });

const timeEl = document.getElementById("time");
const formatter = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit", hour12: false });
function updateTime() {
  timeEl.textContent = formatter.format(new Date()) + " BST";
}
updateTime();
setInterval(updateTime, 15000);

const toast = document.getElementById("toast");
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}
document.getElementById("copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(EMAIL);
    showToast("Email copied");
  } catch (error) {
    showToast(EMAIL);
  }
});

if (finePointer && !reduceMotion) {
  const spotlight = document.getElementById("spotlight");
  let targetX = window.innerWidth * 0.7;
  let targetY = window.innerHeight * 0.25;
  let x = targetX;
  let y = targetY;

  window.addEventListener("mousemove", (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    spotlight.classList.add("on");
  }, { passive: true });

  document.addEventListener("mouseleave", () => spotlight.classList.remove("on"));

  (function follow() {
    x += (targetX - x) * 0.14;
    y += (targetY - y) * 0.14;
    spotlight.style.transform = "translate3d(" + x + "px," + y + "px,0)";
    root.style.setProperty("--mx", x + "px");
    root.style.setProperty("--my", y + "px");
    requestAnimationFrame(follow);
  })();

  document.querySelectorAll(".win").forEach((win) => {
    win.addEventListener("mousemove", (event) => {
      const rect = win.getBoundingClientRect();
      win.style.setProperty("--cx", event.clientX - rect.left + "px");
      win.style.setProperty("--cy", event.clientY - rect.top + "px");
    });
  });
}

const out = document.getElementById("term-out");
const form = document.getElementById("term-form");
const input = document.getElementById("term-input");
const term = document.getElementById("term");
const history = [];
let historyIndex = 0;

function line(text, className) {
  const div = document.createElement("div");
  if (className) div.className = className;
  div.textContent = text;
  out.append(div);
  return div;
}

function linkLine(label, href) {
  const div = document.createElement("div");
  const a = document.createElement("a");
  a.href = href;
  a.textContent = label;
  a.target = "_blank";
  a.rel = "noopener";
  div.append(a);
  out.append(div);
}

const commands = {
  help() {
    line("Available commands:", "ok");
    line("  about     who I am");
    line("  skills    what I work with");
    line("  projects  things I've built");
    line("  contact   how to reach me");
    line("  whoami    short intro");
    line("  accent    cycle the accent color");
    line("  clear     clean the screen");
  },
  about() {
    line("Md. Mahinur Rahman Sun", "ok");
    line("BSc in CSE student at Southeast University, Dhaka.");
    line("Frontend-focused. I learn by building, deploy every project live,");
    line("and make sure I understand every line I ship.");
  },
  whoami() {
    line("visitor, but you can call me a friend of the web.", "dim");
    line("Owner of this site: Md. Mahinur Rahman Sun.");
  },
  skills() {
    line("using     HTML, CSS, Responsive design, Git, GitHub, VS Code, Vercel", "ok");
    line("learning  JavaScript");
    line("next      React, Figma, API integration, AI-powered apps", "dim");
  },
  projects() {
    line("01  Personal portfolio", "ok");
    linkLine("    live: mahinurrahmansun.vercel.app", "https://mahinurrahmansun.vercel.app/");
    line("02  Task manager", "ok");
    linkLine("    live: sun-taskmanager.vercel.app", "https://sun-taskmanager.vercel.app");
  },
  contact() {
    linkLine("email     " + EMAIL, "mailto:" + EMAIL);
    linkLine("github    github.com/MahinurRahmanSun", "https://github.com/MahinurRahmanSun");
    linkLine("linkedin  linkedin.com/in/mahinurrahmansun", "https://www.linkedin.com/in/mahinurrahmansun");
  },
  accent() {
    const order = ["blue", "red", "green"];
    const next = order[(order.indexOf(root.dataset.accent) + 1) % order.length];
    setAccent(next);
    line("accent set to " + next, "ok");
  },
  clear() {
    out.textContent = "";
  }
};

function run(raw) {
  const command = raw.trim().toLowerCase();
  if (!command) return;
  if (command !== "clear") line("visitor@mahinur:~$ " + raw.trim(), "cmd");
  if (commands[command]) {
    commands[command]();
  } else if (command.startsWith("sudo")) {
    line("Nice try. The best way to hire me is an email:", "dim");
    commands.contact();
  } else {
    line("command not found: " + command + ". Type 'help'.", "dim");
  }
  term.scrollTop = term.scrollHeight;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = input.value;
  if (value.trim()) {
    history.push(value);
    historyIndex = history.length;
  }
  input.value = "";
  run(value);
});

input.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp" && history.length) {
    event.preventDefault();
    historyIndex = Math.max(0, historyIndex - 1);
    input.value = history[historyIndex];
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    historyIndex = Math.min(history.length, historyIndex + 1);
    input.value = history[historyIndex] || "";
  }
});

term.addEventListener("click", () => input.focus({ preventScroll: true }));
document.querySelectorAll(".quick button").forEach((button) => {
  button.addEventListener("click", () => run(button.dataset.cmd));
});

line("Welcome! This is an interactive terminal. Type 'help' to begin.", "ok");

if (finePointer && !reduceMotion) {
  const spotlight = document.getElementById("spotlight");
  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 3;
  let x = targetX;
  let y = targetY;

  window.addEventListener("mousemove", (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    root.style.setProperty("--mx", targetX + "px");
    root.style.setProperty("--my", targetY + "px");
    spotlight.classList.add("on");
  }, { passive: true });

  document.addEventListener("mouseleave", () => spotlight.classList.remove("on"));
  document.addEventListener("mouseenter", () => spotlight.classList.add("on"));

  (function follow() {
    x += (targetX - x) * 0.16;
    y += (targetY - y) * 0.16;
    spotlight.style.transform = "translate3d(" + x + "px," + y + "px,0)";
    requestAnimationFrame(follow);
  })();

  document.querySelectorAll(".win").forEach((win) => {
    win.addEventListener("mousemove", (event) => {
      const rect = win.getBoundingClientRect();
      win.style.setProperty("--cx", event.clientX - rect.left + "px");
      win.style.setProperty("--cy", event.clientY - rect.top + "px");
    });
  });
}