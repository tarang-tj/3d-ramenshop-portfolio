// Visitor-facing content: the four panels and their order and labels. Gated by scripts/check_claims.py.
// Split from the original single-file index.html on 2026-09-13; classic script, shares the global scope
// with every other js/*.js file. Load order is the numeric prefix.
const panels={
  projects:`<div class="panel-header"><div class="panel-kanji">作品</div><div class="panel-title">Projects</div></div><div class="panel-content">
<div class="case-brief"><b>The tasting menu.</b> Practical AI, data products, and crafted interfaces—each course pairs a technical decision with a human outcome.</div>
<div class="case-filters" aria-label="Filter projects"><button class="case-filter active" onclick="filterProjects('all',this)">All work</button><button class="case-filter" onclick="filterProjects('ai',this)">Applied AI</button><button class="case-filter" onclick="filterProjects('data',this)">Data systems</button><button class="case-filter" onclick="filterProjects('craft',this)">Creative code</button></div>
<div class="project-entry" data-track="ai">
  <div class="project-num">No. 01</div>
  <div class="project-name">ragproof · RAG Evaluation Harness</div>
  <div class="tool-pills"><span class="tool-pill tp-py">Python</span><span class="tool-pill tp-other">CLI</span><span class="tool-pill tp-other">Docker</span><span class="tool-pill tp-other">BEIR</span></div>
  <div class="proj-stats"><div class="proj-stat"><div class="proj-stat-num">0.720</div><div class="proj-stat-label">NDCG@10, dense</div></div><div class="proj-stat"><div class="proj-stat-num">54</div><div class="proj-stat-label">Tests + CI</div></div><div class="proj-stat"><div class="proj-stat-num">7</div><div class="proj-stat-label">Metrics scored</div></div></div>
  <div class="project-impact">Open-source RAG evaluation harness built from scratch. Scores retrieval and generation: hit@k, MRR, NDCG, recall, answer faithfulness, per-query cost, and embedding-drift detection.</div>
  <div class="project-desc">BEIR-benchmarked. Dense bge-small hits NDCG@10 0.720 versus 0.56 for BM25, and hybrid retrieval beats plain BM25. Covered by 54 tests and CI. Python, CLI, and Docker, so you can run it anywhere.</div>
  <div class="proj-btn-row"><a class="proj-btn-gh" href="https://github.com/tarang-tj/ragproof" target="_blank" rel="noopener noreferrer">⌥ GitHub</a></div>
</div>
<div class="project-entry" data-track="ai">
  <div class="project-num">No. 02</div>
  <div class="project-name">SyllabusAI · Syllabus to Calendar</div>
  <div class="tool-pills"><span class="tool-pill tp-other">Claude API</span><span class="tool-pill tp-js">Node.js</span><span class="tool-pill tp-sql">Supabase</span><span class="tool-pill tp-js">Vercel</span><span class="tool-pill tp-js">PWA</span></div>
  <div class="proj-stats"><div class="proj-stat"><div class="proj-stat-num">PWA</div><div class="proj-stat-label">Mobile Ready</div></div><div class="proj-stat"><div class="proj-stat-num">SSE</div><div class="proj-stat-label">Live Progress</div></div><div class="proj-stat"><div class="proj-stat-num">OAuth</div><div class="proj-stat-label">Calendar Sync</div></div></div>
  <div class="project-impact">Upload a syllabus, get every deadline in your calendar in seconds.</div>
  <div class="project-desc">In production. Claude API parses the document, Node.js and Supabase handle auth and storage, real-time SSE streams progress, Google Calendar OAuth pushes events, and a PWA makes it work on mobile. Deployed on Vercel.</div>
  <div class="proj-btn-row"><a class="proj-btn-live" href="https://syllabusai.net" target="_blank" rel="noopener noreferrer">↗ Live Site</a><a class="proj-btn-gh" href="https://github.com/tarang-tj/syllabus-ai" target="_blank" rel="noopener noreferrer">⌥ GitHub</a></div>
</div>
<div class="project-entry" data-track="ai">
  <div class="project-num">No. 03</div>
  <div class="project-name">AutoAppli · AI Job-Application Platform</div>
  <div class="tool-pills"><span class="tool-pill tp-js">Next.js</span><span class="tool-pill tp-js">TypeScript</span><span class="tool-pill tp-py">FastAPI</span><span class="tool-pill tp-sql">Supabase</span><span class="tool-pill tp-other">Claude API</span></div>
  <div class="proj-stats"><div class="proj-stat"><div class="proj-stat-num">Claude</div><div class="proj-stat-label">LLM Core</div></div><div class="proj-stat"><div class="proj-stat-num">Kanban</div><div class="proj-stat-label">Tracker UI</div></div><div class="proj-stat"><div class="proj-stat-num">Live</div><div class="proj-stat-label">Public Demo</div></div></div>
  <div class="project-impact">AI job-application platform: resume tailoring, outreach drafts, and Kanban tracking.</div>
  <div class="project-desc">Tailors each resume to the job description, drafts outreach that doesn't sound copy-pasted, and tracks applications on a Kanban board. Full-stack: Next.js and TypeScript front end, FastAPI service layer, Supabase for auth and storage, Claude API for the generative work.</div>
  <div class="proj-btn-row"><a class="proj-btn-live" href="https://autoappli.com" target="_blank" rel="noopener noreferrer">↗ Live Site</a><a class="proj-btn-gh" href="https://github.com/tarang-tj/AutoAppli" target="_blank" rel="noopener noreferrer">⌥ GitHub</a></div>
</div>
<div class="project-entry" data-track="craft">
  <div class="project-num">No. 04</div>
  <div class="project-name">Jacobs' Pharmacy 3D Recreation</div>
  <div class="tool-pills"><span class="tool-pill tp-other">Blender</span><span class="tool-pill tp-py">Python</span><span class="tool-pill tp-other">Procedural</span></div>
  <div class="proj-stats"><div class="proj-stat"><div class="proj-stat-num">1886</div><div class="proj-stat-label">Setting</div></div><div class="proj-stat"><div class="proj-stat-num">Code</div><div class="proj-stat-label">Generated</div></div><div class="proj-stat"><div class="proj-stat-num">WIP</div><div class="proj-stat-label">Capstone</div></div></div>
  <div class="project-impact">Procedural recreation of the 1886 pharmacy where Coca-Cola was first served.</div>
  <div class="project-desc">Blender driven through Python, so the space is generated from code rather than modeled by hand. Ongoing Coca-Cola internship capstone. Full build is still under wraps.</div>
</div>
<div class="project-entry" data-track="data">
  <div class="project-num">No. 05</div>
  <div class="project-name">Economic Pulse Dashboard</div>
  <div class="tool-pills"><span class="tool-pill tp-py">Python</span><span class="tool-pill tp-py">Streamlit</span><span class="tool-pill tp-other">FRED API</span><span class="tool-pill tp-other">Regression</span></div>
  <div class="proj-stats"><div class="proj-stat"><div class="proj-stat-num">Live</div><div class="proj-stat-label">FRED Data</div></div><div class="proj-stat"><div class="proj-stat-num">4+</div><div class="proj-stat-label">Macro Indicators</div></div></div>
  <div class="project-impact">Real-time macroeconomic tracker with regression trend detection on live Federal Reserve data.</div>
  <div class="project-desc">Python and Streamlit dashboard pulling seven live FRED indicators, from GDP and CPI to unemployment and fed funds. Rolling-window regression flags trend shifts, with NBER recession shading for context.</div>
  <div class="proj-btn-row"><a class="proj-btn-live" href="https://tarang-tj.github.io/economic-pulse-dashboard/" target="_blank" rel="noopener noreferrer">↗ Live Dashboard</a><a class="proj-btn-gh" href="https://github.com/tarang-tj/economic-pulse-dashboard" target="_blank" rel="noopener noreferrer">⌥ GitHub</a></div>
</div>
<div class="project-entry" data-track="data">
  <div class="project-num">No. 06</div>
  <div class="project-name">E-Commerce SQL Analytics</div>
  <div class="tool-pills"><span class="tool-pill tp-sql">SQL</span><span class="tool-pill tp-sql">PostgreSQL</span><span class="tool-pill tp-other">Window Functions</span></div>
  <div class="proj-stats"><div class="proj-stat"><div class="proj-stat-num">6</div><div class="proj-stat-label">Table Schema</div></div><div class="proj-stat"><div class="proj-stat-num">Cohort</div><div class="proj-stat-label">Analysis</div></div><div class="proj-stat"><div class="proj-stat-num">Window</div><div class="proj-stat-label">Functions</div></div></div>
  <div class="project-impact">PostgreSQL analytics on a 6-table schema with cohort and window-function analysis.</div>
  <div class="project-desc">Designed a normalized 6-table PostgreSQL schema, then wrote window-function queries for cohort retention and funnel analysis.</div>
  <div class="proj-btn-row"><a class="proj-btn-gh" href="https://github.com/tarang-tj/ecommerce-sql" target="_blank" rel="noopener noreferrer">⌥ GitHub</a></div>
</div>
<div class="project-entry" data-track="data">
  <div class="project-num">No. 07</div>
  <div class="project-name">WA Rising Rent &amp; Homelessness</div>
  <div class="tool-pills"><span class="tool-pill tp-r">R</span><span class="tool-pill tp-bi">Tableau</span><span class="tool-pill tp-other">Zillow Data</span></div>
  <div class="proj-stats"><div class="proj-stat"><div class="proj-stat-num">9yr</div><div class="proj-stat-label">Zillow Data</div></div><div class="proj-stat"><div class="proj-stat-num">R</div><div class="proj-stat-label">Analysis</div></div><div class="proj-stat"><div class="proj-stat-num">Tableau</div><div class="proj-stat-label">Dashboard</div></div></div>
  <div class="project-impact">Nine years of Zillow rent data mapped against homelessness trends across Washington.</div>
  <div class="project-desc">Cleaned and modeled 9 years of Zillow rent data in R, then built an interactive Tableau dashboard for a non-technical policy audience.</div>
  <div class="proj-btn-row"><a class="proj-btn-live" href="https://tarang-tj.github.io/wa-housing-homelessness/" target="_blank" rel="noopener noreferrer">↗ Live Visualization</a><a class="proj-btn-gh" href="https://github.com/tarang-tj/wa-housing-homelessness" target="_blank" rel="noopener noreferrer">⌥ GitHub</a></div>
</div>
<div class="project-entry" data-track="craft">
  <div class="project-num">No. 08</div>
  <div class="project-name">This Portfolio — 3D Ramen Shop</div>
  <div class="tool-pills"><span class="tool-pill tp-js">Three.js</span><span class="tool-pill tp-js">WebGL</span><span class="tool-pill tp-js">Web Audio API</span><span class="tool-pill tp-other">Vanilla JS</span></div>
  <div class="proj-stats"><div class="proj-stat"><div class="proj-stat-num">1</div><div class="proj-stat-label">HTML File</div></div><div class="proj-stat"><div class="proj-stat-num">350</div><div class="proj-stat-label">Rain Streaks</div></div><div class="proj-stat"><div class="proj-stat-num">0</div><div class="proj-stat-label">Frameworks</div></div></div>
  <div class="project-impact">You're standing in it right now</div>
  <div class="project-desc">Real-time 3D scene with PBR lighting, 350-streak rain system, particle steam, ambient audio crossfade, interactive raycasting, seated camera system, bowl inspect, 10+ clickable interaction zones, and a full panel UI — all in a single HTML file. No build tools. No frameworks. Every mesh written by hand.</div>
  <div class="proj-btn-row"><a class="proj-btn-live" href="https://tarang-tj.github.io/" target="_blank" rel="noopener noreferrer">↗ Live Site</a><a class="proj-btn-gh" href="https://github.com/tarang-tj/tarang-tj.github.io" target="_blank" rel="noopener noreferrer">⌥ GitHub</a></div>
</div>
</div>`,
  experience:`<div class="panel-header"><div class="panel-kanji">経歴</div><div class="panel-title">Experience</div></div><div class="panel-content">
<div class="exp-timeline">

<div class="exp-entry current">
  <div class="exp-role">Global Human Insights Intern <span class="current-badge">Current</span></div>
  <div class="exp-company">The Coca-Cola Company · Ignite Program · Atlanta, GA</div>
  <div class="exp-date">May 2026 – Present</div>
  <ul class="exp-bullets">
    <li>Build agentic AI workflows that automate MarTech and reporting tasks across the insights team</li>
    <li>Building an internal consumer-analysis tool with a DuckDB backend and Streamlit front end, now migrating to Next.js on Azure, that lets analysts query millions of rows of consumer marketing metric data in natural language</li>
    <li>Analyze five years of global consumer data across 200 markets with SQL and DAX, including Fanta brand analysis across the top 40 markets and TDP distribution analytics</li>
    <li>Ship AI-assisted reporting in Copilot and Power BI with documentation non-technical analysts can run on their own</li>
  </ul>
</div>

<div class="exp-entry current">
  <div class="exp-role">Founder <span class="current-badge">Current</span></div>
  <div class="exp-company">SyllabusAI</div>
  <div class="exp-date">Mar 2026 – Present</div>
  <ul class="exp-bullets">
    <li>Built and shipped an AI tool that turns a syllabus into calendar deadlines in seconds, now serving 500+ active users</li>
    <li>Built syllabus-to-calendar parsing on the Claude API with Node.js, Supabase, and Google Calendar OAuth</li>
  </ul>
</div>

<div class="exp-entry">
  <div class="exp-role">Operations Improvement Analyst</div>
  <div class="exp-company">Quadcore Innovations · Santa Clara, CA</div>
  <div class="exp-date">Oct 2025 – May 2026</div>
  <ul class="exp-bullets">
    <li>Optimized workflows on the Nuff Cash platform through root cause analysis of operational bottlenecks</li>
    <li>Built KPI dashboards tracking transaction volume, issue resolution, and system uptime for leadership reviews</li>
    <li>Automated recurring reporting with SQL and Power BI, cutting manual data entry across the team</li>
  </ul>
</div>

<div class="exp-entry">
  <div class="exp-role">Student Leadership</div>
  <div class="exp-company">UW Bothell Student Government · Delta Sigma Pi</div>
  <div class="exp-date">2025 – Present</div>
  <ul class="exp-bullets">
    <li>Treasurer, UW Bothell student government (Jul 2026 – Present), managing a $200k+ student-activities budget</li>
    <li>President, Delta Sigma Pi Upsilon Psi (Apr 2025 – Jun 2026), leading 80+ members and named Collegiate Member of the Year 2026</li>
  </ul>
</div>

</div>
</div>`,
  skills:`<div class="panel-header"><div class="panel-kanji">技術</div><div class="panel-title">Skills</div></div><div class="panel-content" id="skills-content">
<div class="skill-section-title">Applied AI</div>
<div class="skill-bar-row"><div class="skill-bar-meta"><span class="skill-bar-name">Python</span><span class="skill-bar-pct">90%</span></div><div class="skill-bar-track"><div class="skill-bar-fill" data-w="90"></div></div></div>
<div class="skill-bar-row"><div class="skill-bar-meta"><span class="skill-bar-name">RAG &amp; Retrieval Eval</span><span class="skill-bar-pct">88%</span></div><div class="skill-bar-track"><div class="skill-bar-fill" data-w="88"></div></div></div>
<div class="skill-bar-row"><div class="skill-bar-meta"><span class="skill-bar-name">Claude API &amp; Prompt Engineering</span><span class="skill-bar-pct">90%</span></div><div class="skill-bar-track"><div class="skill-bar-fill" data-w="90"></div></div></div>
<div class="skill-bar-row"><div class="skill-bar-meta"><span class="skill-bar-name">Agentic Workflows</span><span class="skill-bar-pct">84%</span></div><div class="skill-bar-track"><div class="skill-bar-fill" data-w="84"></div></div></div>
<div class="skill-section-title">Full-Stack</div>
<div class="skill-bar-row"><div class="skill-bar-meta"><span class="skill-bar-name">TypeScript &amp; Next.js</span><span class="skill-bar-pct">85%</span></div><div class="skill-bar-track"><div class="skill-bar-fill" data-w="85"></div></div></div>
<div class="skill-bar-row"><div class="skill-bar-meta"><span class="skill-bar-name">Node.js &amp; FastAPI</span><span class="skill-bar-pct">83%</span></div><div class="skill-bar-track"><div class="skill-bar-fill" data-w="83"></div></div></div>
<div class="skill-bar-row"><div class="skill-bar-meta"><span class="skill-bar-name">Supabase</span><span class="skill-bar-pct">84%</span></div><div class="skill-bar-track"><div class="skill-bar-fill" data-w="84"></div></div></div>
<div class="skill-section-title">Data</div>
<div class="skill-bar-row"><div class="skill-bar-meta"><span class="skill-bar-name">SQL &amp; DAX</span><span class="skill-bar-pct">90%</span></div><div class="skill-bar-track"><div class="skill-bar-fill" data-w="90"></div></div></div>
<div class="skill-bar-row"><div class="skill-bar-meta"><span class="skill-bar-name">Power BI &amp; Tableau</span><span class="skill-bar-pct">88%</span></div><div class="skill-bar-track"><div class="skill-bar-fill" data-w="88"></div></div></div>
<div class="skill-bar-row"><div class="skill-bar-meta"><span class="skill-bar-name">R &amp; pandas</span><span class="skill-bar-pct">80%</span></div><div class="skill-bar-track"><div class="skill-bar-fill" data-w="80"></div></div></div>
<div class="skill-section-title">Creative</div>
<div class="skill-tags-small"><span class="skill-tag-sm">Three.js</span><span class="skill-tag-sm">WebGL</span><span class="skill-tag-sm">Blender via Python</span></div>
<div class="skill-section-title" style="margin-top:1.2rem">Relevant Coursework</div>
<div class="skill-tags-small">
<span class="skill-tag-sm">Business Analytics &amp; Decision Making</span>
<span class="skill-tag-sm">Data Mining &amp; Machine Learning</span>
<span class="skill-tag-sm">Financial Accounting</span>
<span class="skill-tag-sm">Operations Management</span>
<span class="skill-tag-sm">Business Intelligence Systems</span>
<span class="skill-tag-sm">Statistical Analysis</span>
<span class="skill-tag-sm">Database Management</span>
<span class="skill-tag-sm">Financial Modeling</span>
<span class="skill-tag-sm">Project Management</span>
<span class="skill-tag-sm">Supply Chain Analytics</span>
<span class="skill-tag-sm">Corporate Finance</span>
<span class="skill-tag-sm">Marketing Analytics</span>
</div>
<div class="skill-section-title" style="margin-top:1.2rem">Education</div>
<div style="font-size:0.82rem;color:#3a2a1a;line-height:1.8">UW Bothell · BA Business Administration (Management Information Systems)<br><span style="font-size:0.7rem;color:#8a6a3a">GPA 3.7 · Dean's List · Expected June 2027</span></div>
<div style="font-size:0.7rem;color:#6a5030;margin-top:0.8rem;line-height:1.7">
<strong style="color:#3a2a1a">Awards &amp; Recognition</strong><br>
Dean's List, multiple quarters<br>
Delta Sigma Pi, Collegiate Member of the Year 2026
</div>
<div class="skill-section-title" style="margin-top:1.2rem">Certifications</div>
<div class="cert-entry"><div class="cert-icon">📊</div><div><div class="cert-name">Microsoft Power BI Data Analyst</div><div class="cert-issuer">Microsoft · Professional Certificate</div></div></div>
<div class="cert-entry"><div class="cert-icon">⚙️</div><div><div class="cert-name">Operations Management Foundations</div><div class="cert-issuer">Professional Certificate</div></div></div>
</div>`,
  contact:`<div class="panel-header"><div class="panel-kanji">連絡</div><div class="panel-title">Contact</div></div><div class="panel-content">
<div class="contact-seeking"><div class="contact-seeking-dot"></div><div class="contact-seeking-text"><strong>Open to Applied-AI and forward-deployed engineering roles</strong> starting June 2027.</div></div>
<div class="about-intro">I'm TJ, an Applied AI &amp; Full-Stack Engineer at UW Bothell. I build applied-AI systems that ship to real users, from a RAG evaluation harness to SyllabusAI and AutoAppli. Right now I'm a Global Human Insights Intern at The Coca-Cola Company.</div>
<div class="contact-row"><div class="contact-label">Email</div><div class="contact-val"><a href="mailto:tarangjammalamadaka9@gmail.com">tarangjammalamadaka9@gmail.com</a><button class="copy-btn" id="copy-email-btn" onclick="copyEmail()">Copy</button></div></div>
<div class="contact-row"><div class="contact-label">LinkedIn</div><div class="contact-val"><a href="https://linkedin.com/in/tarang-tj/" target="_blank" rel="noopener noreferrer">linkedin.com/in/tarang-tj</a></div></div>
<div class="contact-row"><div class="contact-label">GitHub</div><div class="contact-val"><a href="https://github.com/tarang-tj" target="_blank" rel="noopener noreferrer">github.com/tarang-tj</a></div></div>
<div class="contact-row"><div class="contact-label">Portfolio</div><div class="contact-val"><a href="https://tarang-tj.github.io" target="_blank" rel="noopener noreferrer">tarang-tj.github.io</a></div></div>
<div class="contact-row"><div class="contact-label">SyllabusAI</div><div class="contact-val"><a href="https://syllabusai.net" target="_blank" rel="noopener noreferrer">syllabusai.net</a></div></div>
<div class="contact-row"><div class="contact-label">AutoAppli</div><div class="contact-val"><a href="https://autoappli.com" target="_blank" rel="noopener noreferrer">autoappli.com</a></div></div>
<div class="contact-row"><div class="contact-label">Location</div><div class="contact-val">Seattle, WA</div></div>
<hr class="contact-divider">
<div class="contact-note">GPA 3.7 · Dean's List · UW Bothell MIS · Graduating June 2027 · Open to Applied-AI and forward-deployed engineering roles starting June 2027.<br><br><em>"I build applied-AI systems that ship to real users, not demos that stall at the prototype."</em></div>
<div class="contact-form">
  <div class="cf-row"><label class="cf-label" for="cf-name">Your Name</label><input class="cf-input" id="cf-name" type="text" placeholder="Jane Smith" autocomplete="name"></div>
  <div class="cf-row"><label class="cf-label" for="cf-email">Your Email</label><input class="cf-input" id="cf-email" type="email" placeholder="jane@company.com" autocomplete="email"></div>
  <div class="cf-row"><label class="cf-label" for="cf-msg">Message</label><textarea class="cf-textarea" id="cf-msg" placeholder="Hi TJ, I came across your portfolio and wanted to reach out…"></textarea></div>
  <button class="cf-submit" onclick="sendContactForm()">✉ Send Message</button>
  <div class="cf-note">Opens Gmail — works in any browser, no email client needed.</div>
</div>
</div>`
};

const PANEL_ORDER = ['projects','experience','skills','contact'];
const PANEL_LABELS = {projects:'作品 Projects', experience:'経歴 Experience', skills:'技術 Skills', contact:'連絡 Contact'};
let currentPanel = 'projects';
let _panelFromMenu = false;
const _panelCard = document.querySelector('.panel-card'); // cached once
