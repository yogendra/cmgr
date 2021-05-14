"use strict";

import { default as qrcode } from "qrcode-terminal";
import { Client } from "whatsapp-web.js";
import { existsSync, readFileSync, writeFileSync } from "fs";
/**
 * @type {Client}
 */
let client = null;

const SESSION_FILE_PATH = "./session.json";

/** 
 * @param {boolean} relogin - force login
 *  @returns {import("whatsapp-web.js").Client}
*/      


export async function waclient() {
  if (client == null) {
    let clientConfig = {};
    if (existsSync(SESSION_FILE_PATH)) {
        let sessionData = readFileSync(SESSION_FILE_PATH, "utf8");
        clientConfig.session = JSON.parse(sessionData);
    }

    // Use the saved values
    client = new Client(clientConfig);
    client.on("qr", (qr) => {
      // Generate and scan this code with your phone
      qrcode.generate(qr, { small: true });
    });
    client.on("ready", () => {
      console.log("Client is ready!");

    });
    client.on("authenticated", (session) => {    
      writeFileSync(SESSION_FILE_PATH, JSON.stringify(session));
    });
    await client.initialize();
  }
  return client;
}

export default waclient;
