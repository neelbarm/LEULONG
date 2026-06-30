"""
Lab 9: Population Genetics - Wright-Fisher drift/selection simulator.

Reproduces the model behind https://evobir.shinyapps.io/wf_model/ :
a diploid Wright-Fisher population of N individuals (2N alleles), with
optional viability selection via relative genotype fitnesses (wAA, wAa, waa).

Each "run" launches 10 replicate populations for 100 generations and records
how many replicates end with allele A fixed (f(A)=1) or lost (f(A)=0).

Usage:
    python3 wf_simulation.py          # prints all six simulations
"""

import argparse
import random

GENERATIONS = 100
REPLICATES = 10
RUNS = 5


def wf_replicate(N, p0, wAA, wAa, waa, gens=GENERATIONS, rng=random):
    """Run one Wright-Fisher replicate; return the final frequency of A."""
    p = p0
    for _ in range(gens):
        if p <= 0.0 or p >= 1.0:
            break  # absorbed (fixed or lost) - stays put
        # Genotype frequencies after random mating, weighted by fitness.
        f_AA = p * p * wAA
        f_Aa = 2 * p * (1 - p) * wAa
        f_aa = (1 - p) * (1 - p) * waa
        w_bar = f_AA + f_Aa + f_aa
        # Expected frequency of A in the gamete pool after selection.
        p_sel = (f_AA + 0.5 * f_Aa) / w_bar
        # Genetic drift: binomial sampling of 2N alleles for the next gen.
        copies = sum(1 for _ in range(2 * N) if rng.random() < p_sel)
        p = copies / (2 * N)
    return p


def run_block(N, p0, wAA, wAa, waa, runs=RUNS, replicates=REPLICATES, rng=random):
    """Return a list of (fixed, lost, segregating) tuples, one per run."""
    results = []
    for _ in range(runs):
        finals = [wf_replicate(N, p0, wAA, wAa, waa, rng=rng) for _ in range(replicates)]
        fixed = sum(1 for f in finals if f >= 0.999)
        lost = sum(1 for f in finals if f <= 0.001)
        results.append((fixed, lost, replicates - fixed - lost))
    return results


# (label, N, p0, wAA, wAa, waa)
SIMULATIONS = [
    ("Simulation 1: N=100, f(A)=0.5, neutral (all fitness = 1.0)", 100, 0.5, 1.0, 1.0, 1.0),
    ("Simulation 2: N=1000, f(A)=0.5, neutral", 1000, 0.5, 1.0, 1.0, 1.0),
    ("Simulation 3: N=100, f(A)=0.1, neutral", 100, 0.1, 1.0, 1.0, 1.0),
    ("Simulation 4: N=1000, f(A)=0.1, neutral", 1000, 0.1, 1.0, 1.0, 1.0),
    ("Simulation 5: N=100, f(A)=0.5, AA=1.0 Aa=0.9 aa=0.9", 100, 0.5, 1.0, 0.9, 0.9),
    ("Simulation 6: N=100, f(A)=0.5, AA=1.0 Aa=0.8 aa=0.8", 100, 0.5, 1.0, 0.8, 0.8),
]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--seed", type=int, default=7, help="RNG seed for reproducibility")
    args = ap.parse_args()
    rng = random.Random(args.seed)
    for label, N, p0, wAA, wAa, waa in SIMULATIONS:
        print(f"\n{label}")
        block = run_block(N, p0, wAA, wAa, waa, rng=rng)
        for i, (fx, ls, sg) in enumerate(block, 1):
            print(f"   Run {i}: fixed f(A)=1 -> {fx}   lost f(A)=0 -> {ls}   (segregating -> {sg})")


if __name__ == "__main__":
    main()
