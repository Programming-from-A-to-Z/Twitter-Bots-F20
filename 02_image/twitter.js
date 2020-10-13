const { Autohook, validateWebhook, validateSignature } = require("twitter-autohook");

const url = require("url");
const ngrok = require("ngrok");
const http = require("http");

const PORT = process.env.PORT || 4242;

const startServer = (port, auth, tweetHandler) =>
  http
    .createServer((req, res) => {
      const route = url.parse(req.url, true);
      if (!route.pathname) {
        return;
      }

      if (route.query.crc_token) {
        try {
          if (!validateSignature(req.headers, auth, url.parse(req.url).query)) {
            console.error("Cannot validate webhook signature");
            return;
          }
        } catch (e) {
          console.error(e);
        }

        const crc = validateWebhook(route.query.crc_token, auth, res);
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify(crc));
      }

      if (req.method === "POST" && req.headers["content-type"] === "application/json") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            if (!validateSignature(req.headers, auth, body)) {
              console.error("Cannot validate webhook signature");
              return;
            }
          } catch (e) {
            console.error(e);
          }

          let json = JSON.parse(body);
          if (json.tweet_create_events) {
            tweetHandler(json.for_user_id, json.tweet_create_events[0]);
          }
          res.writeHead(200);
          res.end();
        });
      }
    })
    .listen(port);

const OAuth = require("oauth");

class Twitter {
  constructor(config) {
    this.config = config;
    this.oauth = new OAuth.OAuth(
      "https://api.twitter.com/oauth/request_token",
      "https://api.twitter.com/oauth/access_token",
      this.config.consumer_key,
      this.config.consumer_secret,
      "1.0A",
      null,
      "HMAC-SHA1"
    );
  }

  async initActivity(tweetHandler) {
    try {
      const NGROK_AUTH_TOKEN = this.config.ngrok;
      if (NGROK_AUTH_TOKEN) {
        await ngrok.authtoken(this.config.ngrok);
      }
      const url = await ngrok.connect(PORT);
      const webhookURL = `${url}/standalone-server/webhook`;
      const server = startServer(PORT, this.config, tweetHandler);
      const webhook = new Autohook(this.config);
      await webhook.removeWebhooks();

      await webhook.start(webhookURL);
      await webhook.subscribe({
        oauth_token: this.config.token,
        oauth_token_secret: this.config.token_secret,
      });
    } catch (e) {
      console.error(e);
      process.exit(-1);
    }
  }

  async addMetaData(mediaIdStr, alt_text) {
    const postBody = {
      media_id: mediaIdStr,
      alt_text: {
        text: alt_text,
      },
    };
    const url = "https://upload.twitter.com/1.1/media/metadata/create.json";
    return await this.post(url, postBody);
  }

  async upload(b64content) {
    const url = "https://upload.twitter.com/1.1/media/upload.json";
    const postBody = {
      media_data: b64content,
    };
    return await this.post(url, postBody);
  }

  async tweet(status, media_ids) {
    const url = "https://api.twitter.com/1.1/statuses/update.json";
    const postBody = { status, media_ids };
    return await this.post(url, postBody);
  }

  async reply(in_reply_to_status_id, status, media_ids) {
    const url = "https://api.twitter.com/1.1/statuses/update.json";
    const postBody = { in_reply_to_status_id, status, media_ids };
    postBody.auto_populate_reply_metadata = true;
    return await this.post(url, postBody);
  }

  async post(url, postBody) {
    return new Promise((resolve, reject) => {
      this.oauth.post(
        url,
        this.config.token, // oauth_token (user access token)
        this.config.token_secret, // oauth_secret (user secret)
        postBody, // post body
        "", // post content type ?
        function (err, data, res) {
          if (err) {
            console.error(err);
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
