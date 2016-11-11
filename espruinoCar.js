// EspruinoCar
// Ollie Phillips
// RC car control library, websocket server and client

var wifi = require("Wifi");
var ap = {
  "ssid": "wif_ssid",
  "pwd": "wifi_password"
};

// Control object, can be used independently over serial, but better Telnet
// Forward and reverse methods accept speed, and time arguments
var ec = {
  pin: {
    forward: D4,
    reverse: D5,
    left: D14,
    right: D0,
    horn: D12
  },
  left: function() {
    digitalWrite(ec.pin.left, 1);
    digitalWrite(ec.pin.right, 0);
  },
  right: function() {
    digitalWrite(ec.pin.right, 1);
    digitalWrite(ec.pin.left, 0);
  },
  ahead : function() {
    digitalWrite(ec.pin.left, 0);
    digitalWrite(ec.pin.right, 0);
  },
  drive: function(speed, time){
    if(time){
      setTimeout(function(){
        analogWrite(ec.pin.forward, 0);
      },ec.convert.time(time));
    }
    analogWrite(ec.pin.forward, ec.convert.speed(speed)); 
    analogWrite(ec.pin.reverse, 0);
  },
  reverse: function(speed, time) {
    if(time){
      setTimeout(function(){
        analogWrite(ec.pin.reverse, 0);
      },ec.convert.time(time));
    }
    analogWrite(ec.pin.reverse, ec.convert.speed(speed)); 
    analogWrite(ec.pin.forward, 0);
  },
  stop: function() {
    analogWrite(ec.pin.forward, 0);
    analogWrite(ec.pin.reverse, 0);
    digitalWrite(ec.pin.left, 0);
    digitalWrite(ec.pin.right, 0); 
  },
  horn: {
    toot: function() {
      setTimeout(function(){
         digitalPulse(ec.pin.horn, 1, 200);
      },300);
      digitalPulse(ec.pin.horn, 1, 200);
    },
    honk: function() {
      digitalPulse(ec.pin.horn, 1, 1000);
    }
  },
  init: function() {
    pinMode(ec.pin.left, "output");
    pinMode(ec.pin.right, "output");
    pinMode(ec.pin.forward, "output");
    pinMode(ec.pin.reverse, "output");
    pinMode(ec.pin.horn, "output");
    analogWrite(ec.pin.forward, 0);
    analogWrite(ec.pin.reverse, 0);
    digitalWrite(ec.pin.left, 0);
    digitalWrite(ec.pin.right, 0); 
  },
  convert: {
    speed : function(speed) {
              var convSpeed = speed/100;
              return convSpeed;
    },
    time : function(time) {
             var convTime = time* 1000;
             return convTime;
    }
  }
};

// Our server for the page
function servePage(req, res) {
  var page ='<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport"';
  page += 'content="width=device-width, user-scalable=no, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0"></head>';
  page += '<body><iotui-f1wheel id="wheel1" wheellabel="EspruinoCar" primarybuttonlabel="TOOT" startbuttonlabel="START/STOP"';
  page += 'secondarybuttonlabel="HONK" width="540"></iotui-f1wheel>';
  page += '<script>var ws;var send={};ws=new WebSocket("ws://" +';
  page += 'location.host + "/espruinocar", "protocolOne");function ignitionHandler()';
  page += '{send.type="ignition";send.state=this.state.ignition;ws.send(JSON.stringify(send));console.log(JSON.stringify(send));}function driveHandler()';
  page += '{send.type="drive";send.state=this.state.drive;ws.send(JSON.stringify(send));console.log(JSON.stringify(send));}function primaryHandler()';
  page += '{send.type="primarybuttonpush";send.state=null;ws.send(JSON.stringify(send));console.log(JSON.stringify(send));}function secondaryHandler()';
  page += '{send.type="secondarybuttonpush";send.state=null;ws.send(JSON.stringify(send));console.log(JSON.stringify(send));}function steeringHandler()';
  page += '{send.type="steer";send.state=this.state.steer;ws.send(JSON.stringify(send));console.log(JSON.stringify(send));}window.onload=function(){';
  page += 'iotUI.addListener("wheel1", "ignition", ignitionHandler);iotUI.addListener("wheel1", "primarybuttonpush",';
  page += 'primaryHandler);iotUI.addListener("wheel1", "secondarybuttonpush", secondaryHandler);iotUI.addListener("wheel1",';
  page += '"drive", driveHandler);iotUI.addListener("wheel1", "steer", steeringHandler);}</script>';
  page += '<script src="https://rawgit.com/olliephillips/iotUI.js/master/iotUI.js"></script></body></html>';
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(page);
}

// Maps events received over websocket to ec object controls
function controlMap(event){
  var forwardSpeed = 70;
  var reverseSpeed = 40;
  console.log("message:" +  event.type +":" + event.state);
  switch (event.type){
    case "ignition":
      if (event.state == "off"){ec.stop();}
    break;
    case "steer":
      switch(event.state){
        case "left":
          ec.left();
        break;
        case "neutral":
          ec.ahead();
        break;
        case "right":
          ec.right();
        break;
      }
    break;
    case "drive":
      switch(event.state){
        case "stop":
          ec.stop();
        break;
        case "forward":
          ec.drive(forwardSpeed);
        break;
        case "reverse":
          ec.reverse(reverseSpeed);
        break;
      }
    break;
    case "primarybuttonpush":
      ec.horn.toot();
    break;
    case "secondarybuttonpush":
      ec.horn.honk();
    break;
  }
}

// Start everything
function initCar() {
  // Initialise pins
  ec.init();

  // Wifi connection
  wifi.connect(ap.ssid, {"password": ap.pwd}, function(err){
    if(!err){
      var server = require('ws').createServer(servePage);
      server.listen(8000);
      server.on("websocket", function(ws) {
        ws.on('message', function(evt){
          var ev = JSON.parse(evt);
          controlMap(ev);
        });
      });

      // Signal connected to wifi
      ec.horn.toot();
    }
  });
}

// Start up from boot
E.on("init", initCar);