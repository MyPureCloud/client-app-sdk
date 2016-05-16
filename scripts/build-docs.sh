#!/usr/bin/env bash

jshint src

jsdoc --explain --package ./package.json --recurse ./src > doc/doc.json

./scripts/doc_handlebars.js doc/doc.json doc/doc.hbs > doc/doc.md
