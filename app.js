/**
 * Created by jamie on 26/11/2016.
 */
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var Jimp = require("jimp");
var path = require('path');
app.use(express.static(path.join(__dirname)));
var https = require('https');
var Xray = require('x-ray');
var x = Xray();


var FB = require('fb');
FB.setAccessToken(process.env.PAGE_ACCESS_TOKEN);

var apiai = require('apiai');
var aiapp = apiai("ec864f53aefd4b4fbf9c1fd6fefbe256");
var firebase = require('firebase');

var config = {
    apiKey: "AIzaSyDAjJNh-YSUyDz5D675BrQoifhQ0bfDebc",
    authDomain: "chatbetty-76e6f.firebaseapp.com",
    databaseURL: "https://chatbetty-76e6f.firebaseio.com",
    storageBucket: "chatbetty-76e6f.appspot.com",
    messagingSenderId: "575665251318"
};
firebase.initializeApp(config);

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 8080));

var Betfair = require('betfair-api-ng');

var appkey = 'KpCoeurXPW5aI2mF';
var ssid = 'mS5XUYJ9mBvSnumiuD7wogYT5zSn2JUKT3qQMQDaMt8=';
var DEFAULT_ENCODING = 'utf-8';
var DEFAULT_JSON_FORMAT = '\t';

function createImage(score1, score2, callback){
    var FileName = Math.floor((Math.random() * 9999999) + 1);
    console.log(FileName);
    Jimp.read("https://raw.githubusercontent.com/jambobjambo/Betty/master/image/background.png", function (err, background) {
        Jimp.read("https://raw.githubusercontent.com/jambobjambo/Betty/master/image/team1.png", function (err, team1) {
            Jimp.read("https://raw.githubusercontent.com/jambobjambo/Betty/master/image/team2.png", function (err, team2) {
                Jimp.read("https://raw.githubusercontent.com/jambobjambo/Betty/master/image/circle1.png", function (err, circle1) {
                    Jimp.read("https://raw.githubusercontent.com/jambobjambo/Betty/master/image/circle2.png", function (err, circle2) {
                        var image = new Jimp(780, 410, function (err, image) {
                            image.composite(background, 0, 0);
                            image.composite(team1, 30, 15);
                            image.composite(team2, 450, 15);
                            image.composite(circle1, 30, 310);
                            image.composite(circle2, 450, 310);
                            Jimp.loadFont(Jimp.FONT_SANS_64_WHITE).then(function (font) { // load font from .fnt file
                                image.print(font, 130, 330, score1);
                                image.print(font, 550, 330, score2);
                                image.write(FileName + ".png", function () {
                                    callback(FileName + '.png');
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}


// Server frontpage
function GetOdss(teams, callback){
    Betfair.login({
        applicationKey: 'KpCoeurXPW5aI2mF',
        username: 'agwelford',
        password: 'Addington40',

        certFile: 'ChatBetty.crt',
        keyFile: 'client.key'
    }, function (err, betfair) {
        if (err) {
            return console.error(err);
        }

        // get markets matchOdss, over/Under 0.5 from event 'Sunderland v Liverpool'
        betfair.betting.listEvents({
            textQuery: 'Arsenal v Stoke'
        }, function (err, res) {
            var event = res[0].event.id;
            x('https://www.betfair.com/sport/football/event?eventId=' + event, ['.com-bet-button'])(function(err, odds) {
                callback(odds);
            })
        });
    });

}

// Facebook Webhook
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'chat_betty_verification') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});

app.get('/image', function (req, res) {
    res.send('Hi');
});

// handler receiving messages
app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];

        if (event.message && event.message.text) {
            var request = aiapp.textRequest(event.message.text, {
                sessionId: event.sender.id
            });
            request.on('response', function (response) {
                if (response.result.action == "PLACE_BET") {
                    showodds(event.sender.id, response.result.parameters);
                } else {
                    sendMessage(event.sender.id, {text: response.result.fulfillment.speech});
                }
            });
            request.on('error', function (error) {
                console.log(error);
            });
            request.end();
        }
    }
    res.sendStatus(200);
});

// generic function sending messages
function sendMessage(recipientId, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
}

function introMessage(recipientId, message, NextMessage) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        } else {
            request({
                url: 'https://graph.facebook.com/v2.6/me/messages',
                qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
                method: 'POST',
                json: {
                    recipient: {id: recipientId},
                    message: NextMessage
                }
            }, function(error, response, body) {
                if (error) {
                    console.log('Error sending message: ', error);
                } else if (response.body.error) {
                    console.log('Error: ', response.body.error);
                }
            });
        }
    });
}

// send rich message with kitten
function showodds(recipientId, parameters) {
        GetOdss('Arsenal v Stoke', function(odds) {
            createImage(odds[0], odds[2], function (imageName) {
                message = {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "generic",
                            "elements": [{
                                "title": "Premier League, 3rd December",
                                "subtitle": "12:30PM",
                                "image_url": "https://chatbetty.herokuapp.com/" + imageName,
                                "buttons": [
                                    {
                                        "title": "Place a Bet",
                                        "type": "postback",
                                        "payload": "PLACE_BET"
                                    },
                                    {
                                        "title": "Add to Accumulator",
                                        "type": "postback",
                                        "payload": "ADD_TO_ACC"
                                    },
                                    {
                                        "title": "Update",
                                        "type": "postback",
                                        "payload": "UPDATE"
                                    }
                                ]
                            }]
                        }
                    }
                };
                sendMessage(recipientId, message);
            });
        });
    /*var ref = firebase.database().ref('user/');
    ref.child(recipientId).once('value', function(snapshot) {
        var Query = snapshot.val().query;*/


    /*
    });*/
};