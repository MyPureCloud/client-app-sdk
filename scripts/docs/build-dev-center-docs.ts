import * as path from "path";
import * as fs from "fs-extra";
import { Application, TSConfigReader, TypeDocOptions } from "typedoc";

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

// Options added by the Typedoc Markdown Plugin
interface MarkdownPluginOptions {
    skipSidebar: boolean;
    hideBreadcrumbs: boolean;
}

interface DevCenterDocsOptions {
    options?: Partial<TypeDocOptions>;
    flagDocsAsPreview: boolean;
    outputDir: string;
}

export const buildDevCenterDocs = async ({ flagDocsAsPreview, outputDir, options }: DevCenterDocsOptions) => {
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
    const indexFilePath = path.join(outputDir, "index.md");
    await fs.copy("doc/index.md", indexFilePath);

    // Add header to index file
    const indexFileContents = (await fs.readFile(indexFilePath)).toString();
    await fs.outputFile(indexFilePath, "---\ntitle: Client App SDK\n---\n\n" + indexFileContents);

    // Apply transformations to docs
    const docs = await fs.readdir(outputDir);
    await Promise.all(
        docs.map(async (doc) => {
            const docPath = path.join(outputDir, doc);
            let buffer = (await fs.readFile(docPath)).toString();
            buffer = transformLinks(buffer, '.html');
            if (flagDocsAsPreview) {
                buffer = prependDocHeaderAttribute(buffer, 'ispreview: true');
            }
            return fs.outputFile(docPath, buffer);
        })
    );
};
