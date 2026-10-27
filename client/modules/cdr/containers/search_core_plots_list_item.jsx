import _ from "lodash";
import { compose } from "@storybook/react-komposer";

import CorePlotsListItem from "/client/modules/cdr/components/search_core_plots";
import { index as defaultIndex } from "/lib/configs/cdr/search_levels.js";

// Convert raw measurement rows (from esGetMeasurements) into the flat
// {core, section, depth, <series>...} rows the CorePlot expects. Mirrors
// SearchSummariesListItem._extractDepthPlotRowsFromMeasurements.
function extractRows(measurements) {
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
    .filter((r) => _.isFinite(r.depth));
}

const cidOf = (props) => _.get(props, "item.summary.contribution.id");
const coreOf = (props) => _.get(props, "item.summary._all.core[0]");

export const composer = ({ item, es }, onData) => {
  const cid = cidOf({ item });
  const index = (es && es.index) || defaultIndex;
  if (!cid) {
    onData(null, { rows: [], loading: false });
    return;
  }
  onData(null, { rows: undefined, loading: true });
  Meteor.call("esGetMeasurements", { index, cid }, (error, measurements) => {
    try {
      if (error) {
        console.error("SearchCorePlotsListItem", error);
        onData(null, { error, loading: false });
      } else {
        // esGetMeasurements returns every core's measurements for the
        // contribution; this list item is a single core, so scope the rows to
        // it (measurements are stamped with `core` server-side). Fall back to
        // all rows when the item has no core name.
        const itemCore = coreOf({ item });
        let rows = extractRows(measurements);
        if (itemCore != null)
          rows = rows.filter((r) => r.core === itemCore);
        onData(null, { rows, loading: false });
      }
    } catch (e) {
      console.error("SearchCorePlotsListItem", e);
    }
  });
};

export default compose(composer, {
  propsToWatch: ["item"],
  shouldSubscribe(currentProps, nextProps) {
    return (
      cidOf(currentProps) !== cidOf(nextProps) ||
      coreOf(currentProps) !== coreOf(nextProps)
    );
  },
})(CorePlotsListItem);
