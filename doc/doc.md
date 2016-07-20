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
<dt><a href="#module_ui">ui</a></dt>
<dd><p>Utilities for manipulating the PureCloud Client UI</p>
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
| message | string | Toast Message.  Supports emoticons, emoji (unicode, shortcodes) and markdown (with markdwownMessage boolean). |
| options | string | Additonal toast options. |
| options.id | string | The id of the message.  Duplicate IDs will replace each other in the toast display.  All IDs will be  namespaced with your app ID to avoid collisions.  (Default will just be your app's namespace and will not support multiple messages) |
| options.type | string | Toast type, valid options are 'error', 'info', 'success'.  (Default is 'info') |
| options.markdownMessage | string | Boolean indicating if the message is in MD.  (Default is true) |
| options.timeout | number | Time in seconds to show the toast.  Set to 0 to disable automatic dismissal. (Default is 5) |
| options.showCloseButton | string | Boolean indicating if the close button should be shown. (Defalt is false) |

**Example**  

~~~js
purecloud.apps.alerting.showToastPopup("Hello world", "Hello world, how are you doing today?");
~~~

**Example**  

~~~js
var options = {
   type: 'success'
};
purecloud.apps.alerting.showToastPopup("Hello world", "Hello world, how are you doing today?", options);
~~~

**Example**  

~~~js
var options = {
   id: 'greeting',
   timeout: 0,
   showCloseButton: true
};
purecloud.apps.alerting.showToastPopup("Hello world", "Hello world, how are you doing today?", options);
// Set new id so the messages can show together
options.id = 'exit'
purecloud.apps.alerting.showToastPopup("Goodbye world", "See you later world", options);

 
~~~

**Example**  

~~~js
var options = {
   id: 'mdExample',
   markdownMessage: true
};
purecloud.apps.alerting.showToastPopup("Hello world", "Hello :earth_americas: How are *you* doing today?", options);
~~~

<a name="module_ui"></a>

## ui
Utilities for manipulating the PureCloud Client UI

**Since**: 1.0.0  

* [ui](#module_ui)
    * [.showHelp()](#module_ui.showHelp)
    * [.hideHelp()](#module_ui.hideHelp)

<a name="module_ui.showHelp"></a>

### ui.showHelp()
Show the help UI.

**Since**: 1.0.0  
**Example**  

~~~js
purecloud.apps.ui.showHelp();
~~~

<a name="module_ui.hideHelp"></a>

### ui.hideHelp()
Hide the help UI.  Noop if already shown.

**Since**: 1.0.0  
**Example**  

~~~js
purecloud.apps.ui.hideHelp();
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

