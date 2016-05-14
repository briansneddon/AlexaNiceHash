# AlexaNiceHash

This project adds a skill to Alexa that allows you to query or modify your NiceHash order.  It's currently only intended for Bitcoin orders in either the NiceHash or WestHash locations.

## Configuration
This skill currently expects to be run in test mode using an Echo registered to your development account.  The code is designed to be uploaded as an AWS Lambda function. 

The code requires the creation of a config.js file in the app directory with the following format:
```
var config = {};
config.api_id = "xxx";
config.api_key = "xxx";

module.exports = config
```

Where xxx is changed to your NiceHash API id and key

Dependencies must be installed using ```npm install``` before deploying.

## TODO
* Support multiple orders when increasing/decreasing
* Allow specification of price when increasing
* Add conversational functionality where helpful


