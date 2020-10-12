console.log("hi twitter");

const dotenv = require("dotenv");

const Twitter = require("./twitter.js");
dotenv.config();

const config = {
  CONSUMER_KEY: process.env.TWITTER_CONSUMER_KEY,
  CONSUMER_SECRET: process.env.TWITTER_CONSUMER_SECRET,
  ACCESS_TOKEN: process.env.TWITTER_ACCESS_TOKEN,
  ACCESS_TOKEN_SECRET: process.env.TWITTER_ACCESS_TOKEN_SECRET,
};

const twitter = new Twitter(config);

tweet();

async function tweet() {
  const response = await twitter.tweet(`A2Z 4EVER ${Math.random()}`);
  console.log(response.id);
  console.log(response.text);
}
