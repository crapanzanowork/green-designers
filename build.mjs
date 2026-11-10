// Genera tutte le pagine statiche. Uso: node build.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { posts } from './content/posts.mjs';

const SITE = 'Gian&Luca Green Designers';
const EMAIL = 'gianelucagiardini@gmail.com';
const PEC = 'gianeluca@pec.it';
const MAPS = 'https://www.google.com/maps/place/Via+S.+Martino,+36,+20074+Carpiano+MI/@45.3411237,9.2703061,17z';
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const SERVICES = [
  ['Progettazione paesaggistica e su misura', 'Immaginiamo, disegniamo e realizziamo spazi verdi armoniosi, che rispecchiano l’identità del cliente. Dal giardino privato agli spazi aziendali, ogni progetto nasce da uno studio accurato del contesto e si sviluppa con materiali di qualità e un’estetica contemporanea.'],
  ['Realizzazione laghetti, camminamenti e aree relax', 'Costruiamo ambienti immersivi, dove natura e benessere si incontrano. Laghetti ornamentali, vialetti in pietra, illuminazione scenografica e aree relax personalizzate: ogni elemento è progettato per elevare la bellezza del tuo spazio verde.'],
  ['Manutenzione ordinaria e straordinaria', 'Offriamo servizi di cura periodica di giardini, prati e aiuole, con interventi puntuali, discreti e su misura. Inclusi potatura siepi, sfalcio prato, controllo infestanti e gestione stagionale delle fioriture.'],
  ['Abbattimenti e potature speciali in tree climbing', 'Operiamo anche su grandi alberi e in situazioni complesse grazie a piattaforme aeree e tecniche di tree climbing, nel rispetto dell’ambiente e delle normative di sicurezza.'],
  ['Trattamenti fitosanitari certificati', 'Proteggiamo le tue piante con trattamenti mirati contro parassiti, funghi e malattie. Utilizziamo prodotti professionali e tecniche certificate, nel rispetto della salute e dell’ecosistema.'],
  ['Posa e fornitura di piante ornamentali', 'Selezioniamo e forniamo piante ornamentali di alta qualità, curate nella scelta e nell’adattamento al contesto. Affianchiamo ogni installazione con consulenza tecnica e una visione estetica d’insieme.'],
  ['Impianti di irrigazione e illuminazione', 'Studiamo soluzioni tecnologiche per l\'irrigazione e la luce, integrandole in modo discreto e funzionale nel progetto del giardino. Automatismi e sostenibilità, al servizio della tua comodità.'],
];

const NAV = [
  ['index.html', 'Home'],
  ['chi-siamo.html', 'Chi Siamo'],
  ['servizi.html', 'Servizi'],
  ['contatti.html', 'Contatti'],
];

// ---------- parti comuni ----------
const header = (b, active) => `
<header class="site-header" data-header>
  <a class="brand" href="${b}index.html" aria-label="Green Designers – Home"><img src="${b}assets/img/logo-bianco.png" alt="Green Designers" width="237" height="237"></a>
  <button class="burger" type="button" aria-label="Apri il menu" aria-expanded="false" aria-controls="menu" data-burger><span></span><span></span></button>
</header>
<nav class="menu" id="menu" aria-label="Menu principale" aria-hidden="true" data-menu>
  <ul>
    ${NAV.map(([h, t], i) => `<li style="--i:${i}"><a href="${b}${h}"${active === h ? ' aria-current="page"' : ''}>${t}</a></li>`).join('\n    ')}
  </ul>
  <div class="menu-foot">
    <a href="tel:+393490099264">Gian · 349 009 9264</a>
    <a href="tel:+393665047272">Luca · 366 504 7272</a>
    <a href="mailto:${EMAIL}">${EMAIL}</a>
  </div>
</nav>`;

