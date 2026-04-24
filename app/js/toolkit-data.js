// V236 Nacelle Toolkit - Complete Inventory Data
// Source: V236 Nacelle Toolkit.xlsx

// =========================================================
// Toolkit Templates — each wind farm references a template ID.
// To add a new variant: copy a template, give it a new key,
// edit the drawers/items, and assign the key to the farm(s).
// =========================================================

const TOOLKIT_TEMPLATES = {};

TOOLKIT_TEMPLATES["V236_STANDARD"] = {
  name: "V236 Nacelle Toolkit",
  trolley: "Bato Trolley",
  drawers: [
    {
      id: 1,
      name: "Drawer 1",
      description: "Sockets, Extensions & Ratchets",
      groups: [
        {
          name: 'Sockets 1/2" Hexagonal',
          items: [
            { id: "d1-001", name: 'Socket short 1/2" x 10mm Hexagonal' },
            { id: "d1-002", name: 'Socket short 1/2" x 11mm Hexagonal' },
            { id: "d1-003", name: 'Socket short 1/2" x 12mm Hexagonal' },
            { id: "d1-004", name: 'Socket short 1/2" x 13mm Hexagonal' },
            { id: "d1-005", name: 'Socket short 1/2" x 14mm Hexagonal' },
            { id: "d1-006", name: 'Socket short 1/2" x 15mm Hexagonal' },
            { id: "d1-007", name: 'Socket short 1/2" x 16mm Hexagonal' },
            { id: "d1-008", name: 'Socket short 1/2" x 17mm Hexagonal' },
            { id: "d1-009", name: 'Socket short 1/2" x 18mm Hexagonal' },
            { id: "d1-010", name: 'Socket short 1/2" x 19mm Hexagonal' },
            { id: "d1-011", name: 'Socket short 1/2" x 21mm Hexagonal' },
            { id: "d1-012", name: 'Socket short 1/2" x 22mm Hexagonal' },
            { id: "d1-013", name: 'Socket short 1/2" x 24mm Hexagonal' },
            { id: "d1-014", name: 'Socket short 1/2" x 27mm Hexagonal' },
            { id: "d1-015", name: 'Socket short 1/2" x 30mm Hexagonal' },
            { id: "d1-016", name: 'Socket short 1/2" x 32mm Hexagonal' },
            { id: "d1-017", name: 'Socket short 1/2" x 34mm Hexagonal' },
            { id: "d1-018", name: 'Socket short 1/2" x 36mm Hexagonal' }
          ]
        },
        {
          name: 'Extensions & Accessories 1/2"',
          items: [
            { id: "d1-019", name: 'Extension 1/2" x 125mm long' },
            { id: "d1-020", name: 'Extension 1/2" x 250mm long' },
            { id: "d1-021", name: 'Universal joint 1/2"' },
            { id: "d1-022", name: 'Ratchet wrench 1/2" 48T' },
            { id: "d1-023", name: 'Adaptor 3/8"F x 1/2"M T-slide' }
          ]
        },
        {
          name: 'Sockets Short 3/8" Hexagonal',
          items: [
            { id: "d1-024", name: 'Socket short 3/8" x 6mm Hexagonal' },
            { id: "d1-025", name: 'Socket short 3/8" x 7mm Hexagonal' },
            { id: "d1-026", name: 'Socket short 3/8" x 8mm Hexagonal' },
            { id: "d1-027", name: 'Socket short 3/8" x 9mm Hexagonal' },
            { id: "d1-028", name: 'Socket short 3/8" x 10mm Hexagonal' },
            { id: "d1-029", name: 'Socket short 3/8" x 11mm Hexagonal' },
            { id: "d1-030", name: 'Socket short 3/8" x 12mm Hexagonal' },
            { id: "d1-031", name: 'Socket short 3/8" x 13mm Hexagonal' },
            { id: "d1-032", name: 'Socket short 3/8" x 14mm Hexagonal' },
            { id: "d1-033", name: 'Socket short 3/8" x 15mm Hexagonal' },
            { id: "d1-034", name: 'Socket short 3/8" x 16mm Hexagonal' },
            { id: "d1-035", name: 'Socket short 3/8" x 17mm Hexagonal' },
            { id: "d1-036", name: 'Socket short 3/8" x 18mm Hexagonal' },
            { id: "d1-037", name: 'Socket short 3/8" x 19mm Hexagonal' },
            { id: "d1-038", name: 'Socket short 3/8" x 20mm Hexagonal' },
            { id: "d1-039", name: 'Socket short 3/8" x 21mm Hexagonal' },
            { id: "d1-040", name: 'Socket short 3/8" x 22mm Hexagonal' },
            { id: "d1-041", name: 'Socket short 3/8" x 24mm Hexagonal' }
          ]
        },
        {
          name: 'Sockets Long 3/8" Hexagonal',
          items: [
            { id: "d1-042", name: 'Socket long 3/8" x 6mm Hexagonal' },
            { id: "d1-043", name: 'Socket long 3/8" x 7mm Hexagonal' },
            { id: "d1-044", name: 'Socket long 3/8" x 8mm Hexagonal' },
            { id: "d1-045", name: 'Socket long 3/8" x 9mm Hexagonal' },
            { id: "d1-046", name: 'Socket long 3/8" x 10mm Hexagonal' },
            { id: "d1-047", name: 'Socket long 3/8" x 11mm Hexagonal' },
            { id: "d1-048", name: 'Socket long 3/8" x 12mm Hexagonal' },
            { id: "d1-049", name: 'Socket long 3/8" x 13mm Hexagonal' },
            { id: "d1-050", name: 'Socket long 3/8" x 14mm Hexagonal' },
            { id: "d1-051", name: 'Socket long 3/8" x 15mm Hexagonal' },
            { id: "d1-052", name: 'Socket long 3/8" x 16mm Hexagonal' },
            { id: "d1-053", name: 'Socket long 3/8" x 17mm Hexagonal' },
            { id: "d1-054", name: 'Socket long 3/8" x 18mm Hexagonal' },
            { id: "d1-055", name: 'Socket long 3/8" x 19mm Hexagonal' }
          ]
        },
        {
          name: 'Extensions & Accessories 3/8"',
          items: [
            { id: "d1-056", name: 'Extension 3/8" x 50mm long' },
            { id: "d1-057", name: 'Extension 3/8" x 100mm long' },
            { id: "d1-058", name: 'Extension 3/8" x 200mm long' },
            { id: "d1-059", name: 'Universal joint 3/8"' },
            { id: "d1-060", name: 'Adapter 1/2"F x 3/8"M T-slide' },
            { id: "d1-061", name: 'Ratchet wrench 3/8" 48T' }
          ]
        }
      ]
    },
    {
      id: 2,
      name: "Drawer 2",
      description: "Pliers, Seegerring & Bit Sockets",
      groups: [
        {
          name: "Pliers",
          items: [
            { id: "d2-001", name: 'Water pump plier 7" / 175mm Quick adjustment' },
            { id: "d2-002", name: 'Water pump plier 10" / 250mm Quick adjustment' },
            { id: "d2-003", name: 'Water pump plier 12" / 300mm Quick adjustment' },
            { id: "d2-004", name: "Pincers 2K 160mm" },
            { id: "d2-005", name: "Pincers 2K 180mm" },
            { id: "d2-006", name: "Snipe nose pliers straight 2K 200mm" },
            { id: "d2-007", name: "Snipe nose pliers curved 2K 200mm" }
          ]
        },
        {
          name: "Seegerring Sets",
          items: [
            { id: "d2-008", name: "Seegerring set J1 12-25mm" },
            { id: "d2-009", name: "Seegerring set J2 19-60mm" },
            { id: "d2-010", name: "Seegerring set A1 12-25mm" },
            { id: "d2-011", name: "Seegerring set A2 19-60mm" }
          ]
        },
        {
          name: 'Bit Sockets 1/2" Hexagonal',
          items: [
            { id: "d2-012", name: 'Bit socket short 1/2" x 5mm Hexagonal' },
            { id: "d2-013", name: 'Bit socket short 1/2" x 6mm Hexagonal' },
            { id: "d2-014", name: 'Bit socket short 1/2" x 7mm Hexagonal' },
            { id: "d2-015", name: 'Bit socket short 1/2" x 8mm Hexagonal' },
            { id: "d2-016", name: 'Bit socket short 1/2" x 9mm Hexagonal' },
            { id: "d2-017", name: 'Bit socket short 1/2" x 10mm Hexagonal' },
            { id: "d2-018", name: 'Bit socket short 1/2" x 12mm Hexagonal' },
            { id: "d2-019", name: 'Bit socket short 1/2" x 14mm Hexagonal' },
            { id: "d2-020", name: 'Bit socket short 1/2" x 17mm Hexagonal' },
            { id: "d2-021", name: 'Bit socket short 1/2" x 19mm Hexagonal' }
          ]
        },
        {
          name: 'Bit Sockets 1/2" Torx',
          items: [
            { id: "d2-022", name: 'Bit socket short 1/2" Torx 20' },
            { id: "d2-023", name: 'Bit socket short 1/2" Torx 25' },
            { id: "d2-024", name: 'Bit socket short 1/2" Torx 27' },
            { id: "d2-025", name: 'Bit socket short 1/2" Torx 30' },
            { id: "d2-026", name: 'Bit socket short 1/2" Torx 40' },
            { id: "d2-027", name: 'Bit socket short 1/2" Torx 45' },
            { id: "d2-028", name: 'Bit socket short 1/2" Torx 50' },
            { id: "d2-029", name: 'Bit socket short 1/2" Torx 55' },
            { id: "d2-030", name: 'Bit socket short 1/2" Torx 60' }
          ]
        },
        {
          name: 'Bit Sockets 1/2" XZN',
          items: [
            { id: "d2-031", name: 'Bit socket short 1/2" XZN M5' },
            { id: "d2-032", name: 'Bit socket short 1/2" XZN M6' },
            { id: "d2-033", name: 'Bit socket short 1/2" XZN M8' },
            { id: "d2-034", name: 'Bit socket short 1/2" XZN M10' },
            { id: "d2-035", name: 'Bit socket short 1/2" XZN M12' },
            { id: "d2-036", name: 'Bit socket short 1/2" XZN M14' },
            { id: "d2-037", name: 'Bit socket short 1/2" XZN M16' },
            { id: "d2-038", name: 'Bit socket short 1/2" XZN M18' }
          ]
        }
      ]
    },
    {
      id: 3,
      name: "Drawer 3",
      description: "Combination Spanners",
      groups: [
        {
          name: "Combination Spanners",
          items: [
            { id: "d3-001", name: "Combination spanner 6mm" },
            { id: "d3-002", name: "Combination spanner 7mm" },
            { id: "d3-003", name: "Combination spanner 8mm" },
            { id: "d3-004", name: "Combination spanner 9mm" },
            { id: "d3-005", name: "Combination spanner 10mm" },
            { id: "d3-006", name: "Combination spanner 11mm" },
            { id: "d3-007", name: "Combination spanner 12mm" },
            { id: "d3-008", name: "Combination spanner 13mm" },
            { id: "d3-009", name: "Combination spanner 14mm" },
            { id: "d3-010", name: "Combination spanner 15mm" },
            { id: "d3-011", name: "Combination spanner 16mm" },
            { id: "d3-012", name: "Combination spanner 17mm" },
            { id: "d3-013", name: "Combination spanner 18mm" },
            { id: "d3-014", name: "Combination spanner 19mm" },
            { id: "d3-015", name: "Combination spanner 20mm" },
            { id: "d3-016", name: "Combination spanner 21mm" },
            { id: "d3-017", name: "Combination spanner 22mm" },
            { id: "d3-018", name: "Combination spanner 24mm" },
            { id: "d3-019", name: "Combination spanner 27mm" },
            { id: "d3-020", name: "Combination spanner 30mm" },
            { id: "d3-021", name: "Combination spanner 32mm" },
            { id: "d3-022", name: "Combination spanner 34mm" },
            { id: "d3-023", name: "Combination spanner 36mm" }
          ]
        }
      ]
    },
    {
      id: 4,
      name: "Drawer 4",
      description: "Screwdrivers & Bit Set",
      groups: [
        {
          name: "Screwdrivers Slot",
          items: [
            { id: "d4-001", name: "Screwdriver slot 3.0 x 75mm" },
            { id: "d4-002", name: "Screwdriver slot 4.0 x 100mm" },
            { id: "d4-003", name: "Screwdriver slot 5.5 x 100mm" },
            { id: "d4-004", name: "Screwdriver slot 6.5 x 150mm" },
            { id: "d4-005", name: "Screwdriver slot 8.0 x 150mm" }
          ]
        },
        {
          name: "Screwdrivers Phillips (PH)",
          items: [
            { id: "d4-006", name: "Screwdriver PH0 x 75mm" },
            { id: "d4-007", name: "Screwdriver PH1 x 75mm" },
            { id: "d4-008", name: "Screwdriver PH2 x 100mm" },
            { id: "d4-009", name: "Screwdriver PH3 x 150mm" }
          ]
        },
        {
          name: "Screwdrivers Pozidriv (PZ)",
          items: [
            { id: "d4-010", name: "Screwdriver PZ1 x 75mm" },
            { id: "d4-011", name: "Screwdriver PZ2 x 100mm" }
          ]
        },
        {
          name: "Screwdrivers Torx",
          items: [
            { id: "d4-012", name: "Screwdriver Torx 10 x 100mm" },
            { id: "d4-013", name: "Screwdriver Torx 15 x 100mm" },
            { id: "d4-014", name: "Screwdriver Torx 20 x 100mm" },
            { id: "d4-015", name: "Screwdriver Torx 25 x 100mm" },
            { id: "d4-016", name: "Screwdriver Torx 27 x 100mm" },
            { id: "d4-017", name: "Screwdriver Torx 30 x 100mm" },
            { id: "d4-018", name: "Screwdriver Torx 40 x 100mm" }
          ]
        },
        {
          name: "Stubby Screwdrivers",
          items: [
            { id: "d4-019", name: "Screwdriver slot 5.5 x 38mm Stubby" },
            { id: "d4-020", name: "Screwdriver PH2 x 38mm Stubby" }
          ]
        },
        {
          name: "Socket Screwdrivers",
          items: [
            { id: "d4-021", name: "Socket screwdriver 7.0 x 125mm" },
            { id: "d4-022", name: "Socket screwdriver 8.0 x 125mm" },
            { id: "d4-023", name: "Socket screwdriver 10.0 x 125mm" }
          ]
        },
        {
          name: "Bit Screwdriver & Set",
          items: [
            { id: "d4-024", name: 'Bit Screwdriver 1/4" x 125mm' },
            { id: "d4-025", name: '1/4" Bit set 100 parts' }
          ]
        }
      ]
    },
    {
      id: 5,
      name: "Drawer 5",
      description: "Hammers, Punches & Ringratchet Wrenches",
      groups: [
        {
          name: "Hammers",
          items: [
            { id: "d5-001", name: "Bench hammer 600gr Glass fibre grip" },
            { id: "d5-002", name: "Sledgehammer 1500gr Glass fibre grip" },
            { id: "d5-003", name: "Nylon hammer 35mm Steel handle with gum grip" }
          ]
        },
        {
          name: "Pin Punches",
          items: [
            { id: "d5-004", name: "Parallel pin punch 3.0mm" },
            { id: "d5-005", name: "Parallel pin punch 4.0mm" },
            { id: "d5-006", name: "Parallel pin punch 5.0mm" },
            { id: "d5-007", name: "Parallel pin punch 6.0mm" },
            { id: "d5-008", name: "Parallel pin punch 8.0mm" }
          ]
        },
        {
          name: "Pin Punches Soft-grip",
          items: [
            { id: "d5-009", name: "Parallel pin punch Soft-grip 6mm" },
            { id: "d5-010", name: "Parallel pin punch Soft-grip 8mm" },
            { id: "d5-011", name: "Parallel pin punch Soft-grip 10mm" }
          ]
        },
        {
          name: "Chisel",
          items: [
            { id: "d5-012", name: "Chisel flat 230x25" }
          ]
        },
        {
          name: "Ringratchet Wrenches",
          items: [
            { id: "d5-013", name: "Ringratchet wrench 8mm" },
            { id: "d5-014", name: "Ringratchet wrench 9mm" },
            { id: "d5-015", name: "Ringratchet wrench 10mm" },
            { id: "d5-016", name: "Ringratchet wrench 11mm" },
            { id: "d5-017", name: "Ringratchet wrench 12mm" },
            { id: "d5-018", name: "Ringratchet wrench 13mm" },
            { id: "d5-019", name: "Ringratchet wrench 14mm" },
            { id: "d5-020", name: "Ringratchet wrench 15mm" },
            { id: "d5-021", name: "Ringratchet wrench 16mm" },
            { id: "d5-022", name: "Ringratchet wrench 17mm" },
            { id: "d5-023", name: "Ringratchet wrench 18mm" },
            { id: "d5-024", name: "Ringratchet wrench 19mm" }
          ]
        }
      ]
    },
    {
      id: 6,
      name: "Drawer 6",
      description: "Files, Shifting Spanners & Pipe Pliers",
      groups: [
        {
          name: "Files",
          items: [
            { id: "d6-001", name: "File round with attach" },
            { id: "d6-002", name: "File square with attach" },
            { id: "d6-003", name: "File triangle with attach" },
            { id: "d6-004", name: "File flat with attach" },
            { id: "d6-005", name: "File half round with attach" }
          ]
        },
        {
          name: "Shifting Spanners",
          items: [
            { id: "d6-006", name: 'Shifting spanner 4" / 100mm' },
            { id: "d6-007", name: 'Shifting spanner 6" / 150mm' },
            { id: "d6-008", name: 'Shifting spanner 8" / 200mm' },
            { id: "d6-009", name: 'Shifting spanner 10" / 250mm' },
            { id: "d6-010", name: 'Shifting spanner 12" / 300mm' },
            { id: "d6-011", name: 'Shifting spanner 15" / 375mm' }
          ]
        },
        {
          name: "Pipe Pliers",
          items: [
            { id: "d6-012", name: 'Pipe pliers 1" 320mm' },
            { id: "d6-013", name: 'Pipe pliers 1.1/2" 425mm' }
          ]
        }
      ]
    }
  ]
};

