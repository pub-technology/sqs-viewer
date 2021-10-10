import {Request, Response} from "express";
import {ListQueuesCommand, ListQueuesCommandInput, ListQueuesCommandOutput, SQSClient} from "@aws-sdk/client-sqs";
import {isEmpty} from "lodash";

export interface Credentials {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken?: string;
    expiration?: Date;
}

/**
 * Home page.
 * @route GET /
 */
export const index = (req: Request, res: Response) => {
    res.render("home", {
        title: "Home",
        queueUrls: []
    });
};

/**
 * Fetch Queues
 * @route POST
 */
export const fetchQueue = async (req: Request, res: Response) => {
    const {accessKeyId, secretAccessKey, region, sessionToken, endpoint} = req.body;
    const credentials: Credentials = {
        accessKeyId,
        secretAccessKey,
    };
    if (!isEmpty(sessionToken)) {
        credentials.sessionToken = sessionToken;
    }
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-sqs/index.html
    const client = new SQSClient({
        region: isEmpty(region) ? "us-west-2" : region,
        endpoint: isEmpty(endpoint) ? "http://localhost:4566" : endpoint,
        credentials,
    });
    const command = new ListQueuesCommand({} as ListQueuesCommandInput);
    const response: ListQueuesCommandOutput = await client.send(command);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.customStorage.setItem("queueInfo", JSON.stringify({
        queueUrls: response.QueueUrls,
        credentials: {accessKeyId, secretAccessKey, region, sessionToken, endpoint}
    }));
    res.render("home", {
        title: "Home",
        queueUrls: response.QueueUrls,
    });
};
