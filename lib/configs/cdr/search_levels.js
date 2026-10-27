import { Meteor } from "meteor/meteor";

let levels = [
  { name: "Contributions" },
  { name: "Cores" },
  { name: "Sections" },
  { name: "Measurements" },
];

// Index name, overridable via settings.json for previewing alternate indices
// (e.g. an OSU-MGR MST/XRF preview build produced by osu-mgr-pipeline):
//   { "public": { "cdr": { "index": "fiesta-cdr-20260615-065438" } } }
let index =
  (Meteor.settings &&
    Meteor.settings.public &&
    Meteor.settings.public.cdr &&
    Meteor.settings.public.cdr.index) ||
  "cdr-3";

(levels[0].views = [
  {
    name: "Summaries",
    es: {
      index: index,
      type: "contribution",
      source: {
        excludes: ["*.vals"],
        includes: [
          "summary._incomplete_summary",
          "summary.contribution.*",
          "summary._all.*",
        ],
      },
    },
  },
]),
  //                    { name: 'Cores Map', es: { index: index, type: 'cores'        , source: {excludes: [                           ], includes: ['summary._incomplete_summary', 'summary.contribution.*', 'summary.' + 'cores'        + '.*', 'summary._all._geo_point']} }}];
  //                  { name: 'Plots'    , es: { index: index, type: 'contribution' , source: {excludes: ['*.vals', '*._geo_point'   ], includes: ['summary._incomplete_summary', 'summary.contribution.*',                                     'summary._all.*'} } ,
  //                  { name: 'Images'   , es: { index: index, type: 'contribution' , source: {excludes: ['*.vals', '*._geo_point'   ], includes: ['summary._incomplete_summary', 'summary.contribution.*',                                     'summary._all.*'} } ];
  (levels[1].views = [
    {
      name: "Summaries",
      es: {
        index: index,
        type: "cores",
        source: {
          excludes: ["*.vals", "*._geo_envelope"],
          includes: [
            "summary._incomplete_summary",
            "summary.contribution.*",
            "summary." + "cores" + ".*",
            "summary._all.*",
          ],
        },
      },
    },
    {
      name: "Cores Map",
      es: {
        index: index,
        type: "cores",
        source: {
          excludes: [],
          includes: [
            "summary._incomplete_summary",
            "summary.contribution.*",
            "summary." + "cores" + ".*",
            "summary._all._geo_point",
          ],
        },
      },
    },
    {
      name: "Cores Plots",
      es: {
        index: index,
        type: "cores",
        source: {
          excludes: [],
          includes: [
            "summary._incomplete_summary",
            "summary.contribution.*",
            "summary." + "cores" + ".*",
            "summary._all.*",
          ],
        },
      },
    },
    {
      name: "Rows",
      es: {
        index: index,
        type: "cores",
        source: {
          excludes: ["*.vals", "*._geo_envelope"],
          includes: [
            "summary._incomplete_summary",
            "summary.contribution.*",
            "summary." + "cores" + ".*",
            "summary._all.*",
          ],
        },
        countField: "summary.cores._n_results",
      },
    },
  ]); //,
//                  { name: 'Ages'     , es: { index: index, type: 'cores'        , source: {excludes: ['*.vals', '*._geo_envelope'], includes: ['summary._incomplete_summary', 'summary.contribution.*', 'summary.' + 'cores'        + '.*', 'summary._all.*'} } ,
levels[2].views = [
  {
    name: "Summaries",
    es: {
      index: index,
      type: "sections",
      source: {
        excludes: ["*.vals", "*._geo_envelope"],
        includes: [
          "summary._incomplete_summary",
          "summary.contribution.*",
          "summary." + "sections" + ".*",
          "summary._all.*",
        ],
      },
    },
  },
  //                    { name: 'Map'      , es: { index: index, type: 'sections'     , source: {excludes: [                           ], includes: ['summary._incomplete_summary', 'summary.contribution.*', 'summary.' + 'sections'     + '.*', 'summary._all._geo_point']} }} ,
  {
    name: "Rows",
    es: {
      index: index,
      type: "sections",
      source: {
        excludes: ["*.vals", "*._geo_envelope"],
        includes: [
          "summary._incomplete_summary",
          "summary.contribution.*",
          "summary." + "sections" + ".*",
          "summary._all.*",
        ],
      },
      countField: "summary.sections._n_results",
    },
  },
]; //,
//                  { name: 'Ages'     , es: { index: index, type: 'sections'     , source: {excludes: ['*.vals', '*._geo_envelope'], includes: ['summary._incomplete_summary', 'summary.contribution.*', 'summary.' + 'sections'     + '.*', 'summary._all.*'} } ,
levels[3].views = [
  {
    name: "Rows",
    es: {
      index: index,
      type: "measurements",
      source: {
        excludes: ["*.vals", "*._geo_envelope"],
        includes: [
          "summary._incomplete_summary",
          "summary.contribution.*",
          "summary." + "measurements" + ".*",
          "summary._all.*",
        ],
      },
      countField: "summary.measurements._n_results",
    },
  },
];

export { levels, index };
