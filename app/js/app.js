// Toolkit Checker - Main Application Logic

(function () {
  "use strict";

  // ---- State ----
  let currentFarm = null;
  let currentTurbine = null;
  let currentTurbineList = [];
  let technicianName = "";
  let currentDrawer = 1;
  let activeToolkit = TOOLKIT_DATA; // switches per farm
  let viewMode = "list"; // "visual" or "list" — auto-switches to "visual" when drawer has a photo
  const itemStatus = {};

  // ---- URL Params (from QR code) ----
  const params = new URLSearchParams(window.location.search);
  const qrFarmId = params.get("farm");
  const qrTurbineId = params.get("turbine");

  // ---- DOM References ----
  const screenLogin = document.getElementById("screen-login");
  const screenChecklist = document.getElementById("screen-checklist");
  const screenSuccess = document.getElementById("screen-success");
  const farmSelect = document.getElementById("farm-select");
  const turbineSelect = document.getElementById("turbine-select");
  const techNameInput = document.getElementById("tech-name");
  const btnStart = document.getElementById("btn-start");
  const drawerTabs = document.getElementById("drawer-tabs");
  const drawerContent = document.getElementById("drawer-content");
  const btnSubmit = document.getElementById("btn-submit");
  const modalConfirm = document.getElementById("modal-confirm");
  const modalConfirmBody = document.getElementById("modal-confirm-body");
  const btnConfirmSubmit = document.getElementById("btn-confirm-submit");

  // ---- Initialize ----
  function init() {
    populateFarmSelect();
    initAllItemsPresent();
    bindEvents();

    // If QR code provided farm + turbine, pre-select them
    if (qrFarmId) {
      farmSelect.value = qrFarmId;
      onFarmChange();
      if (qrTurbineId) {
        turbineSelect.value = qrTurbineId;
      }
      validateLoginForm();
    }
  }

  function populateFarmSelect() {
    // Group farms by region
    const regions = {};
    for (const farm of getAllWindFarms()) {
      if (!regions[farm.region]) regions[farm.region] = [];
      regions[farm.region].push(farm);
    }
    for (const [region, farms] of Object.entries(regions)) {
      const group = document.createElement("optgroup");
      group.label = region;
      for (const farm of farms) {
        const opt = document.createElement("option");
        opt.value = farm.id;
        opt.textContent = `${farm.name} — ${farm.country} (${farm.wtgType}, ${farm.capacityMW} MW)`;
        group.appendChild(opt);
      }
      farmSelect.appendChild(group);
    }
  }

  function onFarmChange() {
    const farmId = farmSelect.value;
    currentFarm = getWindFarm(farmId);

    // Switch toolkit template based on selected farm
    activeToolkit = currentFarm ? getToolkitForFarm(currentFarm.id) : TOOLKIT_DATA;
    initAllItemsPresent();

    // Reset turbine select
    turbineSelect.innerHTML = '<option value="">— Select turbine —</option>';

    if (currentFarm) {
      currentTurbineList = getTurbineListForFarm(currentFarm.id);
      for (const t of currentTurbineList) {
        const opt = document.createElement("option");
        opt.value = t.id;
        opt.textContent = `${t.name} (${t.toolkitId})`;
        turbineSelect.appendChild(opt);
      }
      turbineSelect.disabled = false;
    } else {
      currentTurbineList = [];
      turbineSelect.disabled = true;
    }

    validateLoginForm();
  }

  function initAllItemsPresent() {
    // Clear previous state (needed when switching farms/toolkits)
    for (const key of Object.keys(itemStatus)) delete itemStatus[key];
    for (const drawer of activeToolkit.drawers) {
      for (const group of drawer.groups) {
        for (const item of group.items) {
          itemStatus[item.id] = true; // all present by default
        }
      }
    }
  }

  function bindEvents() {
    farmSelect.addEventListener("change", onFarmChange);
    turbineSelect.addEventListener("change", validateLoginForm);
    techNameInput.addEventListener("input", validateLoginForm);
    btnStart.addEventListener("click", startChecklist);
    btnSubmit.addEventListener("click", showConfirmModal);
    btnConfirmSubmit.addEventListener("click", submitReport);
    document.getElementById("btn-new-check").addEventListener("click", resetApp);
    const btnCancel = document.getElementById("btn-cancel-check");
    if (btnCancel) btnCancel.addEventListener("click", cancelChecklist);

    // Selected-items panel toggle
    const spToggle = document.getElementById("selected-panel-toggle");
    if (spToggle) {
      spToggle.addEventListener("click", () => {
        const body = document.getElementById("selected-panel-body");
        const caret = spToggle.querySelector(".sp-caret");
        const expanded = spToggle.getAttribute("aria-expanded") === "true";
        spToggle.setAttribute("aria-expanded", String(!expanded));
        body.hidden = expanded;
        if (caret) caret.textContent = expanded ? "▸" : "▾";
      });
    }
  }

  function cancelChecklist() {
    if (!confirm("Cancel this toolkit check? Any unsaved changes will be lost.")) return;
    resetApp();
  }

  function validateLoginForm() {
    const farmOk = farmSelect.value !== "";
    const turbineOk = turbineSelect.value !== "";
    const nameOk = techNameInput.value.trim().length >= 2;
    btnStart.disabled = !(farmOk && turbineOk && nameOk);
  }

  // ---- Start Checklist ----
  function startChecklist() {
    currentTurbine = currentTurbineList.find(t => t.id === turbineSelect.value);
    technicianName = techNameInput.value.trim();

    if (!currentFarm || !currentTurbine || !technicianName) return;

    // Populate header
    document.getElementById("turbine-badge").textContent = currentTurbine.id;
    document.getElementById("farm-display").textContent = currentFarm.name;
    document.getElementById("tech-display").textContent = technicianName;
    document.getElementById("toolkit-display").textContent = currentTurbine.toolkitId;
    document.getElementById("total-items-display").textContent = getTotalItemCount(activeToolkit);

    // Build tabs and content
    buildDrawerTabs();
    switchDrawer(1);
    updateSummary();

    // Show checklist screen
    screenLogin.style.display = "none";
    screenChecklist.style.display = "";
  }

  // ---- Drawer Tabs ----
  function buildDrawerTabs() {
    drawerTabs.innerHTML = "";
    for (const drawer of activeToolkit.drawers) {
      const tab = document.createElement("button");
      tab.className = "drawer-tab" + (drawer.id === currentDrawer ? " active" : "");
      tab.dataset.drawer = drawer.id;
      tab.innerHTML = `
        <div>D${drawer.id}</div>
        <div class="tab-badge complete" id="tab-badge-${drawer.id}">
          ${getDrawerItemCount(drawer)}/${getDrawerItemCount(drawer)}
        </div>
      `;
      tab.addEventListener("click", () => switchDrawer(drawer.id));
      drawerTabs.appendChild(tab);
    }
  }

  function switchDrawer(drawerId) {
    currentDrawer = drawerId;

    // Update tab active states
    document.querySelectorAll(".drawer-tab").forEach(tab => {
      tab.classList.toggle("active", parseInt(tab.dataset.drawer) === drawerId);
    });

    renderDrawerContent(drawerId);
  }

  // ---- Render Drawer Content ----
  function renderDrawerContent(drawerId) {
    const drawer = activeToolkit.drawers.find(d => d.id === drawerId);
    if (!drawer) return;

    const visualAvailable = typeof DrawerVisual !== "undefined" && DrawerVisual.hasVisual(drawer);

    // Auto-switch to visual the first time we land on a drawer that has a photo,
    // unless the user has explicitly chosen list mode for this session.
    if (visualAvailable && viewMode === "list" && !window.__userPickedView) {
      viewMode = "visual";
    }
    if (!visualAvailable && viewMode === "visual") {
      viewMode = "list";
    }

    const visualBtnAttrs = visualAvailable ? "" : "disabled";
    const visualBtnTitle = visualAvailable ? "Photo view" : "No photo for this drawer";

    let html = `
      <div class="fade-in">
        <div class="drawer-header-row">
          <div>
            <h2 style="font-size: 18px; color: var(--vestas-navy);">${drawer.name}</h2>
            <p style="font-size: 13px; color: var(--vestas-gray); margin-top: 2px;">${drawer.description}</p>
          </div>
          <div class="view-toggle" role="tablist" aria-label="View mode">
            <button data-view="visual" class="${viewMode === "visual" ? "active" : ""}" ${visualBtnAttrs} title="${visualBtnTitle}">📷 Photo</button>
            <button data-view="list" class="${viewMode === "list" ? "active" : ""}" title="List view">📋 List</button>
          </div>
        </div>

        <div class="toggle-all-row">
          <span>Quick Actions</span>
          <div>
            <button onclick="markAllDrawer(${drawerId}, true)">✓ All Present</button>
            <button onclick="markAllDrawer(${drawerId}, false)">✕ All Missing</button>
          </div>
        </div>
        <div id="drawer-body"></div>
      </div>
    `;

    drawerContent.innerHTML = html;

    // Bind view-toggle buttons
    drawerContent.querySelectorAll(".view-toggle button[data-view]").forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.disabled) return;
        viewMode = btn.dataset.view;
        window.__userPickedView = true;
        renderDrawerContent(currentDrawer);
      });
    });

    const body = drawerContent.querySelector("#drawer-body");

    if (viewMode === "visual" && visualAvailable) {
      DrawerVisual.render(
        body,
        drawer,
        id => !!itemStatus[id],
        id => window.toggleItem(id)
      );
    } else {
      renderListView(body, drawer);
    }
  }

  function renderListView(container, drawer) {
    let html = "";
    for (const group of drawer.groups) {
      const presentCount = group.items.filter(i => itemStatus[i.id]).length;
      html += `
        <div class="tool-group">
          <div class="tool-group-header">
            <h3>${group.name}</h3>
            <span class="group-count">${presentCount}/${group.items.length}</span>
          </div>
      `;

      for (const item of group.items) {
        const isPresent = itemStatus[item.id];
        html += `
          <div class="tool-item ${isPresent ? "present" : "missing"}" data-item="${item.id}" onclick="toggleItem('${item.id}')">
            <div class="check-box">${isPresent ? "✓" : "✕"}</div>
            <span class="tool-name">${item.name}</span>
            <span class="tool-status">${isPresent ? "OK" : "MISSING"}</span>
          </div>
        `;
      }

      html += `</div>`;
    }
    container.innerHTML = html;
  }

  // ---- Toggle Item ----
  window.toggleItem = function (itemId) {
    itemStatus[itemId] = !itemStatus[itemId];
    renderDrawerContent(currentDrawer);
    updateTabBadges();
    updateSummary();
  };

  window.markAllDrawer = function (drawerId, present) {
    const drawer = activeToolkit.drawers.find(d => d.id === drawerId);
    if (!drawer) return;
    for (const group of drawer.groups) {
      for (const item of group.items) {
        itemStatus[item.id] = present;
      }
    }
    renderDrawerContent(drawerId);
    updateTabBadges();
    updateSummary();
  };

  // ---- Tab Badges ----
  function updateTabBadges() {
    for (const drawer of activeToolkit.drawers) {
      const total = getDrawerItemCount(drawer);
      const present = getDrawerPresentCount(drawer);
      const badge = document.getElementById(`tab-badge-${drawer.id}`);
      if (badge) {
        badge.textContent = `${present}/${total}`;
        badge.className = "tab-badge " + (present === total ? "complete" : "has-missing");
      }
    }
  }

  // ---- Summary ----
  function updateSummary() {
    const total = getTotalItemCount(activeToolkit);
    const present = Object.values(itemStatus).filter(v => v).length;
    const missing = total - present;

    document.getElementById("stat-present").textContent = present;
    document.getElementById("stat-missing").textContent = missing;
    document.getElementById("stat-total").textContent = total;

    renderSelectedPanel();
  }

  // ---- Selected Items Panel ----
  function renderSelectedPanel() {
    const body = document.getElementById("selected-panel-body");
    const countEl = document.getElementById("selected-panel-count");
    if (!body || !countEl || !activeToolkit) return;

    let total = 0;
    let html = "";
    for (const drawer of activeToolkit.drawers) {
      const present = [];
      for (const group of drawer.groups) {
        for (const item of group.items) {
          if (itemStatus[item.id]) present.push(item);
        }
      }
      if (present.length === 0) continue;
      total += present.length;
      html +=
        '<div class="sp-drawer">' +
          '<div class="sp-drawer-head">' +
            '<span>' + escapeHtml(drawer.name) + '</span>' +
            '<span class="sp-drawer-count">' + present.length + '</span>' +
          '</div>' +
          '<ul class="sp-list">' +
            present.map(it =>
              '<li><span class="sp-check">✓</span><span class="sp-name">' + escapeHtml(it.name) + '</span><span class="sp-id">' + escapeHtml(it.id) + '</span></li>'
            ).join("") +
          '</ul>' +
        '</div>';
    }

    countEl.textContent = total;
    if (total === 0) {
      body.innerHTML = '<div class="sp-empty">No items selected yet. Tap a tool above to mark it present.</div>';
    } else {
      body.innerHTML = html;
    }
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }

  // ---- Submit ----
  function showConfirmModal() {
    const missingItems = getMissingItemsList();
    const total = getTotalItemCount(activeToolkit);
    const present = Object.values(itemStatus).filter(v => v).length;

    let html = "";
    if (missingItems.length === 0) {
      html = `
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 48px; margin-bottom: 12px;">✅</div>
          <h3 style="color: var(--vestas-green); margin-bottom: 8px;">All Tools Present!</h3>
          <p style="color: var(--vestas-gray);">All ${total} items are accounted for in ${currentTurbine.id}.</p>
        </div>
      `;
    } else {
      html = `
        <div style="margin-bottom: 16px;">
          <p><strong>${present}</strong> of <strong>${total}</strong> items present. 
          <strong style="color: var(--vestas-red);">${missingItems.length} missing.</strong></p>
        </div>
        <div style="font-weight: 600; margin-bottom: 8px;">Missing Items:</div>
        <ul class="missing-list">
          ${missingItems.map(i => `<li>${i.drawerName} — ${i.name}</li>`).join("")}
        </ul>
      `;
    }

    modalConfirmBody.innerHTML = html;
    modalConfirm.classList.add("active");
  }

  window.closeModal = function (id) {
    document.getElementById(id).classList.remove("active");
  };

  function submitReport() {
    const missingItems = getMissingItemsList();

    const report = {
      farmId: currentFarm.id,
      farmName: currentFarm.name,
      turbineId: currentTurbine.id,
      toolkitId: currentTurbine.toolkitId,
      toolkitTemplate: currentFarm.toolkit,
      technicianName: technicianName,
      totalItems: getTotalItemCount(activeToolkit),
      presentCount: Object.values(itemStatus).filter(v => v).length,
      missingItems: missingItems
    };

    // Save report
    Storage.saveReport(report);

    // Process into missing items database
    Storage.processReport(report);

    // Close modal
    closeModal("modal-confirm");

    // Show success screen
    showSuccessScreen(report);
  }

  function showSuccessScreen(report) {
    screenChecklist.style.display = "none";
    screenSuccess.style.display = "";

    // Update dashboard link with current farm
    document.getElementById("link-dashboard").href = `dashboard.html?farm=${encodeURIComponent(report.farmId)}`;

    const missing = report.missingItems.length;
    const title = missing === 0 ? "All Clear! ✅" : "Report Submitted";
    const message = missing === 0
      ? `All ${report.totalItems} tools verified present in ${report.turbineId}.`
      : `${missing} missing item${missing > 1 ? "s" : ""} reported for ${report.turbineId}. The stockkeeper has been notified.`;

    document.getElementById("success-title").textContent = title;
    document.getElementById("success-message").textContent = message;

    let detailsHtml = `
      <div class="card" style="max-width: 400px; margin: 0 auto; text-align: left;">
        <div class="card-body">
          <div style="margin-bottom: 8px;"><strong>Wind Farm:</strong> ${report.farmName}</div>
          <div style="margin-bottom: 8px;"><strong>Turbine:</strong> ${report.turbineId}</div>
          <div style="margin-bottom: 8px;"><strong>Toolkit:</strong> ${report.toolkitId}</div>
          <div style="margin-bottom: 8px;"><strong>Technician:</strong> ${report.technicianName}</div>
          <div style="margin-bottom: 8px;"><strong>Present:</strong> ${report.presentCount} / ${report.totalItems}</div>
          <div><strong>Missing:</strong> ${missing}</div>
    `;

    if (missing > 0) {
      detailsHtml += `<ul class="missing-list" style="margin-top: 12px;">`;
      for (const item of report.missingItems) {
        detailsHtml += `<li>${item.drawerName} — ${item.name}</li>`;
      }
      detailsHtml += `</ul>`;
    }

    detailsHtml += `</div></div>`;
    document.getElementById("success-details").innerHTML = detailsHtml;
  }

  // ---- Helpers ----
  function getMissingItemsList() {
    const missing = [];
    for (const drawer of activeToolkit.drawers) {
      for (const group of drawer.groups) {
        for (const item of group.items) {
          if (!itemStatus[item.id]) {
            missing.push({
              ...item,
              drawer: drawer.id,
              drawerName: drawer.name,
              group: group.name
            });
          }
        }
      }
    }
    return missing;
  }

  function getDrawerItemCount(drawer) {
    let count = 0;
    for (const g of drawer.groups) count += g.items.length;
    return count;
  }

  function getDrawerPresentCount(drawer) {
    let count = 0;
    for (const g of drawer.groups) {
      for (const item of g.items) {
        if (itemStatus[item.id]) count++;
      }
    }
    return count;
  }

  function resetApp() {
    // Reset state
    currentFarm = null;
    currentTurbine = null;
    currentTurbineList = [];
    technicianName = "";
    currentDrawer = 1;
    activeToolkit = TOOLKIT_DATA;
    initAllItemsPresent();

    // Reset form
    farmSelect.value = qrFarmId || "";
    turbineSelect.innerHTML = '<option value="">— Select turbine —</option>';
    turbineSelect.disabled = true;
    techNameInput.value = "";
    btnStart.disabled = true;

    // Re-apply QR code pre-selection if present
    if (qrFarmId) {
      farmSelect.value = qrFarmId;
      onFarmChange();
      if (qrTurbineId) {
        turbineSelect.value = qrTurbineId;
      }
      validateLoginForm();
    }

    // Show login
    screenSuccess.style.display = "none";
    screenChecklist.style.display = "none";
    screenLogin.style.display = "";
  }

  // ---- Boot ----
  init();
})();
