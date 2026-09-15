
console.log("JS LOADED - Academic Timeline with Month Sorting");

// =========================
// FADE-IN ANIMATION
// =========================
const faders = document.querySelectorAll('.fade');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('show');
  });
});
faders.forEach(el => observer.observe(el));

// =========================
// DARK MODE TOGGLE
// =========================
function toggleMode() {
  document.body.classList.toggle("light");

  const hero = document.querySelector(".hero");
  if (hero) {
    hero.style.background = document.body.classList.contains("light")
      ? "linear-gradient(to bottom, #f0f0f0, #e0e0e0)"
      : "linear-gradient(to bottom, rgba(10, 25, 50,0.95), rgba(20, 30, 60,0.9))";
  }

  const icons = document.querySelectorAll(".icon-links img");
  icons.forEach(icon => {
    icon.style.filter = document.body.classList.contains("light")
      ? "brightness(1.2)"
      : "brightness(0.9)";
    icon.style.background = document.body.classList.contains("light") ? "transparent" : "#ffffff";
  });

  const githubBtns = document.querySelectorAll(".project-actions .btn-github");
  githubBtns.forEach(btn => {
    btn.style.background = document.body.classList.contains("light") ? "#f0f0f0" : "#ffffff";
  });
}

// =========================
// LOAD Community Services
// =========================
async function loadProjects(containerId, limit = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const res = await fetch("./data/community.json");
    const data = await res.json();

    if (location.pathname.includes("community")) {
      container.innerHTML = "";
      data.forEach(section => {
        const block = document.createElement("div");
        block.className = "card community-block";
        const items = (section.items || [])
          .map(item => `<li>${item}</li>`)
          .join("");
        block.innerHTML = `
          <h2>${section.title || ""}</h2>
          <ul>${items}</ul>
        `;
        container.appendChild(block);
      });
      return;
    }

    // Homepage preview still uses the same JSON
    const list = limit ? data.slice(0, limit) : data;
    list.forEach(p => {
      const div = document.createElement("div");
      div.className = containerId === "projects-preview" ? "card fade" : "project-card";
      div.innerHTML = `
        <div class="project-content">
          <h3>${p.title || ""}</h3>
          <ul>${(p.items || []).map(item => `<li>${item}</li>`).join("")}</ul>
        </div>
      `;
      container.appendChild(div);
      if (div.classList.contains("fade")) observer.observe(div);
    });

  } catch (err) {
    console.error("ERROR loading community data:", err);
  }
}

// =========================
// LOAD NEWS
// =========================
// =========================
// LOAD NEWS (Fixed Version)
// =========================
async function loadNews() {
  const preview = document.getElementById("news-preview");
  const full = document.getElementById("news-container");
  if (!preview && !full) return;

  try {
    const res = await fetch("/data/news.json");   // Make sure path is correct
    const news = await res.json();

    // === FIXED DATE PARSING ===
    news.forEach(n => {
      n.dateObj = new Date(n.year);               // Now safe because format is YYYY-MM-DD
      
      // Extra safety: check if date is valid
      if (isNaN(n.dateObj.getTime())) {
        console.warn("Invalid date for:", n.year);
        n.dateObj = new Date(0); // fallback
      }
    });

    // Sort by date descending (newest first)
    news.sort((a, b) => b.dateObj - a.dateObj);

    // For full news page (timeline)
    if (full) {
      news.forEach((n, idx) => {
        const div = document.createElement("div");
        div.className = "timeline-item fade show";
        if (idx === 0) div.classList.add("latest");

        const month = n.dateObj.toLocaleString('default', { month: 'short' });
        const year = n.dateObj.getFullYear();

        div.innerHTML = `
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <span class="timeline-month">${month} ${year}</span>
            <p>${n.text}${n.link ? `<br><a href="${n.link}" target="_blank">Read more →</a>` : ""}</p>
          </div>
        `;
        full.appendChild(div);
        observer.observe(div);
      });
    }

    // For homepage preview
    if (preview) {
      news.slice(0, 3).forEach(n => {
        const div = document.createElement("div");
        div.className = "card fade";
        
        const month = n.dateObj.toLocaleString('default', { month: 'short' });
        const year = n.dateObj.getFullYear();
        
        div.innerHTML = `<b>${month} ${year}</b> — ${n.text}`;
        preview.appendChild(div);
        observer.observe(div);
      });
    }

  } catch (err) {
    console.error("ERROR loading news:", err);
  }
}

