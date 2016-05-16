
window.purecloud = window.purecloud || {};

window.purecloud.apps = (function() {
    var VALID_MESSAGE_TYPES=['error', 'info', 'success'];

    function isInt(n) {
       return n % 1 === 0;
    }

    return {
        ui: {
            /**
             * Shows the profile of a specific user
             * @since 1
             * @param {string} profileId - The id of the user to show
             */
            showProfile: function(profileId){
                parent.postMessage({"action": "showProfile", "profileId": profileId}, '*');
            },

            /**
             * Displays a toast popup.
             * @since 1
             * @param {string} title - Toast title.
             * @param {string} message - Toast Message.
             * @param {string} options - Additonal toast options.
             * @param {string} options.messageType - Toast type, valid options are 'error', 'info', 'success'.
             * @param {bool}   options.shouldPlaySound - (default true) When set to true, notification sound will play when toast is displayed.
             * @param {number} options.timeout - (default 5) Time in seconds to show the toast.
             * @param {string} options.icon - Url of an icon to show in the toast.
             * @example
             * var options = {
             *    messageType: "info"
             * };
             * purecloud.apps.ui.popToast("Hello world", "Hello world, how are you doing today?", options);
             */
            popToast: function(title, message, options){

                options = options || {};

                var type = "info";
                if(options.messageType && VALID_MESSAGE_TYPES.indexOf(options.messageType) > -1){
                    type = options.messageType;
                }

                var messageParams = {
                    action: 'showToast',
                    title: title,
                    message: message,
                    type: type
                };

                if (options.shouldPlaySound){
                    messageParams.shouldPlaySound = options.shouldPlaySound;
                }

                if (options.timeout && isInt(options.timeout)){
                    messageParams.hideAfter = options.timeout;
                }

                parent.postMessage(messageParams, '*');
            }
        }

    };
})();
