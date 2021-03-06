import express from 'express'
import bodyParser from 'body-parser'

import database from './database'
import gcm from './gcm'
import apn from './apn'
import web from './web'

let app = express()

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  return next()
})
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))


app.get('/', function(req, res){
  console.log('[GET] /')
  res.send('Hello World!')
})


app.get('/db', function(req, res){
  console.log('[GET] /db')
  database.getTokens().then(
    tokens => {
      let html = 'Stored tokens:<br><ul>'
      tokens.forEach(function(token){
        html += `<li>${token.id} : ${token.service} : ${token.token}</li>`
      })
      html += '</ul>'
      res.send(html)
    },
    error => res.send(error)
  )
})


app.post('/token', function(req, res){
  console.log('[TOKEN]', req.body)
  database.storeToken(req.body)
  .then(
    result => res.send(result),
    error => res.send(error)
  )
})


function postMessage(message, res){
  console.log('---')
  console.log('[NOTIFICATION]', message)

  database.getTokens().then(
    tokens => {
      web.pushNotifications(tokens, message)
      gcm.pushNotifications(tokens, message)
      apn.pushNotifications(tokens, message)
      res.send({message: `notification pushed to ${tokens.length} devices`})
    },
    error => res.send(error)
  )
}


// test with: curl -X POST -H "Content-Type: application/json" -d '{"message" : "testing testing 1,2,3"}' http://localhost:5000/message
app.post('/message', function(req, res) {
  postMessage(req.body.message, res)
})


// test with: http://localhost:5000/message?message=testing testing 1,2,3
app.get('/message', function(req, res){
  postMessage(req.query.message, res)
})


app.post('/remove_tokens', function(req, res){
  let invalidTokens = req.body.tokens
  database.removeTokens(invalidTokens)
  .then(
    result => res.send(result),
    error => res.send(error)
  )
})


process.on('exit', function (){
  apn.stop()
  console.log('Goodbye!')
})

apn.start({
  // both the key and the certificate are in the .pem file so we can use the same file for both key and certificate
  key: 'conf/push2.pem',
  cert: 'conf/push2.pem',
})

gcm.start({
  key: 'conf/gcm.abu2.key', // should be a plain text file containing nothing but the key
  url: 'https://gcm-http.googleapis.com/gcm/send' // not mandatory
})

web.start({
  key: 'conf/gcm.abu2.key'
})

let port = process.env.PORT || 5000
app.listen(port)
console.log(`server listening at port ${port}`)

