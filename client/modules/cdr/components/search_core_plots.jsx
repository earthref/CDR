import _ from "lodash";
import React from "react";

const seriesDefs = [
  { key: "gamma_density", label: "Gamma Density", color: "#1f77b4" },
  { key: "mag_susc_chi_mass", label: "Mag Susc χmass", color: "#ff7f0e" },
  { key: "res", label: "Resistivity (ohm-m)", color: "#2ca02c" },
  { key: "pwave_v", label: "P-wave Velocity (m/s)", color: "#d62728" },
  { key: "fp", label: "Porosity (frac)", color: "#9467bd" },
  { key: "k", label: "K (cps)", color: "#8c564b" },
  { key: "ca", label: "Ca (cps)", color: "#e377c2" },
  { key: "ti", label: "Ti (cps)", color: "#7f7f7f" },
  { key: "fe", label: "Fe (cps)", color: "#bcbd22" },
  { key: "zr", label: "Zr (cps)", color: "#17becf" },
];

function toNumber(x) {
  const n = parseFloat(x);
  return isNaN(n) ? undefined : n;
}

function firstValue(val) {
  if (_.isArray(val)) return val[0];
  return val;
}

function groupByCore(docs) {
  const grouped = _.groupBy(docs, (d) =>
    firstValue(_.get(d, "summary.cores.core"))
  );
  return _.mapValues(grouped, (rows) =>
    rows
      .map((r) => ({
        section: firstValue(_.get(r, "summary.sections.section")),
        depth: toNumber(
          _.get(r, "summary.measurements.mbs_corrected.vals[0]") !== undefined
            ? _.get(r, "summary.measurements.mbs_corrected.vals[0]")
            : _.get(r, "summary.measurements.depth.range.gte")
        ),
        gamma_density: toNumber(
          _.get(r, "summary.measurements.gamma_density.vals[0]")
        ),
        mag_susc_chi_mass: toNumber(
          _.get(r, "summary.measurements.mag_susc_chi_mass.vals[0]")
        ),
        res: toNumber(_.get(r, "summary.measurements.res.vals[0]")),
        pwave_v: toNumber(_.get(r, "summary.measurements.pwave_v.vals[0]")),
        fp: toNumber(_.get(r, "summary.measurements.fp.vals[0]")),
        k: toNumber(_.get(r, "summary.measurements.k.vals[0]")),
        ca: toNumber(_.get(r, "summary.measurements.ca.vals[0]")),
        ti: toNumber(_.get(r, "summary.measurements.ti.vals[0]")),
        fe: toNumber(_.get(r, "summary.measurements.fe.vals[0]")),
        zr: toNumber(_.get(r, "summary.measurements.zr.vals[0]")),
      }))
      .filter((r) => _.isNumber(r.depth) && r.depth >= 0)
      .sort((a, b) => a.depth - b.depth)
  );
}

function extent(nums) {
  const min = _.min(nums);
  const max = _.max(nums);
  return [min, max];
}

function nice(v) {
  if (!_.isFinite(v)) return v;
  const e = Math.pow(10, Math.floor(Math.log10(Math.abs(v) || 1)));
  return Math.round(v / e) * e;
}

function CorePlot({
  core,
  rows,
  width = 720,
  height = 260,
  padding = 36,
  series = seriesDefs,
}) {
  const depths = rows.map((r) => r.depth).filter(_.isNumber);
  if (!depths.length) return null;
  const [dmin, dmaxRaw] = extent(depths);
  const dmax = dmaxRaw === dmin ? dmin + 1 : dmaxRaw;

  const leftAxisW = 56;
  const topPad = padding;
  const bottomPad = 44;
  const y0 = topPad;
  const y1 = height - bottomPad;
  const innerW = width - padding - leftAxisW;
  const xLeft = leftAxisW;

  const yScale = (d) => y0 + ((d - dmin) / (dmax - dmin)) * (y1 - y0);

  const activeSeries = series.filter((s) =>
    rows.some((r) => _.isNumber(r[s.key]))
  );
  if (!activeSeries.length) return null;
  const panelGap = 10;
  const panelW = Math.max(
    40,
    (innerW - panelGap * (activeSeries.length - 1)) / activeSeries.length
  );

  const xScales = {};
  activeSeries.forEach((s) => {
    const vals = rows.map((r) => r[s.key]).filter(_.isNumber);
    if (!vals.length) return;
    let [vmin, vmax] = extent(vals);
    if (vmax === vmin) vmax = vmin + 1;
    xScales[s.key] = { vmin, vmax };
  });

  return (
    <div className="core-plot" style={{ margin: "0.5em 0" }}>
      <div style={{ fontWeight: "bold", marginBottom: "0.25em" }}>{core}</div>
      <svg width={width} height={height}>
        <rect x={0} y={0} width={width} height={height} fill="white" stroke="#ddd" />
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const d = dmin + t * (dmax - dmin);
          const y = yScale(d);
          return (
            <g key={t}>
              <line x1={xLeft} y1={y} x2={width - padding} y2={y} stroke="#f0f0f0" />
              <text x={xLeft - 8} y={y + 4} fontSize={10} textAnchor="end" fill="#666">
                {_.isFinite(d) ? d.toFixed(2) : ""}
              </text>
            </g>
          );
        })}

        {activeSeries.map((s, idx) => {
          const scale = xScales[s.key];
          if (!scale) return null;
          const px0 = xLeft + idx * (panelW + panelGap);
          const px1 = px0 + panelW;
          const x = (v) => px0 + ((v - scale.vmin) / (scale.vmax - scale.vmin)) * (px1 - px0);
          const dPath = rows
            .filter((r) => _.isNumber(r[s.key]) && _.isNumber(r.depth))
            .map((r, i) => `${i === 0 ? "M" : "L"}${x(r[s.key])},${yScale(r.depth)}`)
            .join(" ");
          return (
            <g key={s.key}>
              <rect x={px0} y={y0} width={panelW} height={y1 - y0} fill="none" stroke="#eaeaea" />
              <text x={(px0 + px1) / 2} y={y0 - 10} fontSize={11} textAnchor="middle" fill="#444">
                {s.label}
              </text>
              {dPath && (
                <path d={dPath} fill="none" stroke="#e09f00" strokeWidth={1.25} />
              )}
              {/* X-axis ticks and labels */}
              <line x1={px0} y1={y1} x2={px1} y2={y1} stroke="#ddd" />
              {[0, 0.5, 1].map((t) => {
                const v = scale.vmin + t * (scale.vmax - scale.vmin);
                const px = x(v);
                const precision = Math.abs(scale.vmax - scale.vmin) >= 1 ? 2 : 3;
                const abs = Math.abs(v);
                const label = _.isFinite(v)
                  ? abs !== 0 && (abs < 1e-3 || abs >= 1e4)
                    ? v.toExponential(2).replace(/e\+?(-?\d+)/, "e$1")
                    : v.toFixed(precision)
                  : "";
                let tx = px;
                let anchor = "middle";
                if (t === 0) {
                  tx = px0; // left edge
                  anchor = "start";
                } else if (t === 1) {
                  tx = px1; // right edge
                  anchor = "end";
                }
                return (
                  <g key={t}>
                    <line x1={px} y1={y1} x2={px} y2={y1 + 5} stroke="#ccc" />
                    <text x={tx} y={y1 + 16} fontSize={10} textAnchor={anchor} fill="#666">
                      {label}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}

        <text
          transform={`translate(${xLeft - 36}, ${(y0 + y1) / 2}) rotate(-90)`}
          fill="#555"
          fontSize={11}
          textAnchor="middle"
        >
          Depth (m)
        </text>
      </svg>
    </div>
  );
}

export default class SearchCorePlots extends React.Component {
  render() {
    const { docs, loading, maxCores } = this.props;
    if (loading) return <div className="ui basic segment">Loading plots…</div>;
    const byCore = groupByCore(docs || []);
    const cores = _.take(_.keys(byCore).filter(Boolean).sort(), maxCores || 24);
    if (!cores.length)
      return (
        <div className="ui basic segment">
          No depth data available for matching cores.
        </div>
      );
    return (
      <div style={{ overflow: "auto", padding: "0.5em" }}>
        {cores.map((core) => (
          <CorePlot key={core} core={core} rows={byCore[core]} />
        ))}
      </div>
    );
  }
}