const footer = (b) => `
<footer class="footer">
  <div class="footer-card">
    <a class="footer-logo" href="${b}index.html" aria-label="Green Designers – Home"><img src="${b}assets/img/logo-colori.png" alt="Green Designers" width="152" height="152" loading="lazy"></a>
    <ul class="footer-col">
      ${NAV.map(([h, t]) => `<li><a href="${b}${h}">${t}</a></li>`).join('')}
    </ul>
    <ul class="footer-col">
      <li><a href="${b}terms-and-conditions.html">Terms &amp; Conditions</a></li>
      <li><a href="${b}privacy-policy.html">Privacy Policy</a></li>
      <li><a href="${b}accessibility-statement.html">Accessibility Statement</a></li>
    </ul>
    <ul class="footer-col">
      <li><a href="https://www.instagram.com/" target="_blank" rel="noopener">Instagram</a></li>
    </ul>
    <div class="footer-legal">
      <span>© 2025 Green Designers. Powered by <a href="https://www.wedooo.it/" target="_blank" rel="noopener">WeDooo.it</a></span>
      <span>P.IVA 14093460963</span>
      <a href="mailto:${EMAIL}">${EMAIL}</a>
    </div>
  </div>
</footer>`;

const form = (id) => `
<form class="form" data-form novalidate>
  <div class="row">
    <label class="field"><span>Nome*</span><input type="text" name="nome" autocomplete="given-name" required></label>
    <label class="field"><span>Cognome*</span><input type="text" name="cognome" autocomplete="family-name" required></label>
  </div>
  <div class="row">
    <label class="field"><span>Email*</span><input type="email" name="email" autocomplete="email" required></label>
    <label class="field"><span>Cellulare</span><input type="tel" name="cellulare" autocomplete="tel"></label>
  </div>
  <label class="field"><span>Messaggio</span><textarea name="messaggio" rows="3"></textarea></label>
  <label class="field"><span>Seleziona</span>
    <select name="tipo">
      <option>Nuovo Progetto</option>
      ${SERVICES.map(([t]) => `<option>${esc(t)}</option>`).join('\n      ')}
      <option>Altro</option>
    </select>
  </label>
  <label class="field"><span>Budget disponibile</span><input type="text" name="budget" placeholder="Esempio: 3000€, oppure 'non definito'"><small>Se vuoi, indicaci il tuo budget indicativo</small></label>
  <p class="form-msg" role="status" aria-live="polite" data-formmsg></p>
  <button class="btn btn-outline-dark" type="submit">Raccontaci il tuo progetto</button>
</form>`;

const contactBlock = (b, { h2 = 'Parliamone dal vivo.<br>O meglio: dal verde.', intro = 'Hai un progetto in mente? Scrivici per fissare un sopralluogo o raccontarci cosa immagini. Siamo pronti ad ascoltarti e trasformare le tue idee in verde.', id = 'contatti' } = {}) => `
<section class="contact" id="${id}">
  <img class="contact-mark" src="${b}assets/img/logo-filigrana.png" alt="" loading="lazy" aria-hidden="true">
  <div class="contact-in">
    <div class="contact-text" data-reveal>
      <h2>${h2}</h2>
      <p>${intro}</p>
      <address>
        <p><strong>Gian &amp; Luca Giardini snc</strong><br><a href="${MAPS}" target="_blank" rel="noopener">Via San Martino 36, 20074 Carpiano (MI)</a></p>
        <p><strong>Gian:</strong> <a href="tel:+393490099264">349 009 9264</a><br><strong>Luca:</strong> <a href="tel:+393665047272">366 504 7272</a></p>
        <p><a href="mailto:${EMAIL}?subject=Progetto%20-%20Richiesta%20preventivo"><strong>${EMAIL}</strong></a><br><a href="mailto:${PEC}?subject=Richiesta%20informazioni">${PEC}</a></p>
      </address>
    </div>
    <div class="contact-form" data-reveal>${form(id)}</div>
  </div>
</section>`;

