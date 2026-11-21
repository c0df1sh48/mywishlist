(function () {
  const KEY = "mywishlist-sidebar-collapsed";
  function applySidebarState(collapsed) {
    document.body.classList.toggle("sidebar-collapsed", collapsed);
    const button = document.querySelector(".sidebar-collapse");
    if (button) {
      button.textContent = collapsed ? "›" : "‹";
      button.title = collapsed ? "Expand sidebar" : "Collapse sidebar";
      button.setAttribute("aria-label", button.title);
    }
  }
  window.toggleSidebar = function () {
    const collapsed = !document.body.classList.contains("sidebar-collapsed");
    try { localStorage.setItem(KEY, collapsed ? "1" : "0"); } catch (_) {}
    applySidebarState(collapsed);
  };
  window.setActiveNav = function (button) {
    document.querySelectorAll("#app-sidebar .sidebar-link").forEach(el => el.classList.remove("active"));
    if (button) button.classList.add("active");
  };
  document.addEventListener("DOMContentLoaded", () => {
    let collapsed = false;
    try { collapsed = localStorage.getItem(KEY) === "1"; } catch (_) {}
    applySidebarState(collapsed);
    const params = new URLSearchParams(location.search);
    const username = params.get("user");
    const person = Array.isArray(window.PERSONS) ? window.PERSONS.find(p => p.username === username) : null;
    const name = document.getElementById("sidebar-profile-name");
    const image = document.getElementById("sidebar-pfp");
    if (name) name.textContent = person ? person.username : "Choose profile";
    if (image && person && person.pfp) image.src = person.pfp;
  });
})();
