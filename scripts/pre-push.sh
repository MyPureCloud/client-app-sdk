#!/usr/bin/env bash -e
rm -rf dist
npm run build
npm run docs
npm run test
