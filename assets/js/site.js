/* Progressive enhancement: all biography and publication text remains visible
   without JavaScript. Missing personal media gracefully uses the bundled art. */
(() => {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  document.querySelectorAll("[data-portrait]").forEach(image => {
    image.addEventListener("load", () => {
      image.hidden = false;
      const fallback = image.parentElement.querySelector(".portrait-fallback");
      if (fallback) fallback.hidden = true;
    });
    image.addEventListener("error", () => { image.hidden = true; });
    image.src = image.dataset.src;
  });

  document.querySelectorAll("[data-animation]").forEach(image => {
    const wrapper = image.closest(".publication-media-wrap, .paper-teaser");
    const button = wrapper.querySelector(".media-pause");
    let loaded = false;
    let playing = !reduceMotion.matches;
    const sync = () => {
      image.hidden = !loaded || !playing;
      button.hidden = !loaded;
      button.textContent = playing ? "Pause GIF" : "Play GIF";
      button.setAttribute("aria-pressed", String(playing));
      button.setAttribute("aria-label", `${playing ? "Pause" : "Play"} ${image.dataset.name} demonstration`);
    };
    image.addEventListener("load", () => { loaded = true; sync(); });
    image.addEventListener("error", () => { loaded = false; sync(); });
    button.addEventListener("click", () => { playing = !playing; sync(); });
    reduceMotion.addEventListener("change", () => { playing = !reduceMotion.matches; sync(); });
    image.src = image.dataset.src;
    sync();
  });

  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");
  if (toggle && nav) {
    toggle.hidden = false;
    const close = () => {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
    };
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", close));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        close(); toggle.focus();
      }
    });
    document.addEventListener("click", event => {
      if (!event.target.closest(".site-header")) close();
    });
    window.matchMedia("(min-width: 641px)").addEventListener("change", close);
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(entries => {
        const entry = entries.filter(item => item.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!entry) return;
        nav.querySelectorAll("a").forEach(link => {
          if (link.hash === `#${entry.target.id}`) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      }, { rootMargin: "-80px 0px -50% 0px", threshold: [0, .15, .4] });
      nav.querySelectorAll("a").forEach(link => {
        const section = document.getElementById(link.hash.slice(1));
        if (section) observer.observe(section);
      });
    }
  }

  document.querySelectorAll(".copy-citation").forEach(button => {
    button.hidden = false;
    button.addEventListener("click", async () => {
      const pre = button.parentElement.querySelector("pre");
      const text = pre.textContent;
      let copied = false;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text); copied = true;
        }
      } catch (_) { /* The selection fallback below works without permissions. */ }
      if (!copied) {
        const area = document.createElement("textarea");
        area.value = text; area.style.position = "fixed"; area.style.opacity = "0";
        document.body.append(area); area.select();
        try { copied = document.execCommand("copy"); } catch (_) { copied = false; }
        area.remove(); button.focus();
      }
      button.textContent = copied ? "Copied" : "Select citation to copy";
      if (!copied) {
        const range = document.createRange(); range.selectNodeContents(pre);
        const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
      }
      window.setTimeout(() => { button.textContent = "Copy BibTeX"; }, 2400);
    });
  });
})();
