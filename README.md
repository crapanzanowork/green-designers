# Green Designers – sito web

Sito statico di **Gian & Luca Green Designers** (progettazione, realizzazione e manutenzione di giardini, Carpiano – MI).

- Pagine: Home, Chi Siamo, Servizi, Contatti, 4 progetti, pagine legali.
- Nessun framework né cookie: HTML + CSS + JS.
- Le pagine HTML sono generate da `build.mjs` (contenuti dei progetti in `content/posts.mjs`).

## Modificare e ripubblicare

```bash
node build.mjs   # rigenera le pagine
```

Poi commit e push da GitHub Desktop. Il sito si pubblica con GitHub Pages (Settings → Pages → Deploy from branch → `main` / root).

Il modulo contatti apre il programma di posta con il messaggio già compilato (nessun server). Per ricevere i messaggi direttamente, collegare un servizio tipo Formspree.
