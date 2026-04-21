module.exports = {
  content: ["./hugo_stats.json"],
  defaultExtractor: (content) => {
    const els = JSON.parse(content).htmlElements;
    return [...(els.tags || []), ...(els.classes || []), ...(els.ids || [])];
  },
  safelist: [
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
};
