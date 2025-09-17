import _ from "lodash";
import numeral from "numeral";
import moment from "moment";
import React from "react";
import PropTypes from "prop-types";
import saveAs from "save-as";
import { HotTable, HotColumn } from "@handsontable/react";
import "handsontable/dist/handsontable.min.css";

import Clamp from "/client/modules/common/components/clamp";
import ExportContribution from "/lib/modules/cdr/export_contribution.js";
import GoogleStaticMap from "/client/modules/common/components/google_static_map";
import GoogleMap from "/client/modules/common/components/google_map";
import Count from "/client/modules/common/components/count";
import { Button, Modal } from "semantic-ui-react";
import { versions, models } from "/lib/configs/cdr/data_models.js";
import { index } from "/lib/configs/cdr/search_levels.js";

class SearchSummariesListItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      loadMap: false,
      showDataModal: false,
      showConfirmCloseEditedDataModal: false,
      showConfirmChangeTabsEditedDataModal: false,
      confirmChangeTabsDataLevel: undefined,
      dataLoading: false,
      dataEdited: false,
      dataSaving: false,
      dataLevel: undefined,
      contributionData: undefined,
      contributionDataError: undefined,
      depthPlotsLoading: {},
      depthPlotsData: {},
      loadingRequests: new Set(),
      showDepthModal: false,
      depthModalContribution: null,
      depthModalCore: null,
    };
    this.styles = {
      a: { cursor: "pointer", color: "#e09f00" },
    };
  }

  componentDidMount() {
    $(this.refs["accordion"]).accordion({
      exclusive: false,
      selector: { trigger: ".accordion-trigger" },
    });
  }

  showData() {
    /*$(this.refs['data modal']).modal('show');
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();*/
  }

  showMap(e) {
    this.setState({ loadMap: true }, () =>
      $(this.refs["map modal"]).modal("show")
    );
  }

  renderTitle(item) {
    let title = "";
    if (
      this.props.table === "contribution" &&
      item.summary &&
      item.summary._all
    ) {
      if (item.summary._all.cruise) title = item.summary._all.cruise[0];
    }
    if (this.props.table === "cores" && item.summary && item.summary._all) {
      if (item.summary._all.cruise) title = item.summary._all.cruise[0];
      if (item.summary._all.core)
        title += " ⇒ <b>" + item.summary._all.core[0] + "</b>";
    }
    if (this.props.table === "cores" && item.summary && item.summary._all) {
      if (item.summary._all.cruise) title = item.summary._all.cruise[0];
      if (item.summary._all.core)
        title += " ⇒ <b>" + item.summary._all.core[0] + "</b>";
    }
    if (this.props.table === "section" && item.summary && item.summary._all) {
      if (item.summary._all.cruise) title = item.summary._all.cruise[0];
      if (item.summary._all.core) title += " ⇒ " + item.summary._all.core[0];
      if (item.summary._all.section)
        title += " ⇒ <b>" + item.summary._all.section[0] + "</b>";
    }
    if (
      this.props.table === "measurements" &&
      item.summary &&
      item.summary._all
    ) {
      if (item.summary._all.cruise) title = item.summary._all.cruise[0];
      if (item.summary._all.core) title += " ⇒ " + item.summary._all.core[0];
      if (item.summary._all.section)
        title += " ⇒ " + item.summary._all.section[0];
      if (item.summary._all.measurement)
        title += " ⇒ <b>" + item.summary._all.measurement[0] + "</b>";
    }
    return (
      <div
        style={{
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          overflow: "hidden",
        }}
        dangerouslySetInnerHTML={{ __html: title }}
      />
    );
  }

  renderDownloadButton(item) {
    if (this.props.table !== "contribution") return undefined;
    let id =
      item.summary && item.summary.contribution && item.summary.contribution.id;
    let _is_activated =
      item.summary &&
      item.summary.contribution &&
      item.summary.contribution._is_activated === "true";
    return (
      <div
        style={{
          minWidth: 100,
          maxWidth: 100,
          marginRight: "1em",
          marginBottom: 5,
        }}
      >
        {id && (
          <button
            type="submit"
            className="ui basic tiny fluid compact icon header yellow button"
            style={{ padding: "20px 0", height: "100px" }}
            onClick={function (id, e) {
              document.getElementById("downloadButton" + id).className =
                "ui spinner loading icon";
              Meteor.call(
                "esGetContribution",
                { index, id },
                function (id, error, c) {
                  // console.log("esGetContribution", index, id, error, c);
                  if (!error && c) {
                    const exporter = new ExportContribution({});
                    // console.log("esGetContribution", index, id, c, exporter.toText(c));
                    let blob = new Blob([exporter.toText(c)], {
                      type: "text/plain;charset=utf-8",
                    });
                    saveAs(blob, "cdr_contribution_" + id + ".txt");
                    document.getElementById("downloadButton" + id).className =
                      "ui file text outline icon";
                  } else {
                    console.error(error);
                    alert(
                      "Failed to find the contribution for download. Please try again soon or email CDR using the link at the bottom of this page."
                    );
                    document.getElementById("downloadButton" + id).className =
                      "ui file text outline icon";
                  }
                }.bind(this, id)
              );
            }.bind(this, id)}
          >
            <i
              id={"downloadButton" + id}
              className="ui file text outline icon"
            />{" "}
            Download
          </button>
        )}
        {!id && (
          <button
            className="ui basic tiny fluid compact icon header yellow disabled button"
            style={{ padding: "20px 0", height: "100px" }}
          >
            <i className="ui file text outline icon" /> Download
          </button>
        )}
      </div>
    );
  }

  renderLinks(item) {
    if (this.props.table !== "contribution") return undefined;
    let _is_activated =
      item.summary &&
      item.summary.contribution &&
      item.summary.contribution._is_activated === "true";
    let _has_data_doi =
      item.summary &&
      item.summary.contribution &&
      item.summary.contribution._has_data_doi === "true";
    let id =
      item.summary && item.summary.contribution && item.summary.contribution.id;
    let doi =
      item.summary &&
      item.summary.contribution &&
      item.summary.contribution._reference &&
      item.summary.contribution._reference.doi;
    return (
      <div
        style={{
          minWidth: 200,
          maxWidth: 200,
          marginRight: "1em",
          marginBottom: 5,
          fontSize: "small",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {id && (
          <span>
            <b>
              {_is_activated
                ? "CDR Contribution Link:"
                : "Future Contribution Link:"}
            </b>
            <p>
              {_is_activated ? (
                <a
                  style={this.styles.a}
                  href={"https://earthref.org/CDR/" + id}
                  target="_blank"
                >
                  {"earthref.org/CDR/" + id}
                </a>
              ) : (
                <span>{"earthref.org/CDR/" + id}</span>
              )}
            </p>
          </span>
        )}
        {id && (
          <span>
            <b>{_is_activated ? "EarthRef Data DOI:" : "Future Data DOI:"}</b>
            <p>
              {_is_activated ? (
                1 || _has_data_doi ? (
                  <a
                    style={this.styles.a}
                    href={"http://dx.doi.org/10.7288/V4/CDR/" + id}
                    target="_blank"
                  >
                    {"10.7288/V4/CDR/" + id}
                  </a>
                ) : (
                  <span>Queued For Creation</span>
                )
              ) : (
                <span>{"10.7288/V4/CDR/" + id}</span>
              )}
            </p>
          </span>
        )}
        {doi && (
          <span>
            <b>Publication DOI: </b>
            <Clamp lines={1}>
              <a
                style={this.styles.a}
                href={"https://dx.doi.org/" + doi}
                target="_blank"
              >
                {doi}
              </a>
            </Clamp>
          </span>
        )}
      </div>
    );
  }

  renderCounts(item) {
    let counts = [];
    let labels = [];
    let levels = [];
    ["Core", "Section", "Measurement"].forEach((label) => {
      let level = label.toLowerCase() + "s";
      let name = label.toLowerCase();
      if (
        item.summary &&
        item.summary._all &&
        item.summary._all["_n_" + level]
      ) {
        let count = item.summary._all["_n_" + level];
        counts.push(count);
        labels.push(label + (count !== 1 ? "s" : ""));
        levels.push(level);
      } else if (
        item.summary &&
        item.summary._all &&
        item.summary._all[name] &&
        item.summary._all[name].length
      ) {
        let count = item.summary._all[name].length;
        counts.push(count);
        labels.push(label + (count !== 1 ? "s" : ""));
        levels.push(level);
      }
    });
    return (
      <div
        style={{
          minWidth: 135,
          maxWidth: 135,
          marginRight: "1em",
          marginBottom: 5,
          fontSize: "small",
          lineHeight: 1,
        }}
      >
        <table>
          <tbody>
            {counts.map((count, i) => {
              return (
                <tr key={i}>
                  <td style={{ textAlign: "right" }}>
                    {this.props.table === "contribution" ? (
                      <a
                        onClick={() => {
                          this.setState({
                            dataLevel: levels[i],
                            showDataModal: true,
                          });
                        }}
                      >
                        {numeral(count).format("0 a")}
                      </a>
                    ) : (
                      numeral(count).format("0 a")
                    )}
                  </td>
                  <td>
                    {this.props.table === "contribution" ? (
                      <a
                        onClick={() => {
                          this.setState({
                            dataLevel: levels[i],
                            showDataModal: true,
                          });
                        }}
                      >
                        &nbsp;{labels[i]}
                      </a>
                    ) : (
                      <span>&nbsp;{labels[i]}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  renderQueuedForIndex(item) {
    return (
      <div
        style={{
          minWidth: 200,
          maxWidth: 200,
          marginRight: "1em",
          marginBottom: 5,
          fontSize: "small",
          color: "#AAAAAA",
          textAlign: "left",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        <br />
        <b>Queued for Indexing</b>
        <br />
        Data are available for
        <br />
        downloading and in
        <br />
        the "Rows" sub-tabs.
      </div>
    );
  }

  renderMapThumbnail(item) {
    let paths = [];

    let tableSummary = item.summary && item.summary[this.props.table];
    let allSummary = item.summary && item.summary._all;

    if (
      tableSummary &&
      (tableSummary._geo_envelope || tableSummary._geo_point)
    ) {
      //if (tableSummary._geo_envelope)
      //  _.sortedUniqBy(
      //    _.sortBy(tableSummary._geo_envelope,
      //      x => _.flatten(x.coordinates).join('_')),
      //    x => _.flatten(x.coordinates).join('_'))
      //  .forEach(envelope => {
      //    paths.push({
      //      lat_s: envelope.coordinates[0][1],
      //      lat_n: envelope.coordinates[1][1],
      //      lon_w: envelope.coordinates[0][0],
      //      lon_e: envelope.coordinates[1][0]
      //    });
      //  });

      if (tableSummary._geo_point)
        _.sortedUniqBy(
          _.sortBy(tableSummary._geo_point, (x) =>
            _.flatten(x.coordinates).join("_")
          ),
          (x) => _.flatten(x.coordinates).join("_")
        ).forEach((point) => {
          paths.push({
            lat_s: point.coordinates[1],
            lat_n: point.coordinates[1],
            lon_w: point.coordinates[0],
            lon_e: point.coordinates[0],
          });
        });
    } else if (allSummary) {
      if (allSummary._geo_envelope)
        _.sortedUniqBy(
          _.sortBy(allSummary._geo_envelope, (x) =>
            _.flatten(x.coordinates).join("_")
          ),
          (x) => _.flatten(x.coordinates).join("_")
        ).forEach((envelope) => {
          paths.push({
            lat_s: envelope.coordinates[0][1],
            lat_n: envelope.coordinates[1][1],
            lon_w: envelope.coordinates[0][0],
            lon_e: envelope.coordinates[1][0],
          });
        });

      if (allSummary._geo_point)
        _.sortedUniqBy(
          _.sortBy(allSummary._geo_point, (x) =>
            _.flatten(x.coordinates).join("_")
          ),
          (x) => _.flatten(x.coordinates).join("_")
        ).forEach((point) => {
          paths.push({
            lat_s: point.coordinates[1],
            lat_n: point.coordinates[1],
            lon_w: point.coordinates[0],
            lon_e: point.coordinates[0],
          });
        });
    }

    return paths.length > 0 ? (
      <div
        style={{
          minWidth: 100,
          maxWidth: 100,
          marginRight: "1em",
          marginBottom: 5,
        }}
      >
        {paths.length > 0 && (
          <a
            className="ui tiny image"
            style={{ cursor: "pointer" }}
            onClick={this.showMap.bind(this)}
          >
            <GoogleStaticMap width={100} height={100} paths={paths} />
          </a>
        )}
      </div>
    ) : (
      <div
        style={{
          minWidth: 100,
          maxWidth: 100,
          marginRight: "1em",
          marginBottom: 5,
          fontSize: "small",
          color: "#AAAAAA",
          textAlign: "center",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        <br />
        No
        <br />
        <b>Geospatial</b>
        <br />
        Data
        <br />
        <br />
      </div>
    );
  }

  _seriesDefs() {
    return [
      { key: "gamma_density", label: "Gamma Density", color: "#1f77b4" },
      { key: "mag_susc_chi_mass", label: "Mag Susc χmass", color: "#ff7f0e" },
      { key: "res", label: "Resistivity", color: "#2ca02c" },
      { key: "pwave_v", label: "P-wave V", color: "#d62728" },
      { key: "fp", label: "Porosity", color: "#9467bd" },
      { key: "k", label: "K", color: "#8c564b" },
      { key: "ca", label: "Ca", color: "#e377c2" },
      { key: "ti", label: "Ti", color: "#7f7f7f" },
      { key: "fe", label: "Fe", color: "#bcbd22" },
      { key: "zr", label: "Zr", color: "#17becf" },
    ];
  }

  renderDepthThumbnailSVG(rows, width = 100, height = 100, padding = 0) {
    if (!rows || !rows.length) return null;
    // Exclude negative depths (typically calibration)
    rows = rows.filter((r) => _.isFinite(+r.depth) && +r.depth >= 0);
    const numericDepths = rows
      .map((r) => (r && r.depth !== undefined ? +r.depth : NaN))
      .filter((v) => _.isFinite(v));
    if (!numericDepths.length) return null;
    const dmin = _.min(numericDepths);
    const dmaxRaw = _.max(numericDepths);
    const dmax = dmaxRaw === dmin ? dmin + 1 : dmaxRaw;
    const y0 = padding,
      y1 = height - padding;
    const yScale = (d) => y0 + ((d - dmin) / (dmax - dmin)) * (y1 - y0);

    const series = this._seriesDefs().filter((s) =>
      rows.some((r) => _.isFinite(+r[s.key]))
    );
    if (!series.length) return null;
    const gap = 2;
    const innerWidth = Math.max(1, width - padding * 2);
    const panelW = Math.max(
      8,
      (innerWidth - gap * (series.length - 1)) / series.length
    );
    const xStart = padding;

    // Precompute per-series x scales to the panel
    const xScales = {};
    series.forEach((s) => {
      const vals = rows
        .map((r) => (r && r[s.key] !== undefined ? +r[s.key] : NaN))
        .filter((v) => _.isFinite(v));
      if (!vals.length) return;
      let vmin = _.min(vals),
        vmax = _.max(vals);
      if (vmax === vmin) vmax = vmin + 1;
      xScales[s.key] = { vmin, vmax };
    });

    return (
      <svg width={width} height={height} style={{ display: "block" }}>
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="#fff"
          stroke="#eee"
        />
        {series.map((s, idx) => {
          const scale = xScales[s.key];
          if (!scale) return null;
          const px0 = xStart + idx * (panelW + gap);
          const px1 = px0 + panelW;
          const x = (v) =>
            px0 + ((v - scale.vmin) / (scale.vmax - scale.vmin)) * (px1 - px0);
          const d = rows
            .filter((r) => _.isFinite(+r[s.key]) && _.isFinite(+r.depth))
            .map(
              (r, i) =>
                `${i === 0 ? "M" : "L"}${x(+r[s.key])},${yScale(+r.depth)}`
            )
            .join(" ");
          if (!d) return null;
          return (
            <g key={s.key}>
              <rect
                x={px0}
                y={y0}
                width={panelW}
                height={y1 - y0}
                fill="none"
                stroke="#f2f2f2"
              />
              <path d={d} fill="none" stroke="#e09f00" strokeWidth={1} />
              {/* X-axis baseline only — no ticks in thumbnail */}
              <line x1={px0} y1={y1} x2={px1} y2={y1} stroke="#ddd" />
            </g>
          );
        })}
      </svg>
    );
  }

  _renderDepthFullSVG(cid, rows, width = 700, height = 700, padding = 40) {
    if (!rows || !rows.length) return null;
    // Exclude negative depths (typically calibration)
    rows = rows.filter((r) => _.isFinite(+r.depth) && +r.depth >= 0);
    const numericDepths = rows
      .map((r) => (r && r.depth !== undefined ? +r.depth : NaN))
      .filter((v) => _.isFinite(v));
    if (!numericDepths.length) return null;
    const dmin = _.min(numericDepths);
    const dmaxRaw = _.max(numericDepths);
    const dmax = dmaxRaw === dmin ? dmin + 1 : dmaxRaw;

    // Layout
    const leftAxisW = 56;
    const topPad = padding;
    const bottomPad = 52; // room for x labels
    const y0 = topPad;
    const y1 = height - bottomPad;
    const innerW = width - padding - leftAxisW; // leave right pad
    const xLeft = leftAxisW;

    const yScale = (d) => y0 + ((d - dmin) / (dmax - dmin)) * (y1 - y0);

    const series = this._seriesDefs().filter((s) =>
      rows.some((r) => _.isFinite(+r[s.key]))
    );
    if (!series.length) return null;
    const panelGap = 10;
    const panelW = Math.max(
      30,
      (innerW - panelGap * (series.length - 1)) / series.length
    );

    // Precompute per-series x scales
    const xScales = {};
    series.forEach((s) => {
      const vals = rows
        .map((r) => (r && r[s.key] !== undefined ? +r[s.key] : NaN))
        .filter((v) => _.isFinite(v));
      if (!vals.length) return;
      let vmin = _.min(vals),
        vmax = _.max(vals);
      if (vmax === vmin) vmax = vmin + 1;
      xScales[s.key] = { vmin, vmax };
    });

    const cruise = this.state.depthModalCruise;
    const core = this.state.depthModalCore;
    const title = cruise && core ? `${cruise} ⇒ ${core}` : cid;

    return (
      <div>
        <div
          style={{
            fontWeight: "bold",
            margin: "0 0 0.5em",
            textAlign: "center",
          }}
        >
          {title}
        </div>
        <svg width={width} height={height}>
          <rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="#fff"
            stroke="#ddd"
          />
          {/* Shared Y axis grid and labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const d = dmin + t * (dmax - dmin);
            const y = yScale(d);
            return (
              <g key={t}>
                <line
                  x1={xLeft}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="#f0f0f0"
                />
                <text
                  x={xLeft - 8}
                  y={y + 4}
                  fontSize={11}
                  textAnchor="end"
                  fill="#666"
                >
                  {_.isFinite(d) ? d.toFixed(2) : ""}
                </text>
              </g>
            );
          })}

          {/* Panels */}
          {series.map((s, idx) => {
            const scale = xScales[s.key];
            if (!scale) return null;
            const px0 = xLeft + idx * (panelW + panelGap);
            const px1 = px0 + panelW;
            const x = (v) =>
              px0 +
              ((v - scale.vmin) / (scale.vmax - scale.vmin)) * (px1 - px0);
            const dPath = rows
              .filter((r) => _.isFinite(+r[s.key]) && _.isFinite(+r.depth))
              .map(
                (r, i) =>
                  `${i === 0 ? "M" : "L"}${x(+r[s.key])},${yScale(+r.depth)}`
              )
              .join(" ");
            return (
              <g key={s.key}>
                {/* Panel frame */}
                <rect
                  x={px0}
                  y={y0}
                  width={panelW}
                  height={y1 - y0}
                  fill="none"
                  stroke="#eaeaea"
                />
                {/* Series label */}
                <text
                  x={(px0 + px1) / 2}
                  y={y0 - 10}
                  fontSize={12}
                  textAnchor="middle"
                  fill="#444"
                >
                  {s.label}
                </text>
                {/* Line */}
                {dPath && (
                  <path
                    d={dPath}
                    fill="none"
                    stroke="#e09f00"
                    strokeWidth={1.5}
                  />
                )}
                {/* X-axis ticks and labels */}
                <line x1={px0} y1={y1} x2={px1} y2={y1} stroke="#ddd" />
                {[0, 0.5, 1].map((t) => {
                  const v = scale.vmin + t * (scale.vmax - scale.vmin);
                  const px = x(v);
                  const precision =
                    Math.abs(scale.vmax - scale.vmin) >= 1 ? 2 : 3;
                  const abs = Math.abs(v);
                  const label = _.isFinite(v)
                    ? abs !== 0 && (abs < 1e-3 || abs >= 1e4)
                      ? v.toExponential(2).replace(/e\+?(-?\d+)/, "e$1")
                      : v.toFixed(precision)
                    : "";
                  let tx = px;
                  let anchor = "middle";
                  if (t === 0) {
                    tx = px0;
                    anchor = "start";
                  } else if (t === 1) {
                    tx = px1;
                    anchor = "end";
                  }
                  return (
                    <g key={t}>
                      <line x1={px} y1={y1} x2={px} y2={y1 + 6} stroke="#ccc" />
                      <text
                        x={tx}
                        y={y1 + 18}
                        fontSize={10}
                        textAnchor={anchor}
                        fill="#666"
                      >
                        {label}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
          {/* Axis title: vertical at left, centered */}
          <text
            transform={`translate(${xLeft - 36}, ${(y0 + y1) / 2}) rotate(-90)`}
            fill="#555"
            fontSize="12"
            textAnchor="middle"
          >
            Depth (m)
          </text>
        </svg>
      </div>
    );
  }

  renderNoDepthPlotsMessage() {
    return (
      <div
        style={{
          minWidth: 125,
          maxWidth: 125,
          marginRight: "1em",
          marginBottom: 5,
          fontSize: "small",
          color: "#AAAAAA",
          textAlign: "center",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        <br />
        No
        <br />
        <b>
          Depth
          <br />
          Plots
        </b>
        <br />
        <br />
      </div>
    );
  }

  renderDepthPlots(item) {
    if (this.props.table !== "contribution" && this.props.table !== "cores")
      return null;

    const cid =
      item.summary && item.summary.contribution && item.summary.contribution.id;

    if (!cid) return this.renderNoDepthPlotsMessage();

    const isLoading = this.state.depthPlotsLoading[cid] === true;
    const rows = this.state.depthPlotsData[cid];

    if (!isLoading && rows === undefined) {
      this.loadDepthPlotsData(cid);
      return this.renderLoadingDepthPlots(cid);
    }
    if (isLoading) return this.renderLoadingDepthPlots(cid);
    if (!rows || !rows.length) return this.renderNoDepthPlotsMessage();

    return (
      <div
        style={{
          minWidth: 125,
          maxWidth: 125,
          marginRight: "1em",
          marginBottom: 5,
          cursor: "pointer",
        }}
        onClick={() =>
          this.openDepthModal(
            cid,
            _.get(item, "summary._all.cruise[0]"),
            _.get(item, "summary._all.core[0]")
          )
        }
        title="Click to view depth plots"
      >
        {this.renderDepthThumbnailSVG(rows)}
      </div>
    );
  }

  openDepthModal(cid, cruise, core) {
    this.setState({
      showDepthModal: true,
      depthModalContribution: cid,
      depthModalCruise: cruise,
      depthModalCore: core,
    });
  }

  closeDepthModal() {
    this.setState({ showDepthModal: false, depthModalContribution: null });
  }

  renderDepthPlotsModal() {
    const open = this.state.showDepthModal === true;
    if (!open) return null;
    const cid = this.state.depthModalContribution;
    const rows = this.state.depthPlotsData[cid] || [];
    const cruise = this.state.depthModalCruise;
    const core = this.state.depthModalCore;
    const headerTitle = cruise && core ? `${cruise} ⇒ ${core}` : cid;
    return (
      <Modal
        open={open}
        onClose={() => this.closeDepthModal()}
        style={{ width: "calc(100vw - 6em)" }}
      >
        <Modal.Header>
          <span>Depth Plots</span>
          <i
            className="close icon"
            onClick={() => this.closeDepthModal()}
            style={{ cursor: "pointer", float: "right" }}
          />
        </Modal.Header>
        <Modal.Content scrolling style={{ maxHeight: "80vh"}}>
          {rows && rows.length ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
              }}
            >
              {this._renderDepthFullSVG(cid, rows)}
            </div>
          ) : (
            <div className="ui basic segment">No depth data available.</div>
          )}
        </Modal.Content>
      </Modal>
    );
  }

  renderAge(item) {
    const rng = _.get(item, "summary._all._age_range_ybp.range");
    let ageRange = null;
    if (rng && _.isNumber(rng.gte) && _.isNumber(rng.lte)) {
      const lo = Math.min(rng.gte, rng.lte) / 1e6;
      const hi = Math.max(rng.gte, rng.lte) / 1e6;
      if (_.isFinite(lo) && _.isFinite(hi)) {
        ageRange = `${lo.toFixed(2)} – ${hi.toFixed(2)} Ma`;
      }
    }
    if (!ageRange)
      return (
        <div
          style={{
            minWidth: 125,
            maxWidth: 125,
            marginRight: "1em",
            marginBottom: 5,
            fontSize: "small",
            color: "#AAAAAA",
            textAlign: "center",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <br />
          No
          <br />
          <b>Age</b>
          <br />
          Data
          <br />
          <br />
        </div>
      );
    return (
      <div
        style={{
          minWidth: 125,
          maxWidth: 125,
          marginRight: "1em",
          marginBottom: 5,
          fontSize: "small",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        <b>Age:</b>
        <br />
        {ageRange}
      </div>
    );
  }

  renderGeo(item) {
    let geologic = [
      "plate_blocks",
      "terranes",
      "geological_province_sections",
      "tectonic_settings",
    ];
    geologic = _.reduce(
      geologic,
      (list, column) => {
        if (item.summary && item.summary._all && item.summary._all[column])
          list.push(...item.summary._all[column]);
        return list;
      },
      []
    );
    let geographic = [
      "continent_ocean",
      "country",
      "ocean_sea",
      "region",
      "village_city",
      "location",
      "location_type",
      "location_alternatives",
    ];
    geographic = _.reduce(
      geographic,
      (list, column) => {
        if (item.summary && item.summary._all && item.summary._all[column])
          list.push(...item.summary._all[column]);
        return list;
      },
      []
    );
    return geologic.length > 0 || geographic.length > 0 ? (
      <div
        style={{
          minWidth: 125,
          maxWidth: 125,
          marginRight: "1em",
          marginBottom: 5,
          fontSize: "small",
          whiteSpace: "normal",
        }}
      >
        {geologic.length > 0 ? (
          <span>
            <b>Geologic:</b>
            <Clamp lines={geographic.length > 0 ? 2 : 5}>
              <span>{geologic.join(", ")}</span>
            </Clamp>
          </span>
        ) : undefined}
        {geographic.length > 0 ? (
          <span>
            <b>Geographic:</b>
            <Clamp lines={geologic.length > 0 ? 2 : 5}>
              <span>{geographic.join(", ")}</span>
            </Clamp>
          </span>
        ) : undefined}
      </div>
    ) : (
      <div
        style={{
          minWidth: 125,
          maxWidth: 125,
          marginRight: "1em",
          marginBottom: 5,
          fontSize: "small",
          color: "#AAAAAA",
          textAlign: "center",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        <br />
        No
        <br />
        <b>Geographic</b>
        <br />
        Data
        <br />
        <br />
      </div>
    );
  }

  renderGeology(item) {
    let geologic_classes =
      item.summary && item.summary._all && item.summary._all.geologic_classes;
    let geologic_types =
      item.summary && item.summary._all && item.summary._all.geologic_types;
    let lithologies =
      item.summary && item.summary._all && item.summary._all.lithologies;
    let nDefined = _.without(
      [geologic_classes, geologic_types, lithologies],
      undefined
    ).length;
    let clampLines = nDefined === 3 ? 1 : nDefined === 2 ? 2 : 5;
    return (geologic_classes && geologic_classes.length > 0) ||
      (geologic_types && geologic_types.length > 0) ||
      (lithologies && lithologies.length > 0) ? (
      <div
        style={{
          minWidth: 125,
          maxWidth: 125,
          marginRight: "1em",
          marginBottom: 5,
          fontSize: "small",
          whiteSpace: "normal",
        }}
      >
        {geologic_classes && geologic_classes.length > 0 ? (
          <span>
            <b>Class:</b>
            <Clamp lines={clampLines}>
              <span>{geologic_classes.join(", ")}</span>
            </Clamp>
          </span>
        ) : undefined}
        {geologic_types && geologic_types.length > 0 ? (
          <span>
            <b>Type:</b>
            <Clamp lines={clampLines}>
              <span>{geologic_types.join(", ")}</span>
            </Clamp>
          </span>
        ) : undefined}
        {lithologies && lithologies.length > 0 ? (
          <span>
            <b>Lithology:</b>
            <Clamp lines={clampLines}>
              <span>{lithologies.join(", ")}</span>
            </Clamp>
          </span>
        ) : undefined}
      </div>
    ) : (
      <div
        style={{
          minWidth: 125,
          maxWidth: 125,
          marginRight: "1em",
          marginBottom: 5,
          fontSize: "small",
          color: "#AAAAAA",
          textAlign: "center",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        <br />
        No
        <br />
        <b>Geologic</b>
        <br />
        Data
        <br />
        <br />
      </div>
    );
  }

  renderMethodCodes(item) {
    return item.summary._all &&
      item.summary._all.method_codes &&
      item.summary._all.method_codes.length > 0 ? (
      <div
        style={{
          minWidth: 125,
          maxWidth: 125,
          marginRight: "1em",
          marginBottom: 5,
          fontSize: "small",
          whiteSpace: "normal",
        }}
      >
        <span>
          <b>Method Codes:</b>
          <Clamp lines={5}>
            <span>{item.summary._all.method_codes.join(", ")}</span>
          </Clamp>
        </span>
      </div>
    ) : (
      <div
        style={{
          minWidth: 125,
          maxWidth: 125,
          marginRight: "1em",
          marginBottom: 5,
          fontSize: "small",
          color: "#AAAAAA",
          textAlign: "center",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        <br />
        No
        <br />
        <b>
          Method
          <br />
          Codes
        </b>
        <br />
        <br />
      </div>
    );
  }

  renderCitations(item) {
    let citations;
    if (item.summary._all && item.summary._all.citations)
      citations = _.without(
        item.summary._all.citations,
        "this study",
        "This study",
        "This Study",
        "This study",
        "this_study",
        "This_study",
        "This_Study",
        "This_study"
      );
    return citations && citations.length > 0 ? (
      <div
        style={{
          minWidth: 125,
          maxWidth: 125,
          marginRight: "1em",
          marginBottom: 5,
          fontSize: "small",
          whiteSpace: "normal",
        }}
      >
        <span>
          <b>Citations:</b>
          <Clamp lines={5}>
            <span>{citations.join(", ")}</span>
          </Clamp>
        </span>
      </div>
    ) : (
      <div
        style={{
          minWidth: 125,
          maxWidth: 125,
          marginRight: "1em",
          marginBottom: 5,
          fontSize: "small",
          color: "#AAAAAA",
          textAlign: "center",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        <br />
        No
        <br />
        <b>
          Additional
          <br />
          Citations
        </b>
        <br />
        <br />
      </div>
    );
  }

  renderLoadingDepthPlots(cid = null) {
    const isClickable = cid !== null;
    return (
      <div
        style={{
          minWidth: 125,
          maxWidth: 125,
          marginRight: "1em",
          marginBottom: 5,
          fontSize: "small",
          color: "#666",
          textAlign: "center",
          overflow: "hidden",
          cursor: isClickable ? "pointer" : "default",
          opacity: isClickable ? 1 : 0.7,
        }}
        onClick={
          isClickable ? () => this.openModalAndWaitForData(cid) : undefined
        }
        title={
          isClickable
            ? "Click to open modal and wait for data"
            : "Loading data..."
        }
      >
        <br />
        Loading
        <br />
        <b>
          Depth
          <br />
          Plots
        </b>
        <br />
        <br />
      </div>
    );
  }

  renderDepthPlotsPlot(depthPlotsResult) {
    return (
      <div
        style={{
          minWidth: 125,
          maxWidth: 125,
          marginRight: "1em",
          marginBottom: 5,
          cursor: "pointer",
        }}
        onClick={() => this.showDepthPlotsModal(depthPlotsResult)}
        title="Click to view full depthPlots plot"
      >
        {this.renderDepthPlotsThumbnail(depthPlotsResult)}
      </div>
    );
  }

  renderDepthPlotsThumbnail(depthPlotsResult) {
    return (
      <svg width={width} height={height} style={{ display: "block" }}></svg>
    );
  }

  renderNoDepthPlotsMessage() {
    return (
      <div
        style={{
          minWidth: 125,
          maxWidth: 125,
          marginRight: "1em",
          marginBottom: 5,
          fontSize: "small",
          color: "#AAAAAA",
          textAlign: "center",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        <br />
        No
        <br />
        <b>
          Depth
          <br />
          Plots
        </b>
        <br />
        <br />
      </div>
    );
  }

  showPDepthPlotsModal(depthPlotsResult) {
    this.setState(
      {
        depthPlotsModalData: depthPlotsResult,
      },
      () => {
        $(this.refs["depthPlots modal"]).modal("show");
      }
    );
  }

  hideDepthPlotsModal() {
    $(this.refs["depth plot modal"]).modal("hide");
    this.setState({
      depthPlotModalData: null,
    });
  }

  openModalAndWaitForData(cid) {
    // Set modal data with loading state and higher priority
    this.setState(
      {
        depthPlotModalData: { loading: true, cid: cid },
      },
      () => {
        $(this.refs["depth plot modal"]).modal("show");
        // Set higher priority for this experiment's data loading
        this.loadDepthPlotsData(cid, true); // true = high priority
      }
    );
  }

  // Normalize measurement docs to plotting rows (depth + series)
  _extractDepthPlotRowsFromDocs(docs) {
    const toNum = (v) => {
      const n = +v;
      return _.isFinite(n) ? n : undefined;
    };
    const first = (v) => (_.isArray(v) ? v[0] : v);
    return (docs || [])
      .map((r) => ({
        section: first(_.get(r, "summary.sections.section")),
        depth: toNum(_.get(r, "summary.measurements.depth.range.gte")),
        gamma_density: toNum(
          _.get(r, "summary.measurements.gamma_density.vals[0]")
        ),
        mag_susc_chi_mass: toNum(
          _.get(r, "summary.measurements.mag_susc_chi_mass.vals[0]")
        ),
        res: toNum(_.get(r, "summary.measurements.res.vals[0]")),
        pwave_v: toNum(_.get(r, "summary.measurements.pwave_v.vals[0]")),
        fp: toNum(_.get(r, "summary.measurements.fp.vals[0]")),
        k: toNum(_.get(r, "summary.measurements.k.vals[0]")),
        ca: toNum(_.get(r, "summary.measurements.ca.vals[0]")),
        ti: toNum(_.get(r, "summary.measurements.ti.vals[0]")),
        fe: toNum(_.get(r, "summary.measurements.fe.vals[0]")),
        zr: toNum(_.get(r, "summary.measurements.zr.vals[0]")),
      }))
      .filter((r) => _.isFinite(r.depth))
      .sort((a, b) => a.depth - b.depth);
  }

  // Normalize raw contribution.measurements rows to plotting rows
  _extractDepthPlotRowsFromMeasurements(measurements) {
    const toNum = (v) => {
      const n = +v;
      return _.isFinite(n) ? n : undefined;
    };
    return (measurements || [])
      .map((m) => ({
        core: m && m.core,
        section: m && m.section,
        depth: toNum(
          m && (m.mbs_corrected !== undefined ? m.mbs_corrected : m.depth)
        ),
        gamma_density: toNum(m && m.gamma_density),
        mag_susc_chi_mass: toNum(m && m.mag_susc_chi_mass),
        res: toNum(m && m.res),
        pwave_v: toNum(m && m.pwave_v),
        fp: toNum(m && m.fp),
        k: toNum(m && m.k),
        ca: toNum(m && m.ca),
        ti: toNum(m && m.ti),
        fe: toNum(m && m.fe),
        zr: toNum(m && m.zr),
      }))
      .filter((r) => _.isFinite(r.depth))
      .sort((a, b) => a.depth - b.depth);
  }

  loadDepthPlotsData(cid, highPriority = false) {
    if (!cid) return;
    if (
      this.state.depthPlotsData[cid] !== undefined ||
      (this.state.loadingRequests && this.state.loadingRequests.has(cid))
    )
      return;

    const newLoading = new Set(this.state.loadingRequests || []);
    newLoading.add(cid);
    this.setState({
      loadingRequests: newLoading,
      depthPlotsLoading: { ...this.state.depthPlotsLoading, [cid]: true },
    });

    Meteor.call("esGetMeasurements", { index, cid }, (error, measurements) => {
      const updatedLoading = new Set(this.state.loadingRequests || []);
      updatedLoading.delete(cid);
      if (error) {
        console.error("Error loading measurements", cid, error);
        this.setState({
          loadingRequests: updatedLoading,
          depthPlotsLoading: {
            ...this.state.depthPlotsLoading,
            [cid]: false,
          },
          depthPlotsData: {
            ...this.state.depthPlotsData,
            [cid]: null,
          },
        });
        return;
      }
      const rows = this._extractDepthPlotRowsFromMeasurements(measurements);
      this.setState({
        loadingRequests: updatedLoading,
        depthPlotsLoading: { ...this.state.depthPlotsLoading, [cid]: false },
        depthPlotsData: { ...this.state.depthPlotsData, [cid]: rows },
      });
    });
  }

  renderFullDepthPlots() {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          maxWidth: "100%",
          overflow: "hidden",
        }}
      >
        <div
          style={{ textAlign: "center", marginBottom: "20px", flexShrink: 0 }}
        >
          <h3>Depth Plots</h3>
        </div>

        <div
          style={{
            flexShrink: 0,
            textAlign: "center",
            maxWidth: "100%",
            overflow: "hidden",
          }}
        >
          <svg
            viewBox={`0 0 ${width} ${height}`}
            style={{
              display: "block",
              margin: "0 auto",
              width: "100%",
              height: "auto",
              maxWidth: `${width}px`,
            }}
          >
            {/* Background */}
            <rect
              width={width}
              height={height}
              fill="white"
              stroke="#ddd"
              strokeWidth={1}
            />
          </svg>
        </div>

        {/* Data table */}
        <div
          style={{
            marginTop: "20px",
            flex: "1",
            overflowY: "auto",
            minHeight: "150px",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "14px",
            }}
          >
            <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "5px",
                    backgroundColor: "#f5f5f5",
                    position: "sticky",
                    top: 0,
                    textAlign: "center",
                  }}
                >
                  Depth
                </th>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "5px",
                    backgroundColor: "#f5f5f5",
                    position: "sticky",
                    top: 0,
                    textAlign: "center",
                  }}
                >
                  Temp (°C)
                </th>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "5px",
                    backgroundColor: "#f5f5f5",
                    position: "sticky",
                    top: 0,
                    textAlign: "center",
                  }}
                >
                  Age (Ma)
                </th>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "5px",
                    backgroundColor: "#f5f5f5",
                    position: "sticky",
                    top: 0,
                    textAlign: "center",
                  }}
                >
                  ±1σ
                </th>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "5px",
                    backgroundColor: "#f5f5f5",
                    position: "sticky",
                    top: 0,
                    textAlign: "center",
                  }}
                >
                  Cum. ³⁹Ar (%)
                </th>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "5px",
                    backgroundColor: "#f5f5f5",
                    position: "sticky",
                    top: 0,
                    textAlign: "center",
                  }}
                >
                  depthPlots
                </th>
              </tr>
            </thead>
            <tbody>
              {ageData.map((d, i) => {
                const isdepthPlotsStep = depthPlotsSteps.includes(i);
                return (
                  <tr
                    key={i}
                    style={{
                      backgroundColor: isdepthPlotsStep ? "#e6f2ff" : "white",
                    }}
                  >
                    <td
                      style={{
                        border: "1px solid #ddd",
                        padding: "5px",
                        textAlign: "center",
                      }}
                    >
                      {i + 1}
                    </td>
                    <td
                      style={{
                        border: "1px solid #ddd",
                        padding: "5px",
                        textAlign: "center",
                      }}
                    >
                      {d.temperature}
                    </td>
                    <td
                      style={{
                        border: "1px solid #ddd",
                        padding: "5px",
                        textAlign: "center",
                      }}
                    >
                      {d.age.toFixed(2)}
                    </td>
                    <td
                      style={{
                        border: "1px solid #ddd",
                        padding: "5px",
                        textAlign: "center",
                      }}
                    >
                      {d.age_sigma.toFixed(2)}
                    </td>
                    <td
                      style={{
                        border: "1px solid #ddd",
                        padding: "5px",
                        textAlign: "center",
                      }}
                    >
                      {d.cumAr39.toFixed(1)}
                    </td>
                    <td
                      style={{
                        border: "1px solid #ddd",
                        padding: "5px",
                        textAlign: "center",
                      }}
                    >
                      {isdepthPlotsStep ? "✓" : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  render() {
    const item = this.props.item;
    let _is_activated =
      item.summary &&
      item.summary.contribution &&
      item.summary.contribution._is_activated === "true";
    try {
      return (
        <div>
          <div
            ref="accordion"
            className={
              "ui accordion search-summaries-list-item" +
              (this.props.active && !this.props.collapsed ? " active" : "")
            }
            onMouseOver={(e) => {
              clearTimeout(this.hideAccordionButtonTimeout);
              this.showAccordionButtonTimeout = setTimeout(() => {
                if ($(this.refs["accordion title"]).hasClass("active")) {
                  $(this.refs["close accordion button"]).show();
                  $(this.refs["open accordion button"]).hide();
                } else {
                  $(this.refs["open accordion button"]).show();
                  $(this.refs["close accordion button"]).hide();
                }
              }, 500);
            }}
            onMouseLeave={(e) => {
              clearTimeout(this.showAccordionButtonTimeout);
              this.hideAccordionButtonTimeout = setTimeout(() => {
                $(this.refs["open accordion button"]).hide();
                $(this.refs["close accordion button"]).hide();
              }, 500);
            }}
          >
            <div
              ref="accordion title"
              className={
                "title" +
                (this.props.active && !this.props.collapsed ? " active" : "")
              }
              style={{ padding: "0 0 0 1em" }}
            >
              <i
                className="dropdown icon"
                style={{ position: "relative", left: "-1.3rem", top: "-.2rem" }}
              />
              <div
                className="ui grid"
                style={{ marginTop: "-1.5rem", marginBottom: "-.5em" }}
              >
                <div
                  className="row accordion-trigger"
                  style={{ display: "flex", padding: "0 1em 0.5em" }}
                >
                  <span
                    style={{
                      fontSize: "small",
                      fontWeight: "bold",
                      color:
                        !_is_activated && Meteor.isDevelopment
                          ? "#e09f00"
                          : "default",
                    }}
                  >
                    {(item.summary._all &&
                      item.summary._all.cruise &&
                      item.summary._all.cruise[0]) ||
                      "Unknown"}
                    {" ⇒ "}
                    {(item.summary._all &&
                      item.summary._all.core &&
                      item.summary._all.core[0]) ||
                      "Unknown"}
                    {item.summary.contribution &&
                      item.summary.contribution.version && (
                        <span>
                          &nbsp;v.&nbsp;{item.summary.contribution.version}
                        </span>
                      )}
                  </span>
                  <span
                    style={{
                      fontSize: "small",
                      flex: "1",
                      height: "1.25em",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      margin: "0 0.5em",
                      color:
                        !_is_activated && Meteor.isDevelopment
                          ? "#e09f00"
                          : "default",
                    }}
                  >
                    {this.renderTitle(item)}
                  </span>
                  <span
                    className="description"
                    style={{
                      fontSize: "small",
                      float: "right",
                      textAlign: "right",
                    }}
                  >
                    {item.summary.contribution &&
                      moment
                        .utc(item.summary.contribution.timestamp)
                        .local()
                        .format("LL")}
                    &nbsp;by&nbsp;
                    <b>
                      {item.summary.contribution &&
                        item.summary.contribution._contributor}
                    </b>
                  </span>
                </div>
                {item.summary && item.summary._incomplete_summary !== "true" ? (
                  <div
                    className="row flex_row"
                    style={{
                      padding: "0",
                      fontWeight: "normal",
                      whiteSpace: "nowrap",
                      display: "flex",
                    }}
                  >
                    {this.renderDownloadButton(item)}
                    {this.renderLinks(item)}
                    {this.renderCounts(item)}
                    {this.renderMapThumbnail(item)}
                    {this.renderDepthPlots(item)}
                    {this.renderGeo(item)}
                    {this.renderGeology(item)}
                    {this.renderMethodCodes(item)}
                  </div>
                ) : (
                  <div
                    className="row flex_row"
                    style={{
                      padding: "0",
                      fontWeight: "normal",
                      whiteSpace: "nowrap",
                      display: "flex",
                    }}
                  >
                    {this.renderDownloadButton(item)}
                    {this.renderLinks(item)}
                    {this.renderCounts(item)}
                    {this.renderQueuedForIndex(item)}
                  </div>
                )}
              </div>
            </div>
            <div
              className={
                "content" +
                (this.props.active && !this.props.collapsed ? " active" : "")
              }
              style={{ fontSize: "small", paddingBottom: 0 }}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    item.summary.contribution &&
                    item.summary.contribution._reference &&
                    item.summary.contribution._reference.html,
                }}
              />
              <div
                style={{ marginTop: "0.5em" }}
                dangerouslySetInnerHTML={{
                  __html:
                    item.summary.contribution &&
                    item.summary.contribution._reference &&
                    item.summary.contribution._reference.abstract_html,
                }}
              />
              {item.summary.contribution &&
                item.summary.contribution._reference &&
                item.summary.contribution._reference.keywords &&
                item.summary.contribution._reference.keywords.join && (
                  <div
                    style={{ marginTop: "0.5em" }}
                    dangerouslySetInnerHTML={{
                      __html:
                        "<b>Keywords: </b>" +
                        item.summary.contribution._reference.keywords.join(
                          ", "
                        ),
                    }}
                  />
                )}
              {item.summary.contribution &&
                item.summary.contribution._reference &&
                item.summary.contribution._reference.keywords &&
                !item.summary.contribution._reference.keywords.join && (
                  <div
                    style={{ marginTop: "0.5em" }}
                    dangerouslySetInnerHTML={{
                      __html:
                        "<b>Keywords: </b>" +
                        item.summary.contribution._reference.keywords,
                    }}
                  />
                )}
              {item.summary.contribution &&
                item.summary.contribution._reference &&
                item.summary.contribution._reference.tags &&
                item.summary.contribution._reference.tags.join && (
                  <div
                    style={{ marginTop: "0.5em" }}
                    dangerouslySetInnerHTML={{
                      __html:
                        "<b>Tags: </b>" +
                        item.summary.contribution._reference.tags.join(", "),
                    }}
                  />
                )}
              {item.summary.contribution &&
                item.summary.contribution._reference &&
                item.summary.contribution._reference.tags &&
                !item.summary.contribution._reference.tags.join && (
                  <div
                    style={{ marginTop: "0.5em" }}
                    dangerouslySetInnerHTML={{
                      __html:
                        "<b>Tags: </b>" +
                        item.summary.contribution._reference.tags,
                    }}
                  />
                )}
              {item.summary.contribution &&
                item.summary.contribution._reference &&
                item.summary.contribution._reference.n_citations && (
                  <div
                    style={{ marginTop: "0.5em" }}
                    dangerouslySetInnerHTML={{
                      __html:
                        '<b><a target="_blank" href="https://www.crossref.org" style="color: #792f91">Crossref</a> Citation Count: </b>' +
                        item.summary.contribution._reference.n_citations,
                    }}
                  />
                )}

              {this.props.table === "contribution" &&
                item.summary.contribution &&
                item.summary.contribution._history && (
                  <table className="ui very basic compact collapsing table">
                    <thead>
                      <tr>
                        <th style={{ whiteSpace: "nowrap" }}>Download</th>
                        <th style={{ whiteSpace: "nowrap" }}>
                          CDR Contribution Link
                        </th>
                        <th style={{ whiteSpace: "nowrap" }}>
                          EarthRef Data DOI Link
                        </th>
                        <th style={{ whiteSpace: "nowrap" }}>Version</th>
                        <th style={{ whiteSpace: "nowrap" }}>Data Model</th>
                        <th style={{ whiteSpace: "nowrap" }}>Date</th>
                        <th style={{ whiteSpace: "nowrap" }}>Contributor</th>
                        {_.find(
                          item.summary.contribution._history,
                          "description"
                        ) && (
                          <th style={{ whiteSpace: "nowrap" }}>Description</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {item.summary.contribution &&
                        item.summary.contribution._history.map((v, i) => {
                          let _is_activated =
                            item.summary &&
                            item.summary.contribution &&
                            item.summary.contribution._is_activated === "true";
                          let _has_data_doi =
                            item.summary &&
                            item.summary.contribution &&
                            item.summary.contribution._has_data_doi === "true";
                          return (
                            <tr key={i}>
                              <td style={{ whiteSpace: "nowrap" }}>
                                {v.id && (
                                  <a
                                    href={`//earthref.org/CDR/download/${v.id}/cdr_contribution_${v.id}.txt`}
                                    download
                                  >
                                    <button
                                      className="ui basic tiny fluid compact icon yellow button"
                                      style={{ marginTop: "0" }}
                                    >
                                      <i className="ui file text outline icon" />{" "}
                                      Download
                                    </button>
                                  </a>
                                )}
                                {!v.id && (
                                  <button
                                    className="ui basic tiny fluid compact icon yellow disabled button"
                                    style={{ marginTop: "0" }}
                                  >
                                    <i className="ui file text outline icon" />{" "}
                                    Download
                                  </button>
                                )}
                              </td>
                              <td>
                                {(_is_activated || i > 0) && (
                                  <a
                                    style={this.styles.a}
                                    href={"https://earthref.org/CDR/" + v.id}
                                  >
                                    {"earthref.org/CDR/" + v.id}
                                  </a>
                                )}
                                {!_is_activated && i == 0 && (
                                  <span>{"earthref.org/MagIC/" + v.id}</span>
                                )}
                              </td>
                              <td>
                                {_is_activated && _has_data_doi && (
                                  <a
                                    style={this.styles.a}
                                    href={
                                      "http://dx.doi.org/10.7288/V4/CDR/" + v.id
                                    }
                                    target="_blank"
                                  >
                                    {"10.7288/V4/CDR/" + v.id}
                                  </a>
                                )}
                                {_is_activated && !_has_data_doi && (
                                  <span>Queued For Creation</span>
                                )}
                                {!_is_activated && (
                                  <span>{"10.7288/V4/CDR/" + v.id}</span>
                                )}
                              </td>
                              <td>{v.version}</td>
                              <td>
                                {parseFloat(v.data_model_version).toFixed(1)}
                              </td>
                              <td>
                                {moment(v.timestamp).local().format("LL")}
                              </td>
                              <td>{v.contributor}</td>
                              {_.find(
                                item.summary.contribution._history,
                                "description"
                              ) && <td>{v.description}</td>}
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                )}
              {Meteor.isDevelopment &&
                this.props.table === "contribution" &&
                item.summary.contribution && (
                  <table className="ui compact red table">
                    <thead>
                      <tr>
                        <th style={{ whiteSpace: "nowrap" }}>
                          Developer Tasks
                        </th>
                        <th style={{ whiteSpace: "nowrap" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.summary.contribution._is_activated === "true" && (
                        <tr>
                          <td style={{ whiteSpace: "nowrap" }}>
                            <button
                              className="ui basic tiny fluid compact red button"
                              style={{ marginTop: "0" }}
                              onClick={function (id, e) {
                                console.log("esDeactivateContribution");
                                Meteor.call(
                                  "esDeactivateContribution",
                                  { index: index, id: id },
                                  (error) => {
                                    console.log(
                                      "esDeactivateContribution done"
                                    );
                                  }
                                );
                              }.bind(this, item.summary.contribution.id)}
                            >
                              Deactivate
                            </button>
                          </td>
                          <td>
                            Deactivate the contribution (contribution and Data
                            DOI links will be broken until activated again).
                          </td>
                        </tr>
                      )}
                      {item.summary.contribution._is_activated !== "true" && (
                        <tr>
                          <td style={{ whiteSpace: "nowrap" }}>
                            <button
                              className="ui basic tiny fluid compact red button"
                              style={{ marginTop: "0" }}
                              onClick={function (id, e) {
                                console.log("esActivateContribution");
                                Meteor.call(
                                  "esActivateContribution",
                                  { index: index, id: id },
                                  (error) => {
                                    console.log("esActivateContribution done");
                                  }
                                );
                              }.bind(this, item.summary.contribution.id)}
                            >
                              Force Activate
                            </button>
                          </td>
                          <td>
                            Activate the contribution even if not validated.
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td style={{ whiteSpace: "nowrap" }}>
                          <button
                            className="ui basic tiny fluid compact red button"
                            style={{ marginTop: "0" }}
                            onClick={function (id, contributor, e) {
                              console.log("esUpdatePrivatePreSummaries");
                              Meteor.call(
                                "esUpdatePrivatePreSummaries",
                                { index, id, contributor },
                                (error) => {
                                  console.log(
                                    "esUpdatePrivatePreSummaries done"
                                  );
                                }
                              );
                            }.bind(
                              this,
                              item.summary.contribution.id,
                              item.summary.contribution.contributor
                            )}
                          >
                            Pre Summary
                          </button>
                        </td>
                        <td>
                          Calculate the contribution pre summary and submit it
                          to Elasticsearch for indexing.
                        </td>
                      </tr>
                      <tr>
                        <td style={{ whiteSpace: "nowrap" }}>
                          <button
                            className="ui basic tiny fluid compact red button"
                            style={{ marginTop: "0" }}
                            onClick={function (id, contributor, e) {
                              console.log("esUpdatePrivateSummaries");
                              Meteor.call(
                                "esUpdatePrivateSummaries",
                                { index, id, contributor },
                                (error) => {
                                  console.log("esUpdatePrivateSummaries done");
                                }
                              );
                            }.bind(
                              this,
                              item.summary.contribution.id,
                              item.summary.contribution.contributor
                            )}
                          >
                            Full Summary
                          </button>
                        </td>
                        <td>
                          Calculate the full contribution summary and submit it
                          to Elasticsearch for indexing.
                        </td>
                      </tr>
                      {item.summary.contribution &&
                        item.summary.contribution._history &&
                        item.summary.contribution._history.map((v, i) => (
                          <tr key={i}>
                            <td style={{ whiteSpace: "nowrap" }}>
                              <button
                                className="ui basic tiny fluid compact red button"
                                style={{ marginTop: "0" }}
                                onClick={function (id, e) {
                                  console.log(
                                    "esUploadActivatedContributionToS3"
                                  );
                                  Meteor.call(
                                    "esUploadActivatedContributionToS3",
                                    { index, id },
                                    (error) => {
                                      console.log(
                                        "esUploadActivatedContributionToS3 done"
                                      );
                                    }
                                  );
                                }.bind(this, v.id)}
                              >
                                Upload {v.id} to S3
                              </button>
                            </td>
                            <td>
                              Upload the contribution text file to
                              magic-contributions and/or
                              magic-activated-contributions.
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
            </div>
            <div
              ref="open accordion button"
              className="ui grey icon button accordion-button"
              onClick={(e) => {
                $(this.refs["accordion"]).accordion("open", 0);
                $(this.refs["close accordion button"]).show();
                $(this.refs["open accordion button"]).hide();
              }}
            >
              <i className="caret down icon"></i>
            </div>
            <div
              ref="close accordion button"
              className="ui grey icon button accordion-button"
              onClick={(e) => {
                $(this.refs["accordion"]).accordion("close", 0);
                $(this.refs["open accordion button"]).show();
                $(this.refs["close accordion button"]).hide();
              }}
            >
              <i className="caret up icon"></i>
            </div>
            {this.state.loadMap && this.renderMapModal(item)}
            {this.state.showDataModal && this.renderDataModal(item)}
            {this.renderDepthPlotsModal()}
          </div>
        </div>
      );
    } catch (e) {
      console.error(e);
    }
  }

  renderMapModal(item) {
    let citation =
      item.summary &&
      item.summary.contribution &&
      item.summary.contribution._reference &&
      item.summary.contribution._reference.citation;
    let name =
      item.summary &&
      item.summary.contribution &&
      item.summary.contribution._name;
    return (
      <div ref="map modal" className="ui fullscreen modal">
        <i className="close icon"></i>
        <div className="header">{citation || name || "Unnamed"} Map</div>
        <GoogleMap
          style={{ width: "100%", height: "calc(100vh - 10em)" }}
          docs={[item]}
        />
      </div>
    );
  }

  renderDataModal(item) {
    const citation =
      item.summary &&
      item.summary.contribution &&
      item.summary.contribution._reference &&
      item.summary.contribution._reference.citation;
    const name =
      item.summary &&
      item.summary.contribution &&
      item.summary.contribution._name;
    const isPrivate =
      item.summary &&
      item.summary.contribution &&
      item.summary.contribution._is_activated !== "true";
    return (
      <Modal
        onClose={() =>
          this.setState(
            this.state.dataEdited
              ? { showConfirmCloseEditedDataModal: true }
              : { showDataModal: false }
          )
        }
        open={true}
        style={{ width: "calc(100vw - 4em)" }}
      >
        <Modal.Header>
          <i
            className="close icon"
            onClick={() =>
              this.setState(
                this.state.dataEdited
                  ? { showConfirmCloseEditedDataModal: true }
                  : { showDataModal: false }
              )
            }
            style={{ cursor: "pointer", float: "right" }}
          />
          {citation || name || "Unnamed"} - Contribution Data
        </Modal.Header>
        <Modal.Content>
          <div className="ui top attached tabular small menu search-tab-menu">
            {this.state.contributionData &&
            this.state.contributionData.cores ? (
              <a
                className={`${
                  this.state.dataLevel === "cores" ? "active " : ""
                }item`}
                style={
                  this.state.dataLevel === "cores"
                    ? { backgroundColor: "#F0F0F0" }
                    : {}
                }
                onClick={() =>
                  this.setState(
                    this.state.dataEdited
                      ? {
                          showConfirmChangeTabsEditedDataModal: true,
                          confirmChangeTabsDataLevel: "cores",
                        }
                      : { dataLoading: true, dataLevel: "cores" }
                  )
                }
              >
                Cores
                <div
                  className="ui circular small basic label"
                  style={{
                    color: "#0C0C0C",
                    margin: "-1em -1em -1em 0.5em",
                    minWidth: "4em",
                  }}
                >
                  <Count count={this.state.contributionData.cores.length} />
                </div>
              </a>
            ) : (
              <div
                className={`${
                  this.state.dataLevel === "cores" ? "active " : ""
                }disabled item`}
                style={
                  this.state.dataLevel === "cores"
                    ? { backgroundColor: "#F0F0F0" }
                    : {}
                }
              >
                Cores
                <div
                  className="ui circular small basic label"
                  style={{
                    color: "#0C0C0C",
                    margin: "-1em -1em -1em 0.5em",
                    minWidth: "4em",
                  }}
                >
                  {this.state.contributionData ? "0" : "?"}
                </div>
              </div>
            )}
            {this.state.contributionData &&
            this.state.contributionData.sections ? (
              <a
                className={`${
                  this.state.dataLevel === "sections" ? "active " : ""
                }item`}
                style={
                  this.state.dataLevel === "sections"
                    ? { backgroundColor: "#F0F0F0" }
                    : {}
                }
                onClick={() =>
                  this.setState(
                    this.state.dataEdited
                      ? {
                          showConfirmChangeTabsEditedDataModal: true,
                          confirmChangeTabsDataLevel: "sections",
                        }
                      : { dataLoading: true, dataLevel: "sections" }
                  )
                }
              >
                Sections
                <div
                  className="ui circular small basic label"
                  style={{
                    color: "#0C0C0C",
                    margin: "-1em -1em -1em 0.5em",
                    minWidth: "4em",
                  }}
                >
                  <Count count={this.state.contributionData.sections.length} />
                </div>
              </a>
            ) : (
              <div
                className={`${
                  this.state.dataLevel === "sections" ? "active " : ""
                }disabled item`}
                style={
                  this.state.dataLevel === "sections"
                    ? { backgroundColor: "#F0F0F0" }
                    : {}
                }
              >
                Sections
                <div
                  className="ui circular small basic label"
                  style={{
                    color: "#0C0C0C",
                    margin: "-1em -1em -1em 0.5em",
                    minWidth: "4em",
                  }}
                >
                  {this.state.contributionData ? "0" : "?"}
                </div>
              </div>
            )}
            {this.state.contributionData &&
            this.state.contributionData.measurements ? (
              <a
                className={`${
                  this.state.dataLevel === "measurements" ? "active " : ""
                }item`}
                style={
                  this.state.dataLevel === "measurements"
                    ? { backgroundColor: "#F0F0F0" }
                    : {}
                }
                onClick={() =>
                  this.setState(
                    this.state.dataEdited
                      ? { showConfirmChangeTabsEditedDataModal: true }
                      : {
                          dataLoading: true,
                          dataLevel: "measurements",
                          confirmChangeTabsDataLevel: "measurements",
                        }
                  )
                }
              >
                Measurments
                <div
                  className="ui circular small basic label"
                  style={{
                    color: "#0C0C0C",
                    margin: "-1em -1em -1em 0.5em",
                    minWidth: "4em",
                  }}
                >
                  <Count
                    count={this.state.contributionData.measurements.length}
                  />
                </div>
              </a>
            ) : (
              <div
                className={`${
                  this.state.dataLevel === "measurements" ? "active " : ""
                }disabled item`}
                style={
                  this.state.dataLevel === "measurements"
                    ? { backgroundColor: "#F0F0F0" }
                    : {}
                }
              >
                Measurements
                <div
                  className="ui circular small basic label"
                  style={{
                    color: "#0C0C0C",
                    margin: "-1em -1em -1em 0.5em",
                    minWidth: "4em",
                  }}
                >
                  {this.state.contributionData ? "0" : "?"}
                </div>
              </div>
            )}
          </div>
          {this.renderData(item)}
          <Modal
            size="small"
            onClose={() =>
              this.setState({ showConfirmCloseEditedDataModal: false })
            }
            open={this.state.showConfirmCloseEditedDataModal}
            content="Closing the Contribution Data tables will cancel edits made to this table."
            actions={[
              {
                content: "Cancel Edits and Close",
                key: "cancel",
                negative: true,
                onClick: () =>
                  this.setState({
                    dataEdited: false,
                    contributionData: undefined,
                    contributionDataError: undefined,
                    showDataModal: false,
                    showConfirmCloseEditedDataModal: false,
                    confirmChangeTabsDataLevel: undefined,
                  }),
              },
              "Continue Editing",
            ]}
          />
          <Modal
            size="small"
            onClose={() =>
              this.setState({
                showConfirmChangeTabsEditedDataModal: false,
                confirmChangeTabsDataLevel: undefined,
              })
            }
            open={this.state.showConfirmChangeTabsEditedDataModal}
            content="Changing table tabs will cancel edits made to this table."
            actions={[
              {
                content: "Cancel Edits and Change Tabs",
                key: "cancel",
                negative: true,
                onClick: () =>
                  this.setState({
                    dataEdited: false,
                    contributionData: undefined,
                    contributionDataError: undefined,
                    showConfirmChangeTabsEditedDataModal: false,
                    confirmChangeTabsDataLevel: undefined,
                    dataLevel: this.state.confirmChangeTabsDataLevel,
                  }),
              },
              "Continue Editing",
            ]}
          />
        </Modal.Content>
        {isPrivate && (
          <Modal.Actions>
            <Button
              color="yellow"
              floated="left"
              disabled={!this.state.dataEdited || this.state.dataSaving}
              onClick={() => {
                const data =
                  (this.refs["hotTableComponent"] &&
                    this.refs["hotTableComponent"].hotInstance.getData()) ||
                  undefined;
                if (this.state.dataEdited && data) {
                  const rowData =
                    this.state.contributionData[this.state.dataLevel];
                  const model = models[_.last(versions)];
                  const table = model.tables[this.state.dataLevel];
                  const modelColumns = _.sortBy(
                    _.keys(table.columns),
                    (columnName) => table.columns[columnName].position
                  );
                  const tableData =
                    this.state.contributionData[this.state.dataLevel];
                  const usedColumns = {};
                  tableData.forEach((row) => {
                    _.keys(row).forEach((column) => {
                      usedColumns[column] = true;
                    });
                  });
                  const columns = modelColumns.filter((x) => usedColumns[x]);
                  const contributionData = {
                    ...this.state.contributionData,
                    [this.state.dataLevel]: data.map((row) => {
                      const editedRow = {};
                      row.forEach((col, colIdx) => {
                        editedRow[columns[colIdx]] = col;
                      });
                      return editedRow;
                    }),
                  };
                  console.log("updating contribution", item);
                  const contributor = item.summary.contribution.contributor;
                  const _contributor = item.summary.contribution._contributor;
                  const id = item.summary.contribution.id;
                  const contribution = contributionData;
                  const summary = item.summary;
                  Meteor.call(
                    "esUpdatePrivateContribution",
                    {
                      index,
                      contributor,
                      _contributor,
                      id,
                      contribution,
                      summary,
                    },
                    (error) => {
                      console.log("updated contribution", id, error);
                      if (error) {
                        this.setState({
                          contributionDataError: error,
                          dataSaving: false,
                        });
                      } else {
                        this.setState({ dataSaving: false });
                        Meteor.call(
                          "esUpdatePrivatePreSummaries",
                          {
                            index,
                            contributor,
                            _contributor,
                            id,
                            contribution,
                            summary,
                          },
                          (error) => {
                            console.log(
                              "updated contribution pre-summaries",
                              id,
                              error
                            );
                            if (error) {
                              this.setState({ contributionDataError: error });
                            } else {
                              Meteor.call("esUpdatePrivateSummaries", {
                                index,
                                contributor,
                                _contributor,
                                id,
                                contribution,
                                summary,
                              });
                            }
                          }
                        );
                      }
                    }
                  );
                  this.setState({
                    dataEdited: false,
                    dataSaving: true,
                    contributionData,
                  });
                  this.contributionDataEdited = undefined;
                }
              }}
            >
              {this.state.dataSaving ? "Saving" : "Save"} Edits
            </Button>
            <Button
              color="red"
              disabled={!this.state.dataEdited || this.state.dataSaving}
              onClick={() => {
                this.contributionDataEdited = undefined;
                this.setState({
                  dataEdited: false,
                  contributionData: undefined,
                  contributionDataError: undefined,
                });
              }}
            >
              Cancel Edits
            </Button>
            <Button
              onClick={() =>
                this.setState(
                  this.state.dataEdited
                    ? { showConfirmCloseEditedDataModal: true }
                    : { showDataModal: false }
                )
              }
            >
              Close
            </Button>
          </Modal.Actions>
        )}
      </Modal>
    );
  }

  renderData(item) {
    const isPrivate =
      item.summary &&
      item.summary.contribution &&
      item.summary.contribution._is_activated !== "true";
    if (
      !this.state.contributionData &&
      item &&
      item.summary &&
      item.summary.contribution
    )
      Meteor.call(
        "esGetContribution",
        {
          index,
          id: item.summary.contribution.id,
          tables: ["cores", "sections", "measurements"],
        },
        (error, c) => {
          console.log("esGetContribution", error, c);
          if (!error && c) this.setState({ contributionData: c });
          else
            this.setState({
              contributionData: {},
              contributionDataError: error,
            });
        }
      );
    if (!this.state.contributionData)
      return (
        <div
          className="ui bottom attached segment"
          style={{
            overflow: "auto",
            height: `calc(100vh - ${isPrivate ? 19 : 14}em)`,
          }}
        >
          <div className="ui inverted active dimmer">
            <div className="ui text loader">Loading Contribution Data</div>
          </div>
        </div>
      );
    if (this.state.dataLoading) {
      _.delay(() => this.setState({ dataLoading: false }));
      return (
        <div
          className="ui bottom attached segment"
          style={{
            overflow: "auto",
            height: `calc(100vh - ${isPrivate ? 19 : 14}em)`,
          }}
        >
          <div className="ui inverted active dimmer">
            <div className="ui text loader">Loading Contribution Data</div>
          </div>
        </div>
      );
    }
    if (this.state.contributionDataError)
      return (
        <div
          className="ui bottom attached segment"
          style={{
            overflow: "auto",
            height: `calc(100vh - ${isPrivate ? 19 : 14}em)`,
          }}
        >
          <div className="ui error message">
            <div className="header">Contribution Data Error</div>
            <p>{this.state.contributionDataError}</p>
          </div>
        </div>
      );
    if (!this.state.contributionData[this.state.dataLevel])
      return (
        <div
          className="ui bottom attached segment"
          style={{
            overflow: "auto",
            height: `calc(100vh - ${isPrivate ? 19 : 14}em)`,
          }}
        >
          <div className="ui fluid warning message">
            <div className="ui center aligned huge basic segment">
              No Rows to Display
            </div>
          </div>
        </div>
      );
    const model = models[_.last(versions)];
    const table = model.tables[this.state.dataLevel];
    const modelColumns = _.sortBy(
      _.keys(table.columns),
      (columnName) => table.columns[columnName].position
    );
    const rowData = this.state.contributionData[this.state.dataLevel];
    const usedColumns = {};
    rowData.forEach((row) => {
      _.keys(row).forEach((column) => {
        usedColumns[column] = true;
      });
    });
    const columns = modelColumns.filter((x) => usedColumns[x]);
    return (
      <HotTable
        ref="hotTableComponent"
        className={!isPrivate ? "handsontable-readonly" : ""}
        style={{
          marginTop: -1,
          height: `calc(100vh - ${isPrivate ? 20 : 15}em)`,
          overflow: "hidden",
          backgroundColor: "#EEE",
        }}
        settings={{
          licenseKey: "non-commercial-and-evaluation",
          data: rowData,
          readOnly: !isPrivate,
          contextMenu: isPrivate,
          rowHeaders: true,
          colHeaders: columns,
          outsideClickDeselects: false,
          afterChange: (changes) => {
            if (changes) {
              const data =
                (this.refs["hotTableComponent"] &&
                  this.refs["hotTableComponent"].hotInstance.getData()) ||
                undefined;
              if (data && !this.state.dataEdited)
                this.setState({ dataEdited: true });
              this.contributionDataEdited = data;
            }
          },
        }}
      >
        {columns.map((columnName, i) => (
          <HotColumn key={i} data={columnName}></HotColumn>
        ))}
      </HotTable>
    );
  }
}

SearchSummariesListItem.propTypes = {
  table: PropTypes.oneOf(["contribution", "cores", "sections", "measurements"])
    .isRequired,
  item: PropTypes.object,
};

export default SearchSummariesListItem;
