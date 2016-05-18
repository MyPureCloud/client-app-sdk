---
title: Client App SDK
---
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

**Kind**: static method of <code>[alerting](#module_alerting)</code>  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| title | <code>string</code> | Toast title. |
| message | <code>string</code> | Toast Message. |
| options | <code>string</code> | Additonal toast options. |
| options.messageType | <code>string</code> | Toast type, valid options are 'error', 'info', 'success'. |
| options.shouldPlaySound | <code>bool</code> | (default true) When set to true, notification sound will play when toast is displayed. |
| options.timeout | <code>number</code> | (default 5) Time in seconds to show the toast. |
| options.icon | <code>string</code> | Url of an icon to show in the toast. |

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

**Kind**: static method of <code>[users](#module_users)</code>  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| profileId | <code>string</code> | The id of the user to show |

**Example**  
~~~js
purecloud.apps.users.showProfile("targetUserId");
~~~
