import * as _ from "lodash";
import * as path from "path";
import * as fs from "fs-extra";
import { Application, TSConfigReader, TypeDocOptions } from "typedoc";

// Options added by the Typedoc Markdown Plugin
interface MarkdownPluginOptions {
    skipSidebar: boolean;
    hideBreadcrumbs: boolean;
}

interface DevCenterDocsOptions {
    version: string;
    bundleHash?: string;
    options?: Partial<TypeDocOptions>;
    flagDocsAsPreview: boolean;
    outputDir: string;
}

export const buildDevCenterDocs = async ({
    version,
    bundleHash,
    flagDocsAsPreview,
    outputDir,
    options
}: DevCenterDocsOptions) => {
    const app = new Application();

    // So TypeDoc can load tsconfig.json
    app.options.addReader(new TSConfigReader());

    const docsConfig: Partial<TypeDocOptions & MarkdownPluginOptions> = {
        ...options,
        theme: "docusaurus", // Theme that generates output closest to Dev Center format
        skipSidebar: true, // Disable sidebar generation
        hideBreadcrumbs: true, // Dev Center handles breadcrumbs for us
        readme: "none",
        plugin: [
            'typedoc-plugin-markdown',
            'typedoc-plugin-no-inherit'
        ],
    };

    app.bootstrap(docsConfig);

    const project = app.convert(app.expandInputFiles(["src"]));
    if (!project) throw new Error("Unable to generate typedoc project");

    // Rendered docs
    app.generateDocs(project, outputDir);

    // Flatten typedoc's generated classes folder
    const classesDir = path.join(outputDir, "classes");
    const fileNames = await fs.readdir(classesDir);
    await Promise.all(
        fileNames.map(async (name) =>
            fs.rename(path.join(classesDir, name), path.join(outputDir, name))
        )
    );

    // Delete typedoc's generated classes folder
    await fs.remove(classesDir);

    // Use custom index file in place of typedoc's index
    const buffer = await fs.readFile("doc/index.md");
    const indexWithHeader = "---\ntitle: Client App SDK\n---\n\n" + buffer.toString();
    await fs.writeFile(path.join(outputDir, "index.md"), indexWithHeader);

    // Apply rest of docs transformations
    await transformFiles(outputDir, _.flow(
        bundleHash ? injectBundleHash(bundleHash) : _.identity,
        transformLinks('.html'),
        injectPackageVersion(version),
        prependDocHeaderAttribute('ispreview', flagDocsAsPreview),
    ));
};

async function transformFiles(outputDir: string, transformer: (src: string) => string) {
    const docs = await fs.readdir(outputDir);
    await Promise.all(
        docs.map(async (doc) => {
            const docPath = path.join(outputDir, doc);
            const buffer = await fs.readFile(docPath);
            return fs.outputFile(docPath, transformer(buffer.toString()));
        })
    );
}

const transformLinks = (ext: string) => (buffer: string) => {
    // Regex to replace the following patterns (ext = "html"):
    // [link1](api.md) -> [link1](api.html)
    // [link2](api.md#someref) -> [link2](api.html#someref)
    return buffer.replace(/(\[[^\]]+\][^)]+)(\.md)(\)|#[^)]*\))/gm, `$1${ext}$3`);
};

const prependDocHeaderAttribute = (attr: string, value: any) => (buffer: string) => {
    if (!buffer.startsWith('---')) {
        throw new Error('Doc header symbol "---" not found');
    }
    return buffer = `---\n${attr}: ${value}${buffer.substring('---'.length)}`;
};

const injectPackageVersion = (version: string) => (buffer: string) => {
    const result = buffer.replace(/<taggedversion>/g, version);
    return prependDocHeaderAttribute('version', version)(result);
};

const injectBundleHash = (bundleHash: string) => (buffer: string) => {
    const result = buffer.replace(/<hash>/g, bundleHash);
    return prependDocHeaderAttribute('bundle_hash', bundleHash)(result);
};
