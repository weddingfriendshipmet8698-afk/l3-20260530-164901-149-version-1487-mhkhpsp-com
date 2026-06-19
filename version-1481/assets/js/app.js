import { H as Hls } from './hls-dru42stk.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function initNavigation() {
  const toggle = $('[data-nav-toggle]');
  const mobileNav = $('[data-mobile-nav]');
  if (!toggle || !mobileNav) return;

  toggle.addEventListener('click', () => {
    mobileNav.classList.toggle('is-open');
  });
}

function initHero() {
  const hero = $('[data-hero]');
  if (!hero) return;

  const slides = $$('.hero-slide', hero);
  const dots = $$('.hero-dots button', hero);
  if (slides.length < 2) return;

  let active = 0;
  let timer = null;

  const show = (index) => {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === active));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === active));
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => show(active + 1), 5200);
  };

  const stop = () => {
    if (timer) window.clearInterval(timer);
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      show(index);
      start();
    });
  });

  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  show(0);
  start();
}

function initSearch() {
  const input = $('[data-search-input]');
  const panel = $('[data-search-panel]');
  const results = $('[data-search-results]');
  if (!input || !panel || !results || !window.SEARCH_INDEX) return;

  const currentPrefix = input.dataset.prefix || '';

  const render = (items) => {
    if (!items.length) {
      results.innerHTML = '<p>没有匹配到内容，请换一个关键词。</p>';
      return;
    }

    results.innerHTML = items.slice(0, 12).map((item) => {
      const href = currentPrefix + item.href;
      return `<a href="${href}"><strong>${item.title}</strong><small>${item.year} · ${item.type} · ${item.category}</small></a>`;
    }).join('');
  };

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    panel.classList.toggle('is-visible', q.length > 0);
    if (!q) return;

    const terms = q.split(/\s+/).filter(Boolean);
    const matched = window.SEARCH_INDEX.filter((item) => {
      const hay = `${item.title} ${item.region} ${item.type} ${item.genre} ${item.tags}`.toLowerCase();
      return terms.every((term) => hay.includes(term));
    });
    render(matched);
  });
}

function initPlayers() {
  const player = $('[data-player]');
  if (!player) return;

  const video = $('video', player);
  const playButton = $('[data-play]', player);
  const cover = $('[data-play-cover]', player);
  const status = $('[data-player-status]', player);
  if (!video) return;

  const source = video.dataset.src;
  let hls = null;

  const setStatus = (message) => {
    if (status) status.textContent = message;
  };

  if (!source) {
    setStatus('播放源未绑定');
  } else if (Hls && Hls.isSupported()) {
    hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hls.loadSource(source);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => setStatus('播放源已就绪'));
    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (!data || !data.fatal) return;
      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        setStatus('网络波动，正在重新加载');
        hls.startLoad();
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        setStatus('媒体解码异常，正在恢复');
        hls.recoverMediaError();
      } else {
        setStatus('当前浏览器无法播放该视频源');
        hls.destroy();
      }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    video.addEventListener('loadedmetadata', () => setStatus('播放源已就绪'));
  } else {
    setStatus('当前浏览器不支持 HLS 播放');
  }

  const play = async () => {
    try {
      await video.play();
      if (cover) cover.classList.add('is-hidden');
      setStatus('正在播放');
    } catch (error) {
      setStatus('请再次点击播放按钮启动视频');
    }
  };

  if (playButton) playButton.addEventListener('click', play);
  video.addEventListener('play', () => {
    if (cover) cover.classList.add('is-hidden');
  });
  video.addEventListener('pause', () => setStatus('已暂停'));
  video.addEventListener('ended', () => setStatus('播放结束'));
  window.addEventListener('beforeunload', () => {
    if (hls) hls.destroy();
  });
}

initNavigation();
initHero();
initSearch();
initPlayers();
