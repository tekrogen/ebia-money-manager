// Plain conventional commits, per BRANCH-WORKFLOWS.md / GIT-Workflows library.
// The header-no-emoji rule exists because commitlint's parser can strip a leading
// emoji before rules run — the message may pass commitlint, but release-please
// cannot parse it. Validate the RAW first line and reject anything before the type.
module.exports = {
  extends: ["@commitlint/config-conventional"],
  plugins: [
    {
      rules: {
        "header-no-emoji": (parsed) => {
          const firstLine = (parsed.raw ?? "").split("\n")[0];
          if (/^(Merge|Revert) /.test(firstLine)) return [true];
          return [
            /^[a-z]+(\([^)]*\))?!?: /.test(firstLine),
            "first line must start with a bare conventional type (e.g. `feat: …`) — no leading emoji",
          ];
        },
      },
    },
  ],
  rules: {
    "header-no-emoji": [2, "always"],
  },
};
