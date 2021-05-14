import {
  createReadStream,
  existsSync,
  readFileSync,
  lstatSync,
  readdir,
} from "fs";
import { default as csv } from "csv-parser";
import pkg from "whatsapp-web.js";
const { MessageMedia } = pkg;
import { waclient } from "./lib/waclient.js";
import { join } from "path";

/**
 * Runs a campaign from the given folder. Expects a contact.csv file and messages folder in it
 * @param {string} folder Folder path. It can be relative or absoluted path
 */
export function runFolder(folder) {
  console.debug("Run Folder: %s", folder);
  if (isValidCampaignFolder(folder)) {    
    Promise.all([      
      readContacts(folder + "/contacts.csv"),
      readMessagesFromFolder(folder + "/messages/"),
    ]).then(([contacts, messages]) => {
      run(contacts, messages);
    });
  }else{
    console.error(`${folder}: invalid folder`);
  }
}

/**
 *
 * @param {Array<*>} contacts
 * @param {Array<*} messages
 */
export async function run(contacts, messages) {
  for (let i = 0; i < contacts.length; i++) {
    await runForContact(contacts[i], messages);
    if (i % 5 == 0){
      sleep(0.5);
    }

  }
  waclient.destroy();
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}  
/**
 *
 * @param {*} contact
 * @param {Array<*>} messages
 */
export async function runForContact(contact, messages) {
  try {
    let wwa = await waclient();
    console.debug("contact: %s - processing", contact.phone);
    let isRegistered = await wwa.isRegisteredUser(contact.phone);
    if (!isRegistered) {
      return;
    }

    for (let i = 0; i < messages.length; i++) {
      console.debug(
        "contact: %s - posting message (%s)",
        contact.phone,
        messages[i].path
      );
      await postMessage(wwa, contact, messages[i]);
    }
  } catch (e) {
    console.error(e);
    return;
  }
}
/**
 *
 *
 * @param {import("whatsapp-web.js").Client} waclient
 * @param {*} contact
 * @param {*} message
 * @returns {*}
 */
async function postMessage(waclient, contact, message) {
  let sentMessage = null;
  if (isMediaMessage(message)) {
    console.debug("MEDIA chat: %s, message: %s", contact.phone, message);
    let mediaMessage = MessageMedia.fromFilePath(message.path);
    let messageOptions = { caption: message.caption };
    sentMessage = await waclient.sendMessage(
      contact.phone,
      mediaMessage,
      messageOptions
    );
  } else if (isTextMessage(message)) {
    console.debug("TEXT chat: %s, message: %s", contact.phone, message);
    let content = message.text || readFileSync(message.path, "utf8");
    sentMessage = await waclient.sendMessage(contact.phone, content);
  } else {
    console.error("unknown message type");
  }
}

function isMediaMessage(message) {
  if (message.path && /(jpg|jpeg|mp4|png)$/.test(message.path)) {
    return true;
  }
}
function isTextMessage(message) {
  return message.text || /\.(txt)$/.test(message.path);
}
function isValidCampaignFolder(folder) {
  let valid = existsSync(folder);
  valid = valid && lstatSync(folder).isDirectory();
  valid = valid && existsSync(folder + "/contacts.csv");
  valid = valid && existsSync(folder + "/messages");
  valid = valid && lstatSync(folder + "/messages").isDirectory();
  return valid;
}
/**
 *
 * @param {string} csvFile
 * @returns {Promise<Array<*>>}
 */
function readContacts(csvFile) {
  return new Promise((resolve, reject) => {
    if (!existsSync(csvFile)) {
      reject("File not found");
    }
    let contacts = [];
    createReadStream(csvFile)
      .pipe(csv())
      .on("data", (contact) => {
        if (contact.phone){
          contacts.push(cleanupContact(contact))
        }
      })
      .on("end", () => {
        console.debug("Finished reading contacts");
        resolve(contacts);
      });
  });
}
function cleanupContact(contact) {
  return {
    phone: cleanPhoneNumber(contact.phone),
    name: contact.name,
    nickname: contact.nickname,
  };
}
/**
 *
 * @param {string} phoneNumber
 */
function cleanPhoneNumber(phoneNumber) {
  let n = phoneNumber
    .replace(/^\+/, "") // remove leading '+'
    .replace(/@c\.us$/, "") // remove trailing '@c.us'
    .replace(/\s+/g, "") // remove spaces
    .replaceAll(/\D+/g, "")
    .concat("@c.us"); // remove non-digits
}
/**
 *
 * @param {string} csvFile
 * @returns {Promise<Array<*>>}
 */
function readMessagesFromFolder(messagesFolder) {
  return new Promise((resolve, reject) => {
    readdir(messagesFolder, (err, files) => {
      if (err) {
        console.debug(err);
        reject(err);
        return;
      } else {
        let messages = files
          .filter((x) => /\.(txt|jpg|jpeg|png|mp4)$/.test(x))
          .map((x) => {
            return { path: join(messagesFolder, x) };
          });
        resolve(messages);
      }
    });
  });
}
