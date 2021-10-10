import express from "express";
import compression from "compression"; // compresses requests
import bodyParser from "body-parser";
import lusca from "lusca";
import flash from "express-flash";
import session from "express-session";
import path from "path";
import * as nodeLocalstorage from "node-localstorage";

// Controllers (route handlers)
import * as homeController from "./controllers/home";
import * as queueController from "./controllers/queue";


// Create Express server
const app = express();

// Express configuration
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    cookie: {maxAge: 60000},
    secret: "woot",
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use(
    express.static(path.join(__dirname, "public"), {maxAge: 31557600000})
);

/**
 * Primary app routes.
 */
app.get("/", homeController.index);
app.post("/", homeController.fetchQueue);
app.get("/detail", queueController.index);
app.post("/detail", queueController.index);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
global.customStorage = new nodeLocalstorage.LocalStorage("./scratch");

export default app;
