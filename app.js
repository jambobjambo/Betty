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


function createImage(Match, callback){
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
                                image.print(font, 560, 330, Match[4]);
                                var FileName = Math.floor((Math.random() * 9999999) + 1);
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
    var amount_of_lists = 5;
    x('https://www.betfair.com/sport/football', ['.home-team-name'])(function (err, homeTeams) {
        x('https://www.betfair.com/sport/football', ['.away-team-name'])(function (err, awayTeam) {
            x('https://www.betfair.com/sport/football', ['.date'])(function (err, date) {
                x('https://www.betfair.com/sport/football', ['.ui-runner-price'])(function (err, odds) {
                    var filenames = [];
                    for(var index = 0; index < amount_of_lists; index++){
                        var Match = [];
                        var HomeTeam = homeTeams[index].replace("\n","");
                        var AwayTeam = awayTeam[index].replace("\n","");
                        var Date = date[index].replace("\n","");
                        Match.push(HomeTeam);
                        Match.push(AwayTeam);
                        Match.push(Date);
                        Match.push(odds[index * 3]);
                        Match.push(odds[index * 3 + 2]);
                        createImage(Match, function(filename, Match) {
                            filenames.push(Match[0]);
                            filenames.push(Match[1]);
                            filenames.push(Match[2]);
                            filenames.push(Match[3]);
                            filenames.push(Match[4]);
                            filenames.push(filename);
                            if(filenames.length == amount_of_lists*6){
                                callback(filenames);
                            }
                        });
                    }
                });
            });
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


// handler receiving messages
app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
          var event = events[i];
		      var ref = firebase.database().ref('user/');
          ref.child(event.sender.id).once('value', function(snapshot) {
              var exists = (snapshot.val() !== null);
              if (exists == false){
                  Welcome(event.sender.id);
              } else{
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
            });
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

function Welcome(id){
    FB.api(id, function (res) {
        if(!res || res.error) {
            console.log(!res ? 'error occurred' : res.error);
            return;
        }
        introMessage(id, {text: 'Hello ' + res.first_name + ' :D My name is Betty, BLAH BLAH'}, {text: "This is what I can do LALALALA"});

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
        //messageTemp.push ('{"title":' + Match[0] + ' v ' + Match[1] + ', "subtitle":' + Match[2] + ',"image_url": "https://chatbettyeu.herokuapp.com/"' + filename + ',"buttons": [{"title": "Place a Bet","type": "postback","payload": "PLACE_BET"},{"title": "Add to Accumulator","type": "postback","payload": "ADD_TO_ACC"},{"title": "Update","type": "postback","payload": "UPDATE"}]}');
        var message1 = '{"title": "' + Match[0].substring(0, Match[0].length - 1) + ' v ' + Match[1].substring(0, Match[1].length - 1) + '", "subtitle": "' + Match[2].substring(0, Match[2].length - 1) + '", "image_url": "' + "https://chatbettyeu.herokuapp.com/" + Match[5] + '", "buttons":[{"title": "Place a Bet", "type": "postback", "payload": "PLACE_BET"},{"title": "Add to Accumulator", "type": "postback", "payload": "ADD_TO_ACC"},{"title": "Update", "type": "postback", "payload": "UPDATE"}]} ';
        var message2 = '{"title": "' + Match[6].substring(0, Match[6].length - 1) + ' v ' + Match[7].substring(0, Match[7].length - 1) + '", "subtitle": "' + Match[8].substring(0, Match[8].length - 1) + '", "image_url": "' + "https://chatbettyeu.herokuapp.com/" + Match[11] + '", "buttons":[{"title": "Place a Bet", "type": "postback", "payload": "PLACE_BET"},{"title": "Add to Accumulator", "type": "postback", "payload": "ADD_TO_ACC"},{"title": "Update", "type": "postback", "payload": "UPDATE"}]} ';
        var message3 = '{"title": "' + Match[12].substring(0, Match[12].length - 1) + ' v ' + Match[13].substring(0, Match[13].length - 1) + '", "subtitle": "' + Match[14].substring(0, Match[14].length - 1) + '", "image_url": "' + "https://chatbettyeu.herokuapp.com/" + Match[17] + '", "buttons":[{"title": "Place a Bet", "type": "postback", "payload": "PLACE_BET"},{"title": "Add to Accumulator", "type": "postback", "payload": "ADD_TO_ACC"},{"title": "Update", "type": "postback", "payload": "UPDATE"}]} ';
        var message4 = '{"title": "' + Match[18].substring(0, Match[18].length - 1) + ' v ' + Match[19].substring(0, Match[19].length - 1) + '", "subtitle": "' + Match[20].substring(0, Match[20].length - 1) + '", "image_url": "' + "https://chatbettyeu.herokuapp.com/" + Match[23] + '", "buttons":[{"title": "Place a Bet", "type": "postback", "payload": "PLACE_BET"},{"title": "Add to Accumulator", "type": "postback", "payload": "ADD_TO_ACC"},{"title": "Update", "type": "postback", "payload": "UPDATE"}]} ';
        var message5 = '{"title": "' + Match[24].substring(0, Match[24].length - 1) + ' v ' + Match[25].substring(0, Match[25].length - 1) + '", "subtitle": "' + Match[26].substring(0, Match[26].length - 1) + '", "image_url": "' + "https://chatbettyeu.herokuapp.com/" + Match[29] + '", "buttons":[{"title": "Place a Bet", "type": "postback", "payload": "PLACE_BET"},{"title": "Add to Accumulator", "type": "postback", "payload": "ADD_TO_ACC"},{"title": "Update", "type": "postback", "payload": "UPDATE"}]} ';

        message = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [message1, message2, message3, message4, message5]
                }
            }
        };
        sendMessage(recipientId, message);
    });

    /*var ref = firebase.database().ref('user/');
    ref.child(recipientId).once('value', function(snapshot) {
        var Query = snapshot.val().query;*/


    /*
    });*/
};
