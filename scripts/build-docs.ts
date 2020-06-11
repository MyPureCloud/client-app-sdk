import * as path from "path";
import * as fs from "fs-extra";
import { Application, TSConfigReader, TypeDocOptions } from "typedoc";

const OUTPUT_DIR = "dist/docs";
const INDEX_FILE = "doc/index.md";

const GITHUB_FORMAT = 'github';
const PC_DEV_CENTER_FORMAT = 'purecloudDevCenter';
const SUPPORTED_DOC_OUTPUT_FORMATS = [GITHUB_FORMAT, PC_DEV_CENTER_FORMAT];
let docMdOutputFormat = process.env.DOC_MD_OUTPUT_FORMAT || PC_DEV_CENTER_FORMAT;
if (SUPPORTED_DOC_OUTPUT_FORMATS.indexOf(docMdOutputFormat) < 0) {
    console.error(`Unknown MD Output Format Specified: '${docMdOutputFormat}'`);
    process.exit(1);
}

let flagDocsAsPreview = true;
if (process.env.FLAG_DOCS_AS_PREVIEW) {
    ['false', 'f', '0'].forEach(currFalseValue => {
        if (process.env.FLAG_DOCS_AS_PREVIEW === currFalseValue) {
            flagDocsAsPreview = false;
        }
    });
}

// Options added by the Typedoc Markdown Plugin
interface MarkdownPluginOptions {
    skipSidebar: boolean;
    hideBreadcrumbs: boolean;
}

type DocsConfig = Partial<TypeDocOptions & MarkdownPluginOptions>;

const docsConfig: DocsConfig = {
    mode: "file",
    name: "Client App SDK",
    logger: 'none',
    theme: "docusaurus", // Theme that generates output closest to Dev Center format
    skipSidebar: true, // Disable sidebar generation
    disableSources: true, // Don't show the file for each method/class
    hideBreadcrumbs: true, // Dev Center handles breadcrumbs for us
    readme: "none",
    plugin: [
        'typedoc-plugin-markdown',
        'typedoc-plugin-no-inherit'
    ],
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

const transformLinks = (buffer: string, ext: string) => {
    return buffer.replace(/(\[[^\]]+\][^\)]+)(\.md)(\)|\#[^\)]*\))/gm, `$1${ext}$3`);
};

const prependDocHeaderAttribute = (buffer: string, attr: string) => {
    return buffer = `---\n${attr}` + buffer.substring(3);
}

(async () => {
    const app = new Application();

    // So TypeDoc can load tsconfig.json
    app.options.addReader(new TSConfigReader());

    app.bootstrap(docsConfig);

    const project = app.convert(app.expandInputFiles(["src"]));
    if (!project) throw new Error("Unable to generate typedoc project");

    // Rendered docs
    app.generateDocs(project, OUTPUT_DIR);

    // Flatten typedoc's generated classes folder
    const classesDir = path.join(OUTPUT_DIR, "classes");
    const fileNames = await fs.readdir(classesDir);
    await Promise.all(
        fileNames.map(async (name) =>
            fs.rename(path.join(classesDir, name), path.join(OUTPUT_DIR, name))
        )
    );

    // Delete typedoc's generated classes folder
    await fs.remove(classesDir);

    // Use custom index file in place of typedoc's index
    await fs.copy(INDEX_FILE, path.join(OUTPUT_DIR, "index.md"));

    // Apply transformations to docs
    const docs = await fs.readdir(OUTPUT_DIR);
    await Promise.all(
        docs.map(async (doc) => {
            const docPath = path.join(OUTPUT_DIR, doc);
            let buffer = (await fs.readFile(docPath)).toString();
            if (docMdOutputFormat === PC_DEV_CENTER_FORMAT) {
                buffer = transformLinks(buffer, '.html');
            }
            if (flagDocsAsPreview) {
                buffer = prependDocHeaderAttribute(buffer, 'ispreview: true');
            }
            return fs.outputFile(docPath, buffer);
        })
    );
})().catch(error => {
    console.error('Documentation generation failed', error);
    process.exit(1);
})
