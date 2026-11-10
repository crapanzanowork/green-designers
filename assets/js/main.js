(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;

  /* header: solido dopo lo scroll, si nasconde scendendo e riappare salendo */
  const header = $('[data-header]');
  let lastY = scrollY;
  const onHeader = () => {
    const y = scrollY;
    header.classList.toggle('is-solid', y > 40);
    header.classList.toggle('is-hidden', y > 400 && y > lastY + 4 && !body.classList.contains('menu-open'));
    if (y < lastY - 4) header.classList.remove('is-hidden');
    lastY = y;
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

  /* citazioni (una sola per ora, ma pronto per altre) */
  const qs = $('[data-quotes]');
  if (qs) {
    const items = $$('.quote', qs);
    let i = 0;
    const show = (n) => { items[i].classList.remove('is-active'); i = (n + items.length) % items.length; items[i].classList.add('is-active'); };
    $('[data-qprev]').addEventListener('click', () => show(i - 1));
    $('[data-qnext]').addEventListener('click', () => show(i + 1));
  }

  /* slideshow della fascia in "Chi Siamo" */
  const ss = $('[data-slideshow]');
  if (ss && !reduce) {
    const imgs = $$('img', ss);
    let i = 0;
    setInterval(() => { imgs[i].classList.remove('is-active'); i = (i + 1) % imgs.length; imgs[i].classList.add('is-active'); }, 4500);
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
