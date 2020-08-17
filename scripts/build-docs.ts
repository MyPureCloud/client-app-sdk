import * as fs from "fs-extra";
import * as yargs from "yargs";
import { TypeDocOptions } from "typedoc";
import { buildDevCenterDocs } from "./docs/build-dev-center-docs";
import { buildHtmlDocs } from "./docs/build-html-docs";

const { npm_package_name, npm_package_version } = process.env;

const { preview: flagDocsAsPreview, format, outputDir, bundle } = yargs
    .option("preview", {
        desc: "Whether or not to flag the dev-center docs as preview",
        type: "boolean",
        default: false
    })
    .option("format", {
        choices: ["html", "dev-center"] as const,
        default: "dev-center"
    })
    .option("outputDir", {
        type: "string",
        default: "dist/docs"
    })
    .option('bundle', {
        type: "string",
        describe: 'minified UMD bundle file name'
    })
    .check(argv => {
        if (argv.preview && argv.format !== "dev-center") {
            throw new Error("--preview can only be used in conjunction with dev-center output format");
        }
        return true;
    })
    .argv;

const commonDocsOptions: Partial<TypeDocOptions> = {
    mode: "file",
    name: "Client App SDK",
    logger: 'none',
    disableSources: true, // Don't show the file for each method/class
    exclude: [
        "**/utils/**",
        "**/.babelrc",
        "**/.eslintrc.js",
        "**/*+(Spec).ts"
    ],
    excludeExternals: true,
    excludePrivate: true,
    excludeProtected: true,
    excludeNotExported: true,
    excludeNotDocumented: true
};

(async () => {
    try {
        if (!npm_package_name || !npm_package_version) {
            throw new Error("Unable to find npm package info.");
        }
    
        const bundleHash = bundle && extractHashFromBundle(bundle, npm_package_name);
        if (!bundleHash) {
            console.warn("Unable to extract bundle hash");
        }
    
        // Clean output directory
        await fs.remove(outputDir);
    
        if (format === "dev-center") {
            await buildDevCenterDocs({
                bundleHash,
                flagDocsAsPreview,
                outputDir,
                version: npm_package_version,
                options: commonDocsOptions
            });
        } else if (format === "html") {
            await buildHtmlDocs({ outputDir, options: commonDocsOptions });
        }
    } catch (error) {
        console.error('Documentation generation failed', error);
        process.exit(1);
    }
})();

function extractHashFromBundle(bundle: string, packageName: string) {
    return bundle.replace(packageName, '').replace('.min.js', '').replace('-', '');
}
