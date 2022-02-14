import * as path from "node:path";
import * as url from "node:url";

import HtmlWebpackPlugin from "html-webpack-plugin";
import SsgWepackPlugin from "ssg-webpack-plugin";

import { assert, enums } from "superstruct";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const Mode = enums(["development", "production"]);

export default ({ mode }) => {
  assert(mode, Mode);

  return {
    devtool: {
      development: "eval-source-map",
      production: "source-map",
    }[mode],
    mode,
    module: {
      rules: [
        {
          exclude: /\.yarn/u,
          loader: "babel-loader",
          test: /\.js$/u,
          type: "javascript/auto",
        },
      ],
    },
    output: {
      clean: true,
      filename: {
        development: "[name].js",
        production: "[name].[contenthash].js",
      }[mode],
      path: path.resolve(__dirname, "public"),
    },
    plugins: [
      new HtmlWebpackPlugin({
        minify: {
          collapseWhitespace: true,
          keepClosingSlash: true,
          removeComments: false,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          useShortDoctype: true,
        },
        template: path.resolve(__dirname, "template.html"),
      }),
      new SsgWepackPlugin({
        documentAsset: "index.html",
        entry: path.join("src", "components", "app.js"),
        outBasePath: "posts",
        pagesDirectory: path.join("src", "posts"),
        render: (entryModule, pageModule, documentAsset) => {
          const { default: app } = entryModule;
          const { default: page } = pageModule;
          const html = app(page());
          return documentAsset.replace("<!--:: APP ::-->", html);
        },
      }),
    ],
  };
};
