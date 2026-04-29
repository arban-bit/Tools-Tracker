# Drawer Photos

Drop drawer photos into this folder to enable **Visual mode** in the toolkit checker.

## File naming convention

```
d1.jpg   → Drawer 1
d2.jpg   → Drawer 2
d3.jpg   → Drawer 3
...
```

The path is referenced from each drawer's `imageUrl` field in `app/js/toolkit-data.js`.

## Recommended photo specs

| Property | Recommendation |
|---|---|
| Format | JPG (smaller) or PNG |
| Aspect ratio | Match the actual drawer (typically wide, ~16:9 or 2:1) |
| Resolution | 1500–2400 px on the long edge |
| File size | < 500 KB per drawer |
| Lighting | Top-down, even lighting, no glare |
| Contents | All foam cutouts visible, drawer fully open |

## Hotspots

Each drawer's hotspots (the clickable rectangles) are stored in `app/js/toolkit-data.js` under each drawer's `hotspots` array.

Format (coordinates are **normalized 0–1** relative to the image):

```js
hotspots: [
  { itemId: "d3-001", x: 0.015, y: 0.30, w: 0.034, h: 0.45 },
  { itemId: "d3-002", x: 0.057, y: 0.30, w: 0.034, h: 0.45 },
  ...
]
```

- `x`, `y` = top-left corner as fraction of image width/height
- `w`, `h` = width/height as fraction
- `itemId` = the item ID this rectangle represents

## Tuning the layout

After dropping in your photo:
1. Open the toolkit checker (Visual mode)
2. Compare overlay rectangles to actual tool positions in the photo
3. Adjust `x`, `y`, `w`, `h` values in `toolkit-data.js`

A visual hotspot editor is planned (Phase 3) so this becomes self-service. For now, hand-tuning is required.

## Drawer 3 demo

Drawer 3 already has a demo hotspot layout (23 vertical rectangles in a row, sized for combination spanners 6–36 mm).
Drop a `d3.jpg` into this folder to see it in action — adjust the coordinates afterwards if your photo's layout differs.
