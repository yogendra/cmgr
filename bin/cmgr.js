#!/usr/bin/env node
import { runFolder } from "../index.js";
import waclient from "../lib/waclient.js";
import logger from "../lib/logger.js";

let folder = process.argv[2] || "./campaign";

logger.debug("Creating WAclient");
let client = await waclient({
  puppeteer: {
    headless: process.env.CMGR_DEBUG=1
  }
});
let reports = await runFolder(folder);
logger.debug("Finished Running Folder");
await client.destroy()
logger.debug("Bye!");
