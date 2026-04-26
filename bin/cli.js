#! /usr/bin/env node

import { monotonicFactory } from '../dist/index.esm.js'
process.stdout.write(monotonicFactory()())
