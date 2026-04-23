// Toolkit Checker - Main Application Logic

(function () {
  "use strict";

  // ---- State ----
  let currentTurbine = null;
  let technicianName = "";
  let currentDrawer = 1;
  // Track item status: key = item id, value = true (present) / false (missing)
  const itemStatus = {};

  // ---- URL Params (from QR code) ----
  const params = new URLSearchParams(window.location.search);
  const qrTurbineId = params.get("turbine");

  // ---- DOM References ----
  const screenLogin = document.getElementById("screen-login");
  const screenChecklist = document.getElementById("screen-checklist");
  const screenSuccess = document.getElementById("screen-success");
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
    populateTurbineSelect();
    initAllItemsPresent();
    bindEvents();

    // If QR code provided turbine ID, pre-select it
    if (qrTurbineId) {
      turbineSelect.value = qrTurbineId;
      validateLoginForm();
    }
  }

  function populateTurbineSelect() {
    for (const t of TURBINE_LIST) {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = `${t.name} (${t.toolkitId})`;
      turbineSelect.appendChild(opt);
    }
  }

  function initAllItemsPresent() {
    for (const drawer of TOOLKIT_DATA.drawers) {
      for (const group of drawer.groups) {
        for (const item of group.items) {
          itemStatus[item.id] = true; // all present by default
        }
      }
    }
  }

  function bindEvents() {
    turbineSelect.addEventListener("change", validateLoginForm);
    techNameInput.addEventListener("input", validateLoginForm);
    btnStart.addEventListener("click", startChecklist);
    btnSubmit.addEventListener("click", showConfirmModal);
    btnConfirmSubmit.addEventListener("click", submitReport);
    document.getElementById("btn-new-check").addEventListener("click", resetApp);
  }

  function validateLoginForm() {
    const turbineOk = turbineSelect.value !== "";
    const nameOk = techNameInput.value.trim().length >= 2;
    btnStart.disabled = !(turbineOk && nameOk);
  }

  // ---- Start Checklist ----
  function startChecklist() {
    currentTurbine = TURBINE_LIST.find(t => t.id === turbineSelect.value);
    technicianName = techNameInput.value.trim();

    if (!currentTurbine || !technicianName) return;

    // Populate header
    document.getElementById("turbine-badge").textContent = currentTurbine.id;
    document.getElementById("tech-display").textContent = technicianName;
    document.getElementById("toolkit-display").textContent = currentTurbine.toolkitId;
    document.getElementById("total-items-display").textContent = getTotalItemCount();

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
    for (const drawer of TOOLKIT_DATA.drawers) {
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
    const drawer = TOOLKIT_DATA.drawers.find(d => d.id === drawerId);
    if (!drawer) return;

    let html = `
      <div class="fade-in">
        <div style="padding: 12px 0 4px;">
          <h2 style="font-size: 18px; color: var(--vestas-navy);">${drawer.name}</h2>
          <p style="font-size: 13px; color: var(--vestas-gray); margin-top: 2px;">${drawer.description}</p>
        </div>

        <div class="toggle-all-row">
          <span>Quick Actions</span>
          <div>
            <button onclick="markAllDrawer(${drawerId}, true)">✓ All Present</button>
            <button onclick="markAllDrawer(${drawerId}, false)">✕ All Missing</button>
          </div>
        </div>
    `;

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

    html += `</div>`;
    drawerContent.innerHTML = html;
  }

  // ---- Toggle Item ----
  window.toggleItem = function (itemId) {
    itemStatus[itemId] = !itemStatus[itemId];
    renderDrawerContent(currentDrawer);
    updateTabBadges();
    updateSummary();
  };

  window.markAllDrawer = function (drawerId, present) {
    const drawer = TOOLKIT_DATA.drawers.find(d => d.id === drawerId);
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
    for (const drawer of TOOLKIT_DATA.drawers) {
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
    const total = getTotalItemCount();
    const present = Object.values(itemStatus).filter(v => v).length;
    const missing = total - present;

    document.getElementById("stat-present").textContent = present;
    document.getElementById("stat-missing").textContent = missing;
    document.getElementById("stat-total").textContent = total;
  }

  // ---- Submit ----
  function showConfirmModal() {
    const missingItems = getMissingItemsList();
    const total = getTotalItemCount();
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
      turbineId: currentTurbine.id,
      toolkitId: currentTurbine.toolkitId,
      technicianName: technicianName,
      totalItems: getTotalItemCount(),
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
    for (const drawer of TOOLKIT_DATA.drawers) {
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
    currentTurbine = null;
    technicianName = "";
    currentDrawer = 1;
    initAllItemsPresent();

    // Reset form
    turbineSelect.value = qrTurbineId || "";
    techNameInput.value = "";
    btnStart.disabled = true;

    // Show login
    screenSuccess.style.display = "none";
    screenChecklist.style.display = "none";
    screenLogin.style.display = "";
  }

  // ---- Boot ----
  init();
})();
