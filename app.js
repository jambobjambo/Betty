/**
 * Created by jamie on 26/11/2016.
 */
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var gm = require('gm');

var FB = require('fb');
FB.setAccessToken(process.env.PAGE_ACCESS_TOKEN);

var apiai = require('apiai');
var aiapp = apiai("ec864f53aefd4b4fbf9c1fd6fefbe256");
var firebase = require('firebase');

var config = {
    apiKey: "AIzaSyDSWF3sW_GqpnVLWOdPLkFJyogs90wlExg",
    authDomain: "flashybot-e7a61.firebaseapp.com",
    databaseURL: "https://flashybot-e7a61.firebaseio.com",
    storageBucket: "flashybot-e7a61.appspot.com",
    messagingSenderId: "802553604379"
};
firebase.initializeApp(config);

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 8080));

// Server frontpage
app.get('/', function (req, res) {
    res.send('This is TestBot Server');
});

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
        console.log(event);
        console.log(event.message);

        if (event.message && event.message.text) {
            var request = aiapp.textRequest(event.message.text, {
                sessionId: event.sender.id
            });
            request.on('response', function (response) {
                if (response.result.action == "PALCE_BET") {
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
    /*var ref = firebase.database().ref('user/');
    ref.child(recipientId).once('value', function(snapshot) {
        var Query = snapshot.val().query;*/
        message = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                        "title":"Premier League, 3rd December",
                        "subtitle":"12:30PM",
                        "item_url":"https://petersfancybrownhats.com",
                        "image_url": "http://pasteboard.co/4BYTl02ml.jpg",
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
                    },
                        {
                            "title":"November Tests, 3rd December",
                            "subtitle":"2:30PM",
                            "item_url":"https://petersfancybrownhats.com",
                            "image_url": "http://pasteboard.co/4BYqhhTRO.jpg",
                            "buttons": [
                                {
                                    "title": "Place a Bet",
                                    "type": "postback",
                                    "payload": "PLACE_BET"
                                },
                                {
                                    "title": "Add to Accumulator",
                                    "type": "postback",
                                    "payload": "PLACE_BET"
                                },
                                {
                                    "title": "Update",
                                    "type": "postback",
                                    "payload": "PLACE_BET"
                                }
                            ]
                        }]
                }
            }
        };
        console.log(message);
        sendMessage(recipientId, message);

    /*
    });*/
};