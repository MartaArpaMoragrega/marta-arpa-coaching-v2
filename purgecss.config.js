module.exports = {
  content: ["./hugo_stats.json"],
  defaultExtractor: (content) => {
    const els = JSON.parse(content).htmlElements;
    return [...(els.tags || []), ...(els.classes || []), ...(els.ids || [])];
  },
  safelist: {
    standard: [
      // Bootstrap JS-toggled classes
      /collapsing/,
      /^show$/,
      // Swiper JS-toggled classes
      /^swiper-/,
      /dragging/,
      /fullscreen/,
      /loaded/,
      /visible/,
      // Generic state classes added by JS
      /active/,
      /current/,
      /dark/,
    ],
    // Keep any rule whose selector contains an attribute selector — needed for
    // [aria-expanded="true"] toggler rules (PurgeCSS only matches class names,
    // not attribute values, so these were being stripped).
    greedy: [/^aria-/],
  },
};
