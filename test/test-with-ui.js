import waclient from "../lib/waclient.js";

var config = {
  puppeteer: {
    headless: false
  }
}
let client = await waclient(config)


client.sendMessage("6598194650@c.us", "test").then((msg)=>{
  console.log("sent");
  
})

