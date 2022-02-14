import { promises as fs } from "node:fs";
import path from "node:path";
import vm from "node:vm";

import {
  Infer,
  boolean,
  create,
  defaulted,
  func,
  object,
  optional,
  regexp,
  string,
} from "superstruct";

import type { Compiler } from "webpack";

const Options = defaulted(
  object({
    documentAsset: optional(string()),
    entry: defaulted(string(), path.join("src", "_app.js")),
    exclude: optional(regexp()),
    include: optional(regexp()),
    outBasePath: defaulted(string(), "/"),
    outPathFormat: defaulted(string(), "indexed"),
    pagesDirectory: defaulted(string(), path.join("src", "pages")),
    recursive: defaulted(boolean(), true),
    render: func(),
  }),
  {}
);

const readdirRecursive = async (
  outerPath: string,
  recursive: boolean,
  exclude?: RegExp,
  include?: RegExp
  // eslint-disable-next-line max-params
): Promise<string[]> => {
  const results: string[] = [];

  const recurse = async (innerPath = "") => {
    const dirPath = path.join(outerPath, innerPath);
    const dirents = await fs.readdir(dirPath, { withFileTypes: true });
    for (const dirent of dirents) {
      const currentPath = path.join(innerPath, dirent.name);
      if (dirent.isFile()) {
        const isExcluded = exclude && exclude.test(currentPath);
        const isIncluded = !include || include.test(currentPath);
        if (isIncluded && !isExcluded) results.push(currentPath);
      } else if (dirent.isDirectory()) {
        // eslint-disable-next-line no-await-in-loop
        if (recursive) await recurse(currentPath);
      }
    }
  };

  await recurse();

  return results;
};

const FILENAME_PREFIX = "__ssg-webpack-plugin__";

class SsgWepackPlugin {
  options: Infer<typeof Options>;

  constructor(options: Infer<typeof Options>) {
    this.options = create(options, Options);
  }

  apply(compiler: Compiler) {
    const { webpack } = compiler;
    const { EntryPlugin } = webpack;
    const { EnableLibraryPlugin } = webpack.library;
    const { NodeTargetPlugin } = webpack.node;
    const { RawSource } = webpack.sources;

    const [entryRelative, pagesDirectoryRelative] = [
      this.options.entry,
      this.options.pagesDirectory,
    ].map((p) => {
      return path.isAbsolute(p)
        ? path.relative(compiler.context, p)
        : path.join(p);
    });

    const pagesDirectoryAbsolute = path.join(
      compiler.context,
      pagesDirectoryRelative
    );

    compiler.hooks.make.tapAsync(
      SsgWepackPlugin.name,
      async (compilation, callback) => {
        // We're creating a child compiler because we need the code to be
        // compiled for a specific target: Node.js.
        const childCompiler = compilation.createChildCompiler(
          SsgWepackPlugin.name,
          {
            filename: `${FILENAME_PREFIX}[name]`,
            // Stops Webpack from adding an IIFE wrapper around emitted code.
            // Later, the code will be ran in a V8 virtual machine context,
            // which returns the result of the last executed statement.
            iife: false,
            library: { name: "module", type: "var" },
          },
          [new EnableLibraryPlugin("var"), new NodeTargetPlugin()]
        );

        new EntryPlugin(childCompiler.context, `.${path.sep}${entryRelative}`, {
          name: entryRelative,
        }).apply(childCompiler);

        const pages = await readdirRecursive(
          pagesDirectoryAbsolute,
          this.options.recursive,
          this.options.include,
          this.options.exclude
        );

        pages.forEach((page) => {
          const currentPath = path.join(pagesDirectoryRelative, page);
          new EntryPlugin(childCompiler.context, `.${path.sep}${currentPath}`, {
            name: currentPath,
          }).apply(childCompiler);
        });

        compilation.hooks.processAssets.tap(
          {
            name: SsgWepackPlugin.name,
            // Stage at which HtmlWebpackPlugin emits its asset(s).
            stage: webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE,
          },
          (assets) => {
            let documentAsset: string | undefined;

            // Retreives the documentAsset if requested by the user.
            if (this.options.documentAsset) {
              documentAsset = assets[this.options.documentAsset]
                ?.source()
                .toString();

              if (!documentAsset) {
                throw new Error(
                  [
                    "The specified documentAsset (`",
                    `${this.options.documentAsset}\`) wasn't found in the `,
                    "emitted assets. Check for a typo and make sure ",
                    "HtmlWebpackPlugin is instanciated before ",
                    "SsgWebpackPlugin.",
                  ].join("")
                );
              }
            }

            const modules = [entryRelative, ...pages].map((p, index) => {
              // Retreives the asset based on its entry path.
              const assetName = FILENAME_PREFIX.concat(
                index > 0 ? path.join(pagesDirectoryRelative, p) : p
              );
              const asset = assets[assetName];

              // Runs the code withing a new V8 Virtual Machine context.
              const source = asset.source().toString();
              const script = new vm.Script(source);
              return script.runInNewContext();
            });

            const [entryModule] = modules;

            modules.slice(1).forEach((pageModule, index) => {
              const { outPathFormat, render } = this.options;

              // Uses the render function to generate the HTML to be emitted.
              const htmlString = render(entryModule, pageModule, documentAsset);

              // Converts to RawSource because it's what emitAsset() expects.
              const rawSource = new RawSource(htmlString);

              const file = path
                .join(this.options.outBasePath, pages[index])
                // Converts platform-specific path-segment separators to slashes.
                .replaceAll(path.sep, "/")
                // Removes the extension.
                .replace(/\.[^.]*$/u, "")
                // Adds an index if requested.
                .concat(outPathFormat === "indexed" ? "/index" : "")
                // Output asset is always HTML.
                .concat(".html");

              compilation.emitAsset(file, rawSource);
            });

            Object.keys(assets).forEach((asset) => {
              if (asset.startsWith(FILENAME_PREFIX)) {
                compilation.deleteAsset(asset);
              }
            });
          }
        );

        childCompiler.runAsChild((error) => {
          callback(error);
        });
      }
    );
  }
}

export default SsgWepackPlugin;
