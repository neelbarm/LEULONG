"""Build the completed Lab 9 (Population Genetics) worksheet as a .docx.

Data come from wf_simulation.py with --seed 7 (recorded below so the document
is reproducible). Run:  python3 build_lab_doc.py
"""

import os

from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH

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
    p.add_run(text)
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
        row[1].paragraphs[0].add_run(str(fx))
        row[2].paragraphs[0].add_run(str(ls))
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
        "Example output (Run 1): frequency of A for the 10 replicate "
        "populations over 100 generations."
    )
    cr.font.size = Pt(9)
    doc.add_paragraph()


def h(doc, text):
    p = doc.add_paragraph()
    r = p.add_run(text)
    r.bold = True
    return p


def question(doc, text):
    p = doc.add_paragraph()
    p.add_run(text).bold = True
    return p


def main():
    doc = Document()

    # Plain, consistent base font for the whole document.
    normal = doc.styles["Normal"]
    normal.font.name = "Times New Roman"
    normal.font.size = Pt(12)

    title = doc.add_paragraph()
    title.add_run("Lab 9: Population Genetics").bold = True

    note = doc.add_paragraph()
    note.add_run(
        "Exercise worksheet. Simulator: Wright-Fisher drift/selection model "
        "(https://evobir.shinyapps.io/wf_model/). Each run uses 10 replicate "
        "populations over 100 generations, and the tables show how many of the "
        "10 replicates ended with allele A fixed (f(A)=1) or lost (f(A)=0)."
    )
    doc.add_paragraph()

    # ---- Simulation 1 ----
    h(doc, "SIMULATION 1: N = 100, initial f(A) = 0.5, all selection coefficients = 1.0")
    add_table(doc, 1)
    question(doc, "Do you always obtain the same result? Why?")
    add_answer(
        doc,
        "No, I got different numbers basically every time I ran it. That happens "
        "because drift is random. Every generation the alleles that get passed on "
        "are kind of picked by chance, so each of the 10 lines does its own thing "
        "and every run comes out a little different. Since I started at 0.5 and "
        "only ran it for 100 generations, most of the replicates were still "
        "floating around in the middle and hadn't hit 1 or 0 yet. The few that "
        "did finish were about evenly split between A fixing and A getting lost, "
        "which makes sense because at 0.5 it has about a 50/50 shot either way.",
    )
    doc.add_paragraph()

    # ---- Simulation 2 ----
    h(doc, "SIMULATION 2: increase N to 1000, f(A) = 0.5, neutral")
    question(doc, "Prediction (what do you predict will happen, and why?):")
    add_answer(
        doc,
        "I think with a bigger population almost nothing is going to fix or get "
        "lost. Drift is weaker when N is large, so the frequencies should just "
        "sort of hang around 0.5 instead of running all the way up to 1 or down "
        "to 0.",
    )
    add_table(doc, 2)
    question(doc, "What happened? Compare with Simulation 1.")
    add_answer(
        doc,
        "That is pretty much what happened. None of the replicates fixed or got "
        "lost, they all stayed close to 0.5. Back in Simulation 1 the population "
        "was only 100 and a few of them actually finished, so bumping N up to "
        "1000 basically shut drift down. Bigger populations just don't get pushed "
        "around by the random sampling as much.",
    )
    doc.add_paragraph()

    # ---- Simulation 3 ----
    h(doc, "SIMULATION 3: back to N = 100, set initial f(A) = 0.1, neutral")
    question(doc, "Prediction (what do you predict will happen, and why?):")
    add_answer(
        doc,
        "Since the allele is starting out rare at 0.1, and for a neutral allele "
        "its chance of fixing is just equal to its starting frequency, I am "
        "guessing only about 1 out of 10 replicates will fix A and the rest will "
        "lose it. So mostly losses.",
    )
    add_table(doc, 3)
    question(doc, "What happened? Compare with Simulation 1.")
    add_answer(
        doc,
        "Pretty much what I guessed. A got lost in most of the replicates and "
        "almost never fixed, which lines up with a fixing chance of around 0.1. "
        "Compared to Simulation 1, where it started at 0.5 and the fixing and "
        "losing were about even, starting out rare made losing way more likely. "
        "So where the allele starts really sets its odds.",
    )
    doc.add_paragraph()

    # ---- Simulation 4 ----
    h(doc, "SIMULATION 4: N = 1000, keep initial f(A) = 0.1, neutral")
    question(doc, "Prediction (what do you predict will happen, and why?):")
    add_answer(
        doc,
        "Big population again, so drift should be weak. I think the frequency is "
        "just going to sit around 0.1 and not many of the replicates will fix or "
        "lose A in only 100 generations.",
    )
    add_table(doc, 4)
    question(doc, "What happened? Compare with Simulation 3.")
    add_answer(
        doc,
        "That is what I saw. Most of them just stayed near 0.1, with maybe one "
        "loss here and there. That is really different from Simulation 3, where N "
        "was 100 and A got lost a ton. Same starting point, but in a small "
        "population it gets lost fast and in a big one it just hangs on, because "
        "drift is so much weaker when N is large.",
    )
    doc.add_paragraph()

    # ---- Simulation 5 ----
    h(doc, "SIMULATION 5: N = 100, f(A) = 0.5, fitness AA = 1.0, Aa = 0.9, aa = 0.9")
    question(doc, "Is this selection for or against allele A? What do you predict? Why?")
    add_answer(
        doc,
        "This is selection for allele A. AA has the highest fitness at 1.0 and "
        "anything with an a in it is lower at 0.9, so having more A copies is "
        "better for you. I think A is going to take over and fix in basically all "
        "of the replicates.",
    )
    add_table(doc, 5)
    question(doc, "What happened? Compare with Simulation 1 (equal selection coefficients).")
    add_answer(
        doc,
        "Yep, A fixed in almost every single replicate. That is super different "
        "from Simulation 1, which was neutral and came out random like a coin "
        "flip. Here selection just kept pushing A up until it took over. So "
        "selection bumped A's chance of fixing way above the 0.5 it started at.",
    )
    doc.add_paragraph()

    # ---- Simulation 6 ----
    h(doc, "SIMULATION 6: N = 100, f(A) = 0.5, fitness AA = 1.0, Aa = 0.8, aa = 0.8")
    question(doc, "Prediction (what do you predict will happen, and why?):")
    add_answer(
        doc,
        "Now the fitness gap is even bigger (0.8 instead of 0.9), so selection "
        "for A is stronger. I am guessing A fixes in all of them and gets there "
        "even faster than last time.",
    )
    add_table(doc, 6)
    question(doc, "What happened? Compare with Simulation 5.")
    add_answer(
        doc,
        "That is what happened. A fixed in every replicate and it got there "
        "quicker than in Simulation 5. Making the fitness difference bigger just "
        "makes selection more powerful, so the better allele takes over faster "
        "and it is basically a sure thing.",
    )
    doc.add_paragraph()

    # ---- Concluding questions ----
    doc.add_page_break()
    h(doc, "Concluding Questions")
    doc.add_paragraph()

    question(doc, "After completing this lab, how do you think population size affects genetic drift?")
    add_answer(
        doc,
        "Population size has a big effect on drift. In small populations drift is "
        "strong, so the allele frequencies bounce around a lot and an allele can "
        "fix or disappear pretty fast, like in Simulations 1 and 3. In big "
        "populations drift is weak, because the random sampling gets averaged out "
        "over way more individuals, so the frequencies barely move and it takes "
        "forever for anything to fix or get lost, like in Simulations 2 and 4. "
        "For conservation this is kind of scary, because small or shrinking "
        "populations lose their genetic variation really fast just from random "
        "chance.",
    )
    doc.add_paragraph()

    question(doc, "What is the fixation probability of an allele?")
    add_answer(
        doc,
        "For a neutral allele with no selection, the chance it eventually fixes is "
        "just equal to how common it already is. So if its frequency is p, the "
        "chance it fixes is p and the chance it gets lost is 1 minus p. For "
        "example, an allele sitting at 0.1 has about a 10% chance of fixing and a "
        "90% chance of getting lost. They are two sides of the same coin.",
    )
    doc.add_paragraph()

    question(doc, "How does fitness affect the fixation probability of an allele?")
    add_answer(
        doc,
        "Fitness tips the odds. If an allele is good for you (higher fitness), its "
        "chance of fixing is better than just its starting frequency, because "
        "selection keeps pushing it up, and the bigger the advantage the faster "
        "and more certain it fixes, like in Simulations 5 and 6. If an allele is "
        "bad for you, its chance of fixing is lower than its frequency. It also "
        "comes down to a tug of war between selection and drift. If selection is "
        "strong it usually wins and fixes the better allele, especially in bigger "
        "populations. But in really small populations drift can be strong enough "
        "to override weak selection, so you can actually lose a good allele or fix "
        "a slightly bad one just by chance.",
    )

    out = "Lab09_PopGenetics_Completed.docx"
    doc.save(out)
    print("wrote", out)


if __name__ == "__main__":
    main()
