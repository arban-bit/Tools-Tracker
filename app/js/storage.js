// Storage abstraction layer for Toolkit Tracker
// MVP: uses localStorage. Future: replace with SharePoint Lists API.

const Storage = {
  // ---- Reports (technician submissions) ----

  getReports() {
    const data = localStorage.getItem("toolkit-reports");
    return data ? JSON.parse(data) : [];
  },

  saveReport(report) {
    const reports = this.getReports();
    report.id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
    report.timestamp = new Date().toISOString();
    reports.push(report);
    localStorage.setItem("toolkit-reports", JSON.stringify(reports));
    return report;
  },

  // ---- Missing Items (aggregated from reports) ----

  getMissingItems() {
    const data = localStorage.getItem("toolkit-missing-items");
    return data ? JSON.parse(data) : [];
  },

  saveMissingItems(items) {
    localStorage.setItem("toolkit-missing-items", JSON.stringify(items));
  },

  // Process a report into the missing items database
  processReport(report) {
    const missingItems = this.getMissingItems();
    const now = report.timestamp || new Date().toISOString();

    for (const item of report.missingItems) {
      // Check if this item is already missing for this toolkit
      const existing = missingItems.find(
        m => m.toolkitId === report.toolkitId && m.itemId === item.id && m.status !== "restocked"
      );

      if (!existing) {
        missingItems.push({
          id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2),
          farmId: report.farmId || "",
          farmName: report.farmName || "",
          toolkitId: report.toolkitId,
          turbineId: report.turbineId,
          itemId: item.id,
          itemName: item.name,
          drawer: item.drawer,
          drawerName: item.drawerName,
          group: item.group,
          reportedBy: report.technicianName,
          reportedAt: now,
          status: "missing", // missing | ordered | restocked
          orderedAt: null,
          restockedAt: null,
          restockedBy: null
        });
      }
    }

    // Mark items as restocked if they were previously missing but now present
    for (const mi of missingItems) {
      if (mi.toolkitId === report.toolkitId && mi.status !== "restocked") {
        const stillMissing = report.missingItems.find(item => item.id === mi.itemId);
        if (!stillMissing) {
          mi.status = "restocked";
          mi.restockedAt = now;
          mi.restockedBy = report.technicianName;
        }
      }
    }

    this.saveMissingItems(missingItems);
  },

  // ---- Status updates (stockkeeper) ----

  updateItemStatus(itemId, status) {
    const items = this.getMissingItems();
    const item = items.find(i => i.id === itemId);
    if (item) {
      item.status = status;
      if (status === "ordered") item.orderedAt = new Date().toISOString();
      if (status === "restocked") item.restockedAt = new Date().toISOString();
      this.saveMissingItems(items);
    }
    return item;
  },

  // ---- Export / Import ----

  exportData() {
    return JSON.stringify({
      reports: this.getReports(),
      missingItems: this.getMissingItems(),
      exportedAt: new Date().toISOString()
    }, null, 2);
  },

  importData(jsonString) {
    const data = JSON.parse(jsonString);
    if (data.reports) {
      const existing = this.getReports();
      const existingIds = new Set(existing.map(r => r.id));
      const newReports = data.reports.filter(r => !existingIds.has(r.id));
      localStorage.setItem("toolkit-reports", JSON.stringify([...existing, ...newReports]));
    }
    if (data.missingItems) {
      const existing = this.getMissingItems();
      const existingIds = new Set(existing.map(i => i.id));
      const newItems = data.missingItems.filter(i => !existingIds.has(i.id));
      localStorage.setItem("toolkit-missing-items", JSON.stringify([...existing, ...newItems]));
    }
  },

  exportCSV() {
    const items = this.getMissingItems();
    if (items.length === 0) return "";

    const headers = ["Wind Farm", "Farm ID", "Turbine", "Toolkit", "Drawer", "Group", "Item", "Status", "Reported By", "Reported At", "Ordered At", "Restocked At", "Restocked By"];
    const rows = items.map(i => [
      i.farmName || "",
      i.farmId || "",
      i.turbineId,
      i.toolkitId,
      i.drawerName,
      i.group,
      i.itemName,
      i.status,
      i.reportedBy,
      i.reportedAt ? new Date(i.reportedAt).toLocaleString() : "",
      i.orderedAt ? new Date(i.orderedAt).toLocaleString() : "",
      i.restockedAt ? new Date(i.restockedAt).toLocaleString() : "",
      i.restockedBy || ""
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    return csvContent;
  },

  // ---- Clear (for development) ----
  clearAll() {
    localStorage.removeItem("toolkit-reports");
    localStorage.removeItem("toolkit-missing-items");
  }
};
