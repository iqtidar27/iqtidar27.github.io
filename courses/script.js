let allResources = [];

document.addEventListener("DOMContentLoaded", () => {
  fetch(JSON_FILE)
    .then(res => res.json())
    .then(data => {
      document.getElementById("course-title").textContent = data.course_title;

      allResources = data.resources;
      renderResources(allResources);
    })
    .catch(err => console.error("JSON load error:", err));
});

function renderResources(resources) {
  const container = document.getElementById("resource-list");
  container.innerHTML = "";

  resources.forEach(item => {
    const div = document.createElement("div");
    div.className = "resource";
    div.dataset.type = item.type;

    div.innerHTML = `
      <a href="${item.link}" target="_blank">${item.title}</a>
      <p>${item.description}</p>
    `;

    container.appendChild(div);
  });
}

function filterItems(type) {
  if (type === "all") {
    renderResources(allResources);
  } else {
    const filtered = allResources.filter(item => item.type === type);
    renderResources(filtered);
  }
}