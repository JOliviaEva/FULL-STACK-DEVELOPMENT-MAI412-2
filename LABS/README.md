# Olivia's Full Stack Development Lab

A vintage academic lab-journal website documenting a full stack development
journey, built with React, React Router and Tailwind CSS (with the
Typography plugin).

## Run it

```bash
npm install
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview
```

## Routes

- `/` — the lab journal home: hero cover, "Lab Journal — Progress So Far"
  with 4 entries (only Lab 1 is implemented; Labs 2–4 are marked
  **In Progress**).
- `/lab-1` — Exercise 1 brief plus the actual implementation. **The
  implementation itself is plain HTML & CSS**, not React: it lives at
  `public/lab-1.html`, served as a static file at `/lab-1.html`, built with
  Tailwind CSS via CDN (including the Typography plugin) and vanilla JS for
  the mobile menu toggle. The `/lab-1` journal page embeds it live in an
  `<iframe>` and also links to open it directly in a new tab.

## Structure

```
public/
  lab-1.html              ← LAB 1 ITSELF: plain HTML + CSS (Tailwind CDN +
                             Typography plugin), header/nav/main/footer,
                             vanilla JS mobile-menu toggle. No React here.
src/
  components/
    Divider.jsx          thin decorative journal rule
    JournalMark.jsx       hero illustration (SVG notebook + circuit sketch)
    SiteHeader.jsx         slim top bar for the journal pages
    Hero.jsx                home page hero / journal cover
    LabProgress.jsx        "progress so far" section (renders 4 LabCards)
    LabCard.jsx             single journal-entry card
    Footer.jsx               shared, configurable footer
  pages/
    Home.jsx
    Lab1.jsx                exercise brief + <iframe> embedding lab-1.html
  App.jsx                  route table
  main.jsx                 app entry + BrowserRouter
  index.css                Tailwind layers + journal-specific utilities
tailwind.config.js         palette, fonts, shadows, animation tokens (for
                            the React journal shell — lab-1.html has its
                            own inline Tailwind config since it's static)
```

## Notes

- Color palette: `#601D49` (plum, dominant), `#BD5579` (rose), `#218DAE`
  (teal), plus warm paper and ink neutrals — configured in
  `tailwind.config.js`.
- Fonts: Source Serif 4 for headings/journal voice, IBM Plex Mono for
  labels, data and navigation — loaded via Google Fonts in `index.html`.
- The Tailwind Typography plugin (`@tailwindcss/typography`) is installed
  and used with the `prose` class in the "About UniAI ERP" section on the
  Lab 1 page.
- Labs 2–4 are intentionally left as placeholders with disabled
  "Coming Soon" states — no fabricated content was added for them.
- **Lab 1 is plain HTML & CSS.** `public/lab-1.html` is a fully
  self-contained static file — open it directly in any browser (double-click
  it, no build step needed) and it works on its own. It's also reachable at
  `/lab-1.html` when the site is running, and the journal's `/lab-1` route
  embeds it live via an `<iframe>`.
