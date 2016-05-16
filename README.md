# Client Apps SDK

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
        "url" : "url to application",
        "displayModes": ['widget', 'standalone'],
        "icon_x24" : "url to 24x24 icon",
        "sandbox" : "allow-same-origin,allow-top-navigation,allow-forms,allow-popups,allow-scripts,allow-pointer-lock"
    }
}
~~~
