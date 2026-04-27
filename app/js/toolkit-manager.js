// Toolkit Manager - Create, clone, import, export, and assign toolkit templates

(function () {
  "use strict";

  const templateSelect = document.getElementById("template-select");
  const templateInfo = document.getElementById("template-info");
  const actionsCard = document.getElementById("actions-card");
  const contentsCard = document.getElementById("contents-card");
  const assignCard = document.getElementById("assign-card");
  const templateContents = document.getElementById("template-contents");
  const importPreview = document.getElementById("import-preview");
  const createDialog = document.getElementById("create-dialog");
  const btnClone = document.getElementById("btn-clone");

  let selectedTemplateId = null;
  let pendingImport = null;
  let cloneSourceId = null; // set when cloning

  // ---- Init ----
  function init() {
    populateTemplateSelect();
    bindEvents();
  }

  function populateTemplateSelect() {
    const prev = templateSelect.value;
    templateSelect.innerHTML = '<option value="">— Select a template —</option>';
    const ids = getAllTemplateIds();
    for (const id of ids) {
      const opt = document.createElement("option");
      opt.value = id;
      const isBuiltIn = !!TOOLKIT_TEMPLATES[id];
      const isCustom = !!getCustomTemplate(id);
      let label = id;
      if (isCustom && isBuiltIn) label += " (customised)";
      else if (isCustom) label += " (custom)";
      else label += " (default)";
      opt.textContent = label;
      templateSelect.appendChild(opt);
    }
    if (prev) templateSelect.value = prev;
  }

  function bindEvents() {
    templateSelect.addEventListener("change", onTemplateChange);
    document.getElementById("btn-create-new").addEventListener("click", () => openCreateDialog(false));
    btnClone.addEventListener("click", () => openCreateDialog(true));
    document.getElementById("btn-create-confirm").addEventListener("click", confirmCreate);
    document.getElementById("btn-create-cancel").addEventListener("click", closeCreateDialog);
    document.getElementById("btn-export-json").addEventListener("click", exportJSON);
    document.getElementById("btn-export-csv").addEventListener("click", exportCSV);
    document.getElementById("import-json").addEventListener("change", onImportJSON);
    document.getElementById("import-csv").addEventListener("change", onImportCSV);
    document.getElementById("btn-confirm-import").addEventListener("click", confirmImport);
    document.getElementById("btn-cancel-import").addEventListener("click", cancelImport);
    document.getElementById("btn-revert").addEventListener("click", revertToDefault);
    document.getElementById("btn-delete-template").addEventListener("click", deleteTemplate);
  }

  // ---- Template Selection ----
  function onTemplateChange() {
    selectedTemplateId = templateSelect.value;
    cancelImport();
    closeCreateDialog();

    btnClone.disabled = !selectedTemplateId;

    if (!selectedTemplateId) {
      templateInfo.style.display = "none";
      actionsCard.style.display = "none";
      contentsCard.style.display = "none";
      assignCard.style.display = "none";
      return;
    }

    const tpl = getEffectiveTemplate(selectedTemplateId);
    if (!tpl) return;

    // Stats
    const totalItems = getTotalItemCount(tpl);
    const farmsUsing = WIND_FARMS.filter(f => getFarmTemplateId(f.id) === selectedTemplateId);

    document.getElementById("info-drawers").textContent = tpl.drawers.length;
    document.getElementById("info-items").textContent = totalItems;
    document.getElementById("info-farms").textContent = farmsUsing.length;
    document.getElementById("info-farms-list").textContent = farmsUsing.length
      ? "Used by: " + farmsUsing.map(f => f.name).join(", ")
      : "Not assigned to any farm yet.";

    // Custom badge + delete button
    const isCustom = !!getCustomTemplate(selectedTemplateId);
    const isBuiltIn = !!TOOLKIT_TEMPLATES[selectedTemplateId];
    const customBadge = document.getElementById("info-custom-badge");
    customBadge.style.display = isCustom ? "" : "none";
    document.getElementById("btn-revert").style.display = (isCustom && isBuiltIn) ? "" : "none";
    document.getElementById("btn-delete-template").style.display = (isCustom && !isBuiltIn) ? "" : "none";

    templateInfo.style.display = "";
    actionsCard.style.display = "";
    contentsCard.style.display = "";
    assignCard.style.display = "";

    renderContents(tpl);
    renderFarmAssignments();
  }

  // ---- Create / Clone Dialog ----
  function openCreateDialog(isClone) {
    cloneSourceId = isClone ? selectedTemplateId : null;
    document.getElementById("create-dialog-title").textContent = isClone
      ? `Clone "${selectedTemplateId}"`
      : "Create New Template";
    document.getElementById("new-template-id").value = isClone ? selectedTemplateId + "_COPY" : "";
    const sourceTpl = isClone ? getEffectiveTemplate(selectedTemplateId) : null;
    document.getElementById("new-template-name").value = sourceTpl ? sourceTpl.name + " (Copy)" : "";
    document.getElementById("new-template-trolley").value = sourceTpl ? sourceTpl.trolley : "Bato Trolley";
    createDialog.style.display = "";
  }

  function closeCreateDialog() {
    createDialog.style.display = "none";
    cloneSourceId = null;
  }

  function confirmCreate() {
    const id = document.getElementById("new-template-id").value.trim().toUpperCase().replace(/\s+/g, "_");
    const name = document.getElementById("new-template-name").value.trim();
    const trolley = document.getElementById("new-template-trolley").value.trim();

    if (!id) { alert("Template ID is required."); return; }
    if (!name) { alert("Display name is required."); return; }
    if (getEffectiveTemplate(id)) { alert(`Template "${id}" already exists. Choose a different ID.`); return; }

    let drawers;
    if (cloneSourceId) {
      const source = getEffectiveTemplate(cloneSourceId);
      drawers = JSON.parse(JSON.stringify(source.drawers)); // deep copy
    } else {
      drawers = []; // empty, user will import CSV/JSON
    }

    saveCustomTemplate(id, { name, trolley, drawers });
    closeCreateDialog();
    populateTemplateSelect();
    templateSelect.value = id;
    selectedTemplateId = id;
    onTemplateChange();
    showToast(cloneSourceId ? `Cloned as "${id}"` : `Created "${id}" — import a CSV or JSON to add items.`);
  }

  // ---- Delete custom-only template ----
  function deleteTemplate() {
    if (!selectedTemplateId) return;
    const isBuiltIn = !!TOOLKIT_TEMPLATES[selectedTemplateId];
    if (isBuiltIn) { alert("Cannot delete a built-in template. Use 'Revert to Default' instead."); return; }

    // Check if any farms are assigned
    const farmsUsing = WIND_FARMS.filter(f => getFarmTemplateId(f.id) === selectedTemplateId);
    if (farmsUsing.length > 0) {
      if (!confirm(`"${selectedTemplateId}" is used by ${farmsUsing.length} farm(s): ${farmsUsing.map(f => f.name).join(", ")}.\nThey will revert to V236_STANDARD. Continue?`)) return;
      for (const farm of farmsUsing) {
        setFarmTemplateAssignment(farm.id, null);
      }
    } else {
      if (!confirm(`Delete custom template "${selectedTemplateId}"?`)) return;
    }

    deleteCustomTemplate(selectedTemplateId);
    selectedTemplateId = null;
    templateSelect.value = "";
    populateTemplateSelect();
    onTemplateChange();
    showToast("Template deleted.");
  }

  // ---- Farm Assignments ----
  function renderFarmAssignments() {
    const container = document.getElementById("farm-assignments");
    let html = "";

    // Group farms by region
    const regions = {};
    for (const farm of WIND_FARMS) {
      if (!regions[farm.region]) regions[farm.region] = [];
      regions[farm.region].push(farm);
    }

    for (const [region, farms] of Object.entries(regions)) {
      html += `<div style="font-weight: 600; font-size: 13px; color: var(--vestas-blue); margin: 12px 0 4px;">${region}</div>`;
      for (const farm of farms) {
        const currentTplId = getFarmTemplateId(farm.id);
        const isAssigned = currentTplId === selectedTemplateId;
        html += `
          <label style="display: flex; align-items: center; gap: 8px; padding: 6px 0; cursor: pointer;">
            <input type="checkbox" data-farm="${farm.id}" ${isAssigned ? "checked" : ""} class="farm-assign-cb">
            <span>${farm.name}</span>
            <span style="font-size: 12px; color: var(--vestas-gray);">(${farm.country}, ${farm.wtgType})</span>
            ${currentTplId !== selectedTemplateId && currentTplId !== "V236_STANDARD" ? `<span style="font-size: 11px; color: var(--vestas-blue);">currently: ${currentTplId}</span>` : ""}
          </label>
        `;
      }
    }

    container.innerHTML = html;

    // Bind checkbox changes
    container.querySelectorAll(".farm-assign-cb").forEach(cb => {
      cb.addEventListener("change", function () {
        const farmId = this.dataset.farm;
        if (this.checked) {
          setFarmTemplateAssignment(farmId, selectedTemplateId);
        } else {
          setFarmTemplateAssignment(farmId, null); // revert to default
        }
        // Update stats
        const farmsUsing = WIND_FARMS.filter(f => getFarmTemplateId(f.id) === selectedTemplateId);
        document.getElementById("info-farms").textContent = farmsUsing.length;
        document.getElementById("info-farms-list").textContent = farmsUsing.length
          ? "Used by: " + farmsUsing.map(f => f.name).join(", ")
          : "Not assigned to any farm yet.";
      });
    });
  }

  // ---- Render Template Contents ----
  function renderContents(tpl) {
    if (!tpl.drawers || tpl.drawers.length === 0) {
      templateContents.innerHTML = `<p style="color: var(--vestas-gray); text-align: center; padding: 24px;">This template has no items yet. Import a CSV or JSON to populate it.</p>`;
      return;
    }

    let html = `<p style="margin-bottom: 12px; font-weight: 600; color: var(--vestas-navy);">${tpl.name} — ${tpl.trolley}</p>`;

    for (const drawer of tpl.drawers) {
      const itemCount = drawer.groups.reduce((sum, g) => sum + g.items.length, 0);
      html += `
        <div class="tool-group" style="margin-bottom: 12px;">
          <div class="tool-group-header">
            <h3>${drawer.name} — ${drawer.description || ""}</h3>
            <span class="group-count">${itemCount} items</span>
          </div>
      `;
      for (const group of drawer.groups) {
        html += `<div style="padding: 4px 0 4px 8px; font-weight: 600; font-size: 13px; color: var(--vestas-blue);">${group.name} (${group.items.length})</div>`;
        html += `<table style="width: 100%; font-size: 13px; margin-bottom: 8px;">`;
        for (const item of group.items) {
          html += `<tr><td style="padding: 2px 8px; color: var(--vestas-gray); width: 80px;">${item.id}</td><td style="padding: 2px 4px;">${item.name}</td></tr>`;
        }
        html += `</table>`;
      }
      html += `</div>`;
    }

    templateContents.innerHTML = html;
  }

  // ---- Export JSON ----
  function exportJSON() {
    const tpl = getEffectiveTemplate(selectedTemplateId);
    if (!tpl) return;
    const blob = new Blob([JSON.stringify(tpl, null, 2)], { type: "application/json" });
    download(blob, `${selectedTemplateId}.json`);
  }

  // ---- Export CSV ----
  function exportCSV() {
    const tpl = getEffectiveTemplate(selectedTemplateId);
    if (!tpl) return;

    const rows = [["Drawer", "Drawer Name", "Description", "Group", "Item ID", "Item Name"]];
    for (const drawer of tpl.drawers) {
      for (const group of drawer.groups) {
        for (const item of group.items) {
          rows.push([drawer.id, drawer.name, drawer.description || "", group.name, item.id, item.name]);
        }
      }
    }

    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    download(blob, `${selectedTemplateId}.csv`);
  }

  function download(blob, filename) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // ---- Import JSON ----
  function onImportJSON(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
      try {
        const data = JSON.parse(ev.target.result);
        if (!validateTemplate(data)) {
          alert("Invalid template JSON. Must have: name, trolley, drawers[] with groups[] and items[].");
          return;
        }
        pendingImport = data;
        showPreview(data);
      } catch (err) {
        alert("Failed to parse JSON: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  // ---- Import CSV ----
  function onImportCSV(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
      try {
        const data = parseCSVToTemplate(ev.target.result);
        if (!data) return;
        pendingImport = data;
        showPreview(data);
      } catch (err) {
        alert("Failed to parse CSV: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function parseCSVToTemplate(csvText) {
    const lines = csvText.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) {
      alert("CSV must have a header row and at least one data row.");
      return null;
    }

    function parseLine(line) {
      const result = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inQuotes) {
          if (ch === '"') {
            if (i + 1 < line.length && line[i + 1] === '"') { current += '"'; i++; }
            else inQuotes = false;
          } else current += ch;
        } else {
          if (ch === '"') inQuotes = true;
          else if (ch === ",") { result.push(current.trim()); current = ""; }
          else current += ch;
        }
      }
      result.push(current.trim());
      return result;
    }

    const header = parseLine(lines[0]).map(h => h.toLowerCase());
    const colDrawer = header.findIndex(h => h === "drawer");
    const colDrawerName = header.findIndex(h => h.includes("drawer") && h.includes("name"));
    const colDesc = header.findIndex(h => h.includes("desc"));
    const colGroup = header.findIndex(h => h === "group");
    const colItemId = header.findIndex(h => h.includes("item") && h.includes("id"));
    const colItemName = header.findIndex(h => h.includes("item") && h.includes("name"));

    if (colDrawer < 0 || colGroup < 0 || colItemId < 0 || colItemName < 0) {
      alert("CSV must have columns: Drawer, Group, Item ID, Item Name.\nOptional: Drawer Name, Description.");
      return null;
    }

    const drawersMap = {};
    for (let i = 1; i < lines.length; i++) {
      const cols = parseLine(lines[i]);
      if (cols.length < Math.max(colDrawer, colGroup, colItemId, colItemName) + 1) continue;

      const drawerId = parseInt(cols[colDrawer], 10);
      if (isNaN(drawerId)) continue;

      const drawerName = colDrawerName >= 0 ? cols[colDrawerName] : `Drawer ${drawerId}`;
      const desc = colDesc >= 0 ? cols[colDesc] : "";
      const groupName = cols[colGroup];
      const itemId = cols[colItemId];
      const itemName = cols[colItemName];

      if (!drawersMap[drawerId]) {
        drawersMap[drawerId] = { id: drawerId, name: drawerName, description: desc, groupsMap: {} };
      }
      const d = drawersMap[drawerId];
      if (!d.groupsMap[groupName]) {
        d.groupsMap[groupName] = { name: groupName, items: [] };
      }
      d.groupsMap[groupName].items.push({ id: itemId, name: itemName });
    }

    const drawers = Object.values(drawersMap)
      .sort((a, b) => a.id - b.id)
      .map(d => ({
        id: d.id,
        name: d.name,
        description: d.description,
        groups: Object.values(d.groupsMap)
      }));

    if (drawers.length === 0) {
      alert("No valid rows found in CSV.");
      return null;
    }

    const existing = getEffectiveTemplate(selectedTemplateId);
    return {
      name: existing ? existing.name : selectedTemplateId,
      trolley: existing ? existing.trolley : "Custom Trolley",
      drawers: drawers
    };
  }

  // ---- Validation ----
  function validateTemplate(data) {
    if (!data || !data.name || !Array.isArray(data.drawers)) return false;
    for (const drawer of data.drawers) {
      if (drawer.id == null || !Array.isArray(drawer.groups)) return false;
      for (const group of drawer.groups) {
        if (!group.name || !Array.isArray(group.items)) return false;
        for (const item of group.items) {
          if (!item.id || !item.name) return false;
        }
      }
    }
    return true;
  }

  // ---- Preview ----
  function showPreview(tpl) {
    const totalItems = getTotalItemCount(tpl);
    const current = getEffectiveTemplate(selectedTemplateId);
    const currentCount = current ? getTotalItemCount(current) : 0;
    const diff = totalItems - currentCount;
    const diffText = diff === 0 ? "same count" : (diff > 0 ? `+${diff} items` : `${diff} items`);

    document.getElementById("preview-summary").innerHTML = `
      <p><strong>${tpl.name || selectedTemplateId}</strong> — ${tpl.drawers.length} drawers, ${totalItems} items (${diffText} vs current)</p>
    `;

    let html = `<table class="data-table" style="font-size: 13px;"><thead><tr><th>Drawer</th><th>Group</th><th>Item ID</th><th>Item Name</th></tr></thead><tbody>`;
    let rowCount = 0;
    for (const drawer of tpl.drawers) {
      for (const group of drawer.groups) {
        for (const item of group.items) {
          if (rowCount < 50) {
            html += `<tr><td>${drawer.name}</td><td>${group.name}</td><td>${item.id}</td><td>${item.name}</td></tr>`;
          }
          rowCount++;
        }
      }
    }
    if (rowCount > 50) {
      html += `<tr><td colspan="4" style="text-align:center; color: var(--vestas-gray);">... and ${rowCount - 50} more items</td></tr>`;
    }
    html += `</tbody></table>`;
    document.getElementById("preview-table-wrap").innerHTML = html;

    importPreview.style.display = "";
  }

  // ---- Confirm / Cancel Import ----
  function confirmImport() {
    if (!pendingImport || !selectedTemplateId) return;
    saveCustomTemplate(selectedTemplateId, pendingImport);
    pendingImport = null;
    importPreview.style.display = "none";
    populateTemplateSelect();
    templateSelect.value = selectedTemplateId;
    onTemplateChange();
    showToast("Template updated successfully!");
  }

  function cancelImport() {
    pendingImport = null;
    importPreview.style.display = "none";
  }

  // ---- Revert to Default ----
  function revertToDefault() {
    if (!selectedTemplateId) return;
    if (!confirm(`Revert "${selectedTemplateId}" to the built-in default? Custom changes will be lost.`)) return;
    deleteCustomTemplate(selectedTemplateId);
    populateTemplateSelect();
    templateSelect.value = selectedTemplateId;
    onTemplateChange();
    showToast("Reverted to default.");
  }

  // ---- Toast ----
  function showToast(message) {
    const existing = document.querySelector(".toast-msg");
    if (existing) existing.remove();
    const toast = document.createElement("div");
    toast.className = "toast-msg";
    toast.textContent = message;
    toast.style.cssText = "position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: var(--vestas-navy); color: white; padding: 12px 24px; border-radius: 8px; font-size: 14px; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.2);";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // ---- Start ----
  init();
})();
