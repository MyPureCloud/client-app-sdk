(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.purecloud || (g.purecloud = {})).apps = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports={
  "name": "purecloud-client-app-sdk",
  "version": "0.0.1-beta.1",
  "description": "Javascript API for PureCloud Client Apps and Extensions",
  "main": "dist/index.js",
  "directories": {
    "doc": "doc",
    "lib": "src"
  },
  "scripts": {
    "lint": "jshint src",
    "build": "node_modules/.bin/gulp",
    "build-docs": "./scripts/build-docs.sh",
    "test": "echo \"Error: no test specified\" && exit 1",
    "about": "node scripts/about.js",
    "postinstall": "npm run build",
    "preversion": "npm run lint",
    "version": "npm run build",
    "postversion": "rm -rf build/temp"
  },
  "keywords": [
    "MyPureCloud",
    "PureCloud"
  ],
  "author": "Interactive Intelligence, Inc.",
  "homepage": "http://www.inin.com/purecloud/",
  "repository": {
    "type": "git",
    "url": "https://github.com/MyPureCloud/client-app-sdk"
  },
  "license": "MIT",
  "private": true,
  "engines": {
    "node": ">= 4.4.0"
  },
  "dependencies": {},
  "devDependencies": {
    "babel-preset-es2015": "^6.6.0",
    "babelify": "^7.3.0",
    "browserify": "^13.0.1",
    "del": "^2.2.0",
    "gulp": "^3.9.1",
    "gulp-babel": "^6.1.2",
    "gulp-rename": "^1.2.2",
    "gulp-uglify": "^1.5.3",
    "handlebars": "^4.0.5",
    "jsdoc": "^3.4.0",
    "jshint": "*",
    "optimist": "^0.6.1",
    "purecloud-api-sdk-common": "git://github.com/MyPureCloud/purecloud_api_sdk_common.git",
    "vinyl-buffer": "^1.0.0",
    "vinyl-source-stream": "^1.1.0"
  }
}

},{}],2:[function(require,module,exports){
/* jshint node: true */

'use strict';

var pkg = require('../package.json');

/**
 * Displays information about this version of the PureClound Client App SDK.
 * @since 1.0.0
 *
 * @returns A string of information describing this library
 *
 * @example
 * pcClientApp.about() // returns module name and current version
 */
exports.about = function () {
  return pkg.name + ': ' + pkg.version;
};

exports.users = require('./modules/users');
exports.alerting = require('./modules/alerting');

},{"../package.json":1,"./modules/alerting":3,"./modules/users":4}],3:[function(require,module,exports){
'use strict';

/**
 * Utilities for alerting users in the PureCloud Client
 * @module alerting
 * @since 1.0.0
 */

var VALID_MESSAGE_TYPES = ['error', 'info', 'success'];

function isInt(n) {
    return n % 1 === 0;
}

/**
 * Displays a toast popup.
 * @since 1.0.0
 * @param {string} title - Toast title.
 * @param {string} message - Toast Message.
 * @param {string} options - Additonal toast options.
 * @param {string} options.messageType - Toast type, valid options are 'error', 'info', 'success'.
 * @param {bool}   options.shouldPlaySound - (default true) When set to true, notification sound will play when toast is displayed.
 * @param {number} options.timeout - (default 5) Time in seconds to show the toast.
 * @param {string} options.icon - Url of an icon to show in the toast.
 *
 * @example
 * var options = {
 *    messageType: "info"
 * };
 * purecloud.apps.showToastPopup("Hello world", "Hello world, how are you doing today?", options);
 */
exports.showToastPopup = function (title, message, options) {
    options = options || {};

    var type = "info";
    if (options.messageType && typeof options.messageType === 'string') {
        var requestedType = options.messageType.trim().toLowerCase();

        if (VALID_MESSAGE_TYPES.indexOf(typeToTest) > -1) {
            type = requestedType;
        }
    }

    var messageParams = {
        action: 'showToast',
        title: title,
        message: message,
        type: type
    };

    if (options.shouldPlaySound) {
        messageParams.shouldPlaySound = options.shouldPlaySound;
    }

    if (options.timeout && isInt(options.timeout)) {
        messageParams.hideAfter = options.timeout;
    }

    parent.postMessage(messageParams, '*');
};

},{}],4:[function(require,module,exports){
"use strict";

/**
 * Utilities for interacting with users in the PureCloud Client
 * @module users
 * @since 1.0.0
 */

/**
 * Shows the profile of a specified user
 * @since 1.0.0
 * @param {string} profileId - The id of the user to show
 *
 * @example
 * purecloud.apps.showProfile("targetUserId");
 */
exports.showProfile = function (profileId) {
  parent.postMessage({ "action": "showProfile", "profileId": profileId }, '*');
};

},{}]},{},[2])(2)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWNrYWdlLmpzb24iLCJzcmMvaW5kZXguanMiLCJzcmMvbW9kdWxlcy9hbGVydGluZy5qcyIsInNyYy9tb2R1bGVzL3VzZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNwREE7O0FBRUEsSUFBSSxNQUFNLFFBQVEsaUJBQVIsQ0FBVjs7Ozs7Ozs7Ozs7QUFXQSxRQUFRLEtBQVIsR0FBZ0IsWUFBWTtBQUN4QixTQUFVLElBQUksSUFBZCxVQUF1QixJQUFJLE9BQTNCO0FBQ0gsQ0FGRDs7QUFJQSxRQUFRLEtBQVIsR0FBZ0IsUUFBUSxpQkFBUixDQUFoQjtBQUNBLFFBQVEsUUFBUixHQUFtQixRQUFRLG9CQUFSLENBQW5COzs7Ozs7Ozs7OztBQ2RBLElBQU0sc0JBQXNCLENBQUMsT0FBRCxFQUFVLE1BQVYsRUFBa0IsU0FBbEIsQ0FBNUI7O0FBRUEsU0FBUyxLQUFULENBQWUsQ0FBZixFQUFrQjtBQUNmLFdBQU8sSUFBSSxDQUFKLEtBQVUsQ0FBakI7QUFDRjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1CRCxRQUFRLGNBQVIsR0FBeUIsVUFBVSxLQUFWLEVBQWlCLE9BQWpCLEVBQTBCLE9BQTFCLEVBQW1DO0FBQ3hELGNBQVUsV0FBVyxFQUFyQjs7QUFFQSxRQUFJLE9BQU8sTUFBWDtBQUNBLFFBQUcsUUFBUSxXQUFSLElBQXVCLE9BQU8sUUFBUSxXQUFmLEtBQStCLFFBQXpELEVBQW1FO0FBQy9ELFlBQUksZ0JBQWdCLFFBQVEsV0FBUixDQUFvQixJQUFwQixHQUEyQixXQUEzQixFQUFwQjs7QUFFQSxZQUFJLG9CQUFvQixPQUFwQixDQUE0QixVQUE1QixJQUEwQyxDQUFDLENBQS9DLEVBQWtEO0FBQzlDLG1CQUFPLGFBQVA7QUFDSDtBQUNKOztBQUVELFFBQUksZ0JBQWdCO0FBQ2hCLGdCQUFRLFdBRFE7QUFFaEIsb0JBRmdCO0FBR2hCLHdCQUhnQjtBQUloQjtBQUpnQixLQUFwQjs7QUFPQSxRQUFJLFFBQVEsZUFBWixFQUE2QjtBQUN6QixzQkFBYyxlQUFkLEdBQWdDLFFBQVEsZUFBeEM7QUFDSDs7QUFFRCxRQUFJLFFBQVEsT0FBUixJQUFtQixNQUFNLFFBQVEsT0FBZCxDQUF2QixFQUErQztBQUMzQyxzQkFBYyxTQUFkLEdBQTBCLFFBQVEsT0FBbEM7QUFDSDs7QUFFRCxXQUFPLFdBQVAsQ0FBbUIsYUFBbkIsRUFBa0MsR0FBbEM7QUFDSCxDQTVCRDs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2ZBLFFBQVEsV0FBUixHQUFzQixVQUFTLFNBQVQsRUFBb0I7QUFDdEMsU0FBTyxXQUFQLENBQW1CLEVBQUMsVUFBVSxhQUFYLEVBQTBCLGFBQWEsU0FBdkMsRUFBbkIsRUFBc0UsR0FBdEU7QUFDSCxDQUZEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJuYW1lXCI6IFwicHVyZWNsb3VkLWNsaWVudC1hcHAtc2RrXCIsXG4gIFwidmVyc2lvblwiOiBcIjAuMC4xLWJldGEuMVwiLFxuICBcImRlc2NyaXB0aW9uXCI6IFwiSmF2YXNjcmlwdCBBUEkgZm9yIFB1cmVDbG91ZCBDbGllbnQgQXBwcyBhbmQgRXh0ZW5zaW9uc1wiLFxuICBcIm1haW5cIjogXCJkaXN0L2luZGV4LmpzXCIsXG4gIFwiZGlyZWN0b3JpZXNcIjoge1xuICAgIFwiZG9jXCI6IFwiZG9jXCIsXG4gICAgXCJsaWJcIjogXCJzcmNcIlxuICB9LFxuICBcInNjcmlwdHNcIjoge1xuICAgIFwibGludFwiOiBcImpzaGludCBzcmNcIixcbiAgICBcImJ1aWxkXCI6IFwibm9kZV9tb2R1bGVzLy5iaW4vZ3VscFwiLFxuICAgIFwiYnVpbGQtZG9jc1wiOiBcIi4vc2NyaXB0cy9idWlsZC1kb2NzLnNoXCIsXG4gICAgXCJ0ZXN0XCI6IFwiZWNobyBcXFwiRXJyb3I6IG5vIHRlc3Qgc3BlY2lmaWVkXFxcIiAmJiBleGl0IDFcIixcbiAgICBcImFib3V0XCI6IFwibm9kZSBzY3JpcHRzL2Fib3V0LmpzXCIsXG4gICAgXCJwb3N0aW5zdGFsbFwiOiBcIm5wbSBydW4gYnVpbGRcIixcbiAgICBcInByZXZlcnNpb25cIjogXCJucG0gcnVuIGxpbnRcIixcbiAgICBcInZlcnNpb25cIjogXCJucG0gcnVuIGJ1aWxkXCIsXG4gICAgXCJwb3N0dmVyc2lvblwiOiBcInJtIC1yZiBidWlsZC90ZW1wXCJcbiAgfSxcbiAgXCJrZXl3b3Jkc1wiOiBbXG4gICAgXCJNeVB1cmVDbG91ZFwiLFxuICAgIFwiUHVyZUNsb3VkXCJcbiAgXSxcbiAgXCJhdXRob3JcIjogXCJJbnRlcmFjdGl2ZSBJbnRlbGxpZ2VuY2UsIEluYy5cIixcbiAgXCJob21lcGFnZVwiOiBcImh0dHA6Ly93d3cuaW5pbi5jb20vcHVyZWNsb3VkL1wiLFxuICBcInJlcG9zaXRvcnlcIjoge1xuICAgIFwidHlwZVwiOiBcImdpdFwiLFxuICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9naXRodWIuY29tL015UHVyZUNsb3VkL2NsaWVudC1hcHAtc2RrXCJcbiAgfSxcbiAgXCJsaWNlbnNlXCI6IFwiTUlUXCIsXG4gIFwicHJpdmF0ZVwiOiB0cnVlLFxuICBcImVuZ2luZXNcIjoge1xuICAgIFwibm9kZVwiOiBcIj49IDQuNC4wXCJcbiAgfSxcbiAgXCJkZXBlbmRlbmNpZXNcIjoge30sXG4gIFwiZGV2RGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcImJhYmVsLXByZXNldC1lczIwMTVcIjogXCJeNi42LjBcIixcbiAgICBcImJhYmVsaWZ5XCI6IFwiXjcuMy4wXCIsXG4gICAgXCJicm93c2VyaWZ5XCI6IFwiXjEzLjAuMVwiLFxuICAgIFwiZGVsXCI6IFwiXjIuMi4wXCIsXG4gICAgXCJndWxwXCI6IFwiXjMuOS4xXCIsXG4gICAgXCJndWxwLWJhYmVsXCI6IFwiXjYuMS4yXCIsXG4gICAgXCJndWxwLXJlbmFtZVwiOiBcIl4xLjIuMlwiLFxuICAgIFwiZ3VscC11Z2xpZnlcIjogXCJeMS41LjNcIixcbiAgICBcImhhbmRsZWJhcnNcIjogXCJeNC4wLjVcIixcbiAgICBcImpzZG9jXCI6IFwiXjMuNC4wXCIsXG4gICAgXCJqc2hpbnRcIjogXCIqXCIsXG4gICAgXCJvcHRpbWlzdFwiOiBcIl4wLjYuMVwiLFxuICAgIFwicHVyZWNsb3VkLWFwaS1zZGstY29tbW9uXCI6IFwiZ2l0Oi8vZ2l0aHViLmNvbS9NeVB1cmVDbG91ZC9wdXJlY2xvdWRfYXBpX3Nka19jb21tb24uZ2l0XCIsXG4gICAgXCJ2aW55bC1idWZmZXJcIjogXCJeMS4wLjBcIixcbiAgICBcInZpbnlsLXNvdXJjZS1zdHJlYW1cIjogXCJeMS4xLjBcIlxuICB9XG59XG4iLCIvKiBqc2hpbnQgbm9kZTogdHJ1ZSAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmxldCBwa2cgPSByZXF1aXJlKCcuLi9wYWNrYWdlLmpzb24nKTtcblxuLyoqXG4gKiBEaXNwbGF5cyBpbmZvcm1hdGlvbiBhYm91dCB0aGlzIHZlcnNpb24gb2YgdGhlIFB1cmVDbG91bmQgQ2xpZW50IEFwcCBTREsuXG4gKiBAc2luY2UgMS4wLjBcbiAqXG4gKiBAcmV0dXJucyBBIHN0cmluZyBvZiBpbmZvcm1hdGlvbiBkZXNjcmliaW5nIHRoaXMgbGlicmFyeVxuICpcbiAqIEBleGFtcGxlXG4gKiBwY0NsaWVudEFwcC5hYm91dCgpIC8vIHJldHVybnMgbW9kdWxlIG5hbWUgYW5kIGN1cnJlbnQgdmVyc2lvblxuICovXG5leHBvcnRzLmFib3V0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBgJHtwa2cubmFtZX06ICR7cGtnLnZlcnNpb259YDtcbn07XG5cbmV4cG9ydHMudXNlcnMgPSByZXF1aXJlKCcuL21vZHVsZXMvdXNlcnMnKTtcbmV4cG9ydHMuYWxlcnRpbmcgPSByZXF1aXJlKCcuL21vZHVsZXMvYWxlcnRpbmcnKTtcbiIsIi8qKlxuICogVXRpbGl0aWVzIGZvciBhbGVydGluZyB1c2VycyBpbiB0aGUgUHVyZUNsb3VkIENsaWVudFxuICogQG1vZHVsZSBhbGVydGluZ1xuICogQHNpbmNlIDEuMC4wXG4gKi9cblxuY29uc3QgVkFMSURfTUVTU0FHRV9UWVBFUyA9IFsnZXJyb3InLCAnaW5mbycsICdzdWNjZXNzJ107XG5cbmZ1bmN0aW9uIGlzSW50KG4pIHtcbiAgIHJldHVybiBuICUgMSA9PT0gMDtcbn1cblxuLyoqXG4gKiBEaXNwbGF5cyBhIHRvYXN0IHBvcHVwLlxuICogQHNpbmNlIDEuMC4wXG4gKiBAcGFyYW0ge3N0cmluZ30gdGl0bGUgLSBUb2FzdCB0aXRsZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIC0gVG9hc3QgTWVzc2FnZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zIC0gQWRkaXRvbmFsIHRvYXN0IG9wdGlvbnMuXG4gKiBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5tZXNzYWdlVHlwZSAtIFRvYXN0IHR5cGUsIHZhbGlkIG9wdGlvbnMgYXJlICdlcnJvcicsICdpbmZvJywgJ3N1Y2Nlc3MnLlxuICogQHBhcmFtIHtib29sfSAgIG9wdGlvbnMuc2hvdWxkUGxheVNvdW5kIC0gKGRlZmF1bHQgdHJ1ZSkgV2hlbiBzZXQgdG8gdHJ1ZSwgbm90aWZpY2F0aW9uIHNvdW5kIHdpbGwgcGxheSB3aGVuIHRvYXN0IGlzIGRpc3BsYXllZC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnRpbWVvdXQgLSAoZGVmYXVsdCA1KSBUaW1lIGluIHNlY29uZHMgdG8gc2hvdyB0aGUgdG9hc3QuXG4gKiBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5pY29uIC0gVXJsIG9mIGFuIGljb24gdG8gc2hvdyBpbiB0aGUgdG9hc3QuXG4gKlxuICogQGV4YW1wbGVcbiAqIHZhciBvcHRpb25zID0ge1xuICogICAgbWVzc2FnZVR5cGU6IFwiaW5mb1wiXG4gKiB9O1xuICogcHVyZWNsb3VkLmFwcHMuc2hvd1RvYXN0UG9wdXAoXCJIZWxsbyB3b3JsZFwiLCBcIkhlbGxvIHdvcmxkLCBob3cgYXJlIHlvdSBkb2luZyB0b2RheT9cIiwgb3B0aW9ucyk7XG4gKi9cbmV4cG9ydHMuc2hvd1RvYXN0UG9wdXAgPSBmdW5jdGlvbiAodGl0bGUsIG1lc3NhZ2UsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIGxldCB0eXBlID0gXCJpbmZvXCI7XG4gICAgaWYob3B0aW9ucy5tZXNzYWdlVHlwZSAmJiB0eXBlb2Ygb3B0aW9ucy5tZXNzYWdlVHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgbGV0IHJlcXVlc3RlZFR5cGUgPSBvcHRpb25zLm1lc3NhZ2VUeXBlLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgIGlmIChWQUxJRF9NRVNTQUdFX1RZUEVTLmluZGV4T2YodHlwZVRvVGVzdCkgPiAtMSkge1xuICAgICAgICAgICAgdHlwZSA9IHJlcXVlc3RlZFR5cGU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgbWVzc2FnZVBhcmFtcyA9IHtcbiAgICAgICAgYWN0aW9uOiAnc2hvd1RvYXN0JyxcbiAgICAgICAgdGl0bGUsXG4gICAgICAgIG1lc3NhZ2UsXG4gICAgICAgIHR5cGVcbiAgICB9O1xuXG4gICAgaWYgKG9wdGlvbnMuc2hvdWxkUGxheVNvdW5kKSB7XG4gICAgICAgIG1lc3NhZ2VQYXJhbXMuc2hvdWxkUGxheVNvdW5kID0gb3B0aW9ucy5zaG91bGRQbGF5U291bmQ7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMudGltZW91dCAmJiBpc0ludChvcHRpb25zLnRpbWVvdXQpKSB7XG4gICAgICAgIG1lc3NhZ2VQYXJhbXMuaGlkZUFmdGVyID0gb3B0aW9ucy50aW1lb3V0O1xuICAgIH1cblxuICAgIHBhcmVudC5wb3N0TWVzc2FnZShtZXNzYWdlUGFyYW1zLCAnKicpO1xufTtcbiIsIi8qKlxuICogVXRpbGl0aWVzIGZvciBpbnRlcmFjdGluZyB3aXRoIHVzZXJzIGluIHRoZSBQdXJlQ2xvdWQgQ2xpZW50XG4gKiBAbW9kdWxlIHVzZXJzXG4gKiBAc2luY2UgMS4wLjBcbiAqL1xuXG4gLyoqXG4gICogU2hvd3MgdGhlIHByb2ZpbGUgb2YgYSBzcGVjaWZpZWQgdXNlclxuICAqIEBzaW5jZSAxLjAuMFxuICAqIEBwYXJhbSB7c3RyaW5nfSBwcm9maWxlSWQgLSBUaGUgaWQgb2YgdGhlIHVzZXIgdG8gc2hvd1xuICAqXG4gICogQGV4YW1wbGVcbiAgKiBwdXJlY2xvdWQuYXBwcy5zaG93UHJvZmlsZShcInRhcmdldFVzZXJJZFwiKTtcbiAgKi9cbmV4cG9ydHMuc2hvd1Byb2ZpbGUgPSBmdW5jdGlvbihwcm9maWxlSWQpIHtcbiAgICBwYXJlbnQucG9zdE1lc3NhZ2Uoe1wiYWN0aW9uXCI6IFwic2hvd1Byb2ZpbGVcIiwgXCJwcm9maWxlSWRcIjogcHJvZmlsZUlkfSwgJyonKTtcbn07XG4iXX0=
