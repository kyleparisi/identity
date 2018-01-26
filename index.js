if (!process.env.IDENTITY_OAUTH_TOKEN_URL) require("./config/env");
const debug = require("debug")(process.env.DEBUG_NAMESPACE + ":identity");
global.debug = debug;
const request = require("request");

let oauth_token = {};
function getToken(cb) {
  debug("Getting oauth token");
  request.post(
    {
      method: "POST",
      url: process.env.IDENTITY_OAUTH_TOKEN_URL,
      headers: { "content-type": "application/json" },
      body: {
        audience: process.env.IDENTITY_AUDIENCE,
        grant_type: process.env.IDENTITY_GRANT_TYPE,
        client_id: process.env.IDENTITY_CLIENT_ID,
        client_secret: process.env.IDENTITY_CLIENT_SECRET
      },
      json: true
    },
    function(error, response, body) {
      if (error) {
        debug("Error: %s", error);
        return;
      }
      debug("Successfully got oauth token");
      oauth_token = body;
      oauth_token.expires = (Math.ceil(new Date().getTime() / 1000)) + body.expires_in;
      if (cb) {
        cb(oauth_token);
      }
    }
  );
}
getToken();


module.exports = function (cb) {
  const relativeExpiration = Math.floor(new Date().getTime() / 1000) - oauth_token.expires - 60;
  if (relativeExpiration <= 0) {
    getToken(function (token) {
      if (cb) {
        return cb(token)
      }
    })
  }
  debug("Using cached token");
  return oauth_token;
};