const page = ({ file, title, desc, body, active = '', depth = 0, bodyClass = '' }) => {
  const b = '../'.repeat(depth);
  const html = `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} | ${esc(SITE)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#32311e">
<meta property="og:title" content="${esc(title)} | ${esc(SITE)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="it_IT">
<link rel="icon" type="image/png" href="${b}assets/img/logo-colori.png">
<link rel="preload" href="${b}assets/fonts/arboria-medium.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${b}assets/fonts/arno-pro-subhead.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${b}assets/css/style.css">
</head>
<body class="${bodyClass}">
<a class="skip" href="#main">Passa al contenuto principale</a>
${header(b, active)}
<main id="main">
${body(b)}
</main>
${footer(b)}
<script src="${b}assets/js/main.js" defer></script>
</body>
</html>
`;
  const out = file;
  mkdirSync(out.includes('/') ? out.split('/').slice(0, -1).join('/') : '.', { recursive: true });
  writeFileSync(out, html);
};

const reveal = (t, i = 0) => `data-reveal style="--d:${i * 90}ms"`;

// ---------- HOME ----------
const homeBody = (b) => `
<section class="hero" data-hero>
  <img class="hero-bg" src="${b}assets/img/hero.jpg" alt="" fetchpriority="high" data-parallax="0.25">
  <div class="hero-shade"></div>
  <div class="hero-in">
    <h1><span class="line"><span>Il verde non è solo natura,</span></span> <span class="line"><span>è design</span></span></h1>
    <p class="hero-sub">Tra natura e desiderio. Non solo giardinaggio.</p>
    <a class="btn btn-outline" href="#contatti">Progettiamo insieme il tuo spazio</a>
  </div>
  <a class="scroll-cue" href="#progetti" aria-label="Scorri verso il basso"><span></span></a>
</section>

<section class="projects" id="progetti">
  <ul class="project-grid">
    ${posts.map((p, i) => `<li ${reveal('', i)}><a class="project-card" href="${b}progetti/${p.slug}.html"><img src="${b}assets/img/${p.image}" alt="${esc(p.alt)}" loading="lazy"><span class="project-label">${p.title}</span></a></li>`).join('\n    ')}
  </ul>
</section>

<section class="about" id="chi-siamo">
  <div class="about-card">
    <div class="about-text">
      <p class="eyebrow" data-reveal>Chi Siamo</p>
      <h2 class="display" data-reveal style="--d:80ms">Professionisti del verde per progetti unici e personalizzati.</h2>
      <div class="prose" data-reveal style="--d:160ms">
        <p>Green Designers è una realtà specializzata nella progettazione e realizzazione di giardini, terrazze e spazi verdi su misura.<br>Un team di giardinieri e progettisti del verde che unisce competenze tecniche, visione estetica e attenzione sartoriale ai dettagli.</p>
        <p>Ogni nostro intervento nasce da un dialogo, cresce su carta e prende forma nel terreno.<br><strong>Diamo struttura alle idee, trasformandole in paesaggi da vivere.</strong></p>
      </div>
      <a class="btn btn-outline-dark" href="${b}chi-siamo.html" data-reveal style="--d:240ms">SCOPRI CHI SIAMO</a>
    </div>
    <figure class="about-art" data-reveal><img src="${b}assets/img/schizzo-progetto.png" alt="Schizzo acquerellato del progetto di un giardino" loading="lazy"></figure>
  </div>
</section>

<section class="services" id="servizi">
  <img class="services-bg" src="${b}assets/img/servizi-sfondo.jpg" alt="" loading="lazy" data-parallax="0.12">
  <div class="services-shade"></div>
  <div class="services-in">
    <div class="services-head">
      <p class="eyebrow" data-reveal>I Nostri Servizi</p>
      <h2 class="display" data-reveal style="--d:80ms">Il tuo spazio verde, progettato su misura</h2>
      <div class="prose" data-reveal style="--d:160ms">
        <p>Ogni ambiente ha bisogno di cura, identità e funzionalità.<br>Green Designers progetta e realizza giardini privati, terrazzi panoramici, cortili condominiali e spazi verdi aziendali su misura.</p>
        <p>Partiamo dalla tua idea e la sviluppiamo in ogni dettaglio:<br>dal disegno iniziale alle piante ornamentali, dal laghetto alla potatura in tree climbing, fino all’ultimo tocco di verde.<br>Progettazione, realizzazione e manutenzione, con uno stile riconoscibile e un approccio sartoriale, sempre nel rispetto dei tempi e dell’ambiente.</p>
      </div>
      <a class="btn btn-light" href="${b}servizi.html" data-reveal style="--d:240ms">Scopri tutti i servizi</a>
    </div>
    <div class="service-cards">
      <article class="service-card" data-reveal>
        <span class="num">01</span>
        <h3>Progettazione paesaggistica su misura</h3>
        <p>Diamo forma a giardini, terrazzi e spazi esterni residenziali o aziendali. Ogni progetto nasce da un’idea, prende forma con materiali di pregio e si realizza con precisione artigianale.<br>Linee, volumi e natura: il tuo spazio verde come non l’hai mai immaginato.</p>
        <img src="${b}assets/img/card-progettazione.jpg" alt="Villa moderna con giardino progettato su misura" loading="lazy">
      </article>
      <article class="service-card" data-reveal style="--d:100ms">
        <span class="num">02</span>
        <h3>Realizzazione aree relax, laghetti e impianti</h3>
        <p>Zone relax, laghetti ornamentali, camminamenti, impianti di irrigazione e illuminazione.<br>Ogni dettaglio è pensato per valorizzare l’ambiente e offrire comfort quotidiano, con uno stile che dura nel tempo.</p>
        <img src="${b}assets/img/card-relax.jpg" alt="Sentiero in pietra tra aiuole fiorite" loading="lazy">
      </article>
      <article class="service-card" data-reveal style="--d:200ms">
        <span class="num">03</span>
        <h3>Manutenzione professionale e interventi speciali</h3>
        <p>Dalla cura del prato alla potatura in tree climbing. Interveniamo con mezzi e tecniche adatte a ogni esigenza, anche in contesti complessi o su alberature ad alto fusto.<br>Discrezione, puntualità e rispetto per ogni spazio.</p>
        <img src="${b}assets/img/card-tree-climbing.jpg" alt="Operatore in tree climbing con imbracatura" loading="lazy">
      </article>
    </div>
  </div>
</section>

<section class="trio" data-trio>
  <div class="trio-words" aria-label="Progettiamo. Realizziamo. Manteniamo.">
    <h2 class="t1" data-trio-line>Progettiamo.</h2>
    <h2 class="t2" data-trio-line>Realizziamo.</h2>
    <h2 class="t3" data-trio-line>Manteniamo.</h2>
  </div>
  <p class="trio-text" data-reveal>Non solo design e visione: nel nostro team ci sono anche giardinieri esperti. Che si tratti di un nuovo impianto, di un prato da rigenerare o di una semplice potatura, puoi contare su di noi.</p>
  <a class="btn btn-light" href="#contatti" data-reveal style="--d:100ms">Fissa un sopralluogo gratuito</a>
</section>

<section class="gallery" id="gallery">
  <div class="gallery-head">
    <h2 class="display" data-reveal>Sfoglia la nostra gallery</h2>
    <div class="arrows">
      <button type="button" class="arrow" aria-label="Foto precedenti" data-gprev>←</button>
      <button type="button" class="arrow" aria-label="Foto successive" data-gnext>→</button>
    </div>
  </div>
  <div class="gallery-track" data-gallery tabindex="0" aria-label="Galleria di giardini realizzati">
    ${['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'].map((n) => `<figure><img src="${b}assets/img/gallery-${n}.jpg" alt="Giardino realizzato da Green Designers, foto ${Number(n)}" loading="lazy" draggable="false"></figure>`).join('\n    ')}
  </div>
</section>

<section class="why" id="perche">
  <h2 class="display" data-reveal>Perché scegliere noi</h2>
  <ol class="why-list">
    <li data-reveal><span class="num">01</span><h3>Puntuali, ogni volta</h3><p>Rispettiamo i tempi, sempre. Ogni progetto viene pianificato con attenzione e consegnato entro i termini stabiliti, perché sappiamo quanto sia importante potersi fidare.</p></li>
    <li data-reveal><span class="num">02</span><h3>Menti e mani esperte</h3><p>Il nostro team unisce competenze tecniche e sensibilità estetica. Dalla progettazione alla realizzazione, ogni dettaglio è curato da professionisti con anni di esperienza nel verde.</p></li>
    <li data-reveal><span class="num">03</span><h3>Eco-compatibili per scelta</h3><p>Utilizziamo tecnologie e materiali a basso impatto ambientale, preferiamo soluzioni sostenibili e trattamenti fitosanitari certificati. Per un giardino bello, sano e consapevole.</p></li>
    <li data-reveal><span class="num">04</span><h3>Affidabili e assicurati</h3><p>Operiamo in sicurezza, con coperture assicurative e strumentazioni certificate. Offriamo interventi anche complessi (come tree climbing) con la massima garanzia per te e per il tuo spazio.</p></li>
  </ol>
</section>

<section class="testimonials">
  <div class="testi-media">
    <video src="${b}assets/video/fiori.mp4" poster="${b}assets/img/fiori-poster.jpg" autoplay muted loop playsinline preload="metadata" aria-hidden="true"></video>
  </div>
  <div class="testi-body">
    <h2 class="display" data-reveal>Ci piace lasciare parlare chi ha già scelto Green Designer.<br><span>Ecco cosa raccontano i nostri clienti.</span></h2>
    <div class="quote-slider" data-quotes>
      <blockquote class="quote is-active">
        <p>"Il nostro giardino è diventato un’estensione della casa: elegante, curato, su misura. Green Designer ha colto esattamente quello che avevamo in mente, superando ogni aspettativa."</p>
        <footer>Martina R., Milano</footer>
      </blockquote>
    </div>
    <div class="arrows">
      <button type="button" class="arrow" aria-label="Recensione precedente" data-qprev>←</button>
      <button type="button" class="arrow" aria-label="Recensione successiva" data-qnext>→</button>
    </div>
  </div>
</section>

${contactBlock(b)}
`;

