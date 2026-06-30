# Lab 9: Population Genetics

Completed worksheet for the population-genetics drift/selection lab.

## Deliverable
- **`Lab09_PopGenetics_Completed.docx`** — the filled-in worksheet (data tables,
  predictions, and concluding answers) ready to upload to Blackboard.

## How the data were generated
The lab uses the Wright–Fisher simulator at
<https://evobir.shinyapps.io/wf_model/>. That tool is stochastic, so the
worksheet data come from a faithful reproduction of the same model:

- `wf_simulation.py` — the Wright–Fisher drift/selection simulator
  (diploid N, viability selection via genotype fitnesses; 10 replicates ×
  100 generations per run).
- `build_lab_doc.py` — builds the completed `.docx` from the recorded results.

Reproduce the numbers in the document with:

```bash
python3 wf_simulation.py --seed 7   # prints the six simulations' results
python3 build_lab_doc.py            # rebuilds Lab09_PopGenetics_Completed.docx
```

Because drift is random, re-running with a different `--seed` gives different
individual counts but the same qualitative patterns (small N drifts fast;
large N resists drift; neutral fixation probability ≈ initial frequency;
selection drives the favored allele to fixation).
