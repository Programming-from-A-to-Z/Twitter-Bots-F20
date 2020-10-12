const dotenv = require("dotenv");
dotenv.config();

const config = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  token: process.env.TWITTER_ACCESS_TOKEN,
  token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  env: process.env.TWITTER_WEBHOOK_ENV,
  ngrok: process.env.NGROK_AUTH_TOKEN,
};

const Twitter = require("./twitter.js");
const twitter = new Twitter(config);

start();
async function start() {
  await twitter.initActivity(tweetHandler);
}

async function tweetHandler(for_user_id, tweet) {
  const { user, id_str } = tweet;
  if (user.id_str !== for_user_id) {
    await twitter.reply(id_str, "hi back!");
  }
}
