// Experience panel. Split out of js/70-content.js so each content file stays readable.
// Classic script: assigns onto the `panels` object declared in js/70-content.js, and must load
// before js/52-panels-controls.js. Every number here is backed by the claims ledger.
panels.experience=`<div class="panel-header"><div class="panel-kanji">経歴</div><div class="panel-title">Experience</div></div><div class="panel-content">
<div class="exp-timeline">

<div class="exp-entry">
  <div class="exp-role">Global Human Insights Intern</div>
  <div class="exp-company">The Coca-Cola Company &middot; Ignite Program &middot; Atlanta, GA</div>
  <div class="exp-date">May 18 to Aug 14, 2026</div>
  <ul class="exp-bullets">
    <li>Turned a recurring manual analytical request into an internal tool. Azure OpenAI plans the query, deterministic Python computes every figure, over a 25 to 30M row backend.</li>
    <li>Model output is schema validated, and 50+ reconciliation checks run across Excel, Power BI and Python. If two systems disagree, the run halts instead of printing a number.</li>
    <li>Traced a recurring discrepancy to rounding order, then wrote the calculation standard the team adopted.</li>
    <li>Worked five years of consumer data across 200 markets in SQL, DAX and Excel, including a brand-performance review of a top-40 market set.</li>
    <li>Demoed the tool live at the Ignite showcase, presented to insights leads, and wrote the handover documentation so it kept running after I left.</li>
  </ul>
</div>

<div class="exp-entry current">
  <div class="exp-role">Founder and AI engineer <span class="current-badge">Current</span></div>
  <div class="exp-company">SyllabusAI</div>
  <div class="exp-date">Mar 2026 to present</div>
  <ul class="exp-bullets">
    <li>Built the parser wedge that turns a syllabus into dated deadlines, exporting to Google, Apple, Outlook and plain .ics.</li>
    <li>Shipped an AI study companion on Claude across six surfaces, with per-user cost ceilings and Polar billing behind it.</li>
    <li>React, Express and Supabase, plus LMS SEO pages, held together by 1,055 tests.</li>
  </ul>
</div>

<div class="exp-entry">
  <div class="exp-role">Operations Improvement Analyst</div>
  <div class="exp-company">Quadcore Innovations &middot; Nuff Cash fintech platform</div>
  <div class="exp-date">Oct 2025 to May 2026</div>
  <ul class="exp-bullets">
    <li>Mapped the payments platform with the people who operate it, then isolated three real bottlenecks from a longer list of symptoms. Two were accepted onto the roadmap.</li>
    <li>Replaced a manual weekly reporting cycle with automated SQL and Power BI feeds behind four Tableau dashboards covering transaction volume, resolution rates and uptime.</li>
  </ul>
</div>

<div class="exp-entry">
  <div class="exp-role">IT Business Analyst Intern (2021 to 2022), then Product Analyst Intern (2022 to 2024)</div>
  <div class="exp-company">JMT Worldwide LLC</div>
  <div class="exp-date">Aug 2021 to Sep 2024</div>
  <ul class="exp-bullets">
    <li>Sat between business users and the dev team in Agile. Documented requirements and workflows, translated them into technical specs, and ran the recurring KPI reporting.</li>
    <li>SQL cohort analysis on a 50K+ MAU product database surfaced engagement drop-offs that informed roadmap prioritization.</li>
    <li>Synthesized 500+ customer responses into a prioritized insight framework.</li>
  </ul>
</div>

<div class="exp-entry current">
  <div class="exp-role">Leadership and programs <span class="current-badge">Current</span></div>
  <div class="exp-company">UW Bothell Club Council &middot; Delta Sigma Pi &middot; NASA L'SPACE &middot; Adobe &middot; Microsoft</div>
  <div class="exp-date">2025 to present</div>
  <ul class="exp-bullets">
    <li>Treasurer, UW Bothell Club Council (2026-27). A $200K+ annual allocation across 95+ organizations, reviewed against published criteria, audited in spreadsheets, and decided in front of a board.</li>
    <li>Events and Resources Coordinator, UW Bothell Club Council (2025-26). Heritage Night across 16 clubs, and a Club Recognition Banquet with 200+ attendees.</li>
    <li>President, Delta Sigma Pi Upsilon Psi (Apr 2025 to May 2026). 80+ members and a 14-person exec team, with 20% growth through structured mentorship. Named Collegiate Member of the Year 2026, an individual honor.</li>
    <li>NASA L'SPACE NPWEE Academy participant, Fall 2026, focused on autonomy, AI and space robotics.</li>
    <li>Adobe Student Ambassador (2026-27) and Microsoft Copilot Student Ambassador (Sep 2026 to present).</li>
  </ul>
</div>

</div>
</div>`;
