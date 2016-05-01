var config = require('config.js');
var https = require('https');
var async = require('async');
var api_id = config.api_id;
var api_key = config.api_key;
var api_url = "https://www.nicehash.com/api?method=";

exports.handler = function (event, context) {
console.log(JSON.stringify(event, null, 2));
if (event.request.type === "LaunchRequest") {
    replySpeech = "NiceHash is ready, sir.";
} else if (event.request.type ==="IntentRequest") {
    routeIntent(event.request.intent,function callback(replySpeech,shouldEndSession) { 
	    				context.succeed(speakReply(replySpeech,shouldEndSession));
    					});
}
};

function routeIntent(intent,callback) {
  switch(intent.name) { 
    case 'GetOrders': doGetOrders(intent,callback); break;
    case 'LowerPrice': doLowerPrice(intent,callback); break;
    case 'RaisePrice': doRaisePrice(intent,callback); break;
  }
}

function httpsRequest(url,callback) {
	console.log("URL: "+url);
  https.get(url,function(response) {
    var body = "";
    response.on('data', function(data) {
      body += data;
    });

    response.on('end', function() {
	    console.log("Body: "+body);
      callback(null,JSON.parse(body));
    });
  });
}
function doGetOrders(intent,callback) {
	console.log("Got to doGetOrders");
//  var request_url = api_url+"orders.get&my&id="+api_id+"&key="+api_key+"&location=0&algo=1";
  async.waterfall([
    function(next) {
      var request_url = api_url+"orders.get&my&id="+api_id+"&key="+api_key+"&location=0&algo=1";
      httpsRequest(request_url,next);
    }],
    function(err,result) {
      if (err) {
        console.log("Error: "+err, err.stack);
      } else {
	console.log("Result1: "+result);
        var replySpeech = "Your order "+result.result.orders[0].id+"is running at "+Number(result.result.orders[0].accepted_speed / 1000).toFixed(2) +" terahashes per second with "+result.result.orders[0].workers+" workers.  Your cost per terahash per day is "+result.result.orders[0].price+" bitcoins.";
        callback(replySpeech,true);
      }
    });
}

function doLowerPrice(intent,callback) {
  var order_id="";
  async.waterfall([
    function(next) {
      var request_url = api_url+"orders.get&my&id="+api_id+"&key="+api_key+"&location=0&algo=1";
      httpsRequest(request_url,next);
    },
    function(result,next) {
      order_id = result.result.orders[0].id;
      var request_url = api_url+"orders.set.price.decrease&id="+api_id+"&key="+api_key+"&location=0&algo=1&order="+order_id;
      httpsRequest(request_url,next);
    }],
    function(err,result) {
      var replySpeech = "";
      if (err) {
        replySpeech = "There was a system error while attempting to lower your price.";
	console.log("Error: "+err);
      } else {
        if (result.result.success) {
          replySpeech = "Order "+order_id+" price has been lowered. "+result.result.success;
	} else if (result.result.error) {
	  replySpeech = "Order "+order_id+" price could not be changed at this time. "+result.result.error;
	} else {
	  replySpeech = "Order "+order_id+" price could not be changed at this time.";
	  console.log("Result: "+result);
	}
      }

      callback(replySpeech,true);
    });
}

function doRaisePrice(intent,callback) {
  var order_id="";

  async.waterfall([
    function(next) {
      var request_url = api_url+"orders.get&my&id="+api_id+"&key="+api_key+"&location=0&algo=1";
      httpsRequest(request_url,next);
    },
    function(result,next) {
      order_id = result.result.orders[0].id;
      var old_price = result.result.orders[0].price;
      var new_price = Number(old_price) + Number(0.0001);
      console.log("Price increase from "+old_price+" to "+new_price);
      var request_url = api_url+"orders.set.price&id="+api_id+"&key="+api_key+"&location=0&algo=1&order="+order_id+"&price="+new_price;
      httpsRequest(request_url,next);
    }],
    function(err,result) {
      var replySpeech = "";
      if (err) {
        replySpeech = "There was a system error while attempting to raise your price.";
        console.log("Error: "+err);
      } else {
        if (result.result.success) {
          replySpeech = "Order "+order_id+" price has been raised. "+result.result.success;
        } else if (result.result.error) {
          replySpeech = "Order "+order_id+" price could not be changed at this time. "+result.result.error;
        } else {
          replySpeech = "Order "+order_id+" price could not be changed at this time.";
          console.log("Result: "+result);
        }
      }

      callback(replySpeech,true);
    });
}


function speakReply(replySpeech,shouldEndSession) {
    return {
  version: "1.0",
  sessionAttributes: {},
  response: {
    outputSpeech: {
      type: "PlainText",
      text: replySpeech
    },
    reprompt: {
        outputSpeech: {
            type: "PlainText",
            text: replySpeech
        }
    },
    shouldEndSession: shouldEndSession
  }
};
}
