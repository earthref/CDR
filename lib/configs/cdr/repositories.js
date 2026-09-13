// Curating repositories that expose a stable per-core landing page, keyed by the
// display name stored in the cores table's "repository_links" Dictionary column.
//
// "url" builds the landing page from a core's cruise and core names. Return
// undefined when the pair cannot be mapped, so callers can skip the core rather
// than emit a link that resolves to nothing.

export const repositories = {
  "OSU-MGR": {
    label: "OSU Marine and Geology Repository",
    // Cores are curated as OSU-<cruise>-<core>, e.g. OSU-OD1507-18GC
    url: ({ cruise, core }) => {
      if (!cruise || !core) return undefined;
      return `https://osu-mgr.org/OSU-${cruise}-${core}`;
    },
  },
};

// Builds the "repository_links" cell value for a core as it appears in a
// contribution file, e.g.
//   'OSU-MGR["https://osu-mgr.org/OSU-OD1507-18GC"]'
// URLs always contain a colon, so values are quoted to match the escapeColons()
// convention in export_contribution.js. Returns undefined when no repository maps
// the core.
export function deriveRepositoryLinks({ cruise, core }, names = ["OSU-MGR"]) {
  const escape = (value) => (value.indexOf(":") >= 0 ? `"${value}"` : value);
  const links = names
    .map((name) => {
      const repository = repositories[name];
      if (!repository) return undefined;
      const url = repository.url({ cruise, core });
      return url && `${escape(name)}[${escape(url)}]`;
    })
    .filter((link) => link !== undefined);

  return links.length ? links.join(":") : undefined;
}
