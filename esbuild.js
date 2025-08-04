const esbuild = require("esbuild");
const { sassPlugin } = require("esbuild-sass-plugin");
require("dotenv").config();
esbuild
  .build({
    entryPoints: ["frontend/Index.tsx", "frontend/styles.scss"],
    outdir: "portal-server/public/",
    bundle: true,
    minify: true,
    external: [],
    plugins: [sassPlugin()],
    loader: {
      ".png": "file",
      ".css": "file",
    },
    define: {
      "process.env.MAPBOX_TOKEN": JSON.stringify(process.env.MAPBOX_TOKEN), // Make env variable available
    },
  })
  .then(() => console.log("⚡ Build complete! ⚡"))
  .catch(() => process.exit(1));
