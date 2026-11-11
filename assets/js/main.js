(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;

  /* header: solido dopo lo scroll, si nasconde scendendo e riappare salendo */
  const header = $('[data-header]');
  const progress = $('[data-progress]');
  const fab = $('[data-fab]');
  let lastY = scrollY;
  const onHeader = () => {
    const y = scrollY;
    header.classList.toggle('is-solid', y > 40);
    if (!body.classList.contains('menu-open')) {
      if (y > lastY + 3 && y > 80) header.classList.add('is-hidden');
      else if (y < lastY - 3 || y < 80) header.classList.remove('is-hidden');
    }
    lastY = y;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (fab) {
      const c = $('.contact');
      const r = c && c.getBoundingClientRect();
      const onContact = r && r.top < innerHeight && r.bottom > 0;
      fab.classList.toggle('show', y > innerHeight * 0.7 && !onContact);
    }
  };

  /* menu */
  const burger = $('[data-burger]'), menu = $('[data-menu]');
  const setMenu = (open) => {
    body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    menu.setAttribute('aria-hidden', !open);
    if (open) $('a', menu).focus({ preventScroll: true });
  };
  burger.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && body.classList.contains('menu-open')) { setMenu(false); burger.focus(); } });

  /* reveal */
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal]').forEach((el) => io.observe(el));

  /* parallax + parola "trio" che cresce con lo scroll */
  const par = $$('[data-parallax]');
  const trio = $('[data-trio]');
  const lines = $$('[data-trio-line]');
  const onScroll = () => {
    const vh = innerHeight;
    if (!reduce) {
      par.forEach((el) => {
        const host = el.parentElement.getBoundingClientRect();
        if (host.bottom < 0 || host.top > vh) return;
        const k = parseFloat(el.dataset.parallax);
        el.style.transform = `translate3d(0,${(host.top + host.height / 2 - vh / 2) * -k}px,0)`;
      });
      if (trio) {
        const r = trio.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) {
          const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.9)));
          lines.forEach((l, i) => {
            const t = Math.min(1, Math.max(0, p * 1.5 - i * 0.25));
            l.style.transform = `scale(${0.8 + t * 0.2 + i * 0.06 * t})`;
            l.style.opacity = 0.25 + t * 0.75;
          });
        }
      }
    }
    onHeader();
  };
  let tick = false;
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(() => { onScroll(); tick = false; }); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* gallery: frecce, trascinamento col mouse, rotella orizzontale */
  const track = $('[data-gallery]');
  if (track) {
    const step = () => Math.max(260, track.clientWidth * 0.6);
    const go = (d) => track.scrollBy({ left: d * step(), behavior: reduce ? 'auto' : 'smooth' });
    $('[data-gprev]').addEventListener('click', () => go(-1));
    $('[data-gnext]').addEventListener('click', () => go(1));
    track.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); });
    let down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; });
    addEventListener('pointermove', (e) => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 4) { moved = true; track.classList.add('drag'); } track.scrollLeft = sl - dx; });
    addEventListener('pointerup', () => { down = false; track.classList.remove('drag'); });
    track.addEventListener('click', (e) => { if (moved) e.preventDefault(); }, true);
  }

  /* recensioni: scorrono da sole ogni 6s, frecce e puntini */
  const qs = $('[data-quotes]');
  if (qs) {
    const items = $$('.quote', qs), dots = $$('[data-qdots] span');
    let i = 0, timer;
    const show = (n) => {
      items[i].classList.remove('is-active'); dots[i].classList.remove('on');
      i = (n + items.length) % items.length;
      items[i].classList.add('is-active'); dots[i].classList.add('on');
    };
    const play = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => show(i + 1), 6000); };
    $('[data-qprev]').addEventListener('click', () => { show(i - 1); play(); });
    $('[data-qnext]').addEventListener('click', () => { show(i + 1); play(); });
    qs.parentElement.addEventListener('mouseenter', () => clearInterval(timer));
    qs.parentElement.addEventListener('mouseleave', play);
    play();
  }

  /* slideshow della fascia in "Chi Siamo" */
  const ss = $('[data-slideshow]');
  if (ss && !reduce) {
    const imgs = $$('img', ss);
    let i = 0;
    setInterval(() => { imgs[i].classList.remove('is-active'); i = (i + 1) % imgs.length; imgs[i].classList.add('is-active'); }, 4500);
  }

  /* transizione tra pagine */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target || a.hasAttribute('download')) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || (u.pathname === location.pathname && u.hash)) return;
    e.preventDefault(); body.classList.add('leaving');
    setTimeout(() => { location.href = a.href; }, 220);
  });
  addEventListener('pageshow', (e) => { if (e.persisted) body.classList.remove('leaving'); });

  /* cursore "Trascina" sulla galleria (solo mouse) */
  if (track && matchMedia('(hover:hover)').matches) {
    const c = document.createElement('div'); c.className = 'cursor'; c.textContent = 'Trascina'; body.appendChild(c);
    track.addEventListener('mouseenter', () => c.classList.add('on'));
    track.addEventListener('mouseleave', () => c.classList.remove('on'));
    track.addEventListener('mousemove', (e) => { c.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; });
  }

  /* modulo: validazione e invio via programma di posta (sito statico, nessun server) */
  $$('[data-form]').forEach((f) => {
    const msg = $('[data-formmsg]', f);
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      msg.className = 'form-msg';
      if (!f.checkValidity()) {
        f.reportValidity();
        msg.classList.add('err');
        msg.textContent = 'Controlla i campi obbligatori (*).';
        return;
      }
      const d = Object.fromEntries(new FormData(f));
      const lines = [
        `Nome: ${d.nome} ${d.cognome}`,
        `Email: ${d.email}`,
        d.cellulare && `Cellulare: ${d.cellulare}`,
        `Tipo di richiesta: ${d.tipo}`,
        d.budget && `Budget: ${d.budget}`,
        '',
        d.messaggio || '',
      ].filter((x) => x !== '' && x !== undefined && x !== false || x === '');
      const url = `mailto:gianelucagiardini@gmail.com?subject=${encodeURIComponent('Progetto - Richiesta preventivo')}&body=${encodeURIComponent(lines.join('\n'))}`;
      msg.textContent = 'Si apre il tuo programma di posta con il messaggio già pronto: premi Invia per spedircelo.';
      location.href = url;
    });
  });
})();
