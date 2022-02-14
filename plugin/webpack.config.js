import path from "node:path";
import url from "node:url";

import { assert, enums } from "superstruct";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const Mode = enums(["development", "production"]);

export default ({ mode }) => {
  assert(mode, Mode);

  return {
    entry: path.resolve(__dirname, "index.ts"),
    experiments: { outputModule: true },
    mode,
    module: {
      rules: [
        {
          exclude: /node_modules/u,
          loader: "babel-loader",
          test: /\.tsx?$/u,
        },
      ],
    },
    output: {
      clean: true,
      filename: "index.js",
      library: { type: "module" },
      path: path.resolve(__dirname, "lib"),
    },
    // Remove when https://github.com/webpack/webpack/issues/15360 is fixed
    target: {
      development: void 0,
      production: "node12.20",
    }[mode],
  };
};
