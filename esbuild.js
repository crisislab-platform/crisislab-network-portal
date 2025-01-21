const esbuild = require("esbuild");
const { sassPlugin } = require("esbuild-sass-plugin");

esbuild
  .build({
    entryPoints: ["frontend/Index.tsx", "frontend/styles.scss"],
    outdir: "portal-server/public/",
    bundle: true,
    minify: true,
    plugins: [sassPlugin()],
  })
  .then(() => console.log("⚡ Build complete! ⚡"))
  .catch(() => process.exit(1));
