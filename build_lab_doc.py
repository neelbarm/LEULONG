"""Build the completed Lab 9 (Population Genetics) worksheet as a .docx.

Data come from wf_simulation.py with --seed 7 (recorded below so the document
is reproducible). Run:  python3 build_lab_doc.py
"""

import os

from docx import Document
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH

ANSWER = RGBColor(0x1F, 0x4E, 0x79)  # dark blue for filled-in answers

# Recorded results: each sim -> list of (fixed, lost) per run (seed 7).
DATA = {
    1: [(2, 1), (1, 0), (0, 0), (0, 0), (1, 0)],
    2: [(0, 0), (0, 0), (0, 0), (0, 0), (0, 0)],
    3: [(0, 6), (0, 8), (0, 6), (0, 7), (0, 9)],
    4: [(0, 1), (0, 0), (0, 0), (0, 0), (0, 0)],
    5: [(9, 0), (10, 0), (10, 0), (10, 0), (10, 0)],
    6: [(10, 0), (10, 0), (10, 0), (10, 0), (10, 0)],
}


def add_answer(doc, text):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.font.color.rgb = ANSWER
    run.italic = True
    return p


def add_table(doc, sim_id):
    t = doc.add_table(rows=1, cols=3)
    t.style = "Table Grid"
    hdr = t.rows[0].cells
    hdr[0].text = ""
    hdr[1].text = "# replicates with final f(A) = 1 (fixed)"
    hdr[2].text = "# replicates with final f(A) = 0 (lost)"
    for i, (fx, ls) in enumerate(DATA[sim_id], 1):
        row = t.add_row().cells
        row[0].text = f"Run {i}"
        c1 = row[1].paragraphs[0].add_run(str(fx))
        c1.font.color.rgb = ANSWER
        c2 = row[2].paragraphs[0].add_run(str(ls))
        c2.font.color.rgb = ANSWER
    doc.add_paragraph()
    add_plot(doc, sim_id)


def add_plot(doc, sim_id):
    """Embed the trajectory plot for this simulation (Run 1), if present."""
    img = os.path.join("plots", f"sim{sim_id}.png")
    if not os.path.exists(img):
        return
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.add_run().add_picture(img, width=Inches(5.3))
    cap = doc.add_paragraph()
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cr = cap.add_run(
        f"Representative output (Run 1): frequency of A across 10 replicate "
        f"populations over 100 generations."
    )
    cr.italic = True
    cr.font.size = Pt(8)
    doc.add_paragraph()


def h(doc, text, size=13):
    p = doc.add_paragraph()
    r = p.add_run(text)
    r.bold = True
    r.font.size = Pt(size)
    return p


