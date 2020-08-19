#!/usr/bin/env bash -e
rm -rf dist
npm run lint
npm run tsc:build
npm run rollup
npm run docs
npm run test
