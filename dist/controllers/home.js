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
exports.fetchQueue = exports.index = void 0;
const client_sqs_1 = require("@aws-sdk/client-sqs");
const lodash_1 = require("lodash");
/**
 * Home page.
 * @route GET /
 */
const index = (req, res) => {
    res.render("home", {
        title: "Home",
        queueUrls: []
    });
};
exports.index = index;
/**
 * Fetch Queues
 * @route POST
 */
const fetchQueue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { accessKeyId, secretAccessKey, region, sessionToken, endpoint } = req.body;
    const credentials = {
        accessKeyId,
        secretAccessKey,
    };
    if (!lodash_1.isEmpty(sessionToken)) {
        credentials.sessionToken = sessionToken;
    }
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-sqs/index.html
    const client = new client_sqs_1.SQSClient({
        region: lodash_1.isEmpty(region) ? "us-west-2" : region,
        endpoint: lodash_1.isEmpty(endpoint) ? "http://localhost:4566" : endpoint,
        credentials,
    });
    const command = new client_sqs_1.ListQueuesCommand({});
    const response = yield client.send(command);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.customStorage.setItem("queueInfo", JSON.stringify({
        queueUrls: response.QueueUrls,
        credentials: { accessKeyId, secretAccessKey, region, sessionToken, endpoint }
    }));
    res.render("home", {
        title: "Home",
        queueUrls: response.QueueUrls,
    });
});
exports.fetchQueue = fetchQueue;
//# sourceMappingURL=home.js.map