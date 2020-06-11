#!/usr/bin/env bash
rm -rf dist
npm run tsc -- --project tsconfig.build.json
# Rename ts declarations output 'src' -> 'types'
mv dist/src dist/types
npm run rollup
npm run docs
