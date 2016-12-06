# EspruinoCar

![img_3086](https://cloud.githubusercontent.com/assets/7113347/20222206/4e1449ce-a82c-11e6-9208-446c74071a3c.jpeg)

Espruino code to control a remote control car, using ESP8266, double H-Bridge, Websocket server and client.
Control itself is provided by [iotUI.js](https://github.com/olliephillips/iotUI.js) which is based on [riot.js](http://riotjs.com/) and HTML device orientation API on iPhone.

There are four components:-

1. The Car build (as per image above)
2. The control object, `ec`
3. The HTML page to serve which allows us to control the car from iPhone.
4. The http/websocket server, which serves the HTML page and creates a websocket connection and listens for message events.

Full write up of project [can be found here](https://slippytrumpet.io/posts/building-an-rc-car-with-espruino-on-esp8266/)
