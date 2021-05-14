#!/usr/bin/env node
import { runFolder } from '../index.js';

let folder = process.argv[2] || './campaign';

runFolder(folder);

