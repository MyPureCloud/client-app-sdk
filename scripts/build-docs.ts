import * as fs from "fs-extra";
import * as yargs from "yargs";
import { TypeDocOptions } from "typedoc";
import { buildDevCenterDocs } from "./docs/build-dev-center-docs";
import { buildHtmlDocs } from "./docs/build-html-docs";

const { preview: flagDocsAsPreview, format, outputDir } = yargs
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

try {
    // Clean output directory
    fs.removeSync(outputDir);
    if (format === "dev-center") {
        buildDevCenterDocs({ flagDocsAsPreview, outputDir, options: commonDocsOptions });
    } else if (format === "html") {
        buildHtmlDocs({ outputDir, options: commonDocsOptions });
    }
} catch (error) {
    console.error('Documentation generation failed', error);
    process.exit(1);
}