// Placeholder: V174 farms use the same toolkit until a specific list is provided.
// To customise, replace with a full { name, trolley, drawers: [...] } object.
TOOLKIT_TEMPLATES["V174_STANDARD"] = TOOLKIT_TEMPLATES["V236_STANDARD"];

// Backward-compatible alias (used by pages that don't pick a farm)
const TOOLKIT_DATA = TOOLKIT_TEMPLATES["V236_STANDARD"];

// =========================================================
// Wind Farms Configuration — Source: SGM Sources SharePoint List
// =========================================================
const WIND_FARMS = [
  // ---- Americas (AME) ----
  {
    id: "EW1",
    name: "Empire Wind 1",
    country: "United States",
    region: "AME",
    turbineCount: 54,
    capacityMW: 810,
    wtgType: "V236 Mk0A",
    toolkit: "V236_STANDARD",
    scd: "2026-09-01",
    spNumber: "61793",
    serviceManager: "Steven Gould"
  },
  // ---- Asia Pacific (APAC) ----
  {
    id: "TPC2",
    name: "TPC Phase II",
    country: "Taiwan",
    region: "APAC",
    turbineCount: 31,
    capacityMW: 295,
    wtgType: "V174 Mk3A",
    toolkit: "V174_STANDARD",
    scd: "2025-04-11",
    spNumber: "60987",
    serviceManager: "Mark Challinor"
  },
  {
    id: "FENGMIAO",
    name: "Fengmiao",
    country: "Taiwan",
    region: "APAC",
    turbineCount: 33,
    capacityMW: 495,
    wtgType: "V236 Mk0A",
    toolkit: "V236_STANDARD",
    scd: "2027-09-07",
    spNumber: "61791",
    serviceManager: "Mark Challinor"
  },
  {
    id: "KTG",
    name: "Katagami",
    country: "Japan",
    region: "APAC",
    turbineCount: 21,
    capacityMW: 315,
    wtgType: "V236 Mk0A",
    toolkit: "V236_STANDARD",
    scd: "2028-06-30",
    spNumber: "67067",
    serviceManager: "Mark Challinor"
  },
  // ---- North & Central Europe (NCE) ----
  {
    id: "BALTIC-POWER",
    name: "Baltic Power",
    country: "Poland",
    region: "NCE",
    turbineCount: 76,
    capacityMW: 1140,
    wtgType: "V236 Mk0A",
    toolkit: "V236_STANDARD",
    scd: "2026-03-14",
    spNumber: "61545",
    serviceManager: "Daria Jeziorna"
  },
  {
    id: "NSCA",
    name: "NSCA",
    country: "United Kingdom",
    region: "NCE",
    turbineCount: 44,
    capacityMW: 660,
    wtgType: "V236 Mk0A",
    toolkit: "V236_STANDARD",
    scd: "2026-07-13",
    spNumber: "62783",
    serviceManager: "Henrik Lehmkuhl"
  },
  {
    id: "HE-DREITH",
    name: "He Dreith",
    country: "Germany",
    region: "NCE",
    turbineCount: 64,
    capacityMW: 960,
    wtgType: "V236 Mk0A",
    toolkit: "V236_STANDARD",
    scd: "2025-09-17",
    spNumber: "60423",
    serviceManager: "Sebastian Mügge"
  },
  {
    id: "INCH-CAPE",
    name: "Inch Cape",
    country: "United Kingdom",
    region: "NCE",
    turbineCount: 72,
    capacityMW: 1080,
    wtgType: "V236 Mk0A",
    toolkit: "V236_STANDARD",
    scd: "2026-11-29",
    spNumber: "65087",
    serviceManager: "Kenneth Robertson"
  },
  {
    id: "ORANJEWIND",
    name: "Oranjewind",
    country: "Netherlands",
    region: "NCE",
    turbineCount: 53,
    capacityMW: 795,
    wtgType: "V236 Mk0A",
    toolkit: "V236_STANDARD",
    scd: "2027-03-28",
    spNumber: "66273",
    serviceManager: "Klejda Hoxha"
  },
  {
    id: "NORDLICHT-1",
    name: "Nordlicht 1",
    country: "Germany",
    region: "NCE",
    turbineCount: 68,
    capacityMW: 1020,
    wtgType: "V236 Mk0A",
    toolkit: "V236_STANDARD",
    scd: "2027-07-19",
    spNumber: "64340",
    serviceManager: "Jochen Holling"
  },
  {
    id: "HKW6",
    name: "HKW 6",
    country: "Netherlands",
    region: "NCE",
    turbineCount: 52,
    capacityMW: 780,
    wtgType: "V236 Mk0A",
    toolkit: "V236_STANDARD",
    scd: "2026-06-03",
    spNumber: "65456",
    serviceManager: "Niels Alexandre Visser"
  },
  {
    id: "BALTIC-EAGLE",
    name: "Baltic Eagle",
    country: "Germany",
    region: "NCE",
    turbineCount: 50,
    capacityMW: 475,
    wtgType: "V174 Mk3A",
    toolkit: "V174_STANDARD",
    scd: "2024-04-10",
    spNumber: "60920",
    serviceManager: ""
  }
];

