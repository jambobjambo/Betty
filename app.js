/**
 * Created by jamie on 26/11/2016.
 */
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

var FB = require('fb');
FB.setAccessToken(process.env.PAGE_ACCESS_TOKEN);

var apiai = require('apiai');
var aiapp = apiai("bcbc9b77fbf849c2ba6e785567535c91");
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

// handler receiving messages
app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        console.log(event);
        console.log(event.message);

        if (event.message && event.message.text) {
            var ref = firebase.database().ref('user/');
            ref.child(event.sender.id).once('value', function(snapshot) {
                var exists = (snapshot.val() !== null);
                if (exists == false){
                    Welcome(event.sender.id);
                }
                else {
                    //Message Handler
                    var request = aiapp.textRequest(event.message.text, {
                        sessionId: event.sender.id
                    });
                    request.on('response', function (response) {
                    if (event.message.text == "£30" || event.message.text == "£70" || event.message.text == "£125" || event.message.text == "£125+") {
                        var PriceAdd = firebase.database().ref('user/' + event.sender.id);

                        if(event.message.text == "£30"){
                            shoppingquery(event.sender.id, response.result.parameters,"p20:25");
                            PriceAdd.update({
                                price: "p20:25"
                            });
                        }else if(event.message.text == "£70"){
                            shoppingquery(event.sender.id, response.result.parameters,"p20:29");
                            PriceAdd.update({
                                price: "p20:29"
                            });
                        }else if(event.message.text == "£125"){
                            shoppingquery(event.sender.id, response.result.parameters,"p20:33");
                            PriceAdd.update({
                                price: "p20:33"
                            });
                        }else if(event.message.text == "£125+"){
                            shoppingquery(event.sender.id, response.result.parameters,"p34:49");
                            PriceAdd.update({
                                price: "p34:49"
                            });
                        }

                    } else {
                            if (response.result.action == "shopping_query") {
                                PriceMessage(event.sender.id, response.result.parameters );
                            } else {
                                sendMessage(event.sender.id, {text: response.result.fulfillment.speech});
                            }
                    }
                    });
                    request.on('error', function (error) {
                        console.log(error);
                    });
                    request.end();
                }
            });
        }else if (event.postback) {
            ViewMore(event.sender.id, "p20:25");
        }else if (event.message && event.message.attachments){
            Vision(event.sender.id,event.message.attachments[0].payload.url);
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
function shoppingquery(recipientId, parameters,price) {
    var ref = firebase.database().ref('user/');
    ref.child(recipientId).once('value', function(snapshot) {
        var Query = snapshot.val().query;
        const options = {
            fts: Query,
            offset: 0,
            limit: 4,
            sort: 'Popular',
            fl: [price]
        };
        shopstyle.products(options).then(function(response){
                message = {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "list",
                            "top_element_style": "compact",
                            "elements": [{
                                "title": response.products[0].brandedName,
                                "subtitle": response.products[0].priceLabel,
                                "image_url": response.products[0].image.sizes.Best.url,
                                "default_action": {
                                    "type": "web_url",
                                    "url": response.products[0].image.sizes.Best.url
                                },
                                "buttons": [
                                    {
                                        "title": "Go to Store",
                                        "type": "web_url",
                                        "url": response.products[0].clickUrl,
                                        "messenger_extensions": true,
                                        "webview_height_ratio": "tall"
                                    }
                                ]
                            }, {
                                "title": response.products[1].brandedName,
                                "subtitle": response.products[1].priceLabel,
                                "image_url": response.products[1].image.sizes.Large.url,
                                "default_action": {
                                    "type": "web_url",
                                    "url": response.products[1].image.sizes.Best.url
                                },
                                "buttons": [
                                    {
                                        "title": "Go to Store",
                                        "type": "web_url",
                                        "url": response.products[1].clickUrl,
                                        "messenger_extensions": true,
                                        "webview_height_ratio": "tall"
                                    }
                                ]
                            },{
                                "title": response.products[2].brandedName,
                                "subtitle": response.products[2].priceLabel,
                                "image_url": response.products[2].image.sizes.Large.url,
                                "default_action": {
                                    "type": "web_url",
                                    "url": response.products[2].image.sizes.Best.url
                                },
                                "buttons": [
                                    {
                                        "title": "Go to Store",
                                        "type": "web_url",
                                        "url": response.products[2].clickUrl,
                                        "messenger_extensions": true,
                                        "webview_height_ratio": "tall"
                                    }
                                ]
                            },{
                                "title": response.products[3].brandedName,
                                "subtitle": response.products[3].priceLabel,
                                "image_url": response.products[3].image.sizes.Large.url,
                                "default_action": {
                                    "type": "web_url",
                                    "url": response.products[3].image.sizes.Best.url
                                },
                                "buttons": [
                                    {
                                        "title": "Go to Store",
                                        "type": "web_url",
                                        "url": response.products[3].clickUrl,
                                        "messenger_extensions": true,
                                        "webview_height_ratio": "tall"
                                    }
                                ]
                            }],
                            "buttons": [
                                {
                                    "title": "View More",
                                    "type": "postback",
                                    "payload": "view_more"
                                }
                            ]
                        }
                    }
                };
                sendMessage(recipientId, message);
                sendMessage(recipientId, {text: "Here is a few I've found :D"});
            }
        );

    });
};