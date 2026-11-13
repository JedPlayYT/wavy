// Wavy-Website: passenden Download erkennen, neueste Version von GitHub holen, kleine Effekte.
(() => {
  const REPO = 'JedPlayYT/wavy', LATEST = `https://github.com/${REPO}/releases/latest`;
  const L = document.documentElement.lang === 'de' ? { for: 'Download für', copied: 'Kopiert', copy: 'Kopieren' } : { for: 'Download for', copied: 'Copied', copy: 'Copy' };
  document.documentElement.classList.remove('no-js');

  // Welches Gerät? (ohne Fingerprinting – nur grob für den großen Knopf)
  const ua = navigator.userAgent, plat = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
  let os = 'windows';
  if (/android/i.test(ua)) os = 'android';
  else if (/iphone|ipad|ipod/i.test(ua) || (/mac/i.test(plat) && navigator.maxTouchPoints > 1)) os = 'iphone';
  else if (/mac/i.test(plat) || /mac os/i.test(ua)) os = 'macArm';
  else if (/linux|cros/i.test(plat) || /linux/i.test(ua)) os = 'linux';
  const names = { windows: 'Windows', macArm: 'Mac', macIntel: 'Mac', linux: 'Linux', android: 'Android', iphone: 'iPhone' };

  const hero = document.getElementById('hero-dl');
  const card = document.querySelector(`.plat[data-os="${os}"]`);
  if (card) card.classList.add('mine');
  if (hero) {
    hero.querySelector('span').textContent = `${L.for} ${names[os]}`;
    const logo = card && card.querySelector('.logo svg');
    const old = hero.querySelector('svg');
    if (logo && old) old.replaceWith(logo.cloneNode(true));
  }

  // Dateien der neuesten Version
  const pick = {
    windows: (n) => /^Wavy-Setup-[\d.]+\.exe$/i.test(n),
    macArm: (n) => /Mac-Apple-Silicon\.dmg$/i.test(n), macIntel: (n) => /Mac-Intel\.dmg$/i.test(n),
    linux: (n) => /\.AppImage$/i.test(n), android: (n) => /Android\.apk$/i.test(n), iphone: (n) => /iPhone\.ipa$/i.test(n),
    deb: (n) => /\.deb$/i.test(n), rpm: (n) => /\.rpm$/i.test(n), tar: (n) => /\.tar\.gz$/i.test(n),
  };
  const mb = (b) => (b / 1048576).toFixed(0) + ' MB';
  document.querySelectorAll('a[data-asset]').forEach((a) => { a.href = LATEST; });
  fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((rel) => {
      const assets = rel.assets || [];
      const find = (k) => assets.find((x) => pick[k](x.name));
      document.querySelectorAll('.plat[data-os]').forEach((c) => {
        const f = find(c.dataset.os); if (!f) return;
        c.querySelector('.btn').href = f.browser_download_url;
        c.querySelector('.file').textContent = `${f.name} · ${mb(f.size)}`;
      });
      document.querySelectorAll('a[data-asset]').forEach((a) => { const f = find(a.dataset.asset); if (f) a.href = f.browser_download_url; });
      const mine = find(os); if (hero && mine) hero.href = mine.browser_download_url;
      const v = (rel.tag_name || '').replace(/^v/, '');
      document.querySelectorAll('[data-version]').forEach((e) => { e.textContent = v; e.parentElement.hidden = !v; });
    })
    .catch(() => {});

  // Befehl kopieren
  document.querySelectorAll('.code button').forEach((b) => b.addEventListener('click', () => {
    const t = b.previousElementSibling.textContent;
    (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => { b.textContent = L.copied; setTimeout(() => { b.textContent = L.copy; }, 1600); }).catch(() => {
      const r = document.createRange(); r.selectNodeContents(b.previousElementSibling); const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    });
  }));

  // Kopfzeile + Einblenden
  const head = document.querySelector('header');
  const onScroll = () => head.classList.toggle('scrolled', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.rv').forEach((e) => io.observe(e));
  } else document.querySelectorAll('.rv').forEach((e) => e.classList.add('in'));
})();
