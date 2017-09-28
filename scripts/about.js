#!/usr/bin/env node

var ClientApp = require('../dist/main.js');

(function(){
    console.log('Version:', ClientApp.version);
    console.log(ClientApp.about());
})();
