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
const ShopStyle = require('shopstyle-sdk');
const shopstyle = new ShopStyle('uid625-36772825-65', 'UK');
var vision = require('@google-cloud/vision')({
    projectId: 'piklshop-42f40',
    credentials: {
        "type": "service_account",
        "project_id": "piklshop-42f40",
        "private_key_id": "00a3cee60eddb2679cb244dae208ab807e1ec6a7",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDb9l3FuOla1cr3\nT/G4/8RgHX0FE2Zq0OO5LZ9dZWssEp+um997497ZCV7XiyU/4i6EMPdsSeTGFJDz\ntM/HNUD+CPXANYSFUtfLshnpMS+ju5yupkq3ujCP4/xbUEIIJSM9dbYz/KHGhhUk\nwMUS8LrNeRiupMAAqcAGMrqi9ssiDJx+F5L2fQEZt/6cIw6I76fFtqtdC5YaelFc\nUkwOSXqnjFhTJzeNH2u4G8XIhCCPbiOG2XijUCxyS+7qk5arAPryMdcIZ5rmnaaq\nkeJB8SPovuLgIZAeOZq1MUfATlhfE+fELPnaDspssj57SFMkX+9YdMIZO1KWoSro\nUzwznEn7AgMBAAECggEBAInXGKpoFywKH9fdbEAfX4NP12GP57V2U85ejaisfn2u\n6gw0t9beVG8z1RBDrUMcTUQfn11n7QpIJxHhs/dFIwZOvRoHL5WQ9ZQ7dstQPGdh\nkW1M3jPGZNo255SdddO+2heQpW5smUBcE/HlL1qQKq/KfDItIfkIZ0I7FgQ7nc4m\naYveVkx94RxBn6rFqykBenQws5qDeW0jgay6WzbSgARUDPTtnyfNJjsJlyoDWLxU\np6mKEtcYS7F5ZVAXTAibKXQpuRYc21xpZZH8hrsEwd7Dbcb7VlZ0BALGchRd1VXU\n2L1JbpxpaXK1LzpiwEJK0IeIoa5dYCLMi8XuUY0f0oECgYEA8nipZlU+yEP4ImhT\n+nIPyHleMqYh7jsaw8DSTgihKjDXOn9vU0oH1Iuro7o3y/8tR6prA52hy0jqjlvX\nd8vg0nJ8Q6pSNyn8Tb3HadwYKUlAPHpgqAkIuqC6DPWdH0JdYQOoAyre6u+BSup5\nJ++YMhcQkNPYgMnPQdNBfUW3S0ECgYEA6DwypoNIvxoQJaEnQCFkfDhfbeeIaJ5I\nzWepqCF8NsOwkHjZq4RF5fmn0JmfzBqIblBZgq9Nzn2rA4iHX2gduHa2nw5iLRFx\njk/O3EKLctGUDVoon1Cy+E9+SWqhNIBj7ht+tk5+giSXf2ig+aTgDpMJHV+/K69O\nhnkVdtMbcjsCgYBh+TFxwQYiQ5ySwpcUPlx0Q941Fv3k1gsFh/cyQrhkZOHCqFVi\nUSqCzoDnIkqDajNwnsKo7lu+2VK1fRS+Oio4vrvJV5vq4FMrUoCuHJnCrO+AwG4n\n16aoSmOC8weu5tD2b1THGt6CDY6vp7iW03Aq5TjzXDZCK8lMLsFqje33QQKBgCZc\n21kaUsgOvCAbMOqtGXZTsZ/sIWJ20zvrJeF6NpStWttiu0JUBV/qD8irt/P1Zhgi\n+cZWwxmbNMbOpN4jytUP9zbrH1imiwWhNWC5NWPwLu7Nt+wpXocaSphCHwMXOmq4\n7AOdj9RbyxLm68CRddmyfEz35hKHUQdxtRP954jFAoGAQ9k2SnNKz2n2SzJ0Fb14\nWp+3jDJPTaFZKaE2FSlVrNiYwroCo8ncrwDDC7wco4wxFv1xkb3en3MJT9EEtyFA\ncxqDL8udmx3C0Jp+K08QkgxsivqJVNAHIV1nMV3TcVShZ3hxApUo6WCF63ffnQh2\n20j9cj92whbtA0sCwpXIJKA=\n-----END PRIVATE KEY-----\n",
        "client_email": "piklshop-42f40@appspot.gserviceaccount.com",
        "client_id": "109726087120121606722",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://accounts.google.com/o/oauth2/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/piklshop-42f40%40appspot.gserviceaccount.com"
    }
});

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
    if (req.query['hub.verify_token'] === 'flashbot_verification_token') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});

