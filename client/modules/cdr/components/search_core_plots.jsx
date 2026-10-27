import _ from "lodash";
import React from "react";
import { Modal } from "semantic-ui-react";

import { depthPlotSeries as seriesDefs } from "/lib/configs/cdr/depth_plot_series.js";

// Fixed width for each measurement-type panel, so every plot has the same panel
// width regardless of how many series a core has.
const PANEL_W = 96;

// Group raw measurement rows (as returned by esGetMeasurements -> extracted to
// flat {core, depth, <series>...} rows) by core name, sorted by depth.
export function groupRowsByCore(rows) {
  const grouped = _.groupBy(
    (rows || []).filter((r) => r && r.core != null && _.isNumber(r.depth)),
    (r) => r.core
  );
  return _.mapValues(grouped, (rs) => _.sortBy(rs, "depth"));
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
  height = 260,
  padding = 36,
  series = seriesDefs,
  onClick,
}) {
  const depths = rows.map((r) => r.depth).filter(_.isNumber);
  if (!depths.length) return null;
  const [dmin, dmaxRaw] = extent(depths);
  const dmax = dmaxRaw === dmin ? dmin + 1 : dmaxRaw;

  const activeSeries = series.filter((s) =>
    rows.some((r) => _.isNumber(r[s.key]))
  );
  if (!activeSeries.length) return null;

  const leftAxisW = 56;
  const panelGap = 10;
  const panelW = PANEL_W;
  // Width is derived from the series count so every panel is a constant width,
  // rather than stretching to fill a fixed total width.
  const width =
    leftAxisW +
    activeSeries.length * panelW +
    (activeSeries.length - 1) * panelGap +
    padding;
  const topPad = padding;
  const bottomPad = 44;
  const y0 = topPad;
  const y1 = height - bottomPad;
  const xLeft = leftAxisW;

  const yScale = (d) => y0 + ((d - dmin) / (dmax - dmin)) * (y1 - y0);

  const xScales = {};
  activeSeries.forEach((s) => {
    const vals = rows.map((r) => r[s.key]).filter(_.isNumber);
    if (!vals.length) return;
    let [vmin, vmax] = extent(vals);
    if (vmax === vmin) vmax = vmin + 1;
    xScales[s.key] = { vmin, vmax };
  });

  return (
    <div
      className="core-plot"
      style={{
        margin: "0.5em 0",
        cursor: onClick ? "pointer" : "default",
        display: "inline-block",
      }}
      onClick={onClick}
      title={onClick ? "Click to view full depth plot" : undefined}
    >
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
                <path d={dPath} fill="none" stroke={s.color} strokeWidth={1.25} />
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

export { CorePlot };

// Renders the depth plots for a single contribution's cores. `rows` are the
// flat measurement rows for that contribution (fetched lazily by the
// SearchCorePlotsListItem container); each distinct core gets its own plot.
export default class CorePlotsListItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = { modalCore: null };
  }

  openModal(core) {
    this.setState({ modalCore: core });
  }

  closeModal() {
    this.setState({ modalCore: null });
  }

  renderModal(byCore) {
    const core = this.state.modalCore;
    if (!core || !byCore[core]) return null;
    return (
      <Modal
        open={true}
        onClose={() => this.closeModal()}
        style={{ width: "calc(100vw - 6em)" }}
      >
        <Modal.Header>
          <span>Depth Plot — {core}</span>
          <i
            className="close icon"
            onClick={() => this.closeModal()}
            style={{ cursor: "pointer", float: "right" }}
          />
        </Modal.Header>
        <Modal.Content scrolling style={{ maxHeight: "80vh" }}>
          <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <CorePlot core={core} rows={byCore[core]} height={640} />
          </div>
        </Modal.Content>
      </Modal>
    );
  }

  render() {
    const { rows, loading, error } = this.props;
    if (loading)
      return (
        <div className="ui basic segment" style={{ minHeight: 80, position: "relative" }}>
          <div className="ui active inverted dimmer">
            <div className="ui text loader">Loading plots…</div>
          </div>
        </div>
      );
    if (error)
      return (
        <div className="ui basic segment">Error loading plots for this core.</div>
      );
    const byCore = groupRowsByCore(rows || []);
    const cores = _.keys(byCore).filter(Boolean).sort();
    // Hide cores with no depth data entirely rather than showing an empty row.
    if (!cores.length) return null;
    return (
      <div>
        {cores.map((core) => (
          <CorePlot
            key={core}
            core={core}
            rows={byCore[core]}
            onClick={() => this.openModal(core)}
          />
        ))}
        {this.renderModal(byCore)}
      </div>
    );
  }
}
