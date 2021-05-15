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
import logger from "./lib/logger.js";

/**
 * A contact
 * @typedef {Object} Contact
 * @property {string} phone - Phone number os contact
 * @property {string} name - Name of contact
 * @property {string} nickname - Nick name of cotact
 */
/**
 * A message
 * @typedef {Object} Message
 * @property {string} text - Text message to send
 * @property {string} path - Path of the file of type text, image and video
 * @property {string} caption - Caption for media files (image and video)
 */

/**
 * Runs a campaign from the given folder. Expects a contact.csv file and
 * messages folder in it
 * @param {string} folder Folder path. It can be relative or absoluted path
 */
export function runFolder(folder) {
  logger.info("Folder:%s - Campaign Start", folder);
  if (isValidCampaignFolder(folder)) {
    Promise.all([
      readContacts(join(folder, "contacts.csv")),
      readMessagesFromFolder(join(folder, "messages")),
    ]).then(async ([contacts, messages]) => {
      await run(contacts, messages);    
      logger.info("Folder:%s - Campaign End", folder);
    }).catch((err)=>{
      logger.error(err);
    });
  } else {
    logger.error(`${folder}: invalid folder`);
  }
}

/**
 * Send given messages to all contacts
 * @param {Contact[]} contacts
 * @param {Message[]} messages
 */
export async function run(contacts, messages) {
  for (let i = 0; i < contacts.length; i++) {
    await runForContact(contacts[i], messages);
    if (i % 5 == 0) {
      sleep(0.5);
    }
  }  
  (await waclient()).destroy();
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
/**
 * Run campaign for a single contact
 * @param {Contact} contact - Contact object
 * @param {Message[]} messages - List of messages
 */
export async function runForContact(contact, messages) {
  try {
    let wwa = await waclient();
    logger.debug("contact: %s - processing", contact.phone);
    let id = /.*@c.us$/.test(contact.phone) ? contact.phone: `${contact.phone}@c.us`;
    let isRegistered = await wwa.isRegisteredUser(id);
    if (!isRegistered) {
      logger.error("%s: %s not registered", contact.phone, id);
      return;
    }

    for (let i = 0; i < messages.length; i++) {
      let message = messages[i];
      logger.debug(
        "contact: %s (%s) - posting message (%s)",
        contact.phone,
        id,
        message.text || message.path
      );
      await postMessage(wwa, id, messages[i]);
    }
  } catch (e) {
    logger.error(e);
    return;
  }
}
/**
 * @param {import("whatsapp-web.js").Client} waclient
 * @param {string} id - contact id, ending with @c.us
 * @param {Message} messages - Message object
 * @returns {*}
 */
async function postMessage(waclient, id, message) {
  let sentMessage = null;
  if (isMediaMessage(message)) {
    logger.debug("chat: %s, type: MEDIA, message: %s", id, message);
    let mediaMessage = MessageMedia.fromFilePath(message.path);
    let messageOptions = { caption: message.caption };
    sentMessage = await waclient.sendMessage(
      id,
      mediaMessage,
      messageOptions
    );
  } else if (isTextMessage(message)) {
    let content = message.text || readFileSync(message.path, "utf8");
    logger.debug("chat:%s type:TEXT message: %s", id, message.text||message.path);
    sentMessage = await waclient.sendMessage(id, content);
  } else {
    logger.error("unknown message type");
  }
  logger.info(
    "chat:%s sent_message_id: %s sent",
    id,
    sentMessage.id._serialized
  );
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
  if (!valid) {
    logger.error("%s: does not exists", folder);
    return valid;
  }
  valid = valid && lstatSync(folder).isDirectory();
  if (!valid) {
    logger.error("%s: not a directory", folder);
    return valid;
  }
  valid = valid && existsSync(join(folder, "contacts.csv"));
  if (!valid) {
    logger.error("%s: does not have contacts files", folder);
    return valid;
  }
  valid = valid && existsSync(join(folder, "messages"));
  if (!valid) {
    logger.error("%s: messages does not exists", folder);
    return valid;
  }
  valid = valid && lstatSync(join(folder, "messages")).isDirectory();
  if (!valid) {
    logger.error("%s: messages is not a directory", folder);
    return valid;
  }
  return valid;
}

/**
 * Read contacts from a csv file
 * @param {string} csvFile
 * @returns {Promise<Contact[]>} - Promise that return an array of contacts
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
        if (contact.phone) {
          contacts.push(cleanupContact(contact));
        }
      })
      .on("end", () => {
        logger.info(
          "Finished loading  %s contacts from %s",
          contacts.length,
          csvFile
        );
        resolve(contacts);
      });
  });
}
function cleanupContact(contact) {
  contact.phone = cleanPhoneNumber(contact.phone);
  return contact;
}
/**
 *
 * @param {string} phoneNumber
 */
function cleanPhoneNumber(phoneNumber) {
  return phoneNumber
    .replaceAll(/\s+/g, "") // remove spaces
    .replaceAll(/\D+/g, "");
}
/**
 *
 * @param {string} csvFile
 * @returns {Promise<Message[]>} - Promise resolving with an array of messages.
 */
function readMessagesFromFolder(messagesFolder) {
  return new Promise((resolve, reject) => {
    readdir(messagesFolder, (err, files) => {
      if (err) {
        logger.error(err);
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
