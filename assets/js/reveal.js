// Scroll reveal — adds .is-visible to each .reveal element the first time it
// enters the viewport. The hidden starting state only applies under
// html.js-reveal (set by an inline script in partials/head.html), so without
// JS, or with reduced motion, everything is visible from the start.
(function () {
  "use strict";
  var root = document.documentElement;
  if (!root.classList.contains("js-reveal")) return;

  var items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

  items.forEach(function (el) { observer.observe(el); });
})();
