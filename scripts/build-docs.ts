import * as path from "path";
import * as fs from "fs-extra";
import { Application, TSConfigReader, TypeDocOptions } from "typedoc";
import * as yargs from 'yargs';

const OUTPUT_DIR = "dist/docs";
const INDEX_FILE = "doc/index.md";
const SUPPORTED_DOC_OUTPUT_FORMATS = ['github', 'purecloudDevCenter'] as const;

const { preview: flagDocsAsPreview, format: docMdOutputFormat } = yargs
    .option('preview', {
        type: 'boolean',
        default: false
    })
    .option('format', {
        choices: SUPPORTED_DOC_OUTPUT_FORMATS,
        default: 'purecloudDevCenter'
    })
    .argv;

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
    // Regex to replace the following patterns (ext = "html"):
    // [link1](api.md) -> [link1](api.html)
    // [link2](api.md#someref) -> [link2](api.html#someref)
    return buffer.replace(/(\[[^\]]+\][^)]+)(\.md)(\)|#[^)]*\))/gm, `$1${ext}$3`);
};

const prependDocHeaderAttribute = (buffer: string, attr: string) => {
    if (!buffer.startsWith('---')) {
        throw new Error('Doc header symbol "---" not found');
    }
    return buffer = `---\n${attr}${buffer.substring('---'.length)}`;
};

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
    const indexFilePath = path.join(OUTPUT_DIR, "index.md");
    await fs.copy(INDEX_FILE, indexFilePath);

    // Add header to index file
    const indexFileContents = (await fs.readFile(indexFilePath)).toString();
    await fs.outputFile(indexFilePath, "---\ntitle: Client App SDK\n---\n\n" + indexFileContents);

    // Apply transformations to docs
    const docs = await fs.readdir(OUTPUT_DIR);
    await Promise.all(
        docs.map(async (doc) => {
            const docPath = path.join(OUTPUT_DIR, doc);
            let buffer = (await fs.readFile(docPath)).toString();
            if (docMdOutputFormat === 'purecloudDevCenter') {
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
});
