var https = require('https');
var api_id = "35748";
var api_key = "26294e43-2a8f-4674-91f5-325b1930265d";
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
  https.get(url,function(response) {
    var body = "";
    response.on('data', function(data) {
      body += data;
    });

    response.on('end', function() {
      callback(JSON.parse(body));
    });
  });
}
function doGetOrders(intent,callback) {
  var request_url = api_url+"orders.get&my&id="+api_id+"&key="+api_key+"&location=0&algo=1";
  httpsRequest(request_url,function(result) {
    var replySpeech = "Your order "+result.result.orders[0].id+"is running at "+Number(result.result.orders[0].accepted_speed / 1000).toFixed(2) +" terrahashes per second with "+result.result.orders[0].workers+" workers";
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