page({ file: 'index.html', title: 'Home', desc: 'Il verde non è solo natura, è design. Progettazione, realizzazione e manutenzione di giardini, terrazze e spazi verdi su misura a Milano e provincia.', body: homeBody, active: 'index.html', bodyClass: 'home' });

// ---------- CHI SIAMO ----------
page({
  file: 'chi-siamo.html', title: 'Chi Siamo', desc: 'Green Designer nasce dall’esperienza condivisa di due professionisti del verde: passione per il dettaglio, cura dei tempi e rapporto diretto con ogni cliente.', active: 'chi-siamo.html', bodyClass: 'inner',
  body: (b) => `
<section class="page-top"><div class="page-top-in">
  <p class="eyebrow" data-reveal>Chi Siamo</p>
  <h1 class="display" data-reveal style="--d:80ms">Un percorso condiviso, radici comuni</h1>
  <div class="prose two-col" data-reveal style="--d:160ms">
    <p>Green Designer nasce dall’esperienza condivisa di due professionisti che, dopo anni di lavoro nella stessa azienda, hanno deciso di dare forma a un progetto tutto loro.<br>Non solo un servizio, ma una visione: trasformare il verde in design, creare ambienti che riflettano personalità, comfort ed estetica.</p>
    <p>Ciò che ci unisce è la passione per il dettaglio, la cura per i tempi di consegna e un rapporto diretto e sincero con ogni cliente. Ogni progetto è unico, come chi lo vive.</p>
  </div>
</div></section>

<section class="band" data-slideshow>
  <img class="is-active" src="${b}assets/img/giardiniere-1.jpg" alt="Giardiniere al lavoro su una siepe" data-parallax="0.1">
  <img src="${b}assets/img/giardiniere-2.jpg" alt="Giardiniere con grembiule" loading="lazy">
  <img src="${b}assets/img/giardiniere-3.jpg" alt="Giardiniera sorridente" loading="lazy">
</section>

<section class="team">
  <h2 class="display" data-reveal>Scopri il team</h2>
  <div class="team-grid">
    <article class="member" data-reveal>
      <img src="${b}assets/img/giardiniere-2.jpg" alt="Mario Rossi" loading="lazy">
      <p class="role">Progettista paesaggista</p>
      <h3>Mario Rossi</h3>
      <p>Questo è lo spazio per descrivere il membro del team. Scrivi una breve descrizione del ruolo e delle responsabilità di questa persona, oppure aggiungi una breve biografia con un riepilogo di background. Evidenzia le sue competenze e spiega cosa lo rende una risorsa per il team.</p>
    </article>
    <article class="member" data-reveal style="--d:120ms">
      <img src="${b}assets/img/giardiniere-3.jpg" alt="Francesca Rossi" loading="lazy">
      <p class="role">Giardiniere capo</p>
      <h3>Francesca Rossi</h3>
      <p>Questo è lo spazio per descrivere il membro del team. Scrivi una breve descrizione del ruolo e delle responsabilità di questa persona, oppure aggiungi una breve biografia con un riepilogo di background. Evidenzia le sue competenze e spiega cosa lo rende una risorsa per il team.</p>
    </article>
  </div>
</section>

${contactBlock(b, { id: 'lavora-con-noi', h2: 'Lavora Con Noi<br><span>Vuoi far parte del nostro team?</span>', intro: 'Inviaci un\'e-mail e ti risponderemo il prima possibile' })}
`,
});

