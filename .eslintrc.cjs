require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  extends: ["@steadier"],
  ignorePatterns: [
    "!.*",
    "**/lib/**/*",
    "**/public/**/*",
    "/.pnp.cjs",
    "/.pnp.loader.mjs",
    "/.yarn/**/*",
  ],
  parserOptions: { sourceType: "module" },
  root: true,
  rules: {
    "init-declarations": "off",
    "lines-between-class-members": "off",
    "no-underscore-dangle": "off",
    "node/no-missing-import": "off",
    "node/no-unpublished-import": "off",
    "node/no-unpublished-require": "off",
    "node/no-unsupported-features/es-syntax": "off",
    "require-atomic-updates": "off",
  },
};
