(() => {
  console.log(
    ">>> [Pake event.js v3.5] 上帝脚本（纯粹净秒去广告 + 隐形雷达版）已就位！",
  );

  // =========================================================================
  // 1. YouTube / YouTube Music 纯粹净秒去广告系统 (v3.5.0 版)
  // =========================================================================
  const adSelectors = [
    ".ytp-ad-skip-button",
    ".ytp-ad-skip-button-modern",
    ".ytp-skip-ad-button",
    ".ytp-skip-ad-button-modern",
    'button[id*="skip-button"]',
    ".ytp-ad-overlay-close-button",
    ".ytmusic-ad-skip-button",
    "ytmusic-ad-skip-button",
    "button.ytp-ad-skip-button-instant",
    ".ytp-ad-text-overlay",
  ];

  function fastClick(btn) {
    if (!btn) return;
    try {
      btn.click();
      btn.dispatchEvent(
        new PointerEvent("pointerdown", { bubbles: true, cancelable: true }),
      );
      btn.dispatchEvent(
        new MouseEvent("mousedown", { bubbles: true, cancelable: true }),
      );
      btn.dispatchEvent(
        new PointerEvent("pointerup", { bubbles: true, cancelable: true }),
      );
      btn.dispatchEvent(
        new MouseEvent("mouseup", { bubbles: true, cancelable: true }),
      );
    } catch (e) {}
  }

  function skipAds() {
    for (const selector of adSelectors) {
      const btns = document.querySelectorAll(selector);
      btns.forEach((btn) => {
        fastClick(btn);
      });
    }

    const isAdPlaying =
      document.querySelector(".ad-showing") ||
      document.querySelector('ytmusic-player[player-ui-state="AD_SHOWING"]') ||
      document.querySelector(".ytp-ad-player-overlay") ||
      document.querySelector(".ytp-ad-timed-pie-countdown-container");

    if (isAdPlaying) {
      const media =
        document.querySelector("video") || document.querySelector("audio");
      if (media) {
        media.muted = true;
        media.playbackRate = 16.0;

        if (
          isFinite(media.duration) &&
          media.duration > 0 &&
          media.duration <= 16
        ) {
          media.currentTime = media.duration;
          try {
            media.dispatchEvent(new Event("ended"));
          } catch (e) {}
        }
      }
    }
  }

  setInterval(skipAds, 25);

  // =========================================================================
  // 2. 快捷键与窗口增强系统 (支持 F12 控制台 / Home 顶 / End 底 / Ctrl+L 复制)
  // =========================================================================
  const noModKeys = ["F12", "Home", "End"];

  window.addEventListener(
    "keydown",
    (event) => {
      const tag = (event.target.tagName || "").toLowerCase();
      const isInput =
        tag === "input" || tag === "textarea" || event.target.isContentEditable;
      if (isInput && event.key !== "F12") return;

      if (noModKeys.includes(event.key)) {
        if (event.key === "Home") {
          window.scrollTo({ top: 0, behavior: "smooth" });
          event.preventDefault();
        } else if (event.key === "End") {
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth",
          });
          event.preventDefault();
        }
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        if (event.key.toLowerCase() === "l") {
          event.preventDefault();
          event.stopPropagation();
          navigator.clipboard.writeText(window.location.href);
          console.log(">>> [Pake event.js] 已复制 URL 往剪贴板!");
        }
      }
    },
    true,
  );

  // =========================================================================
  // 3. 链接在新窗口打开改为当前应用内打开 (防跳转外部浏览器)
  // =========================================================================
  window.addEventListener("DOMContentLoaded", () => {
    const observer = new MutationObserver(() => {
      document.querySelectorAll('a[target="_blank"]').forEach((a) => {
        a.removeAttribute("target");
      });
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  });

  // =========================================================================
  // 4. 通用隐形视觉雷达种子 (供 F12 控制台或外部调试器定位查询)
  // =========================================================================
  const UniversalSeed = {
    locate(query) {
      if (!query) return [];
      const isSelector =
        typeof query === "string" &&
        (query.startsWith(".") ||
          query.startsWith("#") ||
          query.startsWith("[") ||
          query.includes(" "));
      let candidates = [];
      if (isSelector) {
        try {
          candidates = Array.from(document.querySelectorAll(query));
        } catch (e) {}
      } else {
        const targetStr = String(query).trim().toLowerCase();
        candidates = Array.from(
          document.querySelectorAll(
            "button, a, input, textarea, [role='button'], [tabindex], video, audio, ytmusic-button-renderer",
          ),
        ).filter((el) => {
          const txt = (
            el.innerText ||
            el.value ||
            el.getAttribute("aria-label") ||
            ""
          )
            .trim()
            .toLowerCase();
          return txt.includes(targetStr);
        });
      }

      const results = [];
      candidates.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (
          rect.width > 2 &&
          rect.height > 2 &&
          rect.top < window.innerHeight &&
          rect.bottom > 0
        ) {
          results.push({
            tag: el.tagName,
            text: (el.innerText || el.value || "").trim().slice(0, 30),
            x: Math.round(rect.left + rect.width / 2),
            y: Math.round(rect.top + rect.height / 2),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          });
        }
      });
      return results;
    },
  };

  Object.defineProperty(window, "_pake_seed_", {
    value: UniversalSeed,
    writable: false,
    configurable: false,
    enumerable: false,
  });
})();