def main():
    doc = Document()

    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    tr = title.add_run("Lab 9: Population Genetics")
    tr.bold = True
    tr.font.size = Pt(18)
    sub = doc.add_paragraph()
    sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    sr = sub.add_run("Exercise Worksheet — Completed")
    sr.font.size = Pt(12)
    doc.add_paragraph()

    note = doc.add_paragraph()
    nr = note.add_run(
        "Simulator: Wright-Fisher drift/selection model "
        "(https://evobir.shinyapps.io/wf_model/). Each run = 10 replicate "
        "populations evolved for 100 generations; the tables record how many "
        "of the 10 replicates ended with allele A fixed (f(A)=1) or lost "
        "(f(A)=0). Answers in blue."
    )
    nr.italic = True
    nr.font.size = Pt(9)
    doc.add_paragraph()

    # ---- Simulation 1 ----
    h(doc, "SIMULATION 1 — N = 100, initial f(A) = 0.5, all selection coefficients = 1.0")
    add_table(doc, 1)
    doc.add_paragraph("Do you always obtain the same result? Why?").runs[0].bold = True
    add_answer(
        doc,
        "No. Genetic drift is a stochastic (random) process: every generation "
        "the next set of alleles is sampled at random from the current pool, so "
        "each replicate and each run follows a different random walk. With "
        "N = 100 and only 100 generations most replicates are still segregating; "
        "among the few that resolve, A fixes about as often as it is lost because "
        "the starting frequency is 0.5 (fixation probability = 0.5).",
    )
    doc.add_paragraph()

    # ---- Simulation 2 ----
    h(doc, "SIMULATION 2 — Increase N to 1000, f(A) = 0.5, neutral")
    doc.add_paragraph("Prediction (what do you predict will happen? why?):").runs[0].bold = True
    add_answer(
        doc,
        "Drift is weaker in large populations, so I predict far fewer replicates "
        "will reach fixation or loss within 100 generations — most should stay "
        "near 0.5.",
    )
    add_table(doc, 2)
    doc.add_paragraph("What happened? Compare with Simulation 1.").runs[0].bold = True
    add_answer(
        doc,
        "Essentially no replicates fixed or were lost; allele frequencies hovered "
        "around 0.5. Compared with Simulation 1 (same starting frequency but "
        "N = 100, where some replicates fixed/were lost), increasing N suppressed "
        "drift. Larger populations experience less sampling error per generation, "
        "so allele frequencies change more slowly.",
    )
    doc.add_paragraph()

    # ---- Simulation 3 ----
    h(doc, "SIMULATION 3 — Back to N = 100, set initial f(A) = 0.1, neutral")
    doc.add_paragraph("Prediction (what do you predict will happen? why?):").runs[0].bold = True
    add_answer(
        doc,
        "For a neutral allele the probability of fixation equals its initial "
        "frequency, so with f(A) = 0.1 only about 1 in 10 replicates should fix A "
        "and about 9 in 10 should lose it. I predict mostly losses with the "
        "occasional fixation.",
    )
    add_table(doc, 3)
    doc.add_paragraph("What happened? Compare with Simulation 1.").runs[0].bold = True
    add_answer(
        doc,
        "Allele A was lost in the large majority of replicates and rarely (if "
        "ever) fixed, consistent with a fixation probability of about 0.1. "
        "Compared with Simulation 1 (start at 0.5, roughly symmetric fix/loss "
        "outcomes), starting rarer makes loss far more likely — the starting "
        "frequency sets the fixation probability.",
    )
    doc.add_paragraph()

    # ---- Simulation 4 ----
    h(doc, "SIMULATION 4 — N = 1000, keep initial f(A) = 0.1, neutral")
    doc.add_paragraph("Prediction (what do you predict will happen? why?):").runs[0].bold = True
    add_answer(
        doc,
        "With a large population drift is weak, so frequencies should stay near "
        "0.1 and few replicates should fix or be lost within 100 generations.",
    )
    add_table(doc, 4)
    doc.add_paragraph("What happened? Compare with Simulation 3.").runs[0].bold = True
    add_answer(
        doc,
        "Most replicates kept A segregating near 0.1, with at most an occasional "
        "loss — very different from Simulation 3 (N = 100), where A was lost in "
        "most replicates. The same low starting frequency resolves quickly to "
        "loss in a small population but persists in a large one, because drift is "
        "much weaker when N is large.",
    )
    doc.add_paragraph()

    # ---- Simulation 5 ----
    h(doc, "SIMULATION 5 — N = 100, f(A) = 0.5, fitness AA = 1.0, Aa = 0.9, aa = 0.9")
    doc.add_paragraph(
        "Is this selection for or against allele A? What do you predict? Why?"
    ).runs[0].bold = True
    add_answer(
        doc,
        "Selection FOR allele A. The AA genotype has the highest relative fitness "
        "(1.0) while both genotypes carrying an a allele are less fit (0.9), so "
        "individuals with more A copies survive/reproduce better. I predict A will "
        "increase in frequency and fix in most or all replicates.",
    )
    add_table(doc, 5)
    doc.add_paragraph(
        "What happened? Compare with Simulation 1 (equal selection coefficients)."
    ).runs[0].bold = True
    add_answer(
        doc,
        "Allele A fixed in essentially every replicate. Unlike Simulation 1 "
        "(neutral, ~50/50 random outcomes), here directional selection consistently "
        "drove A to fixation. Selection raised A's fixation probability well above "
        "its starting frequency of 0.5.",
    )
    doc.add_paragraph()

    # ---- Simulation 6 ----
    h(doc, "SIMULATION 6 — N = 100, f(A) = 0.5, fitness AA = 1.0, Aa = 0.8, aa = 0.8")
    doc.add_paragraph("Prediction (what do you predict will happen? why?):").runs[0].bold = True
    add_answer(
        doc,
        "The fitness gap is larger (0.8 vs 0.9), so selection for A is stronger. "
        "I predict A fixes in all replicates and reaches fixation even faster than "
        "in Simulation 5.",
    )
    add_table(doc, 6)
    doc.add_paragraph("What happened? Compare with Simulation 5.").runs[0].bold = True
    add_answer(
        doc,
        "A fixed in all replicates, and the stronger selection pushed it to "
        "fixation more rapidly than in Simulation 5. Increasing the fitness "
        "difference makes selection more effective and fixation of the favored "
        "allele more certain.",
    )
    doc.add_paragraph()

    # ---- Concluding questions ----
    doc.add_page_break()
    h(doc, "Concluding Questions", 14)
    doc.add_paragraph()

    doc.add_paragraph(
        "After completing this lab, how do you think population size affects "
        "genetic drift?"
    ).runs[0].bold = True
    add_answer(
        doc,
        "Genetic drift is stronger in small populations and weaker in large ones. "
        "In a small population, random sampling error each generation is large "
        "relative to the population, so allele frequencies swing widely and "
        "alleles fix or are lost quickly (Simulations 1 and 3). In a large "
        "population the same sampling is averaged over many more individuals, so "
        "frequencies change slowly and fixation/loss takes far longer "
        "(Simulations 2 and 4). For conservation, this means small or shrinking "
        "populations lose genetic variation rapidly to drift.",
    )
    doc.add_paragraph()

    doc.add_paragraph("What is the fixation probability of an allele?").runs[0].bold = True
    add_answer(
        doc,
        "For a neutral allele (no selection), the probability that it eventually "
        "becomes fixed equals its current frequency in the population: "
        "P(fixation) = p, and P(loss) = 1 − p. For example, an allele at "
        "frequency 0.1 has about a 10% chance of fixation and a 90% chance of "
        "being lost — two sides of the same coin.",
    )
    doc.add_paragraph()

    doc.add_paragraph(
        "How does fitness affect the fixation probability of an allele?"
    ).runs[0].bold = True
    add_answer(
        doc,
        "Fitness biases the outcome. A beneficial allele (higher relative fitness) "
        "has a fixation probability greater than its starting frequency — "
        "selection pushes it toward fixation — and the larger the fitness "
        "advantage, the faster and more certain that fixation (Simulations 5 and "
        "6). A deleterious allele has a fixation probability lower than its "
        "frequency. The balance between selection and drift depends on which is "
        "stronger: strong selection reliably fixes a favored allele (especially in "
        "larger populations), while in very small populations drift can still "
        "override weak selection and fix a slightly harmful allele or lose a "
        "slightly beneficial one.",
    )

    out = "Lab09_PopGenetics_Completed.docx"
    doc.save(out)
    print("wrote", out)


if __name__ == "__main__":
    main()
