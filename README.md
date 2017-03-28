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

  - Use the {integrationInstanceId} to configure the app.

  - You must provide the current version of the config as a `version` property to the PUT.  For the first update, this will be `1`

  - __(Not all of the following properties/values are required.)__

~~~
PUT /api/v2/integrations/{integrationInstanceId}/config/current
{
    "name": "Custom Application Name",
    "notes": "Optional Application Notes",
    "credentials": {},
    "version": {currAppConfigVersion},
    "properties" : {
        "url" : "https://mypurecloud.github.io/client-app-sdk/help.html",
        "sandbox" : "allow-forms,allow-modals,allow-popups,allow-presentation,allow-same-origin,allow-scripts",
        "displayType": "standalone", // standalone, widget
        "featureCategory": "" // directory, contactCenterInsights
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
        "lifecycle": {
            "ephemeral": false,
            "hooks": {
                "bootstrap": false,
                "focus": false,
                "blur": false,
                "stop": false
            }
        },
        "icon": {
            "vector": "https://mypurecloud.github.io/client-app-sdk/img/066-lifebuoy.svg",
            "24x24": "https://mypurecloud.github.io/client-app-sdk/img/066-lifebuoy-24x24.png",
            "36x36": "https://mypurecloud.github.io/client-app-sdk/img/066-lifebuoy-36x36.png",
            "48x48": "https://mypurecloud.github.io/client-app-sdk/img/066-lifebuoy-48x48.png",
            "72x72": "https://mypurecloud.github.io/client-app-sdk/img/066-lifebuoy-72x72.png"
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

`npm run serve` Starts a test server with the examples using the local sdk build

## Contributing
1. Fork the repo
1. Add your code (Don't forget the unit tests!)
1. Run the docs build (occurs as part of a standard build) to update the docs
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

## Credit

### IcoMoon

IcoMoon icons used under [CC By 4.0](http://creativecommons.org/licenses/by/4.0/)

https://github.com/Keyamoon/IcoMoon-Free

#### Modifications
* Base SVGs exported to PNGs of varing sizes

### FreePik
Example Icons made by [FreePik](http://www.flaticon.com/packs/color-communication) from [www.flaticon.com](http://www.flaticon.com) is licensed by [CC 3.0 BY](http://creativecommons.org/licenses/by/3.0/)

### Cursor Creative
Example Icons made by [Cursor Creative](http://www.flaticon.com/authors/cursor-creative) from [www.flaticon.com](http://www.flaticon.com) is licensed by [CC 3.0 BY](http://creativecommons.org/licenses/by/3.0/)
