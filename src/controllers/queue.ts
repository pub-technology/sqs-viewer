"use strict";

import {Request, Response} from "express";
import {find, isEmpty, isObject} from "lodash";
import {
    GetQueueAttributesCommand,
    GetQueueAttributesCommandInput,
    PurgeQueueCommand,
    PurgeQueueCommandInput,
    SendMessageCommand,
    SendMessageCommandInput,
    SendMessageCommandOutput,
    SQSClient
} from "@aws-sdk/client-sqs";

/**
 * List of API examples.
 * @route GET /api
 */
export const index = async (req: Request, res: Response) => {
    const queueInfoStr = // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        global.customStorage.getItem("queueInfo");
    if (!queueInfoStr) {
        return res.redirect("/");
    }
    const {queueUrls, credentials} = JSON.parse(queueInfoStr);
    if (!queueUrls || !credentials) {
        return res.redirect("/");
    }
    const {queueName, action} = req.query;
    const currentQueueUrl = find(queueUrls, url => url.lastIndexOf(queueName) > -1);

    // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-sqs/index.html
    const {region, endpoint} = credentials;
    const client = new SQSClient({
        region: isEmpty(region) ? "us-west-2" : region,
        endpoint: isEmpty(endpoint) ? "http://localhost:4566" : endpoint,
        credentials,
    });

    let messageInfo: SendMessageCommandOutput = undefined;
    let jsonMessage;
    switch (action) {
        case "sentMessage":
            const {messageBody, delaySeconds} = req.body;
            if (isEmpty(messageBody)) {
                break;
            }
            try {
                jsonMessage = JSON.parse(messageBody);
                if (!isObject(jsonMessage)) {
                    jsonMessage = null;
                    break;
                }
            } catch (e) {
                break;
            }
            const sendCommand = new SendMessageCommand({
                QueueUrl: currentQueueUrl,
                DelaySeconds: !delaySeconds ? 0 : (delaySeconds > 900 || delaySeconds < 0 ? 0 : delaySeconds),
                MessageBody: JSON.stringify(jsonMessage),
            } as SendMessageCommandInput);
            try {
                messageInfo = await client.send(sendCommand);
            } catch (e) {
                req.flash("errors", {msg: "Can't send the message."});
                console.log(e);
                break;
            }
            req.flash("success", {msg: "The message has been sent. Message ID: " + messageInfo.MessageId});
            break;
    }

    const {purgeQueue, messageBody} = req.body;
    if (purgeQueue) {
        const sendCommand = new PurgeQueueCommand({
            QueueUrl: currentQueueUrl,
        } as PurgeQueueCommandInput);
        try {
            await client.send(sendCommand);
            req.flash("success", {msg: "Purge Queue was successfully"});
        } catch (e) {
            req.flash("errors", {msg: "Can't send the message."});
            console.log(e);
        }
    }

    const command = new GetQueueAttributesCommand({
        QueueUrl: currentQueueUrl
    } as GetQueueAttributesCommandInput);
    const queueAttributes = await client.send(command);

    if (action === "sentMessage" && !isEmpty(messageBody) && !messageInfo) {
        req.flash("errors", {msg: "Message json format is invalid."});
    } else if (action === "sentMessage" && isEmpty(messageBody) && req.method === "POST"){
        req.flash("errors", {msg: "Message Body can't blank"});
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
            text: messageInfo ? JSON.stringify(jsonMessage, undefined, 2) : (
                (action === "sentMessage" && !isEmpty(messageBody)) ? "Your message is an invalid JSON format" : ""),
        }
    });
};
