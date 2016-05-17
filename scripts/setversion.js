#!/usr/bin/env node

//usage
// ./scripts/setversion.js package.json 0.0.1-beta.1

var fs   = require('fs'),
    args = require('optimist').argv,

packageJson = JSON.parse(fs.readFileSync(args._[0]).toString());

packageJson.version = args._[1]

fs.writeFileSync(args._[0], JSON.stringify(packageJson,null, "  "));
