/*

http://redth.codes/the-problem-with-apples-push-notification-ser/

Status Codes & Meanings
0 - No errors encountered
1 - Processing error
2 - Missing device token
3 - Missing topic
4 - Missing payload
5 - Invalid token size
6 - Invalid topic size
7 - Invalid payload size
8 - Invalid token
255 - None (unknown)
*/

import apn from 'apn'
import database from './database'

let connection
let notification
let iosDevices
let currentDevice
let resolveCallback

function start(options){
  // open APN connection
  connection = new apn.Connection(options)
  //console.log(connection)

  connection.on('error', (e) => {
    console.log('error', e)
    pushNext()
  })

  connection.on('transmitted', (notification, device) => {
    console.log('transmitted', device.token)
    //console.log(notification)
    //console.log(device)
  })

  connection.on('completed', (data) => {
    console.log('completed', data)
    pushNext()
  })

  connection.on('transmissionError', (errorCode, notification, device) => {
    //console.log('transmissionError')
    //console.log(notification)
    //console.log(device)
    console.log('ERROR', errorCode, device.toString())
    if(errorCode === 8 || errorCode === 5){
      database.removeTokens([device.toString()])
    }
  })
}


function pushNotifications(devices, message){

  iosDevices = []

  for(let device of devices){
    if(device.os === 'ios'){
      let token = device.token
      if(checkHex(token) === false){
        console.log(`token is not hex: ${token}`)
        database.removeTokens([token])
        continue
      }
      if(token.length !== 64){
        console.log(`token is not valid: ${token}`)
        database.removeTokens([token])
        continue
      }
      console.log('apn', token)
      iosDevices.push(new apn.Device(token))
    }else{
      continue
    }
  }

  if(iosDevices.length === 0){
    console.log('resolve')
    return Promise.resolve([])
  }

  notification = new apn.Notification()
  notification.expiry = Math.floor(Date.now() / 1000) + 3600
  notification.payload = {message}
  notification.badge = 1
  notification.sound = 'dong.aiff'
  notification.alert = message

  currentDevice = -1

  return new Promise(function(resolve){
//  connection.pushNotification(notification, iosDevices)
    resolveCallback = resolve
    //console.log(currentDevice, iosDevices.length)
    pushNext()
  })
}


function pushNext(){
  currentDevice++
  //console.log(currentDevice, iosDevices.length, iosDevices[currentDevice])
  if(currentDevice >= iosDevices.length){
    resolveCallback([])
  }else{
    connection.pushNotification(notification, iosDevices[currentDevice])
  }
}


function stop(){
  // is this really necessary?
  connection = null
}

function checkHex(string){
  let re = /[0-9A-Fa-f]{6}/g
  return re.test(string)
  //let hex = parseInt(string, 16)
  //return (hex.toString(16) === string.toLowerCase())
}

export default {
  stop,
  start,
  pushNotifications
}