// =========================
// MODAL
// =========================
function openInstagram() {
  document.getElementById("instagramModal").style.display = "block";
}
function closeModal() {
  document.getElementById("instagramModal").style.display = "none";
}
window.onclick = function(event) {
  const modal = document.getElementById("instagramModal");
  if (event.target === modal) modal.style.display = "none";
}

// =========================
// LOAD RESEARCH
// =========================
async function loadResearch() {
  const container = document.getElementById("current-work");
  if (!container) return;

  try {
    const res = await fetch("./data/research.json");
    const works = await res.json();

    works.forEach(w => {
      const div = document.createElement("div");
      div.className = "card fade";

      div.innerHTML = `<b>${w.title}</b><br>${w.desc}`;

      container.appendChild(div);
      observer.observe(div);
    });
  } catch (err) {
    console.error("ERROR loading research:", err);
  }
}

// =========================
// LOAD PUBLICATIONS
// =========================
// =========================
// LOAD PUBLICATIONS (Fixed - Title First)
// =========================
async function loadPublications() {
  const container = document.getElementById("publications");
  if (!container) return;

  try {
    const res = await fetch("./data/publications.json");
    let pubs = await res.json();

    // Sort by year descending (newest first)
    pubs.sort((a, b) => b.year - a.year);

    container.innerHTML = ''; // Clear previous content

    pubs.forEach((p, idx) => {
      const div = document.createElement("div");
      div.className = "card fade";
      if (idx === 0) div.classList.add("latest");

      div.innerHTML = `
        <div class="pub-title">${p.title}</div>
        <div class="pub-authors">${p.authors}</div>
        <div class="pub-venue">${p.venue}, ${p.year}</div>
        ${p.link ? 
          `<div class="pub-link">
            <a href="${p.link}" target="_blank" class="btn-primary-pdf">📄 Paper</a>
          </div>` 
          : ''}
      `;

      container.appendChild(div);
      observer.observe(div);
    });

  } catch (err) {
    console.error("ERROR loading publications:", err);
    container.innerHTML = `<p style="color:red;">Failed to load publications. Please check data/publications.json</p>`;
  }
}

// =========================
// AUTO LINKING SYSTEM
// =========================
let AUTO_LINKS = [];

async function loadAutoLinks() {
  try {
    const res = await fetch("./data/auto-links.json");
    AUTO_LINKS = await res.json();

    AUTO_LINKS.sort((a, b) => b.text.length - a.text.length);

  } catch (err) {
    console.error("ERROR loading auto-links:", err);
  }
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function applyAutoLinks(root) {
  if (!AUTO_LINKS.length || !root) return;

  function processNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      let text = node.nodeValue;
      let replaced = false;

      AUTO_LINKS.forEach(link => {
        const regex = new RegExp(`\\b${escapeRegex(link.text)}\\b`, "gi");

        text = text.replace(regex, match => {
          replaced = true;
          return `<a href="${link.url}" class="auto-link" title="${link.desc || link.text}">${match}</a>`;
        });
      });

      if (replaced) {
        const span = document.createElement("span");
        span.innerHTML = text;
        node.replaceWith(span);
      }
    }
    else if (
      node.nodeType === Node.ELEMENT_NODE &&
      node.tagName !== "A" &&
      node.tagName !== "SCRIPT" &&
      node.tagName !== "STYLE"
    ) {
      [...node.childNodes].forEach(processNode);
    }
  }

  processNode(root);
}

// =========================
// INITIALIZE
// =========================
window.addEventListener("DOMContentLoaded", async () => {
  document.body.classList.add("light");

  const currentPage = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".nav-links a").forEach(link => {
    const href = (link.getAttribute("href") || "").split("/").pop().toLowerCase();
    if (!href || href.endsWith(".pdf")) return;
    if (href === currentPage || (currentPage === "" && href === "index.html")) {
      link.classList.add("active");
    }
  });

  await loadAutoLinks();

  await Promise.all([
    loadProjects("projects-preview", 3),
    loadProjects("projects-container"),
    loadNews(),
    loadResearch(),
    loadPublications()
  ]);

  applyAutoLinks(document.body);
});

