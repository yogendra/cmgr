"use strict";

import { default as qrcode } from "qrcode-terminal";
import { Client } from "whatsapp-web.js";
import { existsSync, readFileSync, writeFileSync } from "fs";

import logger from "./logger.js";
import sleep from "./sleep.js";

/**
 * @type {Client}
 */
let _client = null;

const SESSION_FILE_PATH = "./session.json";

/** 
 *  @returns {Promise<import("whatsapp-web.js").Client>}
*/      

export function waclient(config) {
  if (_client == null) {
    logger.debug("creating WA Client");
    let defaultConfig = {};
    if (existsSync(SESSION_FILE_PATH)) {
      logger.info("Using session file");
      let sessionData = readFileSync(SESSION_FILE_PATH, "utf8");
      defaultConfig.session = JSON.parse(sessionData);
    }
    let clientConfig = {
      ...defaultConfig,
      ...config
    };


    // Use the saved values
    let client = new Client(clientConfig);
    client.on("qr", (qr) => {
      // Generate and scan this code with your phone
      qrcode.generate(qr, { small: true });
    });
    client.on("authenticated", (session) => { 
      logger.info("Client authenticated");
      writeFileSync(SESSION_FILE_PATH, JSON.stringify(session));
    });
    return new Promise(async (resolve, reject)=>{
      client.on("ready", async () => {
        await sleep(2000);
        logger.info("Client is ready!");
        _client = client;
        resolve(client);
      });
      logger.info("triggering client initialized");
      client.initialize();
    });
  }
  logger.debug("Returning existing WA Client");
  return Promise.resolve(_client);
}

export default waclient;
