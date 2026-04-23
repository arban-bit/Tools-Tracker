// Stockkeeper Dashboard Logic

(function () {
  "use strict";

  const filterTurbine = document.getElementById("filter-turbine");
  const filterStatus = document.getElementById("filter-status");
  const filterDrawer = document.getElementById("filter-drawer");
  const filterSearch = document.getElementById("filter-search");
  const itemsTbody = document.getElementById("items-tbody");
  const reportsTbody = document.getElementById("reports-tbody");
  const emptyState = document.getElementById("empty-state");
  const reportsEmpty = document.getElementById("reports-empty");

  function init() {
    populateTurbineFilter();
    bindEvents();
    refresh();
  }

  function populateTurbineFilter() {
    for (const t of TURBINE_LIST) {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = t.id;
      filterTurbine.appendChild(opt);
    }
  }

  function bindEvents() {
    filterTurbine.addEventListener("change", renderItems);
    filterStatus.addEventListener("change", renderItems);
    filterDrawer.addEventListener("change", renderItems);
    filterSearch.addEventListener("input", renderItems);

    document.getElementById("btn-export-csv").addEventListener("click", exportCSV);
    document.getElementById("btn-export-json").addEventListener("click", exportJSON);
    document.getElementById("btn-import").addEventListener("change", importJSON);
    document.getElementById("btn-clear-data").addEventListener("click", clearData);
  }

  function refresh() {
    updateStats();
    renderItems();
    renderReports();
    document.getElementById("last-updated").textContent = "Updated: " + new Date().toLocaleTimeString();
  }

  // ---- Stats ----
  function updateStats() {
    const items = Storage.getMissingItems();
    const missing = items.filter(i => i.status === "missing").length;
    const ordered = items.filter(i => i.status === "ordered").length;
    const restocked = items.filter(i => i.status === "restocked").length;
    const turbines = new Set(items.filter(i => i.status !== "restocked").map(i => i.turbineId)).size;

    document.getElementById("stat-total-missing").textContent = missing;
    document.getElementById("stat-total-ordered").textContent = ordered;
    document.getElementById("stat-total-restocked").textContent = restocked;
    document.getElementById("stat-turbines-affected").textContent = turbines;
  }

  // ---- Items Table ----
  function renderItems() {
    const items = Storage.getMissingItems();
    const turbine = filterTurbine.value;
    const status = filterStatus.value;
    const drawer = filterDrawer.value;
    const search = filterSearch.value.toLowerCase().trim();

    const filtered = items.filter(i => {
      if (turbine && i.turbineId !== turbine) return false;
      if (status && i.status !== status) return false;
      if (drawer && i.drawerName !== drawer) return false;
      if (search && !i.itemName.toLowerCase().includes(search)) return false;
      return true;
    });

    // Sort: missing first, then ordered, then restocked; newest first within each
    filtered.sort((a, b) => {
      const statusOrder = { missing: 0, ordered: 1, restocked: 2 };
      const diff = statusOrder[a.status] - statusOrder[b.status];
      if (diff !== 0) return diff;
      return new Date(b.reportedAt) - new Date(a.reportedAt);
    });

    if (filtered.length === 0) {
      itemsTbody.innerHTML = "";
      emptyState.style.display = "";
      return;
    }

    emptyState.style.display = "none";

    itemsTbody.innerHTML = filtered.map(item => `
      <tr>
        <td><strong>${escapeHtml(item.turbineId)}</strong></td>
        <td>${escapeHtml(item.drawerName)}</td>
        <td>${escapeHtml(item.itemName)}<br><small style="color: var(--vestas-gray);">${escapeHtml(item.group)}</small></td>
        <td><span class="status-badge ${item.status}">${item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span></td>
        <td>${escapeHtml(item.reportedBy)}</td>
        <td><small>${formatDate(item.reportedAt)}</small></td>
        <td>
          ${item.status === "missing" ? `<button class="btn btn-sm btn-outline" onclick="markOrdered('${item.id}')">Mark Ordered</button>` : ""}
          ${item.status === "ordered" ? `<button class="btn btn-sm btn-success" onclick="markRestocked('${item.id}')">Mark Restocked</button>` : ""}
          ${item.status === "restocked" ? `<span style="color: var(--vestas-green); font-size: 12px;">✓ Done</span>` : ""}
        </td>
      </tr>
    `).join("");
  }

  // ---- Reports Table ----
  function renderReports() {
    const reports = Storage.getReports().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (reports.length === 0) {
      reportsTbody.innerHTML = "";
      reportsEmpty.style.display = "";
      return;
    }

    reportsEmpty.style.display = "none";

    reportsTbody.innerHTML = reports.map(r => `
      <tr>
        <td><small>${formatDate(r.timestamp)}</small></td>
        <td><strong>${escapeHtml(r.turbineId)}</strong></td>
        <td>${escapeHtml(r.technicianName)}</td>
        <td><span style="color: var(--vestas-green); font-weight: 600;">${r.presentCount}</span> / ${r.totalItems}</td>
        <td>${r.missingItems.length > 0 ? `<span style="color: var(--vestas-red); font-weight: 600;">${r.missingItems.length}</span>` : '<span style="color: var(--vestas-green);">0</span>'}</td>
      </tr>
    `).join("");
  }

  // ---- Actions ----
  window.markOrdered = function (id) {
    Storage.updateItemStatus(id, "ordered");
    refresh();
  };

  window.markRestocked = function (id) {
    Storage.updateItemStatus(id, "restocked");
    refresh();
  };

  // ---- Export ----
  function exportCSV() {
    const csv = Storage.exportCSV();
    if (!csv) {
      alert("No data to export.");
      return;
    }
    downloadFile(csv, `toolkit-missing-items-${dateStamp()}.csv`, "text/csv");
  }

  function exportJSON() {
    const json = Storage.exportData();
    downloadFile(json, `toolkit-data-${dateStamp()}.json`, "application/json");
  }

  function importJSON(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        Storage.importData(event.target.result);
        refresh();
        alert("Data imported successfully!");
      } catch (err) {
        alert("Error importing data: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function clearData() {
    if (confirm("Are you sure you want to clear ALL data? This cannot be undone.")) {
      Storage.clearAll();
      refresh();
    }
  }

  // ---- Helpers ----
  function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
      " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }

  function dateStamp() {
    return new Date().toISOString().slice(0, 10);
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
  }

  // ---- Boot ----
  init();
})();
