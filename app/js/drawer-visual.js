// Drawer Visual Mode - photo with clickable rectangle hotspots
//
// Public API:
//   DrawerVisual.hasVisual(drawer)
//     -> true if drawer has imageUrl AND a non-empty hotspots array
//
//   DrawerVisual.render(container, drawer, getStatus, onToggle)
//     container:  DOM element to fill
//     drawer:     drawer object from the toolkit template
//     getStatus:  function(itemId) -> true if present, false if missing
//     onToggle:   function(itemId) called when user taps a hotspot

const DrawerVisual = (function () {
  "use strict";

  function hasVisual(drawer) {
    // Visual mode is offered when there are hotspots to interact with.
    // The image path defaults to the convention img/drawers/d{id}.jpg, so an
    // explicit imageUrl is no longer required.
    return !!(drawer && Array.isArray(drawer.hotspots) && drawer.hotspots.length > 0);
  }

  function imagePath(drawer) {
    if (typeof effectiveDrawerImagePath === "function") return effectiveDrawerImagePath(drawer);
    return drawer.imageUrl || ("img/drawers/d" + drawer.id + ".jpg");
  }

  function findItem(drawer, itemId) {
    for (const g of drawer.groups || []) {
      for (const it of g.items || []) {
        if (it.id === itemId) return it;
      }
    }
    return null;
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  function render(container, drawer, getStatus, onToggle) {
    if (!hasVisual(drawer)) {
      container.innerHTML =
        '<div class="dv-empty">' +
        '<p>No photo configured for this drawer.</p>' +
        '<p style="font-size: 12px; margin-top: 4px;">Add an image at <code>img/drawers/d' +
        drawer.id + '.jpg</code> and define hotspots in <code>toolkit-data.js</code>.</p>' +
        '</div>';
      return;
    }

    // Track unmapped items so they're never silently lost
    const mapped = new Set(drawer.hotspots.map(function (h) { return h.itemId; }));
    const unmapped = [];
    for (const g of drawer.groups || []) {
      for (const it of g.items || []) {
        if (!mapped.has(it.id)) unmapped.push(it);
      }
    }

    let hotspotsHtml = "";
    for (const h of drawer.hotspots) {
      const item = findItem(drawer, h.itemId);
      const present = !!getStatus(h.itemId);
      const label = item ? item.name : h.itemId;
      const cls = "dv-hotspot " + (present ? "present" : "missing");
      hotspotsHtml +=
        '<button type="button" class="' + cls + '" data-item="' + esc(h.itemId) + '"' +
        ' style="left:' + (h.x * 100).toFixed(3) + '%;top:' + (h.y * 100).toFixed(3) + '%;' +
        'width:' + (h.w * 100).toFixed(3) + '%;height:' + (h.h * 100).toFixed(3) + '%;"' +
        ' title="' + esc(label) + (present ? "" : " — MISSING") + '"' +
        ' aria-label="' + esc(label) + (present ? " present" : " missing") + '">' +
        '<span class="dv-marker">' + (present ? "✓" : "✕") + '</span>' +
        '</button>';
    }

    let unmappedHtml = "";
    if (unmapped.length > 0) {
      unmappedHtml =
        '<div class="dv-unmapped">' +
        '<div class="dv-unmapped-title">Items not on photo (' + unmapped.length + ')</div>' +
        '<div class="dv-unmapped-list">';
      for (const it of unmapped) {
        const present = !!getStatus(it.id);
        unmappedHtml +=
          '<button type="button" class="dv-unmapped-item ' + (present ? "present" : "missing") + '"' +
          ' data-item="' + esc(it.id) + '">' +
          '<span class="dv-marker">' + (present ? "✓" : "✕") + '</span>' +
          '<span>' + esc(it.name) + '</span>' +
          '</button>';
      }
      unmappedHtml += '</div></div>';
    }

    const url = imagePath(drawer);
    container.innerHTML =
      '<div class="drawer-visual">' +
      '<div class="dv-frame">' +
      '<img src="' + esc(url) + '" alt="' + esc(drawer.name) + '" class="dv-img"' +
      ' onerror="this.parentNode.innerHTML=\'<div class=\\\'dv-error\\\'>Photo not found at ' +
      esc(url) + '</div>\'">' +
      '<div class="dv-overlay">' + hotspotsHtml + '</div>' +
      '</div>' +
      unmappedHtml +
      '</div>';

    // Bind clicks
    const handler = function (e) {
      const btn = e.currentTarget;
      const id = btn.dataset.item;
      if (id && typeof onToggle === "function") onToggle(id);
    };
    container.querySelectorAll(".dv-hotspot, .dv-unmapped-item").forEach(function (btn) {
      btn.addEventListener("click", handler);
    });
  }

  return { hasVisual: hasVisual, render: render };
})();
