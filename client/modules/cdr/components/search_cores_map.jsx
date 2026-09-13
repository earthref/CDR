import _ from "lodash";
import React, { useEffect, useRef, useState } from "react";
import "echarts-gl";
import ReactECharts from "echarts-for-react";
import { Button } from "semantic-ui-react";
import SearchSummariesListItem from "/client/modules/cdr/containers/search_summaries_list_item";

// Default and selected marker colors for core locations on the globe.
// Default markers use the CDR orange; the selected marker stays a contrasting
// color so the current selection remains distinguishable.
const POINT_COLOR = "#e09f00";
const SELECTED_COLOR = "#006600"; // Fiesta/EarthRef green

// Pull the array of GeoJSON point coordinates ([lon, lat]) out of a
// contribution summary. The "Cores Map" view only includes
// summary._all._geo_point in its _source, so that is the primary path; we
// also fall back to the cores table summary if it is present.
function geoPointsOf(item) {
  const all = item && item.summary && item.summary._all;
  const cores = item && item.summary && item.summary.cores;
  const points =
    (all && all._geo_point) || (cores && cores._geo_point) || [];
  return points
    .map((p) => p && p.coordinates)
    .filter((c) => Array.isArray(c) && c.length >= 2 && !isNaN(c[0]) && !isNaN(c[1]));
}

// Read the current camera orientation from an ECharts globe instance.
function getView(chart) {
  try {
    const model = chart.getModel && chart.getModel();
    const globeModel =
      model && model.getComponent && model.getComponent("globe");
    if (globeModel && globeModel.get) {
      const alpha = globeModel.get("viewControl.alpha");
      const beta = globeModel.get("viewControl.beta");
      const distance = globeModel.get("viewControl.distance");
      if (typeof alpha === "number" && typeof beta === "number")
        return { alpha, beta, distance };
    }
  } catch (e) {
    /* fall through */
  }
  return { alpha: 0, beta: 0, distance: undefined };
}

// Rotate/zoom the globe so a given [lon, lat] is centered, preserving the
// current zoom distance.
function applyTargetCoord(chart, coord, distance) {
  if (!chart) return;
  const d = typeof distance === "number" ? distance : undefined;
  try {
    chart.setOption(
      { globe: { viewControl: { targetCoord: coord, distance: d } } },
      false,
      true,
      true
    );
  } catch (e) {
    try {
      chart.dispatchAction({
        type: "globeChangeView",
        targetCoord: coord,
        distance: d,
        componentIndex: 0,
      });
    } catch (e2) {
      /* no-op */
    }
  }
}

