/* ===============================
🔧 工具函数区域
================================= */

// 单个元素选择器（默认作用域为 document）
const $ = (sel, scope = document) => scope.querySelector(sel);

// 多个元素选择器（返回数组）
const $$ = (sel, scope = document) => [...scope.querySelectorAll(sel)];

// 防抖函数：避免频繁触发（如滚动、输入）
const debounce = (fn, delay = 200) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
};


/* ===============================
 整屏滚动切换（鼠标滚轮 + 点导航）
================================= */

function initFullPageScroll() {
  const screens = $$(".screen");
  const dots = $$(".dot");

  if (!screens.length || !dots.length) return;

  let current = 0;
  let isAnimating = false;/*动画锁，防重复触发*/
  const duration = 800;/*动画时长（毫秒）*/

  const scrollToScreen = index => {
    if (isAnimating || index < 0 || index >= screens.length) return;
    isAnimating = true;

    const start = window.scrollY;/*动画起始纵向滚动位置（当前页面滚动值*/
    const end = window.innerHeight * index;/*目标滚动位置，按屏高 * 索引计算（假设每屏等高且顶部对齐*/
    const startTime = performance.now();

    const animate = time => {
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      window.scrollTo(0, start + (end - start) * eased);

      if (progress < 1) {
        requestAnimationFrame(animate);/*启动动画*/
      } else {
        isAnimating = false;
        current = index;
        dots.forEach((d, i) => d.classList.toggle("active", i === index));
      }
    };

    requestAnimationFrame(animate);
  };
    /*鼠标*/
    window.addEventListener("wheel", debounce(e => {
      if (isAnimating) return;
      if (e.deltaY > 0) scrollToScreen(current + 1);
      else if (e.deltaY < 0) scrollToScreen(current - 1);
    }, 50));
    /*键盘*/
    window.addEventListener('keydown', e => {
      if (isAnimating) return;
      if (e.key === 'PageDown' || e.key === 'ArrowDown') scrollToScreen(current + 1);
      if (e.key === 'PageUp' || e.key === 'ArrowUp') scrollToScreen(current - 1);
    });

    dots.forEach((dot, i) => dot.addEventListener("click", () => scrollToScreen(i)));

      /*移动端*/
    let startY = 0;
    window.addEventListener("touchstart", e => startY = e.touches[0].clientY);
    window.addEventListener("touchend", e => {
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dy) > 60) {
        if (dy < 0) scrollToScreen(current + 1);
        else scrollToScreen(current - 1);
      }
    });
  }

/* ===============================
 滚动时二维码弹窗与导航 Logo 切换
================================= */

function initScrollLogo() {
  const qrPopup = $("#qrFixed");
  const navLogo = $("#nav-logo");
  const firstScreenHeight = $(".first-screen").offsetHeight;

  window.addEventListener("scroll", () => {
    if (window.scrollY >= firstScreenHeight * 0.5) {
      qrPopup.classList.add("hidden");
      navLogo.style.display = "block";
    } else {
      qrPopup.classList.remove("hidden");
      navLogo.style.display = "none";
    }
  });
}


/* ===============================
 首页轮播图自动切换
================================= */

function initCarousel() {
  const imgs = $$(".carousel img");
  if (!imgs.length) return;

  let index = 0;
  setInterval(() => {/*创建一个定时器，周期性执行回调函数以推进轮播。*/
    imgs[index].classList.remove("active");
    index = (index + 1) % imgs.length;
    imgs[index].classList.add("active");
  }, 3000);/*每3秒切换一次图片*/
}


/* ===============================
 登录弹窗交互逻辑
================================= */

function initLoginPopup() {
  const loginBtn = $("#loginBtn");
  const loginPopup = $("#loginPopup");
  const closePopup = $("#closePopup");

  if (!loginBtn || !loginPopup || !closePopup) return;

  loginBtn.addEventListener("click", () => {
    loginPopup.style.display = "flex";
  });

  closePopup.addEventListener("click", () => {
    loginPopup.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === loginPopup) {
      loginPopup.style.display = "none";/*点击弹窗背景遮罩关闭*/
    }
  });
}


/* ===============================
 新闻区 Tab 切换
================================= */

