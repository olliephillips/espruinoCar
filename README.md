# EspruinoCar

Espruino code to control a remote control car, using ESP8266, double H-Bridge, Websocket server and client.
Control itself is provided by iotUI.js which is based on riot.js and HTML device orientation API on iPhone.

There are four components:-

1. The Car build
2. The control object, `ec`
3. The HTML page to serve which allows us to control the car from iPhone.
4. The http/websocket server, which serves the HTML page and creates a websocket connection and listens for message events.