// Wavy-Website: passenden Download erkennen, neueste Version von GitHub holen, Island-Demo, Einblenden.
(() => {
  const REPO = 'JedPlayYT/wavy', LATEST = `https://github.com/${REPO}/releases/latest`;
  const de = document.documentElement.lang === 'de';
  const L = de ? { for: 'Download für', copied: 'Kopiert', copy: 'Kopieren' } : { for: 'Download for', copied: 'Copied', copy: 'Copy' };
  document.documentElement.classList.remove('no-js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Welches Gerät? (nur grob, für den großen Knopf)
  const ua = navigator.userAgent, plat = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
  let os = 'windows';
  if (/android/i.test(ua)) os = 'android';
  else if (/iphone|ipad|ipod/i.test(ua) || (/mac/i.test(plat) && navigator.maxTouchPoints > 1)) os = 'iphone';
  else if (/mac/i.test(plat) || /mac os/i.test(ua)) os = 'macArm';
  else if (/linux|cros/i.test(plat) || /linux/i.test(ua)) os = 'linux';
  const names = { windows: 'Windows', macArm: 'Mac', macIntel: 'Mac', linux: 'Linux', android: 'Android', iphone: 'iPhone' };

  const hero = document.getElementById('hero-dl');
  const row = document.querySelector(`.drow[data-os="${os}"]`);
  if (row) row.classList.add('mine');
  if (hero) {
    hero.querySelector('span').textContent = `${L.for} ${names[os]}`;
    const logo = row && row.querySelector('.logo svg'), old = hero.querySelector('svg');
    if (logo && old) old.replaceWith(logo.cloneNode(true));
  }

  // Dateien der neuesten Version
  const pick = {
    windows: (n) => /^Wavy-Setup-[\d.]+\.exe$/i.test(n),
    macArm: (n) => /Mac-Apple-Silicon\.dmg$/i.test(n), macIntel: (n) => /Mac-Intel\.dmg$/i.test(n),
    linux: (n) => /\.AppImage$/i.test(n), android: (n) => /Android\.apk$/i.test(n), iphone: (n) => /iPhone\.ipa$/i.test(n),
    deb: (n) => /\.deb$/i.test(n), rpm: (n) => /\.rpm$/i.test(n), tar: (n) => /\.tar\.gz$/i.test(n),
  };
  const mb = (b) => Math.max(1, Math.round(b / 1048576)) + ' MB';
  document.querySelectorAll('a[data-asset]').forEach((a) => { a.href = LATEST; });
  fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((rel) => {
      const assets = rel.assets || [], find = (k) => assets.find((x) => pick[k](x.name));
      document.querySelectorAll('.drow[data-os]').forEach((c) => {
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

  // Dynamic Island: Maus drauf (Desktop), antippen (Handy), Enter/Leertaste (Tastatur).
  // Einmal von selbst aufklappen, damit man sieht, dass sie lebt.
  const isl = document.querySelector('.isl'), stage = document.querySelector('.stage');
  if (isl) {
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    let auto = null;
    const set = (open) => { isl.classList.toggle('open', open); isl.setAttribute('aria-expanded', String(open)); };
    const used = () => { clearTimeout(auto); auto = null; stage && stage.classList.add('used'); };
    if (fine) {
      isl.addEventListener('pointerenter', () => { used(); set(true); });
      isl.addEventListener('pointerleave', () => set(false));
    } else {
      isl.addEventListener('pointerdown', () => { used(); set(!isl.classList.contains('open')); });
      document.addEventListener('pointerdown', (e) => { if (!isl.contains(e.target)) set(false); });
    }
    isl.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); used(); set(!isl.classList.contains('open')); } else if (e.key === 'Escape') set(false); });
    isl.addEventListener('blur', () => { if (!auto) set(false); });
    if (!reduce) auto = setTimeout(() => { set(true); auto = setTimeout(() => { set(false); auto = null; }, 2600); }, 1400);
  }

  // Befehl kopieren
  document.querySelectorAll('.code button').forEach((b) => b.addEventListener('click', () => {
    const t = b.previousElementSibling.textContent, label = b.querySelector('span');
    const swap = (txt) => { b.classList.add('swap'); setTimeout(() => { label.textContent = txt; b.classList.remove('swap'); }, 120); };
    (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => { swap(L.copied); setTimeout(() => swap(L.copy), 1800); }).catch(() => {
      const r = document.createRange(); r.selectNodeContents(b.previousElementSibling); const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    });
  }));

  // Kopfzeile + Einblenden (gestaffelt, 50 ms pro Element in derselben Gruppe)
  const head = document.querySelector('header');
  const onScroll = () => head.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const items = [...document.querySelectorAll('.rv')];
  if (!('IntersectionObserver' in window)) { items.forEach((e) => e.classList.add('in')); return; }
  const io = new IntersectionObserver((es) => {
    es.filter((e) => e.isIntersecting).forEach((e, i) => { e.target.style.transitionDelay = `${Math.min(i, 6) * 50}ms`; e.target.classList.add('in'); io.unobserve(e.target); });
  }, { rootMargin: '0px 0px -60px 0px' });
  items.forEach((e) => io.observe(e));
})();
