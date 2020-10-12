const dotenv = require("dotenv");
dotenv.config();

const Twitter = require("./twitter.js");

const config = {
  token: process.env.TWITTER_ACCESS_TOKEN,
  token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  env: process.env.TWITTER_WEBHOOK_ENV,
  ngrok: process.env.NGROK_AUTH_TOKEN,
};

async function tweetHandler(event) {
  console.log("hello event");
  if (event.tweet_create_events) {
    const tweet = event.tweet_create_events[0];
    const reply_screen_name = tweet.in_reply_to_screen_name;
    const screen_name = tweet.user.screen_name;
    const txt = tweet.text;
    console.log({ reply_screen_name, screen_name, txt });
  }
}

Twitter.initActivity(config, tweetHandler);
