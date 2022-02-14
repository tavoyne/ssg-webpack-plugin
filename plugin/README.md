# SsgWebpackPlugin

:warning: This package is at an initial development stage. It should not be considered stable.

SsgWebpackPlugin is an unopinionated static-site-generation plugin for [Webpack](https://webpack.js.org/).

It _crawls_ your pages directory, evaluates the modules it finds there, hands them to the `render` function you provide and emits the resulting assets. All of that happening at build time.

Why it's awesome:

- It's very intutive, especially if you're familiar with SSG or SSR;
- It enables you to have a [Next.js](https://nextjs.org/)-like setup, but without sacrificing sovereignty over your codebase;
- It integrates into any stack (from React, Vue.js to even Vanilla JavaScript);
- It reuses your main compiler's loaders so any file format (e.g. `.mdx`, `.ts`, etc.) that's importable from there is importable from SsgWebpackPlugin's compiler;
- It allows you to only generate the pages you want (e.g. the blog posts and not the account page) and won't get into your way if you're also doing SSR;
- It integrates seamlessly into your [Babel](https://babeljs.io/) and [HtmlWebpackPlugin](https://www.npmjs.com/package/html-webpack-plugin) setup.

## Installation

With npm:

```bash
npm install ssg-webpack-plugin --save-dev --save-exact
```

With Yarn:

```bash
yarn add ssg-webpack-plugin --dev --exact
```

We encourage you to install an exact version of the package. It's because, as stated in the [SemVer Specification](https://semver.org/spec/v2.0.0.html#spec-item-4), anything may change at any time during the initial development stage.

## Usage

```js
// webpack.config.js

import path from "node:path";

import HtmlWebpackPlugin from "html-webpack-plugin";
import SsgWebpackPlugin from "ssg-webpack-plugin";
import React from "react";

export default {
  // ...
  plugins: [
    new SsgWebpackPlugin({
      entry: path.join("src", "_app.js"),
      pagesDirectory: path.join("src", "pages"),
      render: ({ default: App }, { default: Page }) => {
        return makeHtml(App, Page);
      },
    }),
  ],
};
```

## Options

### `documentAsset`

- Type: `string | undefined`
- Default: `undefined`

If you're using an other plugin (typically HtmlWebpackPlugin) to generate the HTML layout document, set this to the name of the emitted asset. It will later be passed as an argument to the `render` function.

### `entry`

- Type: `string`
- Default: `path.join("src", "_app.js")`

Absolute or relative path to the entry point.

### `exclude`

- Type: `RegExp | undefined`
- Default: `undefined`

Regular expression tested against every page path. If it matches, the path is excluded.

### `include`

- Type: `RegExp | undefined`
- Default: `undefined`

Regular expression tested against every page path. If it matches, the path is included.

### `outBasePath`

- Type: `string`
- Default: `"/"`

Base path for the plugin's assets.

### `outPathFormat`

- Type: `"compact" | "indexed"`
- Default: `"indexed"`

Strategy for the asset path generation:

- If `"compact"`, `contact.js` will output `contact.html`;
- If `"indexed"`, `contact.js` will output `contact/index.html`.

### `pagesDirectory`

- Type: `string`
- Default: `path.join("src", "pages")`

Absolute or relative path to the pages directory.

### `recursive`

- Type: `boolean`
- Default: `true`

Determines whether or not the pages directory should be crawled recursively.

### `render`

- Type: `function`
- Default: `undefined`

<details>

<summary>Signature</summary>

```ts
type Render = (
  appModule: Module,
  pageModule: Module,
  documentAsset: string | undefined
) => string;
```

</details>

Function that will be called for each page and that's responsible for generating the HTML to be emitted.

It takes in the entry module, the page module and the parsed document if `documentAsset` was set.

## Examples

Check out the official guided examples:

- [Vanilla JavaScript](../examples/vanilla)
- [React](../examples/react) (coming soon)
- [Vue](../examples/vue) (coming soon)

## License

[MIT](../LICENSE.md)
