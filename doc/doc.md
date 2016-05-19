---
title: Client App SDK
ispreview: true
---
## Referencing the library

### CDN

SDK is available from our CDN at

~~~
https://sdk-cdn.mypurecloud.com/client-apps/<taggedversion>/purecloud-client-app-sdk.js
https://sdk-cdn.mypurecloud.com/client-apps/<taggedversion>/purecloud-client-app-sdk.min.js
~~~

## Modules

<dl>
<dt><a href="#module_alerting">alerting</a></dt>
<dd><p>Utilities for alerting users in the PureCloud Client</p>
</dd>
<dt><a href="#module_users">users</a></dt>
<dd><p>Utilities for interacting with users in the PureCloud Client</p>
</dd>
</dl>

<a name="module_alerting"></a>

## alerting
Utilities for alerting users in the PureCloud Client

**Since**: 1.0.0  
<a name="module_alerting.showToastPopup"></a>

### alerting.showToastPopup(title, message, options)
Displays a toast popup.

**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| title | string | Toast title. |
| message | string | Toast Message. |
| options | string | Additonal toast options. |
| options.messageType | string | Toast type, valid options are 'error', 'info', 'success'. |
| options.shouldPlaySound | bool | (default true) When set to true, notification sound will play when toast is displayed. |
| options.timeout | number | (default 5) Time in seconds to show the toast. |
| options.icon | string | Url of an icon to show in the toast. |

**Example**  

~~~js
var options = {
   messageType: "info"
};
purecloud.apps.alerting.showToastPopup("Hello world", "Hello world, how are you doing today?", options);
~~~

<a name="module_users"></a>

## users
Utilities for interacting with users in the PureCloud Client

**Since**: 1.0.0  
<a name="module_users.showProfile"></a>

### users.showProfile(profileId)
Shows the profile of a specified user

**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| profileId | string | The id of the user to show |

**Example**  

~~~js
purecloud.apps.users.showProfile("targetUserId");
~~~

