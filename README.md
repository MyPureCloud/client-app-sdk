# Client Apps SDK

## Referencing the library
### CDN

SDK is available from

https://sdk-cdn.mypurecloud.com/client-apps/{taggedversion}/purecloud-client-app-sdk.js

https://sdk-cdn.mypurecloud.com/client-apps/{taggedversion}/purecloud-client-app-sdk.min.js

## Creating a new applications


POST /api/v2/integrations
~~~
{
  "name": "Custom Application Name",
  "integrationType": {
    "id": "embedded-client-app"
  }
}
~~~

from that POST, you will get a config.id, use that id to call

PUT /api/v2/integrations/{integrationId}/config/{configId}

~~~
{
    "version": 1,
    "properties" : {
        "url" : "http://mypurecloud.github.io/client-app-sdk/toast.html",
        "displayModes": "widget",
        "icon_x24" : "http://mypurecloud.github.io/client-app-sdk/img/speech-bubbles-1.png",
        "sandbox" : "allow-same-origin,allow-top-navigation,allow-forms,allow-popups,allow-scripts,allow-pointer-lock"
    }
}
~~~

Finally, set the state to enabled

PUT /api/v2/integrations/{integrationId}

~~~
{
  "name": "Custom Application Name",
  "state": "ENABLED",
  "version": 1
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

## Credit
Example Icons from http://www.flaticon.com/packs/color-communication designed by FreePik
