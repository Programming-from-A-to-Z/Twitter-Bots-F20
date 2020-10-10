const OAuth = require("oauth");

class Twitter {
  constructor(config) {
    this.oauth = new OAuth.OAuth(
      "https://api.twitter.com/oauth/request_token",
      "https://api.twitter.com/oauth/access_token",
      process.env.TWITTER_CONSUMER_KEY,
      process.env.TWITTER_CONSUMER_SECRET,
      "1.0A",
      null,
      "HMAC-SHA1"
    );
  }

  tweet(status) {
    const postBody = {
      status: status,
    };

    return new Promise((resolve, reject) => {
      this.oauth.post(
        "https://api.twitter.com/1.1/statuses/update.json",
        process.env.TWITTER_ACCESS_TOKEN, // oauth_token (user access token)
        process.env.TWITTER_ACCESS_TOKEN_SECRET, // oauth_secret (user secret)
        postBody, // post body
        "", // post content type ?
        function (err, data, res) {
          if (err) {
            reject(err);
          } else {
            resolve(JSON.parse(data));
          }
        }
      );
    });
  }
}

module.exports = Twitter;
