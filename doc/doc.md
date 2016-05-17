## about()
Added in version 1.0.0

### Usage
Displays information about this version of the PureClound Client App SDK.

### Examples

~~~javascript
pcClientApp.about() // returns module name and current version
~~~

## alerting Module
Added in version 1.0.0

### Usage
Utilities for alerting users in the PureCloud Client




## showToastPopup (title,message,options)
Added in version 1.0.0

### Usage
Displays a toast popup.

### Examples

~~~javascript
var options = {
   messageType: "info"
};
purecloud.apps.showToastPopup("Hello world", "Hello world, how are you doing today?", options);
~~~

### Arguments

Name | Type | Description
| -- | -- | -- |
|title | string | Toast title.|
message | string | Toast Message.|
options | string | Additonal toast options.|
options.messageType | string | Toast type, valid options are &#x27;error&#x27;, &#x27;info&#x27;, &#x27;success&#x27;.|
options.shouldPlaySound | bool | (default true) When set to true, notification sound will play when toast is displayed.|
options.timeout | number | (default 5) Time in seconds to show the toast.|
options.icon | string | Url of an icon to show in the toast.|

## users Module
Added in version 1.0.0

### Usage
Utilities for interacting with users in the PureCloud Client




## showProfile (profileId)
Added in version 1.0.0

### Usage
Shows the profile of a specified user

### Examples

~~~javascript
purecloud.apps.showProfile("targetUserId");
~~~

### Arguments

Name | Type | Description
| -- | -- | -- |
|profileId | string | The id of the user to show|


