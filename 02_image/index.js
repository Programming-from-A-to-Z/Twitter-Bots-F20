console.log("hi twitter");
const dotenv = require("dotenv");
const Twitter = require("./twitter.js");
dotenv.config();

const fetch = require("node-fetch");
const Tenor = require("tenorjs").client({
  Key: process.env.TENOR_KEY, // https://tenor.com/developer/keyregistration
  Filter: "medium", // "off", "low", "medium", "high", not case sensitive
  Locale: "en_US", // Your locale here, case-sensitivity depends on input
  MediaFilter: "minimal", // either minimal or basic, not case sensitive
  DateFormat: "D/MM/YYYY - H:mm:ss A", // Change this accordingly
});

const config = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  token: process.env.TWITTER_ACCESS_TOKEN,
  token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
};

const twitter = new Twitter(config);

tweet();

async function tweet() {
  const gif = await getGIF();
  console.log(gif.substring(0, 100));
  const response1 = await twitter.upload(gif);
  console.log(response1);
  // const response2 = await twitter.addMetaData(response1.media_id_string, "rainbow GIF");
  // console.log(response2);
  const response3 = await twitter.tweet(`A2Z 4EVER ${Math.random()}`, [response1.media_id_string]);
  console.log(response3.id);
  console.log(response3.text);
}

function random(arr) {
  let i = Math.floor(Math.random() * arr.length);
  return arr[i];
}
async function getGIF() {
  const gifs = await Tenor.Search.Query("rainbow", "11");
  let gif = random(gifs);
  let url = gif.media[0].tinygif.url;
  let response = await fetch(url);
  let blob = await response.blob();
  let buffer = await blob.arrayBuffer();
  let base64String = Buffer.from(buffer).toString("base64");
  return base64String;
}
