# SsgWebpackPlugin

:warning: This package is at its initial development stage. It should not be considered stable.

SsgWebpackPlugin is an unopinionated static-site-generation plugin for [Webpack](https://webpack.js.org/).

Why it's awesome:

- It enables you to have [Next.js](https://nextjs.org/)-like setup, where you have a pages directory that's automatically crawled;
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

## Usage

### webpack.config.js

```js
import path from "node:path";

import HtmlWebpackPlugin from "html-webpack-plugin";
import SsgWebpackPlugin from "ssg-webpack-plugin";

export default {
  // ...
  plugins: [
    new HtmlWebpackPlugin({ filename: "index.html" }),
    new SsgWebpackPlugin({
      documentAsset: "index.html",
      entry: path.join("src", "components", "app.js"),
      outBasePath: "posts",
      pagesDirectory: path.join("src", "posts"),
      render: (entryModule, pageModule, documentAsset) => {
        const { default: App } = entryModule;
        const { default: Page } = pageModule;
        const root = app(page());
        return documentAsset.replace("<!--:: APP ::-->", root);
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
