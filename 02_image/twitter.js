const OAuth = require("oauth");

class Twitter {
  constructor(config) {
    this.config = config;
    this.oauth = new OAuth.OAuth(
      "https://api.twitter.com/oauth/request_token",
      "https://api.twitter.com/oauth/access_token",
      this.config.CONSUMER_KEY,
      this.config.CONSUMER_SECRET,
      "1.0A",
      null,
      "HMAC-SHA1"
    );
  }

  addMetaData(mediaIdStr, alt_text) {
    const postBody = {
      media_id: mediaIdStr,
      alt_text: {
        text: alt_text,
      },
    };
    return new Promise((resolve, reject) => {
      this.oauth.post(
        "https://upload.twitter.com/1.1/media/metadata/create.json",
        this.config.ACCESS_TOKEN, // oauth_token (user access token)
        this.config.ACCESS_TOKEN_SECRET, // oauth_secret (user secret)
        postBody, // post body
        "", // post content type ?
        function (err, data, res) {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            resolve(JSON.parse(data));
          }
        }
      );
    });
  }

  upload(b64content) {
    const postBody = {
      media_data: b64content,
    };
    return new Promise((resolve, reject) => {
      this.oauth.post(
        "https://upload.twitter.com/1.1/media/upload.json",
        this.config.ACCESS_TOKEN, // oauth_token (user access token)
        this.config.ACCESS_TOKEN_SECRET, // oauth_secret (user secret)
        postBody, // post body
        "", // post content type ?
        function (err, data, res) {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            resolve(JSON.parse(data));
          }
        }
      );
    });
  }

  tweet(status, media_ids) {
    const postBody = { status, media_ids };
    return new Promise((resolve, reject) => {
      this.oauth.post(
        "https://api.twitter.com/1.1/statuses/update.json",
        this.config.ACCESS_TOKEN, // oauth_token (user access token)
        this.config.ACCESS_TOKEN_SECRET, // oauth_secret (user secret)
        postBody, // post body
        "", // post content type ?
        function (err, data, res) {
          if (err) {
            console.log(err);
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
