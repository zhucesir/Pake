(() => {
  console.log(
    ">>> [Pake event.js v3.6] 上帝脚本（极速16倍速纯净去广告 + 抗反拦截检测版）已就位！",
  );

  // =========================================================================
  // 1. YouTube / YouTube Music 极速去广告与自动跳过系统 (v3.6.0 纯净抗检测版)
  // =========================================================================
  const adSelectors = [
    ".ytp-ad-skip-button",
    ".ytp-ad-skip-button-modern",
    ".ytp-ad-skip-button-slot",
    ".ytp-skip-ad-button",
    ".ytp-skip-ad-button-modern",
    'button[id*="skip-button"]',
    ".ytp-ad-overlay-close-button",
    ".ytmusic-ad-skip-button",
    "ytmusic-ad-skip-button",
    "button.ytp-ad-skip-button-instant",
    ".ytp-ad-text-overlay",
  ];

  function skipAds() {
    // 1. 自动点击各类跳过按钮 (纯净原生 click()，防合成事件风控)
    for (const selector of adSelectors) {
      const btns = document.querySelectorAll(selector);
      btns.forEach((btn) => {
        if (btn) {
          try {
            btn.click();
          } catch (e) {}
        }
      });
    }

    // 2. 广告标识实时测定 (兼容 YouTube & YouTube Music 贴片/插播广告 .ad-interrupting)
    const isAdShowing =
      document.querySelector(".ad-showing, .ad-interrupting") ||
      document.querySelector('ytmusic-player[player-ui-state="AD_SHOWING"]') ||
      document.querySelector(".ytp-ad-player-overlay") ||
      document.querySelector(".ytp-ad-timed-pie-countdown-container");

    // 3. 如果正在播放广告，进行“快速蒸发”处理 (16倍速 + 静音 + 自动跳尾)
    if (isAdShowing) {
      const media =
        document.querySelector("video") || document.querySelector("audio");
      if (media) {
        media.muted = true; // 静音
        media.playbackRate = 16.0; // 开启 16 倍速

        // 如果视频/音频支持，直接拉到末尾（规避反拦截检测，不再人工 dispatch synthetic 'ended'）
        if (isFinite(media.duration) && media.duration > 0) {
          media.currentTime = media.duration;
        }
      }
    }
  }

  // 100ms 轮询，完美兼顾极速跳过与 CPU 性能，规避高频反爬风控
  setInterval(skipAds, 100);

  // =========================================================================
  // 2. 全面支持 Pake 官方快捷键系统 (适配 Win/Linux/Mac 全部 14 组快捷键)
  // =========================================================================
  function normalizeZoomPercent(zoom) {
    const parsed = parseFloat(zoom);
    return Number.isFinite(parsed) ? parsed : 100;
  }

  function setZoom(zoom) {
    const zoomPercent = normalizeZoomPercent(zoom);
    const normalizedZoom = `${zoomPercent}%`;
    const invoke = window.__TAURI__?.core?.invoke;
    if (invoke) {
      invoke("set_zoom", { percent: zoomPercent }).catch(() => {});
    }
    window.localStorage.setItem("htmlZoom", normalizedZoom);
  }

  function zoomCommon(zoomChange) {
    const currentZoom = window.localStorage.getItem("htmlZoom") || "100%";
    setZoom(zoomChange(normalizeZoomPercent(currentZoom)));
  }

  window.addEventListener(
    "keydown",
    (event) => {
      const tag =
        event.target && event.target.tagName
          ? event.target.tagName.toLowerCase()
          : "";
      const isInput =
        tag === "input" ||
        tag === "textarea" ||
        (event.target && event.target.isContentEditable);

      // 1. 无需 Ctrl/Cmd 组合键支持: F11 (全屏), F12 (调试), Home/End (非输入状态下到顶/底)
      if (event.key === "F11") {
        event.preventDefault();
        event.stopPropagation();
        const appWindow = window.__TAURI__?.window?.getCurrentWindow?.();
        if (appWindow) {
          appWindow
            .isFullscreen()
            .then((fs) => appWindow.setFullscreen(!fs))
            .catch(() => {});
        }
        return;
      }
      if (event.key === "F12") {
        event.preventDefault();
        event.stopPropagation();
        window.__TAURI__?.core?.invoke("open_devtools").catch(() => {});
        return;
      }
      if (!isInput) {
        if (event.key === "Home") {
          event.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        if (event.key === "End") {
          event.preventDefault();
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth",
          });
          return;
        }
      }

      // 2. Ctrl / Meta (⌘) 组快捷键
      if (event.ctrlKey || event.metaKey) {
        const key = event.key;
        const keyLow = key.toLowerCase();

        // [页面切换]: Ctrl + ← / ⌘ + [ -> 返回上一页; Ctrl + → / ⌘ + ] -> 下一页
        if (!isInput && (key === "ArrowLeft" || key === "[")) {
          event.preventDefault();
          event.stopPropagation();
          window.history.back();
          return;
        }
        if (!isInput && (key === "ArrowRight" || key === "]")) {
          event.preventDefault();
          event.stopPropagation();
          window.history.forward();
          return;
        }

        // [自动滚动]: Ctrl + ↑ -> 自动到顶; Ctrl + ↓ -> 自动到底
        if (!isInput && key === "ArrowUp") {
          event.preventDefault();
          event.stopPropagation();
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        if (!isInput && key === "ArrowDown") {
          event.preventDefault();
          event.stopPropagation();
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth",
          });
          return;
        }

        // [页面刷新]: Ctrl + r
        if (keyLow === "r") {
          event.preventDefault();
          event.stopPropagation();
          window.location.reload();
          return;
        }

        // [隐藏窗口]: Ctrl + w (不退出应用)
        if (keyLow === "w") {
          event.preventDefault();
          event.stopPropagation();
          const appWindow = window.__TAURI__?.window?.getCurrentWindow?.();
          if (appWindow) appWindow.hide();
          return;
        }

        // [缩放控制]: Ctrl + - / Ctrl + = / Ctrl + 0
        if (key === "-" || key === "_") {
          event.preventDefault();
          event.stopPropagation();
          zoomCommon((z) => Math.max(z - 10, 30));
          return;
        }
        if (key === "=" || key === "+") {
          event.preventDefault();
          event.stopPropagation();
          zoomCommon((z) => Math.min(z + 10, 200));
          return;
        }
        if (key === "0") {
          event.preventDefault();
          event.stopPropagation();
          setZoom("100%");
          return;
        }

        // [复制 URL]: Ctrl + L
        if (keyLow === "l") {
          event.preventDefault();
          event.stopPropagation();
          navigator.clipboard.writeText(window.location.href);
          console.log(">>> [Pake event.js] 已复制当前 URL:");
          return;
        }

        // [组合 Shift 键快捷键]: Ctrl + Shift + V / H / I / Del
        if (event.shiftKey) {
          // 粘贴纯文本: Ctrl + Shift + V
          if (keyLow === "v") {
            event.preventDefault();
            document.execCommand("paste");
            return;
          }
          // 回到主页: Ctrl + Shift + H
          if (keyLow === "h") {
            event.preventDefault();
            event.stopPropagation();
            window.location.href = window.location.origin;
            return;
          }
          // 打开开发者工具: Ctrl + Shift + I (或 Alt+I)
          if (keyLow === "i") {
            event.preventDefault();
            event.stopPropagation();
            window.__TAURI__?.core?.invoke("open_devtools").catch(() => {});
            return;
          }
          // 清空缓存并重启: Ctrl + Shift + Del (Delete / Backspace)
          if (key === "Delete" || key === "Backspace") {
            event.preventDefault();
            event.stopPropagation();
            window.localStorage.clear();
            window.sessionStorage.clear();
            window.__TAURI__?.core?.invoke("clear_cache").catch(() => {});
            window.location.reload();
            return;
          }
        }

        // 兼容 Mac: ⌘ + ⌥ + I (Alt + I) 打开控制台
        if (event.altKey && keyLow === "i") {
          event.preventDefault();
          event.stopPropagation();
          window.__TAURI__?.core?.invoke("open_devtools").catch(() => {});
          return;
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