// Generate turbine list for a specific wind farm
function getTurbineListForFarm(farmId) {
  const farm = WIND_FARMS.find(f => f.id === farmId);
  if (!farm) return [];
  return Array.from({ length: farm.turbineCount }, (_, i) => ({
    id: `WTG-${String(i + 1).padStart(2, "0")}`,
    name: `WTG-${String(i + 1).padStart(2, "0")}`,
    toolkitId: `TK-${farmId}-${String(i + 1).padStart(3, "0")}`,
    farmId: farm.id,
    farmName: farm.name
  }));
}

// Legacy compat: default TURBINE_LIST (used if no farm selected)
const TURBINE_LIST = getTurbineListForFarm("BALTIC-POWER");

// Resolve the toolkit template for a given farm
function getToolkitForFarm(farmId) {
  const farm = WIND_FARMS.find(f => f.id === farmId);
  if (!farm) return TOOLKIT_TEMPLATES["V236_STANDARD"];
  return TOOLKIT_TEMPLATES[farm.toolkit] || TOOLKIT_TEMPLATES["V236_STANDARD"];
}

// Helper: get total item count (optional toolkit param)
function getTotalItemCount(toolkit) {
  const tk = toolkit || TOOLKIT_DATA;
  let count = 0;
  for (const drawer of tk.drawers) {
    for (const group of drawer.groups) {
      count += group.items.length;
    }
  }
  return count;
}

// Helper: get all items flat (optional toolkit param)
function getAllItems(toolkit) {
  const tk = toolkit || TOOLKIT_DATA;
  const items = [];
  for (const drawer of tk.drawers) {
    for (const group of drawer.groups) {
      for (const item of group.items) {
        items.push({ ...item, drawer: drawer.id, drawerName: drawer.name, group: group.name });
      }
    }
  }
  return items;
}
