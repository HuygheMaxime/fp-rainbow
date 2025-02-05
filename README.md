<div align="center">
<img src="./1_Fingerprint_Collection/docs/img/logo.png" alt="drawing" width="200" style="width:200px;"/>
<h1 align="center">FP-Rainbow</h1>
</div>

## :page_facing_up: Description

TL;DR: **FP-Rainbow** is a platform for measuring the impact of Chromium-based browser configuration parameters on their fingerprint.

This work has been presented in the paper [FP-Rainbow: Fingerprint-Based Browser Configuration Identification](https://doi.org/10.1145/3696410.3714699) published at [The Web Conference 2025](https://www2025.thewebconf.org/).

<u>Authors</u>:
- [Maxime Huyghe](https://mhuyghe.fr/)
- [Clément Quinton](https://clementquinton.github.io/)
- [Walter Rudametkin](https://rudametw.github.io/)

## :file_cabinet: Repository Structure

```
.
├── 0_Dataset_and_Results     # Fingerprints and their analysis, impact of switches (download required)
├── 1_Fingerprint_Collection  # Installation script and Fingerprint Collection components
└── README.md                 # This readme file
```

## :books: Instructions

The dataset, results, and browser executables are available at: https://doi.org/10.5281/zenodo.13933676

To use the **FP-Rainbow** pipeline:
1. Download the browser executables
2. Follow the instructions in [1_Fingerprint_Collection](./1_Fingerprint_Collection) to run browser configurations and collect fingerprints

To analyse the results of the already generated fingerprint, download the dataset and the results from the link above.
