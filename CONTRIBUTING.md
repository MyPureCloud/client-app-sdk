# Development

## Building
Multiple builds are created for consumption in a wide variety of runtimes and bundlers. Builds are made for browsers (development and production), CJS bundlers like webpack and browserify, and ES/JS Module bundlers like rollup, etc.

### Node/NPM:

```bash
$ yarn run build
# -or-
$ npm run build
```

The default build command also builds the API documentation.  Artifacts are not committed to the repo.  The builds are run before publishing, so the artifacts will be immediately available for users of the API.

### Api Docs

```bash
$ yarn run docs 
# -or-
$ npm run docs 
```

The API sources live in `/doc` and are built to dist before publishing.  These are also deployed out on https://developer.mypurecloud.com.

### Testing/Running:

```bash
# Start the test suite and watch for changes to the API and tests 
$ yarn run watch:test 
# -or-
$ npm run watch:test 

# Starts a test server with the examples using the local sdk build. Watches for changes.
$ yarn run serve 
# -or-
$ npm run serve
```

## Contributing
1. Fork the repo
1. Add your code (Don't forget the unit tests!)
1. Test your code
  * `npm test` -or- `npm run watch:test`
  * `npm run build` and try the version in an app -or- `npm run serve` and try the example in PC
1. Rebase onto upstream/master
1. Push your branch up to your remote
  * Note: pre-push hooks will ensure your code lints, builds, and passes the test suite
1. Open a PR to `https://github.com/MyPureCloud/client-app-sdk`

## Publishing:

### Examples
Examples live on the `gh-pages` branch of the repo.

To update these, simply
1. Update the examples
1. Commit the examples via direct push or PR
1. `npm run publish-examples` to add `examples/**/*` to gh-pages
1. Optional: Kick a new build to update and tag the master branch

[Note 1:] The script requires you to have push access to origin/gh-pages.  If this is not the case, you can submit a PR to the `gh-pages` branch.

[Note 2:] The script is set to *ADD* the examples vs replacing everything on the gh-pages branch.  This is because there are examples in `gh-pages` that are not in the examples directory.  If you have need to remove items in `gh-pages` you will need to do so manually.
