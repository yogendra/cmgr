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
import sleep from "./lib/sleep.js";

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
 * A message sent report
 * @typedef {Object} MessageReport
 * @property {string} phone - phone number
 * @property {string} chat_id - sent chat id
 * @property {sring} sent_id - sent message id
 * @property {string|Object} error - Error details
 */

/**
 * Runs a campaign from the given folder. Expects a contact.csv file and
 * messages folder in it
 * @param {string} folder Folder path. It can be relative or absoluted path
 */

/** @type {import("whatsapp-web.js").Client} */

/**
 *
 * @param {string} folder - Run the campaign folder
 * @returns {Promise<MessageReport>} Array of promise of message reports
 */
export async function runFolder(folder) {
  let messageReports = null;
  logger.info("Folder:%s - Campaign Start", folder);
  if (isValidCampaignFolder(folder)) {
    let contacts = await readContacts(join(folder, "contacts.csv"));
    let messages = await readMessagesFromFolder(join(folder, "messages"));
    logger.debug("before run");
    messageReports = await run(contacts, messages);
    logger.debug("after run");
  } else {
    logger.error(`${folder}: invalid folder`);
    throw new Error(`${folder}: invalid folder`);
  }
  return messageReports;
}

/**
 * Send given messages to all contacts
 * @param {Contact[]} contacts
 * @param {Message[]} messages
 * @return {Promise<MessageReport>[]} sent message handle
 */
export async function run(contacts, messages) {
  logger.debug("in run");
  logger.info("Start processing contacts and messages");
  let messageReports = await doRun(contacts, messages);
  logger.info("Finished processing contacts and messages");
  return messageReports;
}
/**
 * Send given messages to all contacts
 * @param {Contact[]} contacts
 * @param {Message[]} messages
 * @return {Promise<MessageReport>[]} sent message handle
 */
export async function doRun(contacts, messages) {
  /**@type {Promise<MessageReport>[]} */
  let sentMessages = [];
  logger.debug("in doRun");
  for (let i = 0; i < contacts.length; i++) {
    let contact = contacts[i];
    logger.debug("%s: doRun - processing", contact.phone);
    let contactMessageReport = await runForContact(contact, messages);
    logger.debug("%s: doRun - processed", contact.phone);
    sentMessages.concat(contactMessageReport);
    if (i % 5 == 0) {
      logger.debug("Sleeping for 2 seconds");
      await sleep(2000);
    }
  }
  logger.info("Finished queuing all messages");
  return sentMessages;
}

/**
 * Run campaign for a single contact
 * @param {Contact} contact - Contact object
 * @param {Message[]} message - Messages to send
 * @return {Promise<MessageReport>[]} messages - List of messages
 */
export async function runForContact(contact, messages) {
  let sentMessages = [];
  try {
    logger.debug("contact: %s - processing", contact.phone);
    let client = await waclient();
    logger.debug("runForContact got client");
    let id = `${contact.phone}@c.us`;
    let isRegistered = await client.isRegisteredUser(id);
    logger.info(
      "phone: %s, id: %s, registered: %s",
      contact.phone,
      id,
      isRegistered
    );
    if (!isRegistered) {
      logger.warn("%s: %s not registered", contact.phone, id);
      return sentMessages;
    }
    for (let i = 0; i < messages.length; i++) {
      let message = messages[i];
      logger.debug(
        "contact: %s (%s) - posting message (%s)",
        contact.phone,
        id,
        message.text || message.path
      );
      let sentMessage = await postMessage(id, messages[i]);

      logger.info("chat:%s sent_message_id:%s sent", id, sentMessage.sent_id);      
      sentMessages.push(sentMessage);
    }
    logger.debug("contact: %s - completed", contact.phone);
    return sentMessages;
  } catch (e) {
    logger.warning("contact: %s - error running (%s)", contact.phone, e);
    return sentMessages;    
  }
}
/**
 * @param {string} id - contact id, ending with @c.us
 * @param {Message} messages - Message object
 * @returns {Promise<MessageReport>} Returned message
 */
async function postMessage(id, message) {
  /** @type {MessageReport}  */
  let sentMessage = null;
  let messageReport = {
    chat_id: id,
  };
  let client = await waclient();
  if (isMediaMessage(message)) {
    logger.debug("chat: %s, type: MEDIA, message: %s", id, message);
    let mediaMessage = MessageMedia.fromFilePath(message.path);
    let messageOptions = { caption: message.caption };
    sentMessage = await client.sendMessage(id, mediaMessage, messageOptions);
  } else if (isTextMessage(message)) {
    logger.debug(
      "chat:%s type:TEXT message: %s",
      id,
      message.text || message.path
    );
    let content = message.text || readFileSync(message.path, "utf8");

    sentMessage = await client.sendMessage(id, content);
  } else {
    logger.warning("unknown message type");
    messageReport.error = "Unknonw message type";
  }
  messageReport.sent_id = sentMessage.id._serialized;
  return messageReport;
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
