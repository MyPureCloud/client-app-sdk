#!/usr/bin/env bash

node_modules/jshint/bin/jshint src/purecloud_app.js

node_modules/jsdoc/jsdoc.js -X ./src/ > doc/doc.json

./doc_handlebars.js doc/doc.json doc/doc.hbs > doc/doc.md