// ---------- SERVIZI ----------
page({
  file: 'servizi.html', title: 'Servizi', desc: 'Progettazione paesaggistica, laghetti e aree relax, manutenzione, tree climbing, trattamenti fitosanitari, piante ornamentali, irrigazione e illuminazione.', active: 'servizi.html', bodyClass: 'inner',
  body: (b) => `
<section class="page-top"><div class="page-top-in">
  <p class="eyebrow" data-reveal>I nostri Servizi</p>
  <h1 class="display" data-reveal style="--d:80ms">Il tuo spazio verde, progettato su misura</h1>
</div></section>
<section class="service-list">
  ${SERVICES.map(([t, d], i) => `<article class="service-row${i % 2 ? ' flip' : ''}">
    <figure data-reveal><img src="${b}assets/img/servizio-${i + 1}.jpg" alt="${esc(t)}" loading="lazy"></figure>
    <div class="service-copy" data-reveal style="--d:100ms">
      <span class="num">${String(i + 1).padStart(2, '0')}</span>
      <h2>${esc(t)}</h2>
      <p>${esc(d)}</p>
      <a class="btn btn-outline-dark" href="${b}contatti.html">Contattaci</a>
    </div>
  </article>`).join('\n  ')}
</section>
`,
});

// ---------- CONTATTI ----------
page({
  file: 'contatti.html', title: 'Contatti', desc: 'Raccontaci la tua idea di verde. Sopralluogo gratuito a Milano e provincia. Gian: 349 009 9264 · Luca: 366 504 7272.', active: 'contatti.html', bodyClass: 'inner',
  body: (b) => `
<section class="contact contact-page" id="contatti">
  <img class="contact-mark" src="${b}assets/img/logo-filigrana.png" alt="" aria-hidden="true">
  <div class="contact-in">
    <div class="contact-text" data-reveal>
      <p class="eyebrow">Contatti</p>
      <h1>Raccontaci la tua idea di verde.<br>Ci pensiamo noi.</h1>
      <p>Hai un progetto, uno spazio da valorizzare o semplicemente un’idea da sviluppare?<br>Compila il modulo qui accanto: ti ricontatteremo per fissare un sopralluogo gratuito e iniziare a immaginare insieme.</p>
      <address>
        <p><strong>Preferisci parlare al telefono?</strong><br><strong>Gian:</strong> <a href="tel:+393490099264">349 009 9264</a><br><strong>Luca:</strong> <a href="tel:+393665047272">366 504 7272</a></p>
        <p><a href="mailto:${EMAIL}"><strong>${EMAIL}</strong></a></p>
      </address>
    </div>
    <div class="contact-form" data-reveal>${form('contatti')}</div>
  </div>
</section>
`,
});

