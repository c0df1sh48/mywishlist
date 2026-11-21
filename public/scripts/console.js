(() => {
  const TOKEN_KEY = "mywishlist-admin-token";
  const $ = id => document.getElementById(id);
  let token = "";
  let notifications = [];
  let people = [];

  try { token = sessionStorage.getItem(TOKEN_KEY) || ""; } catch (_) {}
  const setToken = value => { token = value || ""; try { token ? sessionStorage.setItem(TOKEN_KEY, token) : sessionStorage.removeItem(TOKEN_KEY); } catch (_) {} };
  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const message = (id, value, error = false) => { const el = $(id); if (el) { el.textContent = value || ""; el.classList.toggle("error", error); } };
  async function api(url, options = {}) {
    const headers = { ...(options.headers || {}), Authorization: `Bearer ${token}` };
    if (options.body && !(options.body instanceof FormData) && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
    const response = await fetch(url, { ...options, headers });
    const data = response.headers.get("content-type")?.includes("application/json") ? await response.json() : {};
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
    return data;
  }
  function showWorkspace(unlocked) { $("console-login-card").hidden = unlocked; $("console-workspace").hidden = !unlocked; $("console-lock").hidden = !unlocked; }
  function activateSection(name) {
    document.querySelectorAll(".console-tab").forEach(tab => tab.classList.toggle("active", tab.dataset.section === name));
    document.querySelectorAll(".console-section").forEach(section => { const active = section.id === `section-${name}`; section.hidden = !active; section.classList.toggle("active", active); });
    if (name === "notifications") loadNotifications();
    if (name === "people") loadPeople();
    if (name === "backups") loadBackups();
  }

  async function loadNotifications() {
    try { notifications = await api("/api/popup"); renderNotifications(); }
    catch (error) { $("notification-list").innerHTML = `<p class="console-muted">${escapeHTML(error.message)}</p>`; }
  }
  function renderNotifications() {
    const list = $("notification-list");
    if (!notifications.length) { list.innerHTML = '<p class="console-muted">No notifications yet.</p>'; return; }
    list.innerHTML = notifications.map((item, i) => `<div class="console-row"><div class="console-row-copy"><strong>${escapeHTML(item.title || "Untitled")} ${item.enabled === false ? "(hidden)" : ""}</strong><small>${escapeHTML(item.message || "")}<br>${escapeHTML(item.type || "info")} · ${escapeHTML(item.date || "No date")}</small></div><div class="console-row-actions"><button type="button" data-edit-notice="${i}">Edit</button><button type="button" class="danger" data-delete-notice="${i}">Delete</button></div></div>`).join("");
    list.querySelectorAll("[data-edit-notice]").forEach(button => button.addEventListener("click", () => {
      const i = Number(button.dataset.editNotice), item = notifications[i];
      $("notification-index").value = i; $("notification-type").value = item.type || "info"; $("notification-title").value = item.title || ""; $("notification-message").value = item.message || ""; $("notification-enabled").checked = item.enabled !== false; $("notification-form-title").textContent = "Edit notification";
      $("notification-form").scrollIntoView({ behavior: "smooth", block: "center" });
    }));
    list.querySelectorAll("[data-delete-notice]").forEach(button => button.addEventListener("click", async () => {
      const i = Number(button.dataset.deleteNotice); if (!confirm("Delete this notification?")) return;
      try { await api(`/api/popup/${i}`, { method: "DELETE" }); await loadNotifications(); message("notification-message-status", "Notification deleted."); }
      catch (error) { message("notification-message-status", error.message, true); }
    }));
  }
  $("notification-form").addEventListener("submit", async event => {
    event.preventDefault(); const raw = $("notification-index").value;
    const body = { type: $("notification-type").value, title: $("notification-title").value.trim(), message: $("notification-message").value.trim(), enabled: $("notification-enabled").checked, date: new Date().toLocaleDateString() };
    try { await api(raw === "" ? "/api/popup" : `/api/popup/${raw}`, { method: raw === "" ? "POST" : "PUT", body: JSON.stringify(body) }); resetNotificationForm(); await loadNotifications(); message("notification-message-status", "Notification saved."); }
    catch (error) { message("notification-message-status", error.message, true); }
  });
  function resetNotificationForm() { $("notification-form").reset(); $("notification-index").value = ""; $("notification-enabled").checked = true; $("notification-form-title").textContent = "Create notification"; message("notification-message-status", ""); }
  $("notification-clear").addEventListener("click", resetNotificationForm);

  async function loadPeople() {
    try { people = await api("/api/people"); renderPeople(); }
    catch (error) { $("people-list").innerHTML = `<p class="console-muted">${escapeHTML(error.message)}</p>`; }
  }
  function renderPeople() {
    const list = $("people-list");
    if (!people.length) { list.innerHTML = '<p class="console-muted">No people yet. Add the first profile using the form.</p>'; return; }
    list.innerHTML = people.map((person, i) => `<div class="console-row"><div class="console-person-info">${person.pfp ? `<img class="console-person-avatar" src="${escapeHTML(person.pfp)}" alt="">` : ''}<div class="console-row-copy"><strong>${escapeHTML(person.username)}</strong><small>${escapeHTML(person.pfp || "No profile picture")}</small></div></div><div class="console-row-actions"><button type="button" data-edit-person="${i}">Edit</button><button type="button" class="danger" data-delete-person="${i}">Delete</button></div></div>`).join("");
    list.querySelectorAll("[data-edit-person]").forEach(button => button.addEventListener("click", () => { const i = Number(button.dataset.editPerson), person = people[i]; $("person-index").value = i; $("person-name").value = person.username || ""; $("person-picture").value = person.pfp || ""; clearPersonImageSelection(); $("person-form-title").textContent = "Edit person"; $("person-form").scrollIntoView({ behavior: "smooth", block: "center" }); }));
    list.querySelectorAll("[data-delete-person]").forEach(button => button.addEventListener("click", async () => { const i = Number(button.dataset.deletePerson), person = people[i]; if (!confirm(`Delete ${person.username}? Their wishlist items may remain but won't have a matching profile.`)) return; try { await api("/api/delete-person", { method: "POST", body: JSON.stringify({ index: i }) }); await loadPeople(); message("person-message", "Person deleted."); } catch (error) { message("person-message", error.message, true); } }));
  }
  function clearPersonImageSelection() {
    const input = $("person-picture-file");
    if (input) input.value = "";
    $("person-picture-preview-wrap").hidden = true;
    $("person-picture-preview").removeAttribute("src");
  }
  $("person-picture-file").addEventListener("change", () => {
    const file = $("person-picture-file").files[0];
    if (!file) return;
    $("person-picture").value = "";
    if (!file.type.startsWith("image/")) { message("person-message", "Choose a valid image file.", true); clearPersonImageSelection(); return; }
    const reader = new FileReader();
    reader.onload = () => { $("person-picture-preview").src = reader.result; $("person-picture-preview-wrap").hidden = false; };
    reader.onerror = () => message("person-message", "Could not preview this image.", true);
    reader.readAsDataURL(file);
    message("person-message", "Image selected. Save person to upload it.");
  });
  $("person-picture-remove").addEventListener("click", clearPersonImageSelection);
  async function uploadPersonPicture() {
    const file = $("person-picture-file").files[0];
    if (!file) return $("person-picture").value.trim();
    const form = new FormData();
    form.append("images", file, file.name || "profile-picture.png");
    form.append("amount", "unk");
    const result = await api("/api/upload-image", { method: "POST", body: form });
    if (!result.paths || !result.paths[0]) throw new Error("The server did not return an uploaded image path.");
    return result.paths[0];
  }
  $("person-form").addEventListener("submit", async event => {
    event.preventDefault();
    const saveButton = $("person-form").querySelector('button[type="submit"]');
    const raw = $("person-index").value, username = $("person-name").value.trim();
    if (!username) { message("person-message", "Enter a profile name.", true); return; }
    saveButton.disabled = true;
    try {
      message("person-message", "Uploading profile picture...");
      const pfp = await uploadPersonPicture();
      if (raw === "") await api("/api/add-person", { method: "POST", body: JSON.stringify({ username, pfp }) });
      else await api("/api/edit-person", { method: "POST", body: JSON.stringify({ index: Number(raw), person: { username, pfp } }) });
      resetPersonForm(); await loadPeople(); message("person-message", "Person saved.");
    } catch (error) { message("person-message", error.message, true); }
    finally { saveButton.disabled = false; }
  });
  function resetPersonForm() { $("person-form").reset(); $("person-index").value = ""; $("person-form-title").textContent = "Add person"; clearPersonImageSelection(); message("person-message", ""); }
  $("person-clear").addEventListener("click", resetPersonForm);

  async function loadBackups() {
    try { const backups = await api("/api/backups"); const list = $("backup-list"); if (!backups.length) { list.innerHTML = '<p class="console-muted">No saved backups yet.</p>'; return; }
      list.innerHTML = backups.map((backup, i) => `<div class="console-row"><div class="console-row-copy"><strong>${escapeHTML(backup.filename)}</strong><small>${new Date(backup.createdAt).toLocaleString()} · ${formatBytes(backup.bytes)}</small></div><div class="console-row-actions"><button type="button" data-download-backup="${i}">Download</button><button type="button" data-restore-backup="${i}">Restore</button></div></div>`).join("");
      list.querySelectorAll("[data-download-backup]").forEach(button => button.addEventListener("click", async () => { const backup = backups[Number(button.dataset.downloadBackup)]; try { const response = await fetch(`/api/backups/${encodeURIComponent(backup.filename)}`, { headers: { Authorization: `Bearer ${token}` } }); if (!response.ok) throw new Error("Download failed."); const blob = await response.blob(), url = URL.createObjectURL(blob), a = document.createElement("a"); a.href = url; a.download = backup.filename; a.click(); URL.revokeObjectURL(url); } catch (error) { message("backup-message", error.message, true); } }));
      list.querySelectorAll("[data-restore-backup]").forEach(button => button.addEventListener("click", async () => { const backup = backups[Number(button.dataset.restoreBackup)]; if (!confirm(`Restore ${backup.filename}? This will replace the current wishlist data.`)) return; try { const result = await api(`/api/backups/${encodeURIComponent(backup.filename)}/restore`, { method: "POST" }); message("backup-message", result.message || "Backup restored."); } catch (error) { message("backup-message", error.message, true); } }));
    } catch (error) { $("backup-list").innerHTML = `<p class="console-muted">${escapeHTML(error.message)}</p>`; }
  }
  const formatBytes = bytes => bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;
  $("create-backup").addEventListener("click", async () => { const button = $("create-backup"); button.disabled = true; button.textContent = "Creating..."; try { const result = await api("/api/backup", { method: "POST" }); message("backup-message", `Backup created: ${result.path}`); await loadBackups(); } catch (error) { message("backup-message", error.message, true); } finally { button.disabled = false; button.textContent = "＋ Create backup"; } });
  $("restore-upload-form").addEventListener("submit", async event => { event.preventDefault(); const file = $("restore-file").files[0]; if (!file) return; if (!confirm("Restore this backup? This will replace the current wishlist data.")) return; const form = new FormData(); form.append("backup", file); try { const result = await api("/api/restore", { method: "POST", body: form }); message("backup-message", result.message || "Backup restored."); await loadBackups(); } catch (error) { message("backup-message", error.message, true); } });

  $("console-login-form").addEventListener("submit", async event => { event.preventDefault(); message("console-login-message", "Checking password..."); try { const response = await fetch("/api/admin/unlock", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: $("console-password").value }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Sign in failed."); setToken(data.token); $("console-password").value = ""; showWorkspace(true); activateSection("notifications"); } catch (error) { message("console-login-message", error.message, true); } });
  $("console-lock").addEventListener("click", () => { setToken(""); showWorkspace(false); });
  document.querySelectorAll(".console-tab").forEach(tab => tab.addEventListener("click", () => activateSection(tab.dataset.section)));
  showWorkspace(false);
  if (token) { showWorkspace(true); activateSection("notifications"); }
})();
