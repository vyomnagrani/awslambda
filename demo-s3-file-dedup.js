// Send SNS notifications when a duplicate file is uploaded to an S3 bucket
var AWS = require('aws-sdk');
var S3 = new AWS.S3();
var SNS = new AWS.SNS();

// Lambda entry point
exports.handler = function(event, context) {

	// Get ETag (MD5) of S3 object from event
	S3.headObject({Bucket: event.Records[0].s3.bucket.name, Key: event.Records[0].s3.object.key}, function(err, headData) {
		
		// Look at all other objects in the S3 bucket
		S3.listObjects({Bucket: event.Records[0].s3.bucket.name}, function(err, listData) {
			var match;
			for (var file in listData.Contents) {
			
				// Check if file checksums match
				if ((('"'+event.Records[0].s3.object.eTag+'"') == listData.Contents[file].ETag) && (event.Records[0].s3.object.key != listData.Contents[file].Key)) {
					match = file;
					break;
				}
			}
			
			// If there was a match, then publish to SNS
			if (match) {
				var payload = "Uploaded file " + event.Records[0].s3.object.key + " matches existing file " + listData.Contents[match].Key;
				var params = {
					Message: payload,
					Subject: 'Demo Lambda Message',
					TopicArn: 'arn:aws:sns:us-west-2:111122223333:demo-email'
				};
				SNS.publish(params, function(err, data) {
					context.succeed();
				});
			}
			// No match, exit function gracefully
			else {
				context.succeed();
			}
		});
	});
};