function initNewsTabs() {
  const tabs = $$(".news-tabs button");
  const contents = $$(".news-content");

  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      tabs.forEach(b => b.classList.remove("active"));
      contents.forEach(c => c.style.display = "none");

      btn.classList.add("active");
      const targetId = btn.dataset.target;
      const target = $("#" + targetId);
      if (target) target.style.display = "block";
    });
  });
}


/* ===============================
 第二屏皮肤展示（视频切换）
================================= */

function initSkinSwitcher() {
  const skins = [
    { video: "img/李白.mp4", title: "李白 · 青莲剑仙", desc: "踏歌行，剑指青云。" },
    { video: "img/貂蝉.mp4", title: "貂蝉 · 仲夏夜之梦", desc: "霓裳轻舞，蝶影流光。" },
    { video: "img/马可波罗.mp4", title: "马可波罗 · 潮玩先锋", desc: "潮流枪术，涂鸦战场！" },
    { video: "img/赵云.mp4", title: "赵云 · 龙胆赤影", desc: "枪如龙啸，影焰无双。" },
  ];/*定义一个皮肤数组，每个皮肤包含视频路径、标题和描述。*/

/*获取页面上的主要视频、皮肤视频、标题、描述、缩略图列表和背景容器。*/
  const mainVideo = $("#main-video");
  const skinVideo = $("#skin-video");
  const titleEl = $("#skin-title");
  const descEl = $("#skin-desc");
  const thumbs = $$(".skin-thumbs img");
  const screen = $(".second-screen");

  function switchSkin(i) {
    const s = skins[i];
    const bgImg = thumbs[i].src;

    [mainVideo, titleEl, descEl].forEach(el => el.classList.add("fade"));
    /*先给主视频、标题、描述加上 "fade" 类，触发淡出效果。*/

    setTimeout(() => {
      mainVideo.src = s.video;
      skinVideo.src = s.video;
      titleEl.textContent = s.title;
      descEl.textContent = s.desc;
      screen.style.backgroundImage = `url('${bgImg}')`;

      thumbs.forEach((img, idx) => img.classList.toggle("active", idx === i));
      [mainVideo, titleEl, descEl].forEach(el => el.classList.remove("fade"));
    }, 300);/*给每个缩略图绑定点击事件，点击时切换皮肤。初始化时默认显示第一个皮肤。*/
  }

  thumbs.forEach((img, i) => img.addEventListener("click", () => switchSkin(i)));
  switchSkin(0);
}

/* ===============================
标签折叠
================================= */
function initSideTagCollapse() {
  const tags = $$(".side-tag");
  if (!tags.length) return;

  const STORAGE_KEY = "sideTagState"; // 存储折叠状态的 key

  // 读取已保存状态
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    saved = {};
  }

  tags.forEach((tag, idx) => {
    // 确保每个 tag 有唯一 id，若无 id，使用索引前缀
    if (!tag.id) tag.id = `side-tag-${idx}`;

    // 可访问性基础设置
    tag.setAttribute("role", "button");
    tag.setAttribute("tabindex", "0");

    // 根据缓存恢复状态
    const isCollapsed = !!saved[tag.id];
    tag.classList.toggle("collapsed", isCollapsed);
    tag.setAttribute("aria-expanded", String(!isCollapsed));

    const toggle = (e) => {
      // 如果事件来自内联链接或表单控件，允许默认行为
      if (e && (e.target.tagName === "A" || e.target.tagName === "BUTTON" || e.defaultPrevented)) return;

      const nowCollapsed = tag.classList.toggle("collapsed");
      tag.setAttribute("aria-expanded", String(!nowCollapsed));

      // 更新并持久化状态
      try {
        saved[tag.id] = nowCollapsed;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      } catch (err) {
        // 忽略存储错误
      }
    };

    // 鼠标点击切换
    tag.addEventListener("click", toggle);
  });
}

/* ===============================
 页面初始化入口
================================= */

document.addEventListener("DOMContentLoaded", () => {
  initScrollLogo();
  initLoginPopup();
  initNewsTabs();
  initCarousel();
  initFullPageScroll();
  initSkinSwitcher();
  initSideTagCollapse();
});
