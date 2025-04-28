const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["./proxy.js"],
    bundle: true,
    platform: "node",
    target: "node22",
    outfile: "./dist/proxy.js",
    minify: true,
    banner: {
      js: "#!/usr/bin/env node",
    },
  })
  .catch(() => process.exit(1));