// ---------- PROGETTI ----------
const mdToHtml = (src) => {
  const lines = src.split('\n');
  let out = '', list = false;
  const close = () => { if (list) { out += '</ul>'; list = false; } };
  for (const raw of lines) {
    const l = raw.trimEnd();
    if (!l) continue;
    if (l.startsWith('- ')) { if (!list) { out += '<ul>'; list = true; } out += `<li>${esc(l.slice(2))}</li>`; continue; }
    close();
    if (l.startsWith('## ')) out += `<h2>${esc(l.slice(3))}</h2>`;
    else if (l.startsWith('### ')) out += `<h3>${esc(l.slice(4))}</h3>`;
    else if (l.startsWith('> ')) out += `<blockquote>${esc(l.slice(2))}</blockquote>`;
    else out += `<p>${esc(l)}</p>`;
  }
  close();
  return out;
};

for (const p of posts) {
  const others = posts.filter((x) => x !== p);
  page({
    file: `progetti/${p.slug}.html`, depth: 1, title: p.title, desc: `${p.title} – ${p.meta[1][1]}. Progetto Green Designers.`, bodyClass: 'inner post',
    body: (b) => `
<article class="post-article">
  <a class="back" href="${b}index.html#progetti">← All Posts</a>
  <header class="post-head">
    <p class="eyebrow">Green Designers · ${p.published} · Tempo di lettura: 2 min</p>
    <h1 class="display">${p.title}</h1>
    <p class="updated">Aggiornamento: ${p.updated}</p>
  </header>
  <figure class="post-cover"><img src="${b}assets/img/${p.image}" alt="${esc(p.alt)}" fetchpriority="high"></figure>
  <dl class="post-meta">
    ${p.meta.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('\n    ')}
  </dl>
  <div class="post-body">${mdToHtml(p.body)}</div>
</article>
<section class="recent">
  <div class="recent-head"><h2>Post recenti</h2><a href="${b}index.html#progetti">Mostra tutti</a></div>
  <ul class="recent-grid">
    ${others.map((o) => `<li><a class="recent-card" href="${b}progetti/${o.slug}.html"><img src="${b}assets/img/${o.image}" alt="${esc(o.alt)}" loading="lazy"><span>${o.title}</span></a></li>`).join('\n    ')}
  </ul>
</section>
`,
  });
}

