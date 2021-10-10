"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.index = void 0;
const lodash_1 = require("lodash");
const client_sqs_1 = require("@aws-sdk/client-sqs");
/**
 * List of API examples.
 * @route GET /api
 */
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const queueInfoStr = // eslint-disable-next-line @typescript-eslint/ban-ts-comment
     
    // @ts-ignore
    global.customStorage.getItem("queueInfo");
    if (!queueInfoStr) {
        return res.redirect("/");
    }
    const { queueUrls, credentials } = JSON.parse(queueInfoStr);
    if (!queueUrls || !credentials) {
        return res.redirect("/");
    }
    const { queueName, action } = req.query;
    const currentQueueUrl = lodash_1.find(queueUrls, url => url.lastIndexOf(queueName) > -1);
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-sqs/index.html
    const { region, endpoint } = credentials;
    const client = new client_sqs_1.SQSClient({
        region: lodash_1.isEmpty(region) ? "us-west-2" : region,
        endpoint: lodash_1.isEmpty(endpoint) ? "http://localhost:4566" : endpoint,
        credentials,
    });
    let messageInfo = undefined;
    let jsonMessage;
    switch (action) {
        case "sentMessage":
            const { messageBody, delaySeconds } = req.body;
            if (lodash_1.isEmpty(messageBody)) {
                break;
            }
            try {
                jsonMessage = JSON.parse(messageBody);
                if (!lodash_1.isObject(jsonMessage)) {
                    jsonMessage = null;
                    break;
                }
            }
            catch (e) {
                break;
            }
            const sendCommand = new client_sqs_1.SendMessageCommand({
                QueueUrl: currentQueueUrl,
                DelaySeconds: !delaySeconds ? 0 : (delaySeconds > 900 || delaySeconds < 0 ? 0 : delaySeconds),
                MessageBody: JSON.stringify(jsonMessage),
            });
            try {
                messageInfo = yield client.send(sendCommand);
            }
            catch (e) {
                req.flash("errors", { msg: "Can't send the message." });
                console.log(e);
                break;
            }
            req.flash("success", { msg: "The message has been sent. Message ID: " + messageInfo.MessageId });
            break;
    }
    const { purgeQueue, messageBody } = req.body;
    if (purgeQueue) {
        const sendCommand = new client_sqs_1.PurgeQueueCommand({
            QueueUrl: currentQueueUrl,
        });
        try {
            yield client.send(sendCommand);
            req.flash("success", { msg: "Purge Queue was successfully" });
        }
        catch (e) {
            req.flash("errors", { msg: "Can't send the message." });
            console.log(e);
        }
    }
    const command = new client_sqs_1.GetQueueAttributesCommand({
        QueueUrl: currentQueueUrl
    });
    const queueAttributes = yield client.send(command);
    if (action === "sentMessage" && !lodash_1.isEmpty(messageBody) && !messageInfo) {
        req.flash("errors", { msg: "Message json format is invalid." });
    }
    else if (action === "sentMessage" && lodash_1.isEmpty(messageBody) && req.method === "POST") {
        req.flash("errors", { msg: "Message Body can't blank" });
    }
    res.render("queue/index", {
        title: "Queue Examples",
        currentQueueUrl,
        url: `/detail?queueName=${queueName}`,
        queueAttributes: queueAttributes.Attributes,
        currentAction: action || "queueAttributes",
        messageInfo,
        messageView: {
            id: messageInfo ? messageInfo.MessageId : "",
            text: messageInfo ? JSON.stringify(jsonMessage, undefined, 2) : ((action === "sentMessage" && !lodash_1.isEmpty(messageBody)) ? "Your message is an invalid JSON format" : ""),
        }
    });
});
exports.index = index;
//# sourceMappingURL=queue.js.map