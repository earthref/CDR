import _ from "lodash";
import React from "react";
import { compose } from "@storybook/react-komposer";

import SearchCorePlots from "/client/modules/cdr/components/search_core_plots";

export const composer = ({ es, maxMeasurements, maxCores }, onData) => {
  const MAX_MEASUREMENTS = _.isNumber(maxMeasurements) ? maxMeasurements : 5000;
  const MAX_CORES = _.isNumber(maxCores) ? maxCores : 24;

  onData(null, { docs: [], nDocs: null, loading: true });

  try {
    const measurementEs = _.extend({}, es, {
      type: "measurements",
      source: {
        includes: [
          "summary.cores.core",
          "summary.sections.section",
          "summary.measurements.depth",
          "summary.measurements.gamma_density",
          "summary.measurements.mag_susc_chi_mass",
          "summary.measurements.res",
          "summary.measurements.pwave_v",
          "summary.measurements.fp",
          "summary.measurements.cl",
          "summary.measurements.k",
          "summary.measurements.ca",
          "summary.measurements.ti",
          "summary.measurements.fe",
          "summary.measurements.zr",
        ],
      },
    });

    let docs = [];
    Meteor.call(
      "esScroll",
      measurementEs,
      1000,
      function processResults(error, results) {
        try {
          if (error) {
            console.error("SearchCorePlots esScroll", error);
            onData(null, { error, loading: false });
            return;
          }
          const hits =
            results && results.hits && results.hits.hits
              ? results.hits.hits.map((h) => h._source)
              : [];
          docs.push(...hits);
          if (docs.length > MAX_MEASUREMENTS)
            docs = docs.slice(0, MAX_MEASUREMENTS);
          let nDocs = null;
          if (results && results.hits && results.hits.total !== undefined) {
            nDocs =
              (results.hits.total && results.hits.total.value) ||
              results.hits.total;
          }
          onData(null, { docs, nDocs, loading: false, maxCores: MAX_CORES });
          if (nDocs && docs.length < Math.min(nDocs, MAX_MEASUREMENTS)) {
            Meteor.call("esScrollByID", results._scroll_id, processResults);
          }
        } catch (e) {
          console.error("SearchCorePlots processResults", e);
          onData(null, { error: e, loading: false });
        }
      }
    );
  } catch (e) {
    console.error("SearchCorePlots composer", e);
    onData(null, { error: e, loading: false });
  }
};

export default compose(composer, {
  propsToWatch: ["es"],
  shouldSubscribe(currentProps, nextProps) {
    return !_.isEqual(currentProps.es, nextProps.es);
  },
})(SearchCorePlots);
