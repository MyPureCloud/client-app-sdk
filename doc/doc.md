

## ui.showProfile(profileId)
Added in version 1

### Usage
Shows the profile of a specific user

### Example

~~~javascript
purecloud.apps.ui.showProfile(&#x27;userprofileid&#x27;);
~~~


### Arguments

| Name | Type | Description |
| ------------- |-------------| -----|
| profileId | string  | The id of the user to show |


## ui.popToast(title,message,options)
Added in version 1

### Usage
Displays a toast popup.

### Example

~~~javascript
var options = {
   messageType: &#x27;info&#x27;
};
purecloud.apps.ui.popToast(&#x27;Hello world&#x27;, &#x27;Hello world, how are you doing today?&#x27;, options);
~~~


### Arguments

| Name | Type | Description |
| ------------- |-------------| -----|
| title | string  | Toast title. |
| message | string  | Toast Message. |
| options | string  | Additonal toast options. |
| options.messageType | string  | Toast type, valid options are &#x27;error&#x27;, &#x27;info&#x27;, &#x27;success&#x27;. |
| options.shouldPlaySound | bool  | (default true) When set to true, notification sound will play when toast is displayed. |
| options.timeout | number  | (default 5) Time in seconds to show the toast. |
| options.icon | string  | Url of an icon to show in the toast. |


