import { Application, TSConfigReader, TypeDocOptions } from "typedoc";

interface HtmlDocsOptions {
    options?: Partial<TypeDocOptions>;
    outputDir: string;
}

export const buildHtmlDocs = async ({ outputDir, options }: HtmlDocsOptions) => {
    const app = new Application();

    // So TypeDoc can load tsconfig.json
    app.options.addReader(new TSConfigReader());

    app.bootstrap({
        ...options,
        theme: 'minimal',
        readme: 'none',
        plugin: [
            'typedoc-plugin-no-inherit'
        ],
    });

    const project = app.convert(app.expandInputFiles(["src"]));
    if (!project) throw new Error("Unable to generate typedoc project");

    // Rendered docs
    app.generateDocs(project, outputDir);
};
