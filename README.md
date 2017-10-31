# Client Apps SDK

A JavaScript library to deeply integrate a 3rd-party applications within PureCloud.  This library handles App and UI-level integration concerns such as navigation, alerting, attention, and lifecycle management. For data access, plese use the [PureCloud Platform API Javascript Client](https://developer.mypurecloud.com/api/rest/client-libraries/javascript/index.html).

* [API](https://developer.mypurecloud.com/api/client-apps/client-app-sdk.html)
* [Developer Guides](https://developer.mypurecloud.com/api/client-apps/index.html)
* [User Guides](https://help.mypurecloud.com/articles/about-custom-client-application-integrations/)

## Install

### JS Package Managers

```bash
$ npm install purecloud-client-app-sdk
# -or-
$ yarn add purecloud-client-app-sdk
```

### PureCloud CDN

```
https://sdk-cdn.mypurecloud.com/client-apps/<taggedversion>/purecloud-client-app-sdk.js
https://sdk-cdn.mypurecloud.com/client-apps/<taggedversion>/purecloud-client-app-sdk-<hash>.min.js
```

## Building a PureCloud App

In the simpliest form, a PureCloud App is simply a web page that enhances or extends PureCloud functionality.  If you have a deployed web site, you could have a PureCloud app!

### Minimum Requirements

* Served over HTTPS
* Allowed to be embedded as an iframe
* Conforms to the [PureCloud Style Guide for Apps](https://developer.mypurecloud.com/partners/)

### Integrating with PureCloud UI

Use this API to improve the integration of your app with PureCloud.  Navigate, notify, and request attention all through a simple JS API.

[Live API Docs](https://developer.mypurecloud.com/api/client-apps/client-app-sdk.html)

### Accessing PureCloud Data

Use the [PureCloud Platform API Javascript Client](https://developer.mypurecloud.com/api/rest/client-libraries/javascript/index.html) to access PureCloud data within your app.

## Registering a PureCloud App

After you've built your app, you will need to configure it to appear in your org.

### UI

PureCloud Apps can be added via the PureCloud UI under Admin > Integrations > Web

### Programmatically

Alternatively, you can use the REST API or PureCloud SDKs to programmatically create a PureCloud App.

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
        "featureCategory": "", // directory, contactCenterInsights
        /*
         * PC Group IDs identifying users who will be able to see this embedded-client-app.
         *
         * Note: This only affects display within the PureCloud UI.  App developers should not rely on
         * this mechanism alone for user authorization.  Check server-side before granting access to a
         * user.
         */
        "groups": []
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
