# 3D Ramen Shop Portfolio

> Step into a hand-built 3D ramen shop. Sit at the bar. Browse my work.

**Live site:** [tarang-tj.github.io](https://tarang-tj.github.io)

An interactive portfolio built as a single HTML file. No frameworks, no build tools, no package manager — just Three.js r128, vanilla JavaScript, and every mesh written by hand.

## What's in the scene

- Real-time 3D ramen shop with PBR-style materials, hemisphere + point lighting, and a night-sky dome
- 350-streak rain system with wind modulation and a CRT scanline overlay
- Particle steam rising from the bowls
- Six lantern glows + a flickering red neon sign
- Interactive zones: sit at any of six stools, inspect three different bowls, open four portfolio panels
- Cursor-follow warm PointLight that pools illumination on whatever you point at
- Periodic lightning storm (every 18–35s — three-pulse flash with scene illumination boost)
- Day/night toggle that swaps the entire lighting scheme
- Camera parallax that drifts the scene toward your mouse
- Japanese omikuji fortunes (press `F` for a random blessing)
- Konami code easter egg — rainbow neon mode for 15 seconds + ramen emoji rain
- Time-aware greeting that changes based on your local hour (late-night ramen at 1am hits different from the afternoon lull)

## Controls

| Key | Action |
|---|---|
| `E` / `Enter` | Enter the shop (from outside) |
| `H` | Step back outside |
| `1` – `4` | Open Projects / Experience / Skills / Contact panels |
| `M` | Open the menu card |
| `S` | Toggle ambient sound |
| `L` | Toggle lo-fi music |
| `N` | Toggle day/night |
| `F` | Pull an omikuji fortune |
| `?` | Keyboard shortcuts overlay |
| `Esc` | Close overlay / stand up / return |
| Drag | Look around |
| Scroll wheel | Zoom |

The classic Konami sequence (↑ ↑ ↓ ↓ ← → ← → B A) unlocks rainbow neon mode for 15 seconds.

## Technical notes

- **Single file, zero build** — `index.html` loads Three.js r128 from a CDN and a Google Fonts stylesheet, then everything else is inline CSS + JS
- **Device-adaptive pixel ratio** — caps at 1.25 on desktop, 1.0 on mobile or low-core (≤4 threads) devices. Auto-degrades a quarter-step on WebGL context loss so the scene self-heals instead of going blank
- **WebGL context loss recovery** — `webglcontextlost` / `webglcontextrestored` handlers reapply renderer state and shed GPU pressure if the driver resets
- **Graceful fallback** — if `WebGLRenderer` construction fails entirely (disabled hardware acceleration, corporate-locked laptop, context exhaustion), the page swaps in a clean text-only portfolio so visitors can always reach the resume + links
- **Animation throttling** — non-critical particle and light updates skip every other frame. Heavy work pauses when a panel is open (render every 8th frame for background visibility). The whole animation loop fully pauses when the tab is hidden (`visibilitychange`)
- **Resize debouncing** — 120ms debounce on window resize to avoid layout thrash during drag-resize
- **Reduced-motion support** — `prefers-reduced-motion: reduce` disables film grain, vignette breathing, and lightning flashes

## Projects showcased

1. **Washington Homelessness & Housing Affordability Analysis** — 9 years of Zillow + HUD PIT data, R regression, interactive Tableau dashboard quantifying the affordability gap
2. **E-Commerce SQL Analytics Engine** — normalized 8-table schema, cohort/RFM/window-function queries, surfaced 58% revenue concentration in top 12% of customers
3. **Economic Pulse Dashboard** — Python + Streamlit pulling live FRED data (GDP, CPI, unemployment, yield curve) with recession probability indicators
4. **Operations & Forecasting Model** — 18-month Excel multivariate regression, 94% forecast accuracy, Power BI dashboard tracking 15+ KPIs
5. **CED Financial Case Competition** — bottom-up financial model projecting $15.3M in revenue and 81.5% operating income improvement; Team Cartier finalist
6. **[AutoAppli](https://autoappli.com)** — AI-assisted job application platform: tailors resumes, drafts outreach, tracks applications on a Kanban board. Full-stack Next.js + TypeScript + FastAPI + Supabase + Claude API, public demo included
7. **[SyllabusAI](https://syllabusai.net)** — AI-parsed syllabus → Google Calendar sync. Paste or upload a PDF, Claude extracts deadlines and pushes them to your calendar. Node.js + Supabase backend, Google Calendar API, PWA for mobile. Shipped to production with real users
8. **This portfolio** — the thing you're reading about right now

## About me

**Tarang (TJ) Jammalamadaka** — Data & Business Analyst

- University of Washington Bothell · BMIS · Class of 2027 · GPA 3.7 · Dean's List
- Currently: Operations Improvement Analyst at Quadcore Innovations
- Open to Summer 2026 internships in Finance, Data Analytics, and Product

[Resume (PDF)](TJ_Resume.pdf) · [LinkedIn](https://linkedin.com/in/tarang-tj) · [GitHub](https://github.com/tarang-tj) · tarangjammalamadaka9@gmail.com

## Running locally

Clone and open — there's nothing to install:

```
git clone https://github.com/tarang-tj/3d-ramenshop-portfolio.git
cd 3d-ramenshop-portfolio
open index.html
```

Or just double-click `index.html` in Finder. Works in any modern browser with WebGL enabled.

## License

Source is open for learning and inspiration. If you remix or reuse meaningful pieces, a credit link back would be appreciated.
