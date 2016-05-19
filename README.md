# Client Apps SDK

## Referencing the library
### CDN

SDK is available from
https://sdk-cdn.mypurecloud.com/client-apps/<taggedversion>/purecloud-client-app-sdk.js
https://sdk-cdn.mypurecloud.com/client-apps/<taggedversion>/purecloud-client-app-sdk.min.js

## Creating a new applications


POST /api/v2/integrations
~~~
{
  "name": "Custom Application Name",
  "integrationType": {
    "id": "embedded-client-app"
  },
  "state": "ENABLED"
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




Example Icons from http://www.flaticon.com/packs/color-communication designed by FreePik
