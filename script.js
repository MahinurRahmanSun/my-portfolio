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
  const text = el.dataset.type || "";

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

function setAccent(name) {
  if (!["blue", "red", "green"].includes(name)) return;

  root.dataset.accent = name;

  try {
    localStorage.setItem("accent", name);
  } catch (error) {
    console.warn("Could not save accent preference:", error);
  }
}

swatches.forEach((button) => {
  button.addEventListener("click", () => {
    setAccent(button.dataset.accent);
  });
});

const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.getElementById("site-nav");
const navLinks = siteNav ? Array.from(siteNav.querySelectorAll("a")) : [];

function setMenu(open) {
  if (!siteNav || !menuToggle) return;

  siteNav.classList.toggle("open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
}

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    setMenu(!siteNav.classList.contains("open"));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach((el) => {
    revealObserver.observe(el);
  });

  if (navLinks.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        navLinks.forEach((link) => {
          link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${entry.target.id}`
          );
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });

    navLinks
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean)
      .forEach((section) => sectionObserver.observe(section));
  }
} else {
  document.querySelectorAll(".reveal").forEach((el) => {
    el.classList.add("visible");
  });
}

const progress = document.getElementById("progress");

if (progress) {
  let scrollTicking = false;

  window.addEventListener("scroll", () => {
    if (scrollTicking) return;

    scrollTicking = true;

    requestAnimationFrame(() => {
      const maxScroll = root.scrollHeight - window.innerHeight;
      const amount = maxScroll > 0 ? window.scrollY / maxScroll : 0;

      progress.style.transform = `scaleX(${Math.min(1, Math.max(0, amount))})`;
      scrollTicking = false;
    });
  }, { passive: true });
}

const timeEl = document.getElementById("time");

if (timeEl) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  function updateTime() {
    timeEl.textContent = `${formatter.format(new Date())} BST`;
  }

  updateTime();
  setInterval(updateTime, 15000);
}

const toast = document.getElementById("toast");

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

const copyButton = document.getElementById("copy");

if (copyButton) {
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      showToast("Email copied");
    } catch (error) {
      showToast(EMAIL);
    }
  });
}

const spotlight = document.getElementById("spotlight");

if (spotlight && finePointer) {
  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;
  let animationFrame = 0;
  let pointerInside = false;

  const followSpeed = reduceMotion ? 1 : 0.16;

  function renderSpotlight() {
    currentX += (targetX - currentX) * followSpeed;
    currentY += (targetY - currentY) * followSpeed;

    spotlight.style.transform =
      `translate3d(${currentX}px, ${currentY}px, 0)`;

    root.style.setProperty("--mx", `${currentX}px`);
    root.style.setProperty("--my", `${currentY}px`);

    const distance = Math.hypot(
      targetX - currentX,
      targetY - currentY
    );

    if (distance > 0.5 && pointerInside) {
      animationFrame = requestAnimationFrame(renderSpotlight);
    } else {
      currentX = targetX;
      currentY = targetY;
      spotlight.style.transform =
        `translate3d(${currentX}px, ${currentY}px, 0)`;
      root.style.setProperty("--mx", `${currentX}px`);
      root.style.setProperty("--my", `${currentY}px`);
      animationFrame = 0;
    }
  }

  function moveSpotlight(event) {
    if (event.pointerType !== "mouse" && event.pointerType !== "pen") {
      return;
    }

    pointerInside = true;
    targetX = event.clientX;
    targetY = event.clientY;

    spotlight.classList.add("on");

    if (!animationFrame) {
      animationFrame = requestAnimationFrame(renderSpotlight);
    }
  }

  function hideSpotlight() {
    pointerInside = false;
    spotlight.classList.remove("on");

    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }
  }

  window.addEventListener("pointermove", moveSpotlight, { passive: true });
  document.documentElement.addEventListener("pointerleave", hideSpotlight);
  window.addEventListener("blur", hideSpotlight);

  document.querySelectorAll(".win").forEach((win) => {
    win.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") {
        return;
      }

      const rect = win.getBoundingClientRect();

      win.style.setProperty("--cx", `${event.clientX - rect.left}px`);
      win.style.setProperty("--cy", `${event.clientY - rect.top}px`);
    }, { passive: true });
  });
}

const out = document.getElementById("term-out");
const form = document.getElementById("term-form");
const input = document.getElementById("term-input");
const term = document.getElementById("term");

const commandHistory = [];
let historyIndex = 0;

function line(text, className) {
  if (!out) return null;

  const div = document.createElement("div");

  if (className) div.className = className;

  div.textContent = text;
  out.append(div);

  return div;
}

function linkLine(label, href) {
  if (!out) return;

  const div = document.createElement("div");
  const anchor = document.createElement("a");

  anchor.href = href;
  anchor.textContent = label;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";

  div.append(anchor);
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
    line(
      "using     HTML, CSS, Responsive design, Git, GitHub, VS Code, Vercel",
      "ok"
    );
    line("learning  JavaScript");
    line("next      React, Figma, API integration, AI-powered apps", "dim");
  },

  projects() {
    line("01  Personal portfolio", "ok");
    linkLine(
      "    live: mahinurrahmansun.vercel.app",
      "https://mahinurrahmansun.vercel.app/"
    );
    line("02  Task manager", "ok");
    linkLine(
      "    live: sun-taskmanager.vercel.app",
      "https://sun-taskmanager.vercel.app"
    );
  },

  contact() {
    linkLine("email     " + EMAIL, "mailto:" + EMAIL);
    linkLine(
      "github    github.com/MahinurRahmanSun",
      "https://github.com/MahinurRahmanSun"
    );
    linkLine(
      "linkedin  linkedin.com/in/mahinurrahmansun",
      "https://www.linkedin.com/in/mahinurrahmansun"
    );
  },

  accent() {
    const order = ["blue", "red", "green"];
    const currentIndex = order.indexOf(root.dataset.accent);
    const next = order[(currentIndex + 1) % order.length];

    setAccent(next);
    line("accent set to " + next, "ok");
  },

  clear() {
    if (out) out.textContent = "";
  }
};

function run(raw) {
  const command = raw.trim().toLowerCase();

  if (!command) return;

  if (command !== "clear") {
    line("visitor@mahinur:~$ " + raw.trim(), "cmd");
  }

  if (Object.prototype.hasOwnProperty.call(commands, command)) {
    commands[command]();
  } else if (command.startsWith("sudo")) {
    line("Nice try. The best way to hire me is an email:", "dim");
    commands.contact();
  } else {
    line("command not found: " + command + ". Type 'help'.", "dim");
  }

  if (term) term.scrollTop = term.scrollHeight;
}

if (form && input) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const value = input.value;

    if (value.trim()) {
      commandHistory.push(value);
      historyIndex = commandHistory.length;
    }

    input.value = "";
    run(value);
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp" && commandHistory.length) {
      event.preventDefault();
      historyIndex = Math.max(0, historyIndex - 1);
      input.value = commandHistory[historyIndex];
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      historyIndex = Math.min(commandHistory.length, historyIndex + 1);
      input.value = commandHistory[historyIndex] || "";
    }
  });
}

if (term && input) {
  term.addEventListener("click", () => {
    input.focus({ preventScroll: true });
  });
}

document.querySelectorAll(".quick button").forEach((button) => {
  button.addEventListener("click", () => {
    run(button.dataset.cmd || "");
  });
});

line("Welcome! This is an interactive terminal. Type 'help' to begin.", "ok");