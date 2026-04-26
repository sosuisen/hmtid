#! /usr/bin/env node

var HMTID = require('../dist/index.umd.js')
process.stdout.write(HMTID.monotonicFactory()())
