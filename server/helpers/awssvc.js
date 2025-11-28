const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');
const config = require('config');

const sqs = new SQSClient({
    "region": config.get('App.aws.region')
});


module.exports = {

    sendLogMsg:async function (logData,req) {
        var reqJson = {
            user_agent: req.headers["user-agent"],
            remoteAddress: req.headers["x-forwarded-for"] ? req.headers["x-forwarded-for"] : req.connection.remoteAddress
        };
        
        logData.req_data = reqJson;
        
        console.log(logData)
        //if (process.env.NODE_ENV !== 'development') {
            if (process.env.NODE_ENV !== 'development') {
                try {
                  // 4. Create and send message
                  const data = await sqs.send(new SendMessageCommand({
                    MessageBody: JSON.stringify(logData),
                    QueueUrl: config.get('App.aws.requestLogsQueue')
                  }));
                  console.log('Message sent, ID:', data.MessageId);
                } catch (err) {
                  console.error('SQS v3 error:', err);
                }
              }
        // }
    }
}