// ---------- LEGALI ----------
const legal = (file, title, html, desc) => page({ file, title, desc, bodyClass: 'inner legal', body: () => `<article class="legal-article"><h1 class="display">${title}</h1>${html}</article>` });

legal('terms-and-conditions.html', 'Terms &amp; Conditions', `
<h2>1. Informazioni generali</h2>
<p>Questo sito è di proprietà di:<br>Gianluca Saresini<br>Green Designers – Progettazione e Realizzazione Aree Verdi<br>Via San Martino n°36, 20074 Carpiano (MI)<br>P.IVA: 14093460963<br>Email: <a href="mailto:${EMAIL}">${EMAIL}</a></p>
<p>Accedendo a questo sito web, l’utente accetta di rispettare i presenti termini e condizioni.</p>
<h2>2. Contenuti del sito</h2>
<p>Tutti i contenuti presenti (testi, immagini, grafiche, elementi visivi) sono di proprietà di Green Designers o utilizzati con licenza. È vietata la riproduzione, distribuzione o modifica, anche parziale, dei contenuti, salvo consenso esplicito del titolare.</p>
<h2>3. Responsabilità</h2>
<p>Green Designers non è responsabile per eventuali malfunzionamenti, errori o interruzioni del sito, né per l’accuratezza assoluta delle informazioni pubblicate. Le informazioni hanno scopo illustrativo e non costituiscono offerta contrattuale.</p>
<h2>4. Link a siti terzi</h2>
<p>Il sito può contenere link esterni. Green Designers non è responsabile per i contenuti o la privacy di tali siti.</p>
<h2>5. Modifiche ai termini</h2>
<p>Il titolare si riserva il diritto di modificare i presenti termini in qualsiasi momento. Le modifiche saranno efficaci dal momento della pubblicazione online.</p>`, 'Termini e condizioni di utilizzo del sito Green Designers.');

