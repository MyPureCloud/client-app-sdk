A JavaScript library to deeply integrate a 3rd-party applications within Genesys Cloud.  This library handles App and UI-level integration concerns such as navigation, alerting, attention, and lifecycle management. For data access, plese use the [Genesys Cloud Platform API Javascript Client](https://developer.mypurecloud.com/api/rest/client-libraries/javascript/index.html).

[Source Code](https://github.com/MyPureCloud/client-app-sdk)

## Obtaining the library

### NPM/Yarn

```bash
$ npm install purecloud-client-app-sdk
# -or-
$ yarn add purecloud-client-app-sdk
```

### Genesys Cloud CDN

```
https://sdk-cdn.mypurecloud.com/client-apps/<taggedversion>/purecloud-client-app-sdk.js
https://sdk-cdn.mypurecloud.com/client-apps/<taggedversion>/purecloud-client-app-sdk-<hash>.min.js
```

## Accessing the Library

The Client Apps SDK is bundled in several formats to support your build ecosystem and deployment model.

_*Note:*_ Although a CJS format is provided, it is to be consumed by tooling.  This library is client-side and will not run in a node environment.

### Best Practice

We recommend importing and using the library via a build tool such as webpack, rollup, broccoli, browserify, etc.  This provides optimal control with respect to resource loading and bootstrapping.  A UMD browser bundle is available for prototyping, quick demos, and build-less environments.

### The Formats

* [JavaScript/EcmaScript Modules (dist/main.mjs)](#formats-es)
* [CommonJS Module (dist/main.js)](#formats-cjs)
* [Browser UMD Module (dist/purecloud-client-app-sdk.js)](#formats-umd)
    * Global: `purecloud.apps.ClientApp`

<a name="formats-es"></a>

#### JavaScript/EcmaScript Modules (dist/main.mjs)

```js
// JS/ES Modules

// Note: import syntax varies by tool
import ClientApp from 'purecloud-client-app-sdk';
let myClientApp = new ClientApp({
    pcEnvironmentQueryParam: 'pcEnvironment'
});

myClientApp.alerting.showToastPopup('Hello', 'Genesys Cloud');
```

<a name="formats-cjs"></a>

#### CommonJS Module (dist/main.js)

```js
// CommonJS

let ClientApp = require('purecloud-client-app-sdk');
let myClientApp = new ClientApp({
    pcEnvironmentQueryParam: 'pcEnvironment'
});

myClientApp.alerting.showToastPopup('Hello', 'Genesys Cloud');
```

<a name="formats-umd"></a>

#### Browser UMD Module (dist/purecloud-client-app-sdk.js)

```html
<!-- Script Tag -->

<!-- Note: You can use the script from our CDN or host it locally -->
<head>
    <script src="https://sdk-cdn.mypurecloud.com/client-apps/<taggedversion>/purecloud-client-app-sdk-<hash>.min.js"></script>
</head>

<!--...-->

<script>
    // Note: You may need to use another event (e.g. load ) depending on how you load the script.
    document.addEventListener('DOMContentLoaded', function () {
        var ClientApp = window.purecloud.apps.ClientApp;
        var myClientApp = new ClientApp({
            pcEnvironmentQueryParam: 'pcEnvironment'
        });

        myClientApp.alerting.showToastPopup('Hello', 'Genesys Cloud');
    });
</script>
```

## Environments

The ClientApp instance must be configured to match the Genesys Cloud environment in which it is being run. The environment defaults to `mypurecloud.com`; however, you will likely need to support other environments.

### Best Practice

We recommend configuring your app so the PC environment can be seeded into the url.  This allows the SDK to dynamically determine the environment at runtime and simplifies your code.

1. When registering your app, configure the URL in the format: https://myapp.mydomain.com?pcEnvironment=\{\{pcEnvironment\}\}
1. Include `pcEnvironmentQueryParam: 'pcEnvironment'` in your ClientApp config to dynamically determine the environment
1. Use `myClientApp.pcEnvironment` to access the environment later when needed (e.g. to pass to the [Genesys Cloud Platform API Javascript Client](https://developer.mypurecloud.com/api/rest/client-libraries/javascript/index.html)).

### Manual Configuration

You can also manually specify the Genesys Cloud environment or origin.  For details on supported options, see [ClientApp](./ClientApp.md)

## Modules

Features of the SDK are bundled into modules and can be accessed from the root [ClientApp](./ClientApp.md) instance.

## Versioning

The Client Apps SDK uses [SemVer](http://semver.org/) to manage releases.  SemVer enables you to safely upgrade in most cases without concern for breaking existing code.  Note that this library's version does not relate to the version of the Genesys Cloud hosting app or the js platform SDK.

## More Resources

* [Dev Center Guides](https://developer.mypurecloud.com/api/client-apps/index.html)
* [Client Apps User Guide](https://help.mypurecloud.com/articles/about-custom-client-application-integrations/)
