(() => {
  console.log(
    ">>> [Pake event.js v3.6] 上帝脚本（极速16倍速纯净去广告 + 抗反拦截检测版）已就位！",
  );

  // =========================================================================
  // 0. 腾讯 ima 极速去埋点追踪系统（拦截 Beacon/Aegis 上报）
  // =========================================================================
  if (window.location.hostname.includes('ima.qq.com')) {
    console.log(">>> [Pake] 侦测到腾讯 ima，已启动反跟踪系统！");
    
    // 制造假对象瘫痪全局 SDK
    window.Aegis = class { constructor(){} report(){} reportEvent(){} reportTime(){} setConfig(){} };
    window.DtJsReporter = { reportEvent: ()=>{} };

    // 劫持 Fetch 请求
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
      const url = (args[0] && args[0].url) ? args[0].url : (typeof args[0] === 'string' ? args[0] : '');
      if (url.includes('beacon.qq.com') || url.includes('aegis.qq.com') || url.includes('/report') || url.includes('oth.str.beacon')) {
        console.log('[Pake 物理隔离] 已成功拦截 Fetch 跟踪请求:', url);
        return new Response(JSON.stringify({code:0, msg:"success"}), { status: 200, headers: {'Content-Type': 'application/json'} });
      }
      return originalFetch.apply(this, args);
    };

    // 劫持 XHR 请求
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
      if (typeof url === 'string' && (url.includes('beacon.qq.com') || url.includes('aegis.qq.com') || url.includes('/report') || url.includes('oth.str.beacon'))) {
        console.log('[Pake 物理隔离] 已成功拦截 XHR 跟踪请求:', url);
        // 伪装一个无害的 URL 让它走完，或者直接 abort
        // 我们直接把它指向一个不存在的本地假接口
        url = 'https://ima.qq.com/__pake_blocked_tracking';
      }
      return originalOpen.call(this, method, url, ...rest);
    };
  }

  // =========================================================================
  // 0.5 GitHub Pro 极客增强模式（外链接管、代码字体美化、文件树自动展开）
  // =========================================================================
  if (window.location.hostname.includes('github.com')) {
    console.log(">>> [Pake] 侦测到 GitHub，已启动 GitHub Pro 极客增强插件！");

    // A. 拦截非 GitHub 外部链接，使用系统默认浏览器打开
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (a && a.href) {
        try {
          const targetUrl = new URL(a.href, window.location.href);
          const isGithub = targetUrl.hostname.endsWith('github.com') || 
                          targetUrl.hostname.endsWith('github.io') || 
                          targetUrl.hostname.endsWith('githubusercontent.com');
          if (!isGithub && targetUrl.protocol.startsWith('http')) {
            e.preventDefault();
            e.stopPropagation();
            console.log('[Pake] 外部链接，由系统默认浏览器打开:', targetUrl.href);
            window.open(targetUrl.href, '_blank');
          }
        } catch (err) {}
      }
    }, true);

    // B. 美化代码字体与代码块交互
    const injectStyles = () => {
      if (document.getElementById('pake-github-style')) return;
      const style = document.createElement('style');
      style.id = 'pake-github-style';
      style.textContent = `
        .blob-code-inner, pre, code, .react-code-text {
          font-family: 'Fira Code', 'JetBrains Mono', Consolas, monospace !important;
          font-variant-ligatures: contextual !important;
        }
        /* 微调代码块悬浮效果 */
        .blob-code-inner:hover {
          background-color: rgba(56, 139, 253, 0.1) !important;
        }
      `;
      document.head.appendChild(style);
    };

    // C. 页面加载/路由切换时自动注入样式
    injectStyles();
    document.addEventListener('DOMContentLoaded', injectStyles);
    document.addEventListener('pjax:end', injectStyles);
    document.addEventListener('turbo:render', injectStyles);
  }

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

  function showCopyToast(msg) {
    try {
      if (typeof window.pakeToast === "function") {
        window.pakeToast(msg);
        return;
      }
      let toastEl = document.getElementById("__pake_copy_toast");
      if (!toastEl) {
        toastEl = document.createElement("div");
        toastEl.id = "__pake_copy_toast";
        toastEl.style.cssText = "position:fixed;top:20px;right:20px;z-index:999999;background:rgba(0,0,0,0.85);color:#fff;padding:12px 20px;border-radius:8px;font-size:14px;box-shadow:0 8px 20px rgba(0,0,0,0.3);transition:all 0.3s ease;pointer-events:none;font-family:sans-serif;";
        document.body.appendChild(toastEl);
      }
      toastEl.textContent = msg;
      toastEl.style.opacity = "1";
      toastEl.style.transform = "translateY(0)";
      clearTimeout(toastEl._timer);
      toastEl._timer = setTimeout(() => {
        toastEl.style.opacity = "0";
      }, 2500);
    } catch (e) {}
  }

  function copyUrlToClipboard(text) {
    let success = false;
    // 方法 1: 使用 textarea + execCommand("copy") (同步 DOM 命令，100% 突破 Windows WebView2 异步权限拦截)
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "-9999px";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, 99999);
      success = document.execCommand("copy");
      document.body.removeChild(textarea);
    } catch (err) {}

    // 方法 2: navigator.clipboard.writeText 异步兜底
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
        success = true;
      }
    } catch (err) {}

    showCopyToast("🔗 已复制网页链接到剪贴板");
    return success;
  }

  let _lastShortcutTime = 0;
  let _lastShortcutKey = "";

  function handleAllShortcuts(event) {
    const now = Date.now();
    if (now - _lastShortcutTime < 200 && _lastShortcutKey === event.key) {
      return;
    }

    const tag = (event.target && event.target.tagName ? event.target.tagName.toLowerCase() : "");
    const isInput = tag === "input" || tag === "textarea" || (event.target && event.target.isContentEditable);

    // 1. 无需 Ctrl/Cmd 组合键支持: F11 (全屏), F12 (调试), Home/End (非输入状态下到顶/底)
    if (event.key === "F11") {
      _lastShortcutTime = now;
      _lastShortcutKey = event.key;
      event.preventDefault();
      event.stopPropagation();
      const appWindow = window.__TAURI__?.window?.getCurrentWindow?.();
      if (appWindow) {
        appWindow.isFullscreen().then((fs) => appWindow.setFullscreen(!fs)).catch(() => {});
      }
      return;
    }
    if (event.key === "F12") {
      _lastShortcutTime = now;
      _lastShortcutKey = event.key;
      event.preventDefault();
      event.stopPropagation();
      window.__TAURI__?.core?.invoke("open_devtools").catch(() => {});
      return;
    }
    if (!isInput) {
      if (event.key === "Home") {
        _lastShortcutTime = now;
        _lastShortcutKey = event.key;
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (event.key === "End") {
        _lastShortcutTime = now;
        _lastShortcutKey = event.key;
        event.preventDefault();
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        return;
      }
    }

    // 2. Ctrl / Meta (⌘) 组快捷键
    if (event.ctrlKey || event.metaKey) {
      const key = event.key;
      const keyLow = key.toLowerCase();

      // [页面切换]: Ctrl + ← / ⌘ + [ -> 返回上一页; Ctrl + → / ⌘ + ] -> 下一页
      if (!isInput && (key === "ArrowLeft" || key === "[")) {
        _lastShortcutTime = now;
        _lastShortcutKey = key;
        event.preventDefault();
        event.stopPropagation();
        window.history.back();
        return;
      }
      if (!isInput && (key === "ArrowRight" || key === "]")) {
        _lastShortcutTime = now;
        _lastShortcutKey = key;
        event.preventDefault();
        event.stopPropagation();
        window.history.forward();
        return;
      }

      // [自动滚动]: Ctrl + ↑ -> 自动到顶; Ctrl + ↓ -> 自动到底
      if (!isInput && key === "ArrowUp") {
        _lastShortcutTime = now;
        _lastShortcutKey = key;
        event.preventDefault();
        event.stopPropagation();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (!isInput && key === "ArrowDown") {
        _lastShortcutTime = now;
        _lastShortcutKey = key;
        event.preventDefault();
        event.stopPropagation();
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        return;
      }

      // [页面刷新]: Ctrl + r
      if (keyLow === "r") {
        _lastShortcutTime = now;
        _lastShortcutKey = key;
        event.preventDefault();
        event.stopPropagation();
        window.location.reload();
        return;
      }

      // [隐藏窗口]: Ctrl + w (不退出应用)
      if (keyLow === "w") {
        _lastShortcutTime = now;
        _lastShortcutKey = key;
        event.preventDefault();
        event.stopPropagation();
        const appWindow = window.__TAURI__?.window?.getCurrentWindow?.();
        if (appWindow) appWindow.hide();
        return;
      }

      // [缩放控制]: Ctrl + - / Ctrl + = / Ctrl + 0
      if (key === "-" || key === "_") {
        _lastShortcutTime = now;
        _lastShortcutKey = key;
        event.preventDefault();
        event.stopPropagation();
        zoomCommon((z) => Math.max(z - 10, 30));
        return;
      }
      if (key === "=" || key === "+") {
        _lastShortcutTime = now;
        _lastShortcutKey = key;
        event.preventDefault();
        event.stopPropagation();
        zoomCommon((z) => Math.min(z + 10, 200));
        return;
      }
      if (key === "0") {
        _lastShortcutTime = now;
        _lastShortcutKey = key;
        event.preventDefault();
        event.stopPropagation();
        setZoom("100%");
        return;
      }

      // [复制 URL]: Ctrl + L
      if (keyLow === "l") {
        _lastShortcutTime = now;
        _lastShortcutKey = key;
        event.preventDefault();
        event.stopPropagation();
        copyUrlToClipboard(window.location.href);
        return;
      }

      // [组合 Shift 键快捷键]: Ctrl + Shift + V / H / I / Del
      if (event.shiftKey) {
        // 粘贴纯文本: Ctrl + Shift + V
        if (keyLow === "v") {
          _lastShortcutTime = now;
          _lastShortcutKey = key;
          event.preventDefault();
          document.execCommand("paste");
          return;
        }
        // 回到主页: Ctrl + Shift + H
        if (keyLow === "h") {
          _lastShortcutTime = now;
          _lastShortcutKey = key;
          event.preventDefault();
          event.stopPropagation();
          window.location.href = window.location.origin;
          return;
        }
        // 打开开发者工具: Ctrl + Shift + I (或 Alt+I)
        if (keyLow === "i") {
          _lastShortcutTime = now;
          _lastShortcutKey = key;
          event.preventDefault();
          event.stopPropagation();
          window.__TAURI__?.core?.invoke("open_devtools").catch(() => {});
          return;
        }
        // 清空缓存并重启: Ctrl + Shift + Del (Delete / Backspace)
        if (key === "Delete" || key === "Backspace") {
          _lastShortcutTime = now;
          _lastShortcutKey = key;
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
        _lastShortcutTime = now;
        _lastShortcutKey = key;
        event.preventDefault();
        event.stopPropagation();
        window.__TAURI__?.core?.invoke("open_devtools").catch(() => {});
        return;
      }
    }
  }

  window.addEventListener("keydown", handleAllShortcuts, true);
  window.addEventListener("keyup", handleAllShortcuts, true);
  document.addEventListener("keydown", handleAllShortcuts, true);
  document.addEventListener("keyup", handleAllShortcuts, true);

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