legal('privacy-policy.html', 'Privacy Policy', `
<h2>1. Titolare del trattamento</h2>
<p>Ai sensi del Regolamento (UE) 2016/679 (GDPR), il titolare del trattamento dei dati è:<br>Gianluca Saresini<br>Green Designers – Progettazione e Realizzazione Aree Verdi<br>Via San Martino n°36, 20074 Carpiano (MI)<br>Email: <a href="mailto:${EMAIL}">${EMAIL}</a></p>
<h2>2. Dati raccolti</h2>
<p>Il sito raccoglie dati personali esclusivamente attraverso il modulo di contatto. I dati richiesti possono includere:</p>
<ul><li>Nome e cognome</li><li>Indirizzo email</li><li>Numero di telefono</li><li>Altri dati eventualmente forniti nel messaggio</li></ul>
<p>Tali dati vengono trattati esclusivamente per finalità informative o commerciali legate ai servizi offerti (progettazione, realizzazione e manutenzione aree verdi).</p>
<h2>3. Base giuridica del trattamento</h2>
<p>Il trattamento è lecito in quanto:</p>
<ul><li>avviene su richiesta volontaria dell’utente (art. 6, par. 1, lett. b GDPR);</li><li>è necessario per dare seguito a una richiesta informativa o preventivo.</li></ul>
<h2>4. Modalità di trattamento</h2>
<p>I dati sono trattati tramite strumenti elettronici e/o cartacei, con adeguate misure di sicurezza a tutela della riservatezza e integrità. Non vengono ceduti a terzi, né trasferiti fuori dallo Spazio Economico Europeo.</p>
<h2>5. Periodo di conservazione</h2>
<p>I dati sono trattati tramite strumenti elettronici e/o cartacei, con adeguate misure di sicurezza a tutela della riservatezza e integrità. Non vengono ceduti a terzi, né trasferiti fuori dallo Spazio Economico Europeo.</p>
<h2>6. Diritti dell'interessato</h2>
<p>L’utente ha il diritto di:</p>
<ul><li>accedere ai propri dati;</li><li>richiederne la rettifica o cancellazione;</li><li>opporsi al trattamento o richiederne la limitazione;</li><li>proporre reclamo al Garante per la protezione dei dati personali.</li></ul>
<p>Per esercitare i propri diritti, è possibile scrivere a: <a href="mailto:${EMAIL}">${EMAIL}</a></p>
<h2>7. Cookie</h2>
<p>Il sito utilizza cookie tecnici necessari al funzionamento della piattaforma. In futuro, potranno essere utilizzati cookie di terze parti (es. Meta Pixel, Google Analytics) per fini statistici e/o pubblicitari. All’accesso al sito verrà mostrato un banner per la gestione del consenso, secondo normativa vigente.</p>`, 'Informativa sul trattamento dei dati personali di Green Designers.');

legal('accessibility-statement.html', 'Accessibility Statement', `
<p>Green Designers si impegna a rendere il proprio sito web accessibile in conformità alla Direttiva (UE) 2016/2102. Il sito favorisce l’accessibilità, tra l’altro, con:</p>
<ul><li>Navigazione da tastiera</li><li>Testi alternativi per immagini (in aggiornamento)</li><li>Contrasto visivo sufficiente</li></ul>
<h2>Stato attuale di accessibilità</h2>
<p>Al momento, alcune funzionalità di accessibilità sono in fase di implementazione. Il sito sarà progressivamente adeguato per garantire un'esperienza inclusiva a tutti gli utenti.</p>
<h2>Segnalazioni</h2>
<p>Per segnalare problemi di accessibilità o ricevere assistenza, è possibile contattare:<br>Gianluca Saresini<br>📩 <a href="mailto:${EMAIL}">${EMAIL}</a></p>
<p class="updated">Ultimo aggiornamento 01 settembre 2025</p>`, 'Dichiarazione di accessibilità del sito Green Designers.');

console.log('Build completata.');
