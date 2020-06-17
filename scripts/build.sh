#!/usr/bin/env bash
rm -rf dist
npm run tsc -- --project tsconfig.build.json
npm run rollup
npm run docs
