// Hotspot Editor — full-screen tool to draw/edit drawer photo hotspots.
//
// Public API:
//   HotspotEditor.open(templateId, drawerId, onSaved)
//
// Persistence: writes the modified template via saveCustomTemplate (auto-promotes
// built-in templates to a custom override on save).

const HotspotEditor = (function () {
  "use strict";

  // ---- State ----
  let templateId = null;
  let drawerId = null;
  let workingTemplate = null;     // deep-cloned template being edited
  let drawer = null;              // reference into workingTemplate.drawers
  let onSavedCb = null;
  let selectedIdx = -1;           // index into drawer.hotspots
  let activeItemId = null;        // next-drawn rectangle gets this itemId
  let mode = "idle";              // idle | drawing | moving | resize-nw | resize-ne | resize-sw | resize-se
  let dragStartNorm = null;       // {x, y} where current drag started (normalized)
  let originalRect = null;        // copy of rect at drag start

  // ---- DOM refs (lazy) ----
  let overlay, frame, img, layer, sidebar, pathInput, hint, deleteBtn;

  function ensureDom() {
    if (overlay) return;
    overlay = document.getElementById("hotspot-editor-overlay");
    if (!overlay) return;
    frame = overlay.querySelector(".he-frame");
    img = overlay.querySelector(".he-img");
    layer = overlay.querySelector(".he-layer");
    sidebar = overlay.querySelector(".he-items");
    pathInput = overlay.querySelector(".he-path");
    hint = overlay.querySelector(".he-hint");
    deleteBtn = overlay.querySelector(".he-delete");

    overlay.querySelector(".he-cancel").addEventListener("click", close);
    overlay.querySelector(".he-save").addEventListener("click", save);
    deleteBtn.addEventListener("click", deleteSelected);
    pathInput.addEventListener("change", onPathChange);
    pathInput.addEventListener("input", onPathChange);

    // Mouse handlers on the image frame
    frame.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Touch support — mirror via pointer events
    frame.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onMouseUp);

    document.addEventListener("keydown", onKeyDown);
  }

  // ---- Public ----
  function open(tplId, dId, cb) {
    ensureDom();
    if (!overlay) {
      alert("Hotspot editor not available on this page.");
      return;
    }
    const tpl = getEffectiveTemplate(tplId);
    if (!tpl) { alert("Template not found: " + tplId); return; }

    templateId = tplId;
    drawerId = dId;
    onSavedCb = cb || null;

    // Deep clone so cancel discards changes cleanly
    workingTemplate = JSON.parse(JSON.stringify(tpl));
    drawer = workingTemplate.drawers.find(function (d) { return d.id === dId; });
    if (!drawer) { alert("Drawer not found: " + dId); return; }
    if (!Array.isArray(drawer.hotspots)) drawer.hotspots = [];
    if (!drawer.imageUrl) drawer.imageUrl = "img/drawers/d" + dId + ".jpg";

    selectedIdx = -1;
    activeItemId = null;
    mode = "idle";

    // Title + path
    overlay.querySelector(".he-title").textContent =
      "Hotspots — " + drawer.name + (drawer.description ? " · " + drawer.description : "");
    pathInput.value = drawer.imageUrl;
    img.src = drawer.imageUrl;

    overlay.classList.add("active");
    document.body.style.overflow = "hidden";

    renderItems();
    renderRects();
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove("active");
    document.body.style.overflow = "";
    workingTemplate = null;
    drawer = null;
    templateId = null;
  }

  function save() {
    if (!templateId || !workingTemplate) return;
    saveCustomTemplate(templateId, workingTemplate);
    const cb = onSavedCb;
    close();
    if (cb) cb(templateId, drawerId);
  }

  // ---- Rendering ----
  function renderItems() {
    const allItems = [];
    for (const g of (drawer.groups || [])) {
      for (const it of (g.items || [])) {
        allItems.push({ id: it.id, name: it.name, group: g.name });
      }
    }
    const mapped = new Set(drawer.hotspots.map(function (h) { return h.itemId; }));
    let html = "";
    let lastGroup = null;
    for (const it of allItems) {
      if (it.group !== lastGroup) {
        html += '<div class="he-item-group">' + esc(it.group) + '</div>';
        lastGroup = it.group;
      }
      const isMapped = mapped.has(it.id);
      const isActive = activeItemId === it.id;
      const isSelected = selectedIdx >= 0 && drawer.hotspots[selectedIdx] && drawer.hotspots[selectedIdx].itemId === it.id;
      const cls = "he-item" + (isMapped ? " mapped" : " unmapped") +
        (isActive ? " active" : "") + (isSelected ? " selected" : "");
      html +=
        '<button type="button" class="' + cls + '" data-id="' + esc(it.id) + '">' +
        '<span class="he-item-mark">' + (isMapped ? "✓" : "○") + '</span>' +
        '<span class="he-item-name">' + esc(it.name) + '</span>' +
        '<span class="he-item-id">' + esc(it.id) + '</span>' +
        '</button>';
    }
    sidebar.innerHTML = html;
    sidebar.querySelectorAll(".he-item").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const id = btn.dataset.id;
        const idx = drawer.hotspots.findIndex(function (h) { return h.itemId === id; });
        if (idx >= 0) {
          selectedIdx = idx;
          activeItemId = null;
        } else {
          activeItemId = id;
          selectedIdx = -1;
        }
        renderItems();
        renderRects();
        updateHint();
      });
    });
    updateCounts();
    updateHint();
  }

  function renderRects() {
    let html = "";
    drawer.hotspots.forEach(function (h, i) {
      const sel = i === selectedIdx;
      const cls = "he-rect" + (sel ? " selected" : "");
      const handles = sel
        ? '<span class="he-h nw" data-h="nw"></span>' +
          '<span class="he-h ne" data-h="ne"></span>' +
          '<span class="he-h sw" data-h="sw"></span>' +
          '<span class="he-h se" data-h="se"></span>'
        : "";
      html +=
        '<div class="' + cls + '" data-idx="' + i + '"' +
        ' style="left:' + (h.x * 100).toFixed(3) + '%;top:' + (h.y * 100).toFixed(3) + '%;' +
        'width:' + (h.w * 100).toFixed(3) + '%;height:' + (h.h * 100).toFixed(3) + '%;">' +
        '<span class="he-rect-label">' + esc(h.itemId) + '</span>' +
        handles +
        '</div>';
    });
    layer.innerHTML = html;
    deleteBtn.disabled = selectedIdx < 0;
  }

  function updateCounts() {
    const total = (drawer.groups || []).reduce(function (n, g) { return n + (g.items || []).length; }, 0);
    const mapped = drawer.hotspots.length;
    overlay.querySelector(".he-counts").textContent = mapped + " / " + total + " items mapped";
  }

  function updateHint() {
    let msg;
    if (selectedIdx >= 0) {
      const h = drawer.hotspots[selectedIdx];
      msg = "Selected: " + h.itemId + ". Drag to move, drag corners to resize, Delete to remove.";
    } else if (activeItemId) {
      msg = "Drag a rectangle on the photo to place: " + activeItemId;
    } else {
      msg = "Click an item on the right, then drag a rectangle on the photo. Click an existing rectangle to edit.";
    }
    hint.textContent = msg;
  }

  // ---- Mouse / Touch ----
  function clientToNorm(clientX, clientY) {
    const r = img.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return null;
    return {
      x: Math.max(0, Math.min(1, (clientX - r.left) / r.width)),
      y: Math.max(0, Math.min(1, (clientY - r.top) / r.height))
    };
  }

  function onMouseDown(e) {
    handleDown(e.clientX, e.clientY, e.target, e);
  }
  function onTouchStart(e) {
    if (!e.touches || e.touches.length === 0) return;
    e.preventDefault();
    const t = e.touches[0];
    handleDown(t.clientX, t.clientY, document.elementFromPoint(t.clientX, t.clientY), e);
  }
  function onTouchMove(e) {
    if (!e.touches || e.touches.length === 0) return;
    if (mode !== "idle") e.preventDefault();
    const t = e.touches[0];
    handleMove(t.clientX, t.clientY);
  }
  function onMouseMove(e) {
    handleMove(e.clientX, e.clientY);
  }

  function handleDown(cx, cy, target, ev) {
    if (!frame.contains(target)) return;
    const p = clientToNorm(cx, cy);
    if (!p) return;

    // 1. Resize handle click?
    const handle = target.closest && target.closest(".he-h");
    if (handle && selectedIdx >= 0) {
      mode = "resize-" + handle.dataset.h;
      dragStartNorm = p;
      originalRect = Object.assign({}, drawer.hotspots[selectedIdx]);
      ev && ev.preventDefault && ev.preventDefault();
      return;
    }

    // 2. Existing rectangle click? (select + move)
    const rectEl = target.closest && target.closest(".he-rect");
    if (rectEl) {
      const idx = parseInt(rectEl.dataset.idx, 10);
      selectedIdx = idx;
      activeItemId = null;
      renderItems();
      renderRects();
      mode = "moving";
      dragStartNorm = p;
      originalRect = Object.assign({}, drawer.hotspots[idx]);
      ev && ev.preventDefault && ev.preventDefault();
      return;
    }

    // 3. Empty area click — if an active item is set, start drawing
    if (activeItemId) {
      mode = "drawing";
      dragStartNorm = p;
      // Start with a zero-size rect; will grow as user drags
      drawer.hotspots.push({ itemId: activeItemId, x: p.x, y: p.y, w: 0.001, h: 0.001 });
      selectedIdx = drawer.hotspots.length - 1;
      activeItemId = null; // consume the active item
      renderItems();
      renderRects();
      ev && ev.preventDefault && ev.preventDefault();
      return;
    }

    // 4. Empty area click without active item — deselect
    if (selectedIdx >= 0) {
      selectedIdx = -1;
      renderItems();
      renderRects();
    }
  }

  function handleMove(cx, cy) {
    if (mode === "idle") return;
    const p = clientToNorm(cx, cy);
    if (!p) return;
    const h = drawer.hotspots[selectedIdx];
    if (!h) return;

    if (mode === "drawing") {
      const x = Math.min(dragStartNorm.x, p.x);
      const y = Math.min(dragStartNorm.y, p.y);
      const w = Math.abs(p.x - dragStartNorm.x);
      const hgt = Math.abs(p.y - dragStartNorm.y);
      h.x = x; h.y = y; h.w = Math.max(0.005, w); h.h = Math.max(0.005, hgt);
    } else if (mode === "moving") {
      const dx = p.x - dragStartNorm.x;
      const dy = p.y - dragStartNorm.y;
      h.x = clamp(originalRect.x + dx, 0, 1 - originalRect.w);
      h.y = clamp(originalRect.y + dy, 0, 1 - originalRect.h);
    } else if (mode.startsWith("resize-")) {
      const corner = mode.slice(7);
      let x1 = originalRect.x;
      let y1 = originalRect.y;
      let x2 = originalRect.x + originalRect.w;
      let y2 = originalRect.y + originalRect.h;
      if (corner === "nw") { x1 = p.x; y1 = p.y; }
      else if (corner === "ne") { x2 = p.x; y1 = p.y; }
      else if (corner === "sw") { x1 = p.x; y2 = p.y; }
      else if (corner === "se") { x2 = p.x; y2 = p.y; }
      h.x = Math.min(x1, x2);
      h.y = Math.min(y1, y2);
      h.w = Math.max(0.005, Math.abs(x2 - x1));
      h.h = Math.max(0.005, Math.abs(y2 - y1));
    }
    renderRects();
  }

  function onMouseUp() {
    if (mode !== "idle") {
      mode = "idle";
      dragStartNorm = null;
      originalRect = null;
      updateHint();
    }
  }

  function deleteSelected() {
    if (selectedIdx < 0) return;
    drawer.hotspots.splice(selectedIdx, 1);
    selectedIdx = -1;
    renderItems();
    renderRects();
  }

  function onKeyDown(e) {
    if (!overlay.classList.contains("active")) return;
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if ((e.key === "Delete" || e.key === "Backspace") && selectedIdx >= 0 &&
               !["INPUT", "TEXTAREA"].includes((e.target || {}).tagName)) {
      e.preventDefault();
      deleteSelected();
    }
  }

  function onPathChange() {
    const v = pathInput.value.trim();
    drawer.imageUrl = v;
    img.src = v || "";
  }

  // ---- Helpers ----
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  return { open: open, close: close };
})();
