'use strict'
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
var User = require('./models/models').User;

app.set('port', (process.env.PORT)|| 3000)

app.use(bodyParser.urlencoded({extended: false}))

app.use(bodyParser.json())

app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})

app.get('/webhook/', function(req, res) {
  if (req.query['hub.verify_token'] === 'my_voice_is_mypassword_verify_me') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})


// get message
  // if user does not exist - create user
  // if user exists:
    // if user does not have routine, ask routine
      // set user routine
    // if user does:
      // yolo


app.post('/webhook/', function(req, res){
  console.log("REQ.BODY===============", req.body)
  let messaging_events = req.body.entry[0].messaging
  for (let i = 0; i < messaging_events.length; i ++) {
    let event = req.body.entry[0].messaging[i]
    let sender = event.sender.id
    var user = User.findOne({facebookId: req.body.entry[0].id}, function(err, user){
      if (err) {return console.log(err)
      } else {
        if (!user && event.message && event.message.text) {
          console.log("EVENT.MESSAGE=====    =======    ======", event.message);
          console.log("EVENT.MESSAGE.TEXT =====    =======    ======", event.message.text);

          sendTextMessages(sender, ["Hello there, I am Pam, your personal assistant. Let's set you up", "I'll help you get up in the mornings and fulfill your personal goals"])
          resToMorningRoutine(sender)

          // create user
          var user = new User({facebookId: req.body.entry[0].id})
          user.save()
        } else if (user) {
          console.log('THERE IS A USERRRRRRRRRRRRRRRRRRRR=========');

          if (event.postback) {
            console.log("EVENT POSTBACK PAYLOAD===========", event.postback.payload)
            let text = event.postback.payload
            if (text === 'yes') {
              console.log("MOTHERFUCKING ===========")
              sendTextMessages(sender, ["Meditation, pushups, tea? What's one thing you should you be doing every morning?", "For example, you could respond 'Meditation for 10 minutes', or... 'Read for 20 minutes'?"])
              if (event.message && event.message.text) { //NOT PASSING THIS
                // console.log("EVENT.MESSAGE=====    =======    ======", event.message);
                // console.log("EVENT.MESSAGE.TEXT =====    =======    ======", event.message.text);
                console.log("SUCCESS===========================       =======");
                console.log("EVENT.MESSAGE=====    =======    ======", event.message);
                console.log("EVENT.MESSAGE.TEXT =====    =======    ======", event.message.text);
                console.log("EVENT.POSTBACK.PAYLOAD", event.postback.payload);
                let text = event.postback.payload
                user.routine.name = event.message.text
                user.save(function (err, user){
                  if(err){
                    console.log('ERROR================')
                  }
                  else {
                    console.log("USER ADDED ===================");
                  }
                });
                //later add
              }
            } else if (text === 'no') {
              // do something else
            }

        }
      }
    }
  });

    console.log('EVENT =================', event)
    console.log('EVENT SENDER ID==================', event.sender.id);
  }
  // }
  res.sendStatus(200)
})

const token = "EAACGElIklxMBAGeo6OyZBOOPCudxZCun6dF7noz5P3HixXIzeZClJNDkzQLAFZCyl61Thn98jXzuNo6bE85ZBaxmK5bBmutKFR9O9mLuFJl5h6NHl55L1EmslH6u53IbKtLYTqj2FPmIojrv2wpJ0odaS7ZCh5RUY0XXGymp3qxQZDZD"

function sendTextMessages(sender, text) {
  let messageData = {text: text[0]}
  if (text.length !== 0) {
    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token: token},
      method: 'POST',
      json: {
        recipient: {id: sender},
        message: messageData
      }
    }, function(error, response,body) {
      if (error) {
        console.log('Error sending messages: ', error)
      } else if (response.body.error) {
        console.log('Error: ', response.body.error)
      }
      text = text.slice(1)
      sendTextMessages(sender, text)
    })
  }
}

function resToMorningRoutine(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",

                "text": "Awesome! Would you like to add a morning ritual? ie. Push-ups, meditation...",

                "buttons": [{
                      "type": "postback",
                      // "url": "https://www.messenger.com",
                      "payload": "yes",
                      "title": "Yeah!"
                  }, {
                      "type": "postback",
                      "title": "No thanks",
                      "payload": "no",
                  }]

            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

// function startMorningRoutine(sender, text) {
//     let messageData = {
//         "attachment": {
//             "type": "template",
//             "payload": {
//                 "template_type": "button",
//                 "text": "S",
//                 "buttons": [{
//                       "type": "postback",
//                       "payload": "Meditation for 10 minutes",
//                       "title": "Meditation for 10 minutes"
//                   }, {
//                       "type": "postback",
//                       "title": "Pushup 10 times",
//                       "payload": "Pushup 10 times",
//                   }]
//             }
//         }
//     }
//     request({
//         url: 'https://graph.facebook.com/v2.6/me/messages',
//         qs: {access_token:token},
//         method: 'POST',
//         json: {
//             recipient: {id:sender},
//             message: messageData,
//         }
//     }, function(error, response, body) {
//         if (error) {
//             console.log('Error sending messages: ', error)
//         } else if (response.body.error) {
//             console.log('Error: ', response.body.error)
//         }
//     })
// }
