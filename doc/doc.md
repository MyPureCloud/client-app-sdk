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
<dt><a href="#module_lifecycle">lifecycle</a></dt>
<dd><p>Utilities for integrating with a PureCloud App&#39;s Lifecycle</p>
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

* [alerting](#module_alerting)
    * [.showToastPopup(title, message, options)](#module_alerting.showToastPopup)
    * [.setAttentionCount(count)](#module_alerting.setAttentionCount)

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

<a name="module_alerting.setAttentionCount"></a>

### alerting.setAttentionCount(count)
Displays badging for unread messages and notifications


| Param | Type | Description |
| --- | --- | --- |
| count | number | The updated number of unread messages or notifications |

**Example**  

~~~js
purecloud.apps.alerting.setAttentionCount(2);
~~~

**Example**  

~~~js
purecloud.apps.alerting.setAttentionCount(0);
~~~

<a name="module_lifecycle"></a>

## lifecycle
Utilities for integrating with a PureCloud App's Lifecycle

**Since**: 1.0.0  

* [lifecycle](#module_lifecycle)
    * [.bootstrapped()](#module_lifecycle.bootstrapped)
    * [.stopped()](#module_lifecycle.stopped)

<a name="module_lifecycle.bootstrapped"></a>

### lifecycle.bootstrapped()
Signals PureCloud that this app has finished its initialization work and
can be shown to the user.

**Since**: 1.0.0  
**Example**  

~~~js
purecloud.apps.lifecycle.bootstrapped();
~~~

<a name="module_lifecycle.stopped"></a>

### lifecycle.stopped()
Signals PureCloud that this app has finished its tear down work and the iframe
can be removed from purecloud permanently.

**Since**: 1.0.0  
**Example**  

~~~js
purecloud.apps.lifecycle.stopped();
~~~

<a name="module_ui"></a>

## ui
Utilities for manipulating the PureCloud Client UI

**Since**: 1.0.0  

* [ui](#module_ui)
    * [.showHelp()](#module_ui.showHelp)
    * [.showResourceCenterArtifact(artifactRelPath)](#module_ui.showResourceCenterArtifact)
    * [.hideHelp()](#module_ui.hideHelp)

<a name="module_ui.showHelp"></a>

### ui.showHelp()
Show the help UI.  Noop if already shown.

**Since**: 1.0.0  
**Example**  

~~~js
purecloud.apps.ui.showHelp();
~~~

<a name="module_ui.showResourceCenterArtifact"></a>

### ui.showResourceCenterArtifact(artifactRelPath)
Open the help panel to the specified Resource Center artifact

**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| artifactRelPath | string | The path of the Resource Center artifact relative to the Resource Center root.  Supports paths and query string params, but not hash params.  The appropriate theme will be inserted automatically. |

**Example**  

~~~js
// Direct path
purecloud.apps.ui.showResourceCenterArtifact('articles/complete-profile');
~~~

**Example**  

~~~js
// Permalink
purecloud.apps.ui.showResourceCenterArtifact('?p=7711');
~~~

<a name="module_ui.hideHelp"></a>

### ui.hideHelp()
Hide the help UI.  Noop if already hidden.

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

