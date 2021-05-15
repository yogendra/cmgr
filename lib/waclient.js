"use strict";

import { default as qrcode } from "qrcode-terminal";
import { Client } from "whatsapp-web.js";
import { existsSync, readFileSync, writeFileSync } from "fs";

import logger from "./logger.js";

/**
 * @type {Client}
 */
let client = null;

const SESSION_FILE_PATH = "./session.json";

/** 
 *  @returns {import("whatsapp-web.js").Client}
*/      


export async function waclient(config) {
  if (client == null) {
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
    client = new Client(clientConfig);
    client.on("qr", (qr) => {
      // Generate and scan this code with your phone
      qrcode.generate(qr, { small: true });
    });
    client.on("ready", () => {
      logger.info("Client is ready!");

    });
    client.on("authenticated", (session) => {    
      writeFileSync(SESSION_FILE_PATH, JSON.stringify(session));
    });
    await client.initialize();
    
  }
  return client;
}

export default waclient;
