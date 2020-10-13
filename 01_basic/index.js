console.log("hi twitter");

const dotenv = require("dotenv");
dotenv.config();

const Twitter = require("./twitter.js");

const config = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  token: process.env.TWITTER_ACCESS_TOKEN,
  token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
};

const twitter = new Twitter(config);

tweet();

async function tweet() {
  const response = await twitter.tweet(`A2Z 4EVER ${Math.random()}`);
  console.log(response.id);
  console.log(response.text);
}
