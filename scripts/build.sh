#!/usr/bin/env bash
rm -rf dist
npm run tsc:build
npm run rollup
npm run docs
