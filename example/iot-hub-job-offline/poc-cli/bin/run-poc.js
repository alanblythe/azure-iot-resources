#!/usr/bin/env node
// import packageJsonExample1 from "../package.json" assert { type: "json" };
// import '../src/cli.mjs';
// cli(process.argv);

//import cli from '../src/cli';
//esm.cli(process.argv);
require = require('esm')(module /*, options*/);
require('../src/cli').cli(process.argv);