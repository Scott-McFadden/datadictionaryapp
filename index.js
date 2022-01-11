/**
 * requires
 */
const express = require("express");
const morgan = require('morgan');
const fs = require("fs");
const path = require("path");
const config = require("config");
const asyncHandler = require('express-async-handler')
const log = require("cslog");
const mongoCollection = require("./data/mongoCollection-mongodb");
const sqlServerCollection = require("./data/sqlServerConnection");
const collectionData = require("./data/collectionsData");
const queryDefData = require("./data/queryDefData");
const templateData = require("./data/templateData");
const connectionRoutes = require("./routes/connection");
const adminRoutes = require("./routes/admin");
const querydefRoutes = require("./routes/querydefs");
const templateRoutes = require("./routes/templates");


const debugOn = true;

const Exception = require("./data/exception");

/**
 * Load Config Files
 */
const appConfig = config.get('app');
const qdefConfig = config.get('qdefDB');
/**
 * App setup
 * @type {*|Express}
 */

const app = express();
const port = appConfig.port;


const collectionsDefintion = {
    "name": "connections",
    "description": "connection info for connections",
    "engineType": "mongo",
    "connectionString": "mongodb://localhost:27017/",
    "dbName": "querydefs",
    "collectionName": "connections",
    "schema": {
        "name": {
            "type": "String",
            "unique": true
        },
        "description": {
            "type": "String"
        },
        "engineType": {
            "type": "String"
        },
        "connectionString": {
            "type": "String"
        },
        "dbName": {
            "type": "String"
        },
        "collectionName": {
            "type": "String"
        },
        "schema": {},
        "uniqueKeys": [
            {
                "type": "String"
            }
        ]
    },
    "uniqueKeys": ["name"]
}
const connectionDef = [];

global.pconnections;   // connection configuration details
global.ptemplate;     // template details
global.pquerydefs;     // predefined query definitions
global.totalCalls = 0;

const initDB = async () => {
    pconnections = new collectionData(collectionsDefintion);
    await pconnections.loadData();
    log.info("collections: " + pconnections.collectionDefinitions.length + " collection entries loaded");

    if (pconnections && pconnections.collectionDefinitions.length) {
        let qd = await pconnections.getCollection("querydefs");
        if (qd) {
            pquerydefs = new queryDefData(qd);

            await pquerydefs.initialize().catch((er) => {
                console.log(er);
            });
            log.info("queryDef: " + pquerydefs.queryDefCollection.length + " queryDef entries loaded");
        }

        let qt = await pconnections.getCollection("templates");
        if (qt) {
            ptemplate = new templateData(qt);
            ptemplate.initialize();
            log.info("templates: " + ptemplate.templateCollection.length + " template entries loaded");
        }
    }
}


/**
 * Morgan logger setup
 * @type {WriteStream}
 */
const accessLogStream = fs.createWriteStream(path.join(__dirname, appConfig.logname), {flags: 'a'})
app.use(morgan('combined', {stream: accessLogStream}));
app.use(express.json());


/**
 * gets alive status
 *
 */
app.get("/", (req, res) => {
    let body = `${new Date().toString()} </br> datadictionaryapp is alive</br>${totalCalls} API requests have been satified</br>`;
    res.send(body);
});

app.use("/connection", connectionRoutes);
app.use("/admin", adminRoutes);
app.use("/template", templateRoutes);
app.use("/querydef", querydefRoutes);


app.listen(port, async () => {
    console.log(`app started at http://${appConfig.hostUrl}:${port}   ${new Date().toLocaleTimeString()}`);

    await initDB();

});