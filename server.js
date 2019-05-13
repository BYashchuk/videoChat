require("dotenv").config();
var path = require("path");
var AccessToken = require("twilio").jwt.AccessToken;
var VideoGrant = AccessToken.VideoGrant;
var express = require("express");
var webpack = require("webpack");
var faker = require("faker");

var app = express();
if (process.env.NODE_ENV === "DEV") {
    var webpackDevMiddleware = require("webpack-dev-middleware");
    var webpackConfig = require("./webpack.config.js");
    const webpackCompiler = webpack(webpackConfig);
    app.use(webpackDevMiddleware(webpackCompiler));
    app.use(express.static(path.join(__dirname, "app")));
} else if (process.env.NODE_ENV === "PROD") {
    app.use(express.static(path.join(__dirname, "dist")));
}

app.get("/token", function (request, response) {
    var identity = faker.name.findName();

    var token = new AccessToken(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_API_KEY,
        process.env.TWILIO_API_SECRET
    );

    token.identity = identity;

    var grant = new VideoGrant();
    token.addGrant(grant);

    response.send({
        identity: identity,
        token: token.toJwt()
    });
});

var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("Express server listening on *:" + port);
});
