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

function getOrderInfo(callback) {
var orders = [];

async.waterfall([
  function(next) {
    var request_url = api_url+"orders.get&my&id="+api_id+"&key="+api_key+"&location=0&algo=1";
    httpsRequest(request_url,function(err,result) {
    				for (var order of result.result.orders) {
				  order.location = 0;
				  orders.push(order);
				}
				next(null);
    				});
  },
  function(next) {
    var request_url = api_url+"orders.get&my&id="+api_id+"&key="+api_key+"&location=1&algo=1";
    httpsRequest(request_url,function(err,result) {
                                for (var order of result.result.orders) {
				  order.location = 1;
                                  orders.push(order);
                                }
                                next(null);
                                });
  }],
  function(err) {
    if (err) {
      console.log("Error in new getOrderInfo: "+err);
      callback(null);
    } else {
      console.log("Returning order info: "+orders);
      callback(null,orders);
    }
  });

}

function doGetOrders(intent,callback) {
	console.log("Got to doGetOrders");
  var replySpeech = "";

  getOrderInfo(function(err,orders) {
    if (err) {
      replySpeech = "There was a system error getting your order info.";
      callback(replySpeech,true);
    }
    console.log("Orders: "+JSON.stringify(orders));
    for (var order of orders) {
      replySpeech += "Your order "+order.id+"is running at "+Number(order.accepted_speed / 1000).toFixed(2) +" terahashes per second with "+order.workers+" workers.  Your cost per terahash per day is "+order.price+" millibitcoins. ";
    }
    callback(replySpeech,true);
  });
} 
    

function doLowerPrice(intent,callback) {

  getOrderInfo(function(err,orders) {
    if (err) {
      replySpeech = "There was a system error getting your order info.";
      callback(replySpeech,true);
    }

// No support for prompting when multiple orders exist, so for now just going to modify the first order
    var order_id = orders[0].id;
    var order_location = orders[0].location;
    var request_url = api_url+"orders.set.price.decrease&id="+api_id+"&key="+api_key+"&location="+order_location+"&algo=1&order="+order_id; 
    httpsRequest(request_url,function(err,response) {
      if (err) {
        replySpeech = "There was a system error while attempting to lower your price.";
	console.log("Error: "+err);
      } else {
        if (response.result.success) {
          replySpeech = "Order "+order_id+" price has been lowered. "+response.result.success;
	} else if (response.result.error) {
          replySpeech = "Order "+order_id+" price could not be changed at this time. "+response.result.error;
	} else {
	  replySpeech = "Order "+order_id+" price could not be changed at this time.";
	  console.log("Result: "+result);
	}
      }
      callback(replySpeech,true);
    });
  });
}

function doRaisePrice(intent,callback) {

  getOrderInfo(function(err,orders) {
    if (err) {
      replySpeech = "There was a system error getting your order info.";
      callback(replySpeech,true);
    }

// No support for prompting when multiple orders exist, so for now just going to modify the first order
    var order_id = orders[0].id;
    var order_location = orders[0].location;
    var old_price = orders[0].price;
    var new_price = Number(old_price) + Number(0.0001);
    console.log("Price increase from "+old_price+" to "+new_price);
    var request_url = api_url+"orders.set.price&id="+api_id+"&key="+api_key+"&location="+order_location+"&algo=1&order="+order_id+"&price="+new_price;
    httpsRequest(request_url,function(err,response) {
      if (err) {
        replySpeech = "There was a system error while attempting to raise your price.";
        console.log("Error: "+err);
      } else {
        if (response.result.success) {
          replySpeech = "Order "+order_id+" price has been raised. "+response.result.success;
        } else if (response.result.error) {
          replySpeech = "Order "+order_id+" price could not be changed at this time. "+response.result.error;
        } else {
          replySpeech = "Order "+order_id+" price could not be changed at this time.";
          console.log("Result: "+result);
        }
      }
      callback(replySpeech,true);
    });
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
