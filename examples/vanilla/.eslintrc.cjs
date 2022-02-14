const path = require("path");

module.exports = {
  overrides: [
    {
      env: { browser: true },
      files: "./src/**/*",
      globals: { POSTS_META: "readonly" },
      parserOptions: {
        babelOptions: {
          configFile: path.resolve(__dirname, "babel.config.json"),
        },
      },
    },
  ],
};
