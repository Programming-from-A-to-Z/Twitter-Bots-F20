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

          tweetHandler(JSON.parse(body));
          res.writeHead(200);
          res.end();
        });
      }
    })
    .listen(port);

const initActivity = async (config, tweetHandler) => {
  try {
    const NGROK_AUTH_TOKEN = config.ngrok;
    if (NGROK_AUTH_TOKEN) {
      await ngrok.authtoken(config.ngrok);
    }
    const url = await ngrok.connect(PORT);
    const webhookURL = `${url}/standalone-server/webhook`;

    const server = startServer(PORT, config, tweetHandler);

    const webhook = new Autohook(config);
    await webhook.removeWebhooks();

    await webhook.start(webhookURL);
    await webhook.subscribe({
      oauth_token: config.token,
      oauth_token_secret: config.token_secret,
    });
  } catch (e) {
    console.error(e);
    process.exit(-1);
  }
};

module.exports = {
  initActivity,
};
