(function () {
  const overlay = () => document.getElementById("control-panel-overlay");
  const tokenKey = "mywishlist-admin-token";
  let updates = [];
  let socket = null;

  function token() { try { return sessionStorage.getItem(tokenKey) || ""; } catch (_) { return ""; } }
  function setToken(value) { try { if (value) sessionStorage.setItem(tokenKey, value); else sessionStorage.removeItem(tokenKey); } catch (_) {} }
  function escapeHTML(value) { return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function message(id, text, isError) { const el = document.getElementById(id); if (el) { el.textContent = text || ""; el.classList.toggle("error", !!isError); } }

  async function request(url, options = {}, authenticated = false) {
    const headers = { ...(options.headers || {}) };
    if (options.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
    if (authenticated && token()) headers.Authorization = `Bearer ${token()}`;
    const response = await fetch(url, { ...options, headers });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
    return data;
  }

  function renderUpdates() {
    const container = document.getElementById("site-notifications") || document.getElementById("control-updates");
    if (!container) return;
    const visible = updates.filter(item => item && item.enabled !== false);
    if (!visible.length) {
      container.innerHTML = '<div class="control-empty"><span class="control-empty-icon">—</span><h3>No updates right now</h3><p>There are no current site announcements.</p></div>';
      return;
    }
    container.innerHTML = visible.slice().reverse().map(item => `<article class="control-update"><div class="control-update-top"><span class="control-update-tag">SITE UPDATE</span><time>${escapeHTML(item.date || "Announcement")}</time></div><h3>${escapeHTML(item.title || "Update")}</h3><p>${escapeHTML(item.message || "")}</p></article>`).join("");
  }

  function renderManageList() {
    const container = document.getElementById("control-manage-list");
    if (!container) return;
    if (!updates.length) { container.innerHTML = '<p class="control-muted">No updates have been published.</p>'; return; }
    container.innerHTML = '<h4>Published updates</h4>' + updates.map((item, index) => `<div class="control-manage-row"><div><strong>${escapeHTML(item.title || "Untitled")}</strong><small>${escapeHTML(item.message || "")}</small></div><div class="control-manage-actions"><button type="button" data-edit="${index}">Edit</button><button type="button" data-delete="${index}" class="control-delete">Delete</button></div></div>`).join("");
    container.querySelectorAll("[data-edit]").forEach(button => button.addEventListener("click", () => {
      const index = Number(button.dataset.edit), item = updates[index];
      document.getElementById("control-update-index").value = String(index);
      document.getElementById("control-update-title").value = item.title || "";
      document.getElementById("control-update-message").value = item.message || "";
      document.getElementById("control-update-form").scrollIntoView({ behavior: "smooth", block: "center" });
    }));
    container.querySelectorAll("[data-delete]").forEach(button => button.addEventListener("click", async () => {
      const index = Number(button.dataset.delete);
      if (!confirm("Delete this site update?")) return;
      try { await request(`/api/popup/${index}`, { method: "DELETE" }, true); await loadUpdates(); message("control-save-message", "Update deleted."); }
      catch (error) { message("control-save-message", error.message, true); }
    }));
  }

  async function loadUpdates() {
    const container = document.getElementById("control-updates");
    if (container) container.innerHTML = '<p class="control-muted">Loading updates…</p>';
    try {
      updates = await request("/api/popup");
      if (!Array.isArray(updates)) updates = [];
      renderUpdates();
      if (token()) renderManageList();
    } catch (error) {
      if (container) container.innerHTML = `<p class="control-muted">Could not load updates: ${escapeHTML(error.message)}</p>`;
    }
  }

  window.openControlPanel = function () {
    const el = overlay();
    if (!el) return;
    el.classList.add("active"); el.setAttribute("aria-hidden", "false");
    loadUpdates();
    const unlocked = !!token();
    document.getElementById("control-login").hidden = unlocked;
    document.getElementById("control-editor").hidden = !unlocked;
    if (unlocked) renderManageList();
    document.body.classList.add("modal-open");
  };
  window.closeControlPanel = function () {
    const el = overlay(); if (!el) return;
    el.classList.remove("active"); el.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };
  window.lockControlPanel = function () {
    setToken("");
    document.getElementById("control-login").hidden = false;
    document.getElementById("control-editor").hidden = true;
    document.getElementById("control-password").value = "";
    message("control-login-message", "Administrator controls are locked.");
  };
  window.resetControlUpdateForm = function () {
    document.getElementById("control-update-form").reset();
    document.getElementById("control-update-index").value = "";
    message("control-save-message", "");
  };

  document.addEventListener("DOMContentLoaded", () => {
    loadUpdates();
    const login = document.getElementById("control-login-form");
    login?.addEventListener("submit", async event => {
      event.preventDefault();
      message("control-login-message", "Checking password…");
      try {
        const result = await request("/api/admin/unlock", { method: "POST", body: JSON.stringify({ password: document.getElementById("control-password").value }) });
        setToken(result.token);
        document.getElementById("control-login").hidden = true;
        document.getElementById("control-editor").hidden = false;
        document.getElementById("control-password").value = "";
        message("control-login-message", "");
        renderManageList();
      } catch (error) { message("control-login-message", error.message, true); }
    });
    const form = document.getElementById("control-update-form");
    form?.addEventListener("submit", async event => {
      event.preventDefault();
      const index = document.getElementById("control-update-index").value;
      const body = { type: "info", title: document.getElementById("control-update-title").value.trim(), message: document.getElementById("control-update-message").value.trim(), enabled: true, date: new Date().toLocaleDateString() };
      try {
        if (index !== "") await request(`/api/popup/${index}`, { method: "PUT", body: JSON.stringify(body) }, true);
        else await request("/api/popup", { method: "POST", body: JSON.stringify(body) }, true);
        window.resetControlUpdateForm(); await loadUpdates(); message("control-save-message", "Update published.");
      } catch (error) { message("control-save-message", error.message, true); }
    });
    overlay()?.addEventListener("click", event => { if (event.target === overlay()) window.closeControlPanel(); });
    document.addEventListener("keydown", event => { if (event.key === "Escape") window.closeControlPanel(); });
    if (window.io) {
      socket = window.io();
      socket.on("popup-updated", list => { updates = Array.isArray(list) ? list : []; renderUpdates(); if (token()) renderManageList(); });
    }
  });
})();
