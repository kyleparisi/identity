if (!process.env.AUTH0_OAUTH_TOKEN_URL) require("./config/env");
const request = require("request");

let oauth_token = {};
function getToken(cb) {
  request.post(
    {
      method: "POST",
      url: process.env.AUTH0_OAUTH_TOKEN_URL,
      headers: { "content-type": "application/json" },
      body: {
        audience: process.env.AUTH0_AUDIENCE,
        grant_type: process.env.AUTH0_GRANT_TYPE,
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET
      },
      json: true
    },
    function(error, response, body) {
      if (error) throw new Error(error);
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

  return oauth_token;
};
