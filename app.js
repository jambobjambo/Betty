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

function createImage(Match, callback){
    var FileName = Math.floor((Math.random() * 9999999) + 1);
    Jimp.read("https://raw.githubusercontent.com/jambobjambo/Betty/master/image/background.png", function (err, background) {
        Jimp.read("https://raw.githubusercontent.com/jambobjambo/Betty/master/image/team1.png", function (err, team1) {
            Jimp.read("https://raw.githubusercontent.com/jambobjambo/Betty/master/image/team2.png", function (err, team2) {
                Jimp.read("https://raw.githubusercontent.com/jambobjambo/Betty/master/image/Left.png", function (err, circle1) {
                    Jimp.read("https://raw.githubusercontent.com/jambobjambo/Betty/master/image/Right.png", function (err, circle2) {
                        var image = new Jimp(780, 410, function (err, image) {
                            image.composite(background, 0, 0);
                            image.composite(circle1, 0, 210);
                            image.composite(circle2, 480, 210);
                            image.composite(team1, 30, 15);
                            image.composite(team2, 450, 15);
                            Jimp.loadFont(Jimp.FONT_SANS_64_WHITE).then(function (font) { // load font from .fnt file
                                image.print(font, 30, 330, Match[3]);
                                image.print(font, 600, 330, Match[4]);
                                image.write(FileName + ".png", function () {
                                    callback(FileName + '.png', Match);
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}

function GetOddsCurrent(teams, callback){
    x('https://www.betfair.com/sport/football', ['.home-team-name'])(function (err, homeTeams) {
        x('https://www.betfair.com/sport/football', ['.away-team-name'])(function (err, awayTeam) {
            x('https://www.betfair.com/sport/football', ['.date'])(function (err, date) {
                x('https://www.betfair.com/sport/football', ['.ui-runner-price'])(function (err, odds) {
                    var Match = [];
                    for(var index = 0; index < 10; index++){
                        var HomeTeam = homeTeams[index].replace("\n","");
                        var AwayTeam = awayTeam[index].replace("\n","");
                        var Date = date[index].replace("\n","");
                        Match.push(HomeTeam);
                        Match.push(AwayTeam);
                        Match.push(Date);
                        Match.push(odds[index * 3]);
                        Match.push(odds[index * 3 + 2]);
                        callback(Match);
                    }
                });
            });
        });
    });
}

// Server frontpage
function GetOdds(teams, callback){
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
            textQuery: 'english premier league'
        }, function (err, res) {
            var odds = res.length;
            var start = 0;
            var oddsList;
            while(odds > start) {
                var event = res[start].event.id;
                x('https://www.betfair.com/sport/football/event?eventId=' + event, ['.com-bet-button'])(function (err, odds) {
                    oddsList.push(odds);
                    console.log('got here');
                    start += 1;
                })
            }
            if(odds == start){
                callback(oddsList);
            }
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
    sendMessage(recipientId, {text: 'Let me have a look for you :)'});
        var messageTemp = [];
        GetOddsCurrent('football', function(Match){
            createImage(Match, function(filename, Match){
                messageTemp.push ('{"title":' + Match[0] + ' v ' + Match[1] + ',"subtitle":' + Match[2] + ',"image_url": "https://chatbettyeu.herokuapp.com/"' + filename + ',"buttons": [{"title": "Place a Bet","type": "postback","payload": "PLACE_BET"},{"title": "Add to Accumulator","type": "postback","payload": "ADD_TO_ACC"},{"title": "Update","type": "postback","payload": "UPDATE"}]}');
            });
        });
        if(messageTemp.length == 10){
            message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [ messageTemp[0] + ','+ messageTemp[1] + ','+ messageTemp[2]+ ','+ messageTemp[3]+ ','+ messageTemp[4]+ ','+ messageTemp[5]+ ','+ messageTemp[6]+ ','+ messageTemp[7]+ ','+ messageTemp[8]+ ','+ messageTemp[9]]
                    }
                }
            };
            sendMessage(recipientId, message);
        }
    /*var ref = firebase.database().ref('user/');
    ref.child(recipientId).once('value', function(snapshot) {
        var Query = snapshot.val().query;*/


    /*
    });*/
};