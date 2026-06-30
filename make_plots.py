"""Generate allele-frequency trajectory plots for each Lab 9 simulation,
styled like the evobir wf_model app (10 replicate lines, f(A) vs generations,
with a fixed/lost readout). Plots match "Run 1" of each recorded data table
(seed 7), so the figures are consistent with Lab09_PopGenetics_Completed.docx.

Run:  python3 make_plots.py   ->  writes plots/sim1.png ... sim6.png
"""

import os
import random

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

GENERATIONS = 100
REPLICATES = 10
COLORS = plt.cm.tab10.colors

# (id, title, N, p0, wAA, wAa, waa)
SIMS = [
    (1, "Simulation 1: N=100, f(A)=0.5, neutral", 100, 0.5, 1.0, 1.0, 1.0),
    (2, "Simulation 2: N=1000, f(A)=0.5, neutral", 1000, 0.5, 1.0, 1.0, 1.0),
    (3, "Simulation 3: N=100, f(A)=0.1, neutral", 100, 0.1, 1.0, 1.0, 1.0),
    (4, "Simulation 4: N=1000, f(A)=0.1, neutral", 1000, 0.1, 1.0, 1.0, 1.0),
    (5, "Simulation 5: N=100, f(A)=0.5, AA=1.0 Aa=0.9 aa=0.9", 100, 0.5, 1.0, 0.9, 0.9),
    (6, "Simulation 6: N=100, f(A)=0.5, AA=1.0 Aa=0.8 aa=0.8", 100, 0.5, 1.0, 0.8, 0.8),
]


def wf_path(N, p0, wAA, wAa, waa, gens, rng):
    p = p0
    path = [p]
    for _ in range(gens):
        if 0 < p < 1:
            f_AA = p * p * wAA
            f_Aa = 2 * p * (1 - p) * wAa
            f_aa = (1 - p) * (1 - p) * waa
            p_sel = (f_AA + 0.5 * f_Aa) / (f_AA + f_Aa + f_aa)
            p = sum(1 for _ in range(2 * N) if rng.random() < p_sel) / (2 * N)
        path.append(p)
    return path


def main():
    os.makedirs("plots", exist_ok=True)
    rng = random.Random(7)  # same seed as the recorded Run 1 data
    for sid, title, N, p0, wAA, wAa, waa in SIMS:
        fig, ax = plt.subplots(figsize=(7, 4.3))
        fixed = lost = 0
        for i in range(REPLICATES):
            path = wf_path(N, p0, wAA, wAa, waa, GENERATIONS, rng)
            ax.plot(range(GENERATIONS + 1), path, color=COLORS[i % 10], lw=1.1)
            if path[-1] >= 0.999:
                fixed += 1
            elif path[-1] <= 0.001:
                lost += 1
        # advance the RNG past runs 2-5 so each sim's Run 1 uses fresh draws
        for _ in range(4):
            for _ in range(REPLICATES):
                wf_path(N, p0, wAA, wAa, waa, GENERATIONS, rng)
        ax.set_xlim(0, GENERATIONS)
        ax.set_ylim(0, 1)
        ax.set_xlabel("Generations")
        ax.set_ylabel("Frequency of A")
        ax.set_title(title, fontsize=11)
        ax.text(0.02, 0.97,
                f"Allele A fixed in {fixed} populations\n"
                f"Allele A lost in {lost} populations",
                transform=ax.transAxes, va="top", fontsize=9,
                bbox=dict(boxstyle="round", fc="white", ec="0.7", alpha=0.8))
        fig.tight_layout()
        out = f"plots/sim{sid}.png"
        fig.savefig(out, dpi=110)
        plt.close(fig)
        print(f"wrote {out}  (Run 1: fixed={fixed}, lost={lost})")


if __name__ == "__main__":
    main()
