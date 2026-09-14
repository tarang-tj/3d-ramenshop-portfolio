// Visitor-facing content: the four panels and their order and labels. Gated by scripts/check_claims.py.
// Split from the original single-file index.html on 2026-09-13; classic script, shares the global scope
// with every other js/*.js file. Load order is the numeric prefix.
// Every sentence here must be backed by the claims ledger. Projects live in js/71-content-projects.js,
// experience in js/72-content-experience.js; both assign onto this object before js/52 runs.
const panels={
  skills:`<div class="panel-header"><div class="panel-kanji">技術</div><div class="panel-title">Skills</div></div><div class="panel-content" id="skills-content">
<div class="case-brief"><b>No percentage bars.</b> Every skill below names the project or the role that proves it, so you can go check.</div>

<div class="skill-group">
  <div class="skill-group-title">Languages</div>
  <div class="skill-tags"><span class="skill-tag">Python</span><span class="skill-tag">pandas</span><span class="skill-tag">LightGBM</span><span class="skill-tag">pytest</span><span class="skill-tag">SQL</span><span class="skill-tag">SQL Server</span><span class="skill-tag">PostgreSQL</span><span class="skill-tag">TypeScript</span><span class="skill-tag">JavaScript</span><span class="skill-tag">R</span><span class="skill-tag">DAX</span></div>
  <div class="project-desc">Proof: Python and SQL Server run the Coca-Cola internal tool. Python, pandas and pytest run ragproof. LightGBM trained the Pokemon TCG policy. PostgreSQL runs the e-commerce analysis. R built the Washington housing study. DAX shipped the reporting at Coca-Cola.</div>
</div>

<div class="skill-group">
  <div class="skill-group-title">AI engineering</div>
  <div class="skill-tags"><span class="skill-tag">Claude API</span><span class="skill-tag">Azure OpenAI</span><span class="skill-tag">Hugging Face models</span><span class="skill-tag">RAG evaluation</span></div>
  <div class="project-desc">Proof: Azure OpenAI plans the query inside the Coca-Cola tool while code computes the numbers. The Claude API runs SyllabusAI and AutoAppli. ragproof scores Hugging Face embedding and reranker models against BM25.</div>
</div>

<div class="skill-group">
  <div class="skill-group-title">Web and services</div>
  <div class="skill-tags"><span class="skill-tag">Next.js</span><span class="skill-tag">React</span><span class="skill-tag">FastAPI</span><span class="skill-tag">Node / Express</span><span class="skill-tag">REST</span><span class="skill-tag">OAuth</span><span class="skill-tag">SSE</span><span class="skill-tag">Supabase</span></div>
  <div class="project-desc">Proof: AutoAppli is Next.js and FastAPI on Supabase. SyllabusAI is React and Express on Supabase, with calendar OAuth and streamed progress.</div>
</div>

<div class="skill-group">
  <div class="skill-group-title">Ship and run</div>
  <div class="skill-tags"><span class="skill-tag">Docker</span><span class="skill-tag">GitHub Actions</span><span class="skill-tag">Git</span><span class="skill-tag">Vercel</span></div>
  <div class="project-desc">Proof: ragproof ships with Docker and green CI. Model Sentinel is gated by ruff, pytest and a CI demo scan. SyllabusAI and AutoAppli deploy on Vercel.</div>
</div>

<div class="skill-group">
  <div class="skill-group-title">Analysis and delivery</div>
  <div class="skill-tags"><span class="skill-tag">Power BI</span><span class="skill-tag">Tableau</span><span class="skill-tag">Excel</span><span class="skill-tag">Jira / Agile</span></div>
  <div class="project-desc">Proof: four Tableau dashboards and automated Power BI feeds at Quadcore. 50+ reconciliation checks across Excel, Power BI and Python at Coca-Cola. Agile delivery between business users and engineers at JMT Worldwide.</div>
</div>

<div class="skill-group">
  <div class="skill-group-title">Creative code</div>
  <div class="skill-tags"><span class="skill-tag">Three.js</span><span class="skill-tag">Blender via Python</span></div>
  <div class="project-desc">Proof: this ramen shop is Three.js written by hand. The Jacobs' Pharmacy capstone is a Blender scene generated from Python.</div>
</div>

<div class="skill-section-title" style="margin-top:1.2rem">Education</div>
<div style="font-size:0.82rem;line-height:1.8">UW Bothell &middot; B.A. Business Administration (Management Information Systems)<br><span style="font-size:0.72rem;opacity:.75">Minors in Data Analytics and Economics &middot; Expected June 2027 &middot; GPA 3.7 &middot; Dean's List 2024, 2025</span></div>

<div class="skill-section-title" style="margin-top:1.2rem">Awards</div>
<div style="font-size:0.74rem;line-height:1.7;opacity:.85">First place, CED Finance Case Competition<br>Collegiate Member of the Year 2026, Delta Sigma Pi</div>

<div class="skill-section-title" style="margin-top:1.2rem">Certifications</div>
<div class="cert-entry"><div class="cert-icon">📊</div><div><div class="cert-name">Power BI</div><div class="cert-issuer">Microsoft Certified</div></div></div>
<div class="cert-entry"><div class="cert-icon">🧭</div><div><div class="cert-name">AI Fluency</div><div class="cert-issuer">Anthropic</div></div></div>
</div>`,
  contact:`<div class="panel-header"><div class="panel-kanji">連絡</div><div class="panel-title">Contact</div></div><div class="panel-content">
<div class="contact-seeking"><div class="contact-seeking-dot"></div><div class="contact-seeking-text"><strong>Full-time from June 2027, part-time now.</strong> Applied AI and forward-deployed engineering.</div></div>
<div class="about-intro">I am TJ, a UW Bothell MIS senior who builds applied AI systems and then tries to break them. This summer at The Coca-Cola Company I built an internal analysis tool where the model plans the query and code computes every number. I run SyllabusAI and AutoAppli, and I keep ragproof honest.</div>
<div class="contact-row"><div class="contact-label">Email</div><div class="contact-val"><a href="mailto:tarangjammalamadaka9@gmail.com">tarangjammalamadaka9@gmail.com</a><button class="copy-btn" id="copy-email-btn" onclick="copyEmail()">Copy</button></div></div>
<div class="contact-row"><div class="contact-label">LinkedIn</div><div class="contact-val"><a href="https://linkedin.com/in/tarang-tj/" target="_blank" rel="noopener noreferrer">linkedin.com/in/tarang-tj</a></div></div>
<div class="contact-row"><div class="contact-label">GitHub</div><div class="contact-val"><a href="https://github.com/tarang-tj" target="_blank" rel="noopener noreferrer">github.com/tarang-tj</a></div></div>
<div class="contact-row"><div class="contact-label">Portfolio</div><div class="contact-val"><a href="https://tarang-tj.github.io" target="_blank" rel="noopener noreferrer">tarang-tj.github.io</a></div></div>
<div class="contact-row"><div class="contact-label">SyllabusAI</div><div class="contact-val"><a href="https://syllabusai.net" target="_blank" rel="noopener noreferrer">syllabusai.net</a></div></div>
<div class="contact-row"><div class="contact-label">AutoAppli</div><div class="contact-val"><a href="https://auto-appli.vercel.app" target="_blank" rel="noopener noreferrer">auto-appli.vercel.app</a></div></div>
<div class="contact-row"><div class="contact-label">Location</div><div class="contact-val">Seattle area</div></div>
<hr class="contact-divider">
<div class="contact-note">Tarang (TJ) Jammalamadaka &middot; UW Bothell, Management Information Systems &middot; GPA 3.7 &middot; Dean's List 2024, 2025 &middot; graduating June 2027.<br><br><em>"The model never computes a number. Code does, and the tests check it."</em></div>
<div class="contact-form">
  <div class="cf-row"><label class="cf-label" for="cf-name">Your Name</label><input class="cf-input" id="cf-name" type="text" placeholder="Jane Smith" autocomplete="name"></div>
  <div class="cf-row"><label class="cf-label" for="cf-email">Your Email</label><input class="cf-input" id="cf-email" type="email" placeholder="jane@company.com" autocomplete="email"></div>
  <div class="cf-row"><label class="cf-label" for="cf-msg">Message</label><textarea class="cf-textarea" id="cf-msg" placeholder="Hi TJ, I came across your portfolio and wanted to reach out."></textarea></div>
  <button class="cf-submit" onclick="sendContactForm()">✉ Send Message</button>
  <div class="cf-note">Opens Gmail in a new tab. No email client needed.</div>
</div>
</div>`
};

const PANEL_ORDER = ['projects','experience','skills','contact'];
const PANEL_LABELS = {projects:'作品 Projects', experience:'経歴 Experience', skills:'技術 Skills', contact:'連絡 Contact'};
let currentPanel = 'projects';
let _panelFromMenu = false;
const _panelCard = document.querySelector('.panel-card'); // cached once