export default function SearchCoresMap({ style, es }) {
  // Each item is one contribution (cores-type summary) returned by esPage.
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(undefined);
  const [pending, setPending] = useState(0);
  const pageSize = 250;

  const chartRef = useRef(null);

  // Fetch a page of activated core contributions that have geospatial data.
  useEffect(() => {
    setPending((c) => c + 1);
    setItems([]);
    setSelectedId(undefined);
    Meteor.call(
      "esPage",
      _.extend({}, es, {
        queries: _.concat(es.queries || [], [
          { term: { "summary.contribution._is_activated": "true" } },
          { exists: { field: "summary._all._geo_point" } },
        ]),
      }),
      pageSize,
      1,
      function (error, results) {
        if (error) {
          console.error("SearchCoresMap esPage error", error);
        } else {
          const withGeo = (results || []).filter(
            (item) => geoPointsOf(item).length > 0
          );
          setItems(withGeo);
          setSelectedId(withGeo.length > 0 ? 0 : undefined);
        }
        setPending((c) => Math.max(0, c - 1));
      }
    );
  }, [es, pageSize]);

  // Build the scatter3D point data. Every core location is a marker tagged
  // with the index of its parent contribution so a click can drive the
  // carousel. The selected contribution's markers are highlighted.
  const points = [];
  items.forEach((item, i) => {
    const isSelected = i === selectedId;
    geoPointsOf(item).forEach((coord) => {
      points.push({
        value: [Number(coord[0]), Number(coord[1]), 0, i],
        symbol: "circle",
        symbolSize: isSelected ? 16 : 9,
        itemStyle: { color: isSelected ? SELECTED_COLOR : POINT_COLOR },
        label: { show: false },
        emphasis: { itemStyle: { color: SELECTED_COLOR } },
      });
    });
  });

  const globeOption = {
    backgroundColor: "#FFF",
    globe: {
      baseTexture: "/CDR/global_relief_map.jpg",
      shading: "lambert",
      viewControl: {
        autoRotate: false,
        rotateSensitivity: 2,
        zoomSensitivity: 2,
        distance: 200,
        // Default minDistance is 40; lower it so the globe can zoom in closer.
        minDistance: 15,
      },
      light: {
        ambient: { intensity: 1 },
        main: { intensity: 0 },
      },
    },
    series: [
      {
        type: "scatter3D",
        coordinateSystem: "globe",
        animation: false,
        data: points,
        zlevel: -8,
      },
    ],
  };

  // When the selection changes (via click or prev/next), rotate the globe to
  // center the selected contribution's first core, keeping the current zoom.
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || selectedId === undefined || !items[selectedId]) return;
    const coords = geoPointsOf(items[selectedId]);
    if (coords.length === 0) return;
    const [lon, lat] = coords[0];
    requestAnimationFrame(() => {
      if (!chartRef.current) return;
      const view = getView(chartRef.current);
      applyTargetCoord(chartRef.current, [Number(lon), Number(lat)], view.distance);
    });
  }, [selectedId, items]);

  const onChartReady = (chart) => {
    chartRef.current = chart;
    chart.on("click", function (params) {
      if (params && params.value && params.value[3] !== undefined) {
        setSelectedId(parseInt(params.value[3]));
      }
    });
    chart.on("mouseover", function (params) {
      chart.dispatchAction({
        type: "highlight",
        seriesIndex: 0,
        dataIndex: params.dataIndex,
      });
    });
  };

  const hasSelection = selectedId !== undefined && items.length > selectedId;

  return (
    <div style={_.extend({ display: "flex", flexDirection: "column" }, style)}>
      {/* Summary-card carousel */}
      {hasSelection && (
        <div
          style={{
            backgroundColor: "white",
            padding: 10,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            borderBottom: "1px solid #D4D4D5",
          }}
        >
          <Button
            icon="chevron left"
            size="large"
            circular
            disabled={selectedId === 0}
            onClick={() => selectedId > 0 && setSelectedId(selectedId - 1)}
            title="Previous core"
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <SearchSummariesListItem
              table="cores"
              item={items[selectedId]}
              key={selectedId}
              collapsed
            />
          </div>
          <Button
            icon="chevron right"
            size="large"
            circular
            disabled={selectedId >= items.length - 1}
            onClick={() =>
              selectedId < items.length - 1 && setSelectedId(selectedId + 1)
            }
            title="Next core"
          />
        </div>
      )}

      {/* Empty / loading state for the carousel area */}
      {!hasSelection && (
        <div
          style={{
            backgroundColor: "white",
            padding: 10,
            minHeight: "120px",
            borderBottom: "1px solid #D4D4D5",
            position: "relative",
          }}
        >
          {pending > 0 ? (
            <div className="ui active inverted dimmer">
              <div className="ui text loader">Loading</div>
            </div>
          ) : (
            <div className="ui fluid warning message">
              <div className="ui center aligned huge basic segment">
                No Cores to Display
              </div>
            </div>
          )}
        </div>
      )}

      {/* Globe */}
      <div style={{ flex: 1, minHeight: 300, position: "relative" }}>
        <ReactECharts
          style={{ width: "100%", height: "100%", minHeight: 300 }}
          option={globeOption}
          notMerge={false}
          renderer="canvas"
          onChartReady={onChartReady}
        />
      </div>
    </div>
  );
}
