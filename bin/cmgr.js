#!/usr/bin/env node
console.log("in cmgr.js");
import { runFolder } from '../index.js';


let folder = process.argv[2] || './campaign';

runFolder(folder);

