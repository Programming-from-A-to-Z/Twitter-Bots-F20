const dotenv = require("dotenv");
dotenv.config();

const Twitter = require("./twitter.js");

const config = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  token: process.env.TWITTER_ACCESS_TOKEN,
  token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  env: process.env.TWITTER_WEBHOOK_ENV,
  ngrok: process.env.NGROK_AUTH_TOKEN,
};

const twitter = new Twitter(config);

start();
async function start() {
  await twitter.initActivity(tweetHandler);
}

async function tweetHandler(event) {
  if (event.tweet_create_events) {
    const { user, id_str } = event.tweet_create_events[0];
    if (user.id_str !== event.for_user_id) {
      await twitter.reply(id_str, "hi back!");
    }
  }
}
