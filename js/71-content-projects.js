// Projects panel. Split out of js/70-content.js so each content file stays readable.
// Classic script: assigns onto the `panels` object declared in js/70-content.js, and must load
// before js/52-panels-controls.js. Every number here is backed by the claims ledger.
// Card ids are stable deep-link targets (project-<slug>) for the quest and arcade layers.
panels.projects=`<div class="panel-header"><div class="panel-kanji">作品</div><div class="panel-title">Projects</div></div><div class="panel-content">
<div class="case-brief"><b>The tasting menu.</b> Eight main courses, then the extras. Each card says what I built, what it measures, and where you can check it.</div>
<div class="case-filters" aria-label="Filter projects"><button class="case-filter active" onclick="filterProjects('all',this)">All work</button><button class="case-filter" onclick="filterProjects('ai',this)">Applied AI</button><button class="case-filter" onclick="filterProjects('data',this)">Data systems</button><button class="case-filter" onclick="filterProjects('craft',this)">Creative code</button></div>

<div class="project-entry" id="project-ragproof" data-track="ai">
  <div class="project-num">No. 01</div>
  <div class="project-name">ragproof &middot; RAG evaluation harness</div>
  <div class="tool-pills"><span class="tool-pill tp-py">Python</span><span class="tool-pill tp-other">CLI</span><span class="tool-pill tp-other">Docker</span><span class="tool-pill tp-other">BEIR</span></div>
  <div class="proj-stats"><div class="proj-stat"><div class="proj-stat-num">0.720</div><div class="proj-stat-label">NDCG@10, dense</div></div><div class="proj-stat"><div class="proj-stat-num">0.560</div><div class="proj-stat-label">NDCG@10, BM25</div></div><div class="proj-stat"><div class="proj-stat-num">54</div><div class="proj-stat-label">Tests, green CI</div></div></div>
  <div class="project-impact">Open-source harness that measures retrieval and answer quality instead of trusting a demo.</div>
  <div class="project-desc">BM25, dense and hybrid retrieval, with a Hugging Face embedding model and a cross-encoder reranker. On the BEIR scifact set, dense bge-small scores NDCG@10 0.720 against 0.560 for BM25. Covered by 54 tests, packaged with Docker, and kept green in CI.</div>
  <div class="proj-btn-row"><a class="proj-btn-gh" href="https://github.com/tarang-tj/ragproof" target="_blank" rel="noopener noreferrer">⌥ GitHub</a></div>
</div>

<div class="project-entry" id="project-syllabusai" data-track="ai">
  <div class="project-num">No. 02</div>
  <div class="project-name">SyllabusAI &middot; syllabus to calendar</div>
  <div class="tool-pills"><span class="tool-pill tp-other">Claude API</span><span class="tool-pill tp-js">React</span><span class="tool-pill tp-js">Express</span><span class="tool-pill tp-sql">Supabase</span><span class="tool-pill tp-js">Vercel</span></div>
  <div class="proj-stats"><div class="proj-stat"><div class="proj-stat-num">1,055</div><div class="proj-stat-label">Tests</div></div><div class="proj-stat"><div class="proj-stat-num">6</div><div class="proj-stat-label">Companion surfaces</div></div><div class="proj-stat"><div class="proj-stat-num">Live</div><div class="proj-stat-label">Since Mar 2026</div></div></div>
  <div class="project-impact">Upload a syllabus, get every deadline in your calendar.</div>
  <div class="project-desc">The parser is the wedge: it exports to Google, Apple, Outlook and plain .ics. On top of it sits an AI study companion built on Claude across six surfaces, with per-user cost ceilings and Polar billing. React, Express and Supabase, plus LMS SEO pages. 1,055 tests.</div>
  <div class="proj-btn-row"><a class="proj-btn-live" href="https://syllabusai.net" target="_blank" rel="noopener noreferrer">↗ Live Site</a></div>
</div>

<div class="project-entry" id="project-autoappli" data-track="ai">
  <div class="project-num">No. 03</div>
  <div class="project-name">AutoAppli &middot; AI job-application platform</div>
  <div class="tool-pills"><span class="tool-pill tp-js">Next.js</span><span class="tool-pill tp-py">FastAPI</span><span class="tool-pill tp-sql">Supabase</span><span class="tool-pill tp-other">Claude API</span></div>
  <div class="proj-stats"><div class="proj-stat"><div class="proj-stat-num">11</div><div class="proj-stat-label">ATS sources</div></div><div class="proj-stat"><div class="proj-stat-num">357</div><div class="proj-stat-label">Live-validated boards</div></div><div class="proj-stat"><div class="proj-stat-num">5</div><div class="proj-stat-label">Boards in the extension</div></div></div>
  <div class="project-impact">Track a job search on a board that tells you where the pipeline is leaking.</div>
  <div class="project-desc">Next.js, FastAPI, Supabase and the Claude API. A kanban board with pipeline-health widgets, and a match scorer that explains itself per dimension rather than printing one number. It reads 11 ATS sources and 357 live-validated boards, with a Chrome extension over five of them. Referral, allowance metering and provider-agnostic billing are built in.</div>
  <div class="proj-btn-row"><a class="proj-btn-live" href="https://auto-appli.vercel.app" target="_blank" rel="noopener noreferrer">↗ Live Site</a></div>
</div>

<div class="project-entry" id="project-ptcg" data-track="ai">
  <div class="project-num">No. 04</div>
  <div class="project-name">Pokemon TCG AI Battle Challenge</div>
  <div class="tool-pills"><span class="tool-pill tp-py">Python</span><span class="tool-pill tp-py">LightGBM</span><span class="tool-pill tp-other">Self-play</span><span class="tool-pill tp-other">Kaggle</span></div>
  <div class="proj-stats"><div class="proj-stat"><div class="proj-stat-num">245</div><div class="proj-stat-label">of 6,807 final</div></div><div class="proj-stat"><div class="proj-stat-num">3.60%</div><div class="proj-stat-label">Top share</div></div><div class="proj-stat"><div class="proj-stat-num">4</div><div class="proj-stat-label">Changes rejected</div></div></div>
  <div class="project-impact">A card-game agent, and a habit of believing the measurement over the idea.</div>
  <div class="project-desc">A gradient-boosted policy trained by imitation learning and self-play. Four changes that felt right were rejected as measured nulls over 200 to 960 games each. An 11-point gain turned out to be an evaluation artifact, caught by a shared-import control.</div>
</div>

<div class="project-entry" id="project-orchestrate-router" data-track="ai">
  <div class="project-num">No. 05</div>
  <div class="project-name">Message Notification Router</div>
  <div class="tool-pills"><span class="tool-pill tp-py">Python</span><span class="tool-pill tp-other">Multimodal</span><span class="tool-pill tp-other">Eval harness</span></div>
  <div class="proj-stats"><div class="proj-stat"><div class="proj-stat-num">#14</div><div class="proj-stat-label">of 1,983</div></div><div class="proj-stat"><div class="proj-stat-num">110</div><div class="proj-stat-label">Multimodal messages</div></div><div class="proj-stat"><div class="proj-stat-num">30/30</div><div class="proj-stat-label">Action labels</div></div></div>
  <div class="project-impact">Route 110 multimodal messages to the right action, and prove it.</div>
  <div class="project-desc">Built for the HackerRank Orchestrate hackathon, finished 14th of 1,983. I wrote the eval harness before the router, which is why the action labels came back 30 of 30. A 110-row adversarial audit covered the rest.</div>
</div>

<div class="project-entry" id="project-model-sentinel" data-track="ai">
  <div class="project-num">No. 06</div>
  <div class="project-name">Model Sentinel &middot; ML guardian on lineage</div>
  <div class="tool-pills"><span class="tool-pill tp-py">Python</span><span class="tool-pill tp-other">DataHub</span><span class="tool-pill tp-other">ruff</span><span class="tool-pill tp-other">pytest</span></div>
  <div class="proj-stats"><div class="proj-stat"><div class="proj-stat-num">2</div><div class="proj-stat-label">Graph adapters</div></div><div class="proj-stat"><div class="proj-stat-num">CI</div><div class="proj-stat-label">Demo scan gate</div></div><div class="proj-stat"><div class="proj-stat-num">Apache-2.0</div><div class="proj-stat-label">License</div></div></div>
  <div class="project-impact">Put the warning next to the asset, not in a report nobody opens.</div>
  <div class="project-desc">A production ML guardian that reads DataHub lineage. Deterministic detectors write their findings back as lineage tags. Two adapters, an in-memory fixture and a live graph, so the detectors can be tested without a cluster. Gated by ruff, pytest and a CI demo scan.</div>
  <div class="proj-btn-row"><a class="proj-btn-gh" href="https://github.com/tarang-tj/model-sentinel" target="_blank" rel="noopener noreferrer">⌥ GitHub</a></div>
</div>

<div class="project-entry" id="project-economic-pulse" data-track="data">
  <div class="project-num">No. 07</div>
  <div class="project-name">Economic Pulse Dashboard</div>
  <div class="tool-pills"><span class="tool-pill tp-py">Python</span><span class="tool-pill tp-py">Streamlit</span><span class="tool-pill tp-other">FRED API</span><span class="tool-pill tp-other">Regression</span></div>
  <div class="proj-stats"><div class="proj-stat"><div class="proj-stat-num">7</div><div class="proj-stat-label">FRED indicators</div></div><div class="proj-stat"><div class="proj-stat-num">Rolling</div><div class="proj-stat-label">Window regression</div></div><div class="proj-stat"><div class="proj-stat-num">NBER</div><div class="proj-stat-label">Recession shading</div></div></div>
  <div class="project-impact">Seven live macro indicators, with trend shifts flagged rather than eyeballed.</div>
  <div class="project-desc">Python and Streamlit pulling seven live FRED indicators. Rolling-window regression flags where a trend turns, and NBER recession shading gives the turns some context.</div>
  <div class="proj-btn-row"><a class="proj-btn-live" href="https://tarang-tj.github.io/economic-pulse-dashboard/" target="_blank" rel="noopener noreferrer">↗ Live Dashboard</a><a class="proj-btn-gh" href="https://github.com/tarang-tj/economic-pulse-dashboard" target="_blank" rel="noopener noreferrer">⌥ GitHub</a></div>
</div>

<div class="project-entry" id="project-ramen-portfolio" data-track="craft">
  <div class="project-num">No. 08</div>
  <div class="project-name">This portfolio &middot; 3D ramen shop</div>
  <div class="tool-pills"><span class="tool-pill tp-js">Three.js</span><span class="tool-pill tp-js">Vanilla JS</span><span class="tool-pill tp-other">Web Audio API</span></div>
  <div class="proj-stats"><div class="proj-stat"><div class="proj-stat-num">26</div><div class="proj-stat-label">Hand-written files</div></div><div class="proj-stat"><div class="proj-stat-num">0</div><div class="proj-stat-label">Frameworks</div></div><div class="proj-stat"><div class="proj-stat-num">0</div><div class="proj-stat-label">Build steps</div></div></div>
  <div class="project-impact">You are standing in it right now.</div>
  <div class="project-desc">Three.js r128 and plain JavaScript, split across css/ and js/ files that the browser loads directly. Every mesh is written by hand. It is built to degrade: bloom falls back to a plain render if the CDN is blocked, the pixel ratio steps down a ladder under GPU pressure, a lost graphics context is rebuilt, and a text-only portfolio takes over if 3D cannot start at all. This wave added a stamp rally (press G for the card), the Noodle Catch arcade (P), and drone mode (V) once the rally is finished.</div>
  <div class="proj-btn-row"><a class="proj-btn-live" href="https://tarang-tj.github.io/3d-ramenshop-portfolio/" target="_blank" rel="noopener noreferrer">↗ Live Site</a><a class="proj-btn-gh" href="https://github.com/tarang-tj/3d-ramenshop-portfolio" target="_blank" rel="noopener noreferrer">⌥ GitHub</a></div>
</div>

<div class="case-brief"><b>Extra courses.</b> Smaller plates, same kitchen.</div>

<div class="project-entry" id="project-civic-gemma" data-track="ai">
  <div class="project-num">No. 09</div>
  <div class="project-name">ShelterBrief &middot; civic housing agent</div>
  <div class="tool-pills"><span class="tool-pill tp-py">Python</span><span class="tool-pill tp-other">Gemma 4</span><span class="tool-pill tp-py">Streamlit</span><span class="tool-pill tp-other">CLI</span></div>
  <div class="project-impact">Every figure in the brief traces back to the tool call that produced it.</div>
  <div class="project-desc">A Gemma 4 tool-calling agent over public HUD data. It writes housing briefs where each number is attributable, and ships with Streamlit, a CLI, and a captured replay so a reviewer can rerun what I ran.</div>
  <div class="proj-btn-row"><a class="proj-btn-gh" href="https://github.com/tarang-tj/civic-gemma" target="_blank" rel="noopener noreferrer">⌥ GitHub</a></div>
</div>

<div class="project-entry" id="project-flow-control" data-track="data">
  <div class="project-num">No. 10</div>
  <div class="project-name">Starship Flow Control &middot; BOM constraint radar</div>
  <div class="tool-pills"><span class="tool-pill tp-py">Python</span><span class="tool-pill tp-js">Canvas 2D</span><span class="tool-pill tp-other">Deterministic</span></div>
  <div class="project-impact">Find the one part that is holding the build back.</div>
  <div class="project-desc">A three-level bill of materials, walked to find the constraining part. In the synthetic scenario, readiness moves from 3 of 4 to 4 of 4 once that part is unblocked. It also detects cycles and invalid references, and draws the flow in a 2D canvas scene. 20 tests.</div>
  <div class="proj-btn-row"><a class="proj-btn-gh" href="https://github.com/tarang-tj/starship-flow-control" target="_blank" rel="noopener noreferrer">⌥ GitHub</a></div>
</div>

<div class="project-entry" id="project-claude-skill-audit" data-track="ai">
  <div class="project-num">No. 11</div>
  <div class="project-name">claude-skill-audit &middot; AI tooling scanner</div>
  <div class="tool-pills"><span class="tool-pill tp-js">TypeScript</span><span class="tool-pill tp-other">Zero deps</span><span class="tool-pill tp-other">Security</span></div>
  <div class="project-impact">Know what your AI tooling would do before you install it.</div>
  <div class="project-desc">A zero-dependency TypeScript CLI that scans local developer-tool installs for prompt-injection, supply-chain and secret-exposure risk. Clone the repo and run it against your own machine.</div>
  <div class="proj-btn-row"><a class="proj-btn-gh" href="https://github.com/tarang-tj/claude-skill-audit" target="_blank" rel="noopener noreferrer">⌥ GitHub</a></div>
</div>

<div class="project-entry" id="project-ecommerce-sql" data-track="data">
  <div class="project-num">No. 12</div>
  <div class="project-name">E-commerce revenue analysis</div>
  <div class="tool-pills"><span class="tool-pill tp-sql">SQL</span><span class="tool-pill tp-sql">PostgreSQL</span><span class="tool-pill tp-other">Window functions</span></div>
  <div class="project-impact">Loyal buyers are 22% of the base and 34% of the revenue.</div>
  <div class="project-desc">620 orders and $112K across 18 months on a six-table schema. Cohort and window-function queries separate the loyal segment from the rest, and show that November and December carry 29.5% of the year.</div>
  <div class="proj-btn-row"><a class="proj-btn-gh" href="https://github.com/tarang-tj/ecommerce-sql" target="_blank" rel="noopener noreferrer">⌥ GitHub</a></div>
</div>

<div class="project-entry" id="project-wa-housing" data-track="data">
  <div class="project-num">No. 13</div>
  <div class="project-name">Washington housing affordability study</div>
  <div class="tool-pills"><span class="tool-pill tp-r">R</span><span class="tool-pill tp-bi">Tableau</span></div>
  <div class="project-impact">Nine years of rent and homelessness data, put in front of a non-technical audience.</div>
  <div class="project-desc">Nine years of rental index, income, vacancy and homelessness data, cleaned and modeled in R. The output is an interactive Tableau dashboard plus a written report.</div>
  <div class="proj-btn-row"><a class="proj-btn-live" href="https://tarang-tj.github.io/wa-housing-homelessness/" target="_blank" rel="noopener noreferrer">↗ Live Visualization</a><a class="proj-btn-gh" href="https://github.com/tarang-tj/wa-housing-homelessness" target="_blank" rel="noopener noreferrer">⌥ GitHub</a></div>
</div>

<div class="project-entry" id="project-reach-battlesnake" data-track="ai">
  <div class="project-num">No. 14</div>
  <div class="project-name">Reach &middot; real-time Battlesnake server</div>
  <div class="tool-pills"><span class="tool-pill tp-py">Python</span><span class="tool-pill tp-other">A* pathfinding</span><span class="tool-pill tp-other">CoG 2026</span></div>
  <div class="project-impact">Every move decided inside a 500 ms budget.</div>
  <div class="project-desc">A move server entered in the Battlesnake competition at CoG 2026, Leibniz University Hannover. A* pathfinding under a hard latency budget, checked with unit tests and simulated duels. No public repo.</div>
</div>

<div class="project-entry" id="project-jacobs-pharmacy" data-track="craft">
  <div class="project-num">No. 15</div>
  <div class="project-name">Jacobs' Pharmacy &middot; 1886 in Python</div>
  <div class="tool-pills"><span class="tool-pill tp-other">Blender</span><span class="tool-pill tp-py">Python</span><span class="tool-pill tp-other">Procedural</span></div>
  <div class="project-impact">The corner where Coca-Cola was first served, generated from code.</div>
  <div class="project-desc">My completed Coca-Cola internship capstone: a procedural Blender scene of the 1886 Jacobs' Pharmacy corner, driven entirely through Python rather than modeled by hand. The full build stays under wraps.</div>
</div>
</div>`;
