#!/usr/bin/env node

import pkg from 'ncp';
const {ncp} = pkg;
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import {resolve} from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const sampledir =  resolve(join(__dirname,'../example/campaign'));
const destdir = resolve(process.argv[2] || join(".","campaign"));
console.log({src: sampledir, dest: destdir});

ncp(sampledir, destdir, (err)=>{
  if (err) {
    return console.error(err);
  }
  console.log('done!');
});

console.log(`Created campaign folder: ${destdir}`);