function Welcome(id){
    FB.api(id, function (res) {
        if(!res || res.error) {
            console.log(!res ? 'error occurred' : res.error);
            return;
        }
        introMessage(id, {text: 'Hello ' + res.first_name + ' :D My name is ShopiiBot, here to help you find the clothes you want :)'}, {text: "I am still learning so please mind the minor mistakes that I may make. You can either send me a picture and I'll find something similar or just ask me what you are looking for "});

        var UserID = id;
        var ref = firebase.database().ref('user/');
        ref.child(UserID).set({
            client: "true",
            first_name: res.first_name,
            last_name: res.last_name,
            gender: res.gender,
            locale: res.locale
        });
    });
}
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

//Look for product in image
function Vision(recipientId, Url){
    vision.detectLabels(Url, function(err, labels, apiResponse) {
        var QueryAdd = firebase.database().ref('user/' + recipientId);
        QueryAdd.update({
            query: labels[0] + ' ' + labels[1] + ' ' + labels[2],
            offset: "4"
        });
        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
            method: 'POST',
            json: {
                recipient: {id: recipientId},
                message: {
                    text: "What is your budget?",
                    quick_replies: [
                        {
                            content_type: "text",
                            title: "£30",
                            payload: "PRICE_LESS_30"
                        },
                        {
                            content_type: "text",
                            title: "£70",
                            payload: "PRICE_30_70"
                        },
                        {
                            content_type: "text",
                            title: "£125",
                            payload: "PRICE_70_120"
                        },
                        {
                            content_type: "text",
                            title: "£125+",
                            payload: "PRICE_120_UP"
                        }
                    ]
                }
            }
        }, function (error, response, body) {
            if (error) {
                console.log('Error sending message: ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            }
        });
    });
}

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

function PriceMessage(recipientId, parameters) {
    if(parameters.clothing == "" && parameters.colour == ""){
        sendMessage(recipientId, {text: "What type of clothing are you searching for? :)" });
    }else {
        var QueryAdd = firebase.database().ref('user/' + recipientId);
        QueryAdd.update({
            query: parameters.colour + ' ' + parameters.clothing,
            offset: "4"
        });


        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
            method: 'POST',
            json: {
                recipient: {id: recipientId},
                message: {
                    text: "What is your budget?",
                    quick_replies: [
                        {
                            content_type: "text",
                            title: "£30",
                            payload: "PRICE_LESS_30"
                        },
                        {
                            content_type: "text",
                            title: "£70",
                            payload: "PRICE_30_70"
                        },
                        {
                            content_type: "text",
                            title: "£125",
                            payload: "PRICE_70_120"
                        },
                        {
                            content_type: "text",
                            title: "£125+",
                            payload: "PRICE_120_UP"
                        }
                    ]
                }
            }
        }, function (error, response, body) {
            if (error) {
                console.log('Error sending message: ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            }
        });
    }
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

function ViewMore(recipientId,price) {
    var ref = firebase.database().ref('user/');
    ref.child(recipientId).once('value', function(snapshot) {
        var Query = snapshot.val().query;
        var Price = snapshot.val().price;
        var Offset = snapshot.val().offset;
        const options = {
            fts: Query,
            offset: Offset,
            limit: Offset + 4,
            sort: 'Popular',
            fl: [Price]
        };
        shopstyle.products(options).then(function (response) {

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
                            }, {
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
                            }, {
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
                var Indent = firebase.database().ref('user/' + recipientId);
                Indent.update({
                    offset: Offset + 4
                });
            }
        );
    });
};