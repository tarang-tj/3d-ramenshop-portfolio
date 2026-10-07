#!/usr/bin/env python3
"""Claims gate for the public portfolio.

Every sentence on the site must be backed by the claims ledger at
~/Desktop/Resume/2026-tailored/facts.md. This script bans the phrases that
ledger (and its check.py) has refuted, bans any printed GPA, and requires
the identity strings. It scans index.html plus css/ and js/ text.
"""
import glob, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

BANNED = [
    (r"\bARIMA\b", "Economic Pulse has no ARIMA in the repo"),
    (r"\b(37|43) tests\b", "Flow Control public main has 20 tests"),
    (r"\bASUWB\b", "Treasurer role is UW Bothell Club Council"),
    (r"\$4\s?M\b", "Treasurer budget: TJ's dated figure is $205,000"),
    (r"\b25%\s+reduction\b", "Quadcore 25% could not be defended live"),
    (r"cutting weekly reporting effort", "unverified Quadcore 40% claim"),
    (r"\babout 60%\b", "JMT 60% is unsourced"),
    (r"\b100K\+ (?:GMV|orders)\b", "E-commerce real figures are 620 orders / $112K"),
    (r"\bRedis\b", "Redis is not an AutoAppli dependency"),
    (r"\bReact Native\b", "not TJ's code"),
    (r"\bAWS\b|\bGCP\b|\bGoogle Cloud\b", "no hands-on AWS/GCP"),
    (r"95%\+?\s*accuracy", "SyllabusAI: no accuracy measurement exists"),
    (r"2,?500\+?\s*syllabi", "SyllabusAI: OCW catalog size, not syllabi processed"),
    (r"\b\d[\d,]*\+?\s*(?:active\s+)?users\b", "SyllabusAI: no user metrics anywhere public (TJ directive 2026-08-06)"),
    (r"\bUW students\b", "no SyllabusAI user metrics"),
    (r"\bVoyage\b", "SyllabusAI: no voyage in repo"),
    (r"3,?000\+?\s*sightings", "AutoAppli: configured floor, not measured"),
    (r"published on PyPI|PyPI package|\bnpm\b(?! run)", "no PyPI/npm publication exists"),
    (r"weekly checkpoints|shipped on time|expected savings", "unbacked schedule/savings phrasing"),
    (r"\bFanta\b", "TJ hold 2026-07-26: brand review stays generic ('a top-40 market set')"),
    (r"\bNielsen(?:IQ)?\b", "data-source disclosure held out of public surfaces"),
    (r"\bConsumption\b|\bOccasions\b|\bBEACH\b", "internal dataset names"),
    (r"408[-.\s]?406[-.\s]?4205", "phone number must not be public"),
    (r"chapter of the year", "Collegiate Member of the Year is an individual honor"),
    (r"Microsoft Copilot AI Evaluator", "not the role title; use Microsoft Copilot Student Ambassador"),
    (r"—", "no em dashes in new copy (writing rule)"),
    # 2026-10-06 print rules (facts.md): no GPA anywhere, SyllabusAI is free, one AutoAppli address.
    (r"\bGPA\b:?\s*[0-9]\.[0-9]", "no GPA is printed on any public surface (TJ 2026-10-06)"),
    (r"Polar billing", "SyllabusAI is a free ed-tech tool, no longer sold"),
    (r"auto-appli\.vercel\.app", "AutoAppli's address is autoappli.com"),
]
REQUIRED = [
    (r"Tarang", "name"), (r"tarangjammalamadaka9@gmail\.com", "email"),
    (r"linkedin\.com/in/tarang-tj", "LinkedIn"), (r"github\.com/tarang-tj", "GitHub"),
    (r"June 2027", "graduation / availability line"),
    (r"20 tests", "Flow Control card must state the public test count") ,
]

def visible_text(path):
    s = open(path, encoding="utf-8").read()
    if path.endswith(".html"):
        s = re.sub(r"<style[\s\S]*?</style>", " ", s)
        s = re.sub(r"<script(?![^>]*type=\"application/ld\+json\")[^>]*>[\s\S]*?</script>", " ", s)
    s = re.sub(r"<[^>]+>", " ", s)
    return s

def main():
    files = [os.path.join(ROOT, "index.html")] + sorted(glob.glob(os.path.join(ROOT, "js", "*.js"))) + sorted(glob.glob(os.path.join(ROOT, "css", "*.css"))) + [os.path.join(ROOT, "README.md")]
    files = [f for f in files if os.path.exists(f)]
    fails = []
    corpus = ""
    for f in files:
        txt = visible_text(f)
        corpus += "\n" + txt
        prose = f.endswith((".html", ".md")) or re.match(r"7\d-content", os.path.basename(f)) is not None
        for pat, why in BANNED:
            if "—" in pat and not prose:
                continue  # em-dash rule applies to visitor-facing prose, not engine code comments
            for m in re.finditer(pat, txt, re.I if "—" not in pat else 0):
                line = txt.count("\n", 0, m.start()) + 1
                fails.append(f"{os.path.relpath(f, ROOT)}: banned {m.group(0)!r} - {why}")
                break
    # Published PDFs are public surfaces too. The 2026-10-06 resume PDF went out naming a
    # data vendor because this gate never opened it. The phone number is allowed inside the
    # resume PDF only (TJ 2026-10-06); every other ban applies.
    pdfs = sorted(glob.glob(os.path.join(ROOT, "*.pdf")))
    if pdfs:
        try:
            from pypdf import PdfReader
        except ImportError:
            fails.append("cannot scan PDFs: pypdf is not installed (pip install pypdf)")
            pdfs = []
    for f in pdfs:
        txt = re.sub(r"\s+", " ", "".join(pg.extract_text() or "" for pg in PdfReader(f).pages))
        for pat, why in BANNED:
            if "408" in pat or "—" in pat:
                continue
            m = re.search(pat, txt, re.I)
            if m:
                fails.append(f"{os.path.relpath(f, ROOT)}: banned {m.group(0)!r} - {why}")
    for pat, label in REQUIRED:
        if not re.search(pat, corpus, re.I):
            fails.append(f"missing {label} ({pat})")
    if fails:
        print("FAIL claims gate"); [print("   " + x) for x in fails]; return 1
    print(f"pass claims gate ({len(files)} files, {len(pdfs)} PDFs)"); return 0

if __name__ == "__main__":
    sys.exit(main())
