// Toolkit Manager - Logic for viewing, exporting, and importing toolkit templates

(function () {
  "use strict";

  const templateSelect = document.getElementById("template-select");
  const templateInfo = document.getElementById("template-info");
  const actionsCard = document.getElementById("actions-card");
  const contentsCard = document.getElementById("contents-card");
  const templateContents = document.getElementById("template-contents");
  const importPreview = document.getElementById("import-preview");

  let selectedTemplateId = null;
  let pendingImport = null; // staged template before confirm

  // ---- Init ----
  function init() {
    populateTemplateSelect();
    bindEvents();
  }

  function populateTemplateSelect() {
    templateSelect.innerHTML = '<option value="">— Select a template —</option>';
    const ids = getAllTemplateIds();
    for (const id of ids) {
      const opt = document.createElement("option");
      opt.value = id;
      const custom = getCustomTemplate(id);
      opt.textContent = id + (custom ? " (customised)" : "");
      templateSelect.appendChild(opt);
    }
  }

  function bindEvents() {
    templateSelect.addEventListener("change", onTemplateChange);
    document.getElementById("btn-export-json").addEventListener("click", exportJSON);
    document.getElementById("btn-export-csv").addEventListener("click", exportCSV);
    document.getElementById("import-json").addEventListener("change", onImportJSON);
    document.getElementById("import-csv").addEventListener("change", onImportCSV);
    document.getElementById("btn-confirm-import").addEventListener("click", confirmImport);
    document.getElementById("btn-cancel-import").addEventListener("click", cancelImport);
    document.getElementById("btn-revert").addEventListener("click", revertToDefault);
  }

  // ---- Template Selection ----
  function onTemplateChange() {
    selectedTemplateId = templateSelect.value;
    cancelImport();

    if (!selectedTemplateId) {
      templateInfo.style.display = "none";
      actionsCard.style.display = "none";
      contentsCard.style.display = "none";
      return;
    }

    const tpl = getEffectiveTemplate(selectedTemplateId);
    if (!tpl) return;

    // Stats
    const totalItems = getTotalItemCount(tpl);
    const farmsUsing = WIND_FARMS.filter(f => f.toolkit === selectedTemplateId);

    document.getElementById("info-drawers").textContent = tpl.drawers.length;
    document.getElementById("info-items").textContent = totalItems;
    document.getElementById("info-farms").textContent = farmsUsing.length;
    document.getElementById("info-farms-list").textContent = farmsUsing.length
      ? "Used by: " + farmsUsing.map(f => f.name).join(", ")
      : "Not assigned to any farm";

    // Custom badge
    const isCustom = !!getCustomTemplate(selectedTemplateId);
    document.getElementById("info-custom-badge").style.display = isCustom ? "" : "none";

    templateInfo.style.display = "";
    actionsCard.style.display = "";
    contentsCard.style.display = "";

    renderContents(tpl);
  }

  // ---- Render Template Contents ----
  function renderContents(tpl) {
    let html = `<p style="margin-bottom: 12px; font-weight: 600; color: var(--vestas-navy);">${tpl.name} — ${tpl.trolley}</p>`;

    for (const drawer of tpl.drawers) {
      const itemCount = drawer.groups.reduce((sum, g) => sum + g.items.length, 0);
      html += `
        <div class="tool-group" style="margin-bottom: 12px;">
          <div class="tool-group-header">
            <h3>${drawer.name} — ${drawer.description}</h3>
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
          rows.push([drawer.id, drawer.name, drawer.description, group.name, item.id, item.name]);
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

    // Parse CSV rows (handle quoted fields)
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
          } else {
            current += ch;
          }
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
    // Expected columns: drawer, drawer name, description, group, item id, item name
    const colDrawer = header.findIndex(h => h === "drawer");
    const colDrawerName = header.findIndex(h => h.includes("drawer") && h.includes("name"));
    const colDesc = header.findIndex(h => h.includes("desc"));
    const colGroup = header.findIndex(h => h === "group");
    const colItemId = header.findIndex(h => h.includes("item") && h.includes("id"));
    const colItemName = header.findIndex(h => h.includes("item") && h.includes("name"));

    if (colDrawer < 0 || colGroup < 0 || colItemId < 0 || colItemName < 0) {
      alert("CSV must have columns: Drawer, Group, Item ID, Item Name. Optional: Drawer Name, Description.");
      return null;
    }

    // Build template structure
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

    // Convert to template
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

    // Use existing template's name/trolley if available
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
      if (!drawer.id || !Array.isArray(drawer.groups)) return false;
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

    // Simple table preview
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
    showToast("Template saved successfully!");
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
    const existing = document.querySelector(".toast");
    if (existing) existing.remove();
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    toast.style.cssText = "position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: var(--vestas-navy); color: white; padding: 12px 24px; border-radius: 8px; font-size: 14px; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.2);";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // ---- Start ----
  init();
})();
