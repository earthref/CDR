// Single source of truth for the depth-plot measurement series and their colors.
// Shared by the Summaries thumbnail, the depth-plot modal, and the Cores Plots
// tab so a given measurement type is drawn in a consistent color everywhere.
export const depthPlotSeries = [
  { key: "gamma_density", label: "Gamma Density", color: "#aec7e8" },
  { key: "mag_susc_chi_mass", label: "Mag Susc χmass", color: "#ffbb78" },
  { key: "res", label: "Resistivity (ohm-m)", color: "#98df8a" },
  { key: "pwave_v", label: "P-wave Velocity (m/s)", color: "#ff9896" },
  { key: "fp", label: "Porosity (frac)", color: "#c5b0d5" },
  { key: "k", label: "K (cps)", color: "#c49c94" },
  { key: "ca", label: "Ca (cps)", color: "#f7b6d2" },
  { key: "ti", label: "Ti (cps)", color: "#c7c7c7" },
  { key: "fe", label: "Fe (cps)", color: "#dbdb8d" },
  { key: "zr", label: "Zr (cps)", color: "#9edae5" },
];

export default depthPlotSeries;
