import waclient from "../lib/waclient.js";

var config = {
  puppeteer: {
    headless: false
  }
}
let client = await waclient(config)

let isRegistered = await client.isRegisteredUser("6598194650@c.us");
let message = await client.sendMessage("6598194650@c.us", "test");

console.log(message);
