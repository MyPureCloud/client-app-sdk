# Client Apps SDK

## Referencing the library

### CDN

SDK is available from

https://sdk-cdn.mypurecloud.com/client-apps/{taggedversion}/purecloud-client-app-sdk.js

https://sdk-cdn.mypurecloud.com/client-apps/{taggedversion}/purecloud-client-app-sdk.min.js

## Creating a new application

1. Create the app (i.e. integration instance)

    ~~~
POST /api/v2/integrations
{
    "integrationType": {
        "id": "embedded-client-app"
    }
}
    ~~~

1. Configure the app

  - The create call will return an {integrationInstanceId}.

  - Use the {integrationInstanceId} to configure the app.  __(Not all the properties/values are required.)__

    ~~~
PUT /api/v2/integrations/{integrationInstanceId}/config/current
{
    "name": "Custom Application Name",
    "notes": "Optional Application Notes",
    "properties" : {
        "url" : "https://mypurecloud.github.io/client-app-sdk/help.html",
        "sandbox" : "allow-same-origin,allow-top-navigation,allow-forms,allow-popups,allow-scripts,allow-pointer-lock",
        "displayModes": "widget,standalone"
    },
    "advanced": {
        "i10n": {
            "es": {
                "name": "PureCloud ejemplo de la Ayuda"
            },
            "fr": {
                "name": "PureCloud Aide Exemple"
            }
        },
        "smallIcon": {
            "vector": "https://mypurecloud.github.io/client-app-sdk/img/066-lifebuoy.svg",
            "x24": "https://mypurecloud.github.io/client-app-sdk/img/066-lifebuoy-24x24.png",
            "x48": "https://mypurecloud.github.io/client-app-sdk/img/066-lifebuoy-48x48.png"
        },
    }
}
    ~~~

1. Finally, enable the app

    ~~~
PATCH /api/v2/integrations/{integrationInstanceId}
{
    "intendedState": "ENABLED"
}
    ~~~

## Development

### Building
Builds can be made for node/npm, browsers, and docs.  Builds are currently handled by gulp but are being transitioned to npm scripts along with the rest of the development tooling.

#### Node/NPM:
`gulp build`

Artifacts are not committed to the repo.  This is run on npm install automatically for node development.

#### Browsers:
`gulp build-browser`

Artifacts are not committed to the repo.  This output will eventually be pushed to bower and other CDNs.

#### Docs:
`gulp doc` or `npm run docs`

Artifacts will be committed to the repo for easy consumption on github.

### Testing/Running:

`npm run watch:test` will start the tests and monitor for changes

`gulp build-browser` and use the generated script in an app for live testing

## Contributing
1. Fork the repo
1. Add your code (Don't forget the unit tests!)
1. Run the docs build (occurs as part of a standard build) to update the docs
1. Test your code
  * `npm test` -or- `npm run watch:test`
  * `npm build` and try the version in an app
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

## Credit

### IcoMoon

IcoMoon icons used under [CC By 4.0](http://creativecommons.org/licenses/by/4.0/)

https://github.com/Keyamoon/IcoMoon-Free

#### Modifications
* Base SVGs exported to PNGs of varing sizes

### FreePik

Example Icons from http://www.flaticon.com/packs/color-communication designed by FreePik
