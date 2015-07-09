// Customize an incoming SNS message and repost it to another SNS topic
var aws = require('aws-sdk');
var sns = new aws.SNS();

// Lambda entry point
exports.handler = function(event, context) {
    
	// Get Message from incoming SNS subscription
	payload1 = new Buffer(event.Records[0].Sns.Message);
	
	// Customize the message
	var payload2 = payload1 + ' -- processed by Lambda';
    
	// Publish the customized message back to SNS
	var params = {
        Message: payload2,
        Subject: 'Demo Lambda Message',
        TopicArn: 'arn:aws:sns:us-west-2:111122223333:demo-email'
    };
    sns.publish(params, function(err, data) {
        context.succeed();
    });
};
