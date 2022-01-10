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
const templateData = require("./data/templateData")
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

let pconnections;   // connection configuration details
let ptemplate;     // template details
let pquerydefs;     // predefined query definitions


/**
 * Morgan logger setup
 * @type {WriteStream}
 */
const accessLogStream = fs.createWriteStream(path.join(__dirname, appConfig.logname), {flags: 'a'})
app.use(morgan('combined', {stream: accessLogStream}));
app.use(express.json());


let totalCalls = 0;


/**
 * gets alive status
 *
 */
app.get("/", (req, res) => {
    let body = `${new Date().toString()} </br> datadictionaryapp is alive</br>${totalCalls} API requests have been satified</br>`;
    res.send(body);
});
/**
 * exits application
 */
app.get("/exit", (req, res) => {
    res.send("exiting datadictionaryapp");
    console.log(new Date().toString(), "shutting down");
    process.exit();
});
/**
 * dumps data for diagnostic purposes.
 */
app.get("/data", asyncHandler(async (req, res) => {
    totalCalls++;
    if (appConfig.debug === true) {
        let ret = {"appConfig": appConfig, "qdefConfig": qdefConfig};
        log.info("Dumping Data");
        log.info(JSON.stringify(ret));
        res.send(JSON.stringify(ret));
    } else {
        // 418 is I'm a teapot
        res.status(418).send("Sorry, the server is not in debug mode and can not provide the information  you requested.")
    }

}))

app.get("/preload", asyncHandler(async (req, res) => {
    totalCalls++;
    let rawData = fs.readFileSync("./data/preLoadData.json");
    let preLoadData = JSON.parse(rawData);

    for (let a = 0; a < preLoadData[2].connection.length; a++) {
        this.pconnections.addCollection(preLoadData[2].connection[a]);
    }


    //  await mc.addOne(pconnections[0]);
    //  await mc.getOne({"_id" : mc.lastId});

    res.send("preload completed.  ");
}))


app.get("/resetDatabase", asyncHandler(async (req, res) => {
    //   let rawData = fs.readFileSync ("./data/preLoadData.json");
    //   let preLoadData = JSON.parse(rawData);
    totalCalls++;

    let ret = "Removing Mongo Collections";
    log.info(ret);

    ret = "Removing Mongo Database";
    log.info(ret);

    res.send("preload");
}))

/*********************
 * Connections
 *********************/

app.get("/connection/:name", async (req, res) => {
    totalCalls++;
    try {
        let ret = await this.pconnections.getCollection(req.params.name);
        res.status(200);
        res.json(ret);
    } catch (er) {
        res.status(500);
        res.JSON(Utils.webErrorMessage(er, debugOn));
    }

});

app.get("/connection", async (req, res) => {
    totalCalls++;
    try {
        let ret = await this.pconnections.listCollections();
        res.status(200);
        res.json(ret);
    } catch (er) {
        res.status(500);
        res.JSON(Utils.webErrorMessage(er, debugOn));
    }

});

app.get("/connection/resetCache", async (req, res) => {
    totalCalls++;
    try {
        let ret = await this.pconnections.resetCache();
        res.status(200);
        res.json(ret);
    } catch (er) {
        res.status(500);
        res.JSON(Utils.webErrorMessage(er, debugOn));
    }
});

app.post("/connection", async (req, res) => {
    totalCalls++;
    try {

        let ret = await this.pconnections.addCollection(req.body);
        res.status(200);
        res.json(ret);
    } catch (er) {
        res.status(500);
        res.JSON(Utils.webErrorMessage(er, debugOn));
    }

});

app.put("/connection", async (req, res) => {
    totalCalls++;
    try {
        //console.log("updateCollection", JSON.stringify(req.body));
        let ret = await this.pconnections.updateCollection(req.body);
        res.status(200);
        res.json(ret);
    } catch (er) {
        res.status(500);
        res.JSON(Utils.webErrorMessage(er, debugOn));
    }

});

app.delete("/connection", async (req, res) => {
    totalCalls++;
    try {
        console.log("updateCollection", JSON.stringify(req.body));
        let ret = await this.pconnections.removeCollection(req.body);
        res.status(200);
        res.json(ret);
    } catch (er) {
        res.status(500);
        res.JSON(Utils.webErrorMessage(er, debugOn));
    }

});


/*********************
 * queryDefs
 *********************/
// list
app.get("/querydefs", async (req, res) => {
    totalCalls++;
    try {
        res.status = 200;
        res.json(await this.pquerydefs.listQueries());
    } catch (er) {

        if (er.className() === "Exception")
            er.consoleLog();
        else
            console.log(er);
        res.status = 500;
        res.json({status: "error", msg: er});
    }
});
// get one
app.get("/querydefs/:name", async (req, res) => {
    totalCalls++;
    try {
        let ret = await this.pquerydefs.get(req.params.name);
        res.status(200);
        res.json(ret);
    } catch (er) {
        res.status(500);
        res.JSON(Utils.webErrorMessage(er, debugOn));
    }
});
// reset cache
app.get("/querydefs/resetCache", async (req, res) => {
    totalCalls++;
    try {
        let ret = this.pquerydefs.resetCache();
        res.status(200)
        res.JSON(ret);
    } catch (er) {
        res.status(500);
        res.JSON(Utils.webErrorMessage(er, debugOn));
    }

});
// update
app.put("/querydefs", async (req, res) => {
    totalCalls++;
    try {

        let ret = await this.pquerydefs.update(req.body);
        res.status(200);
        res.json(ret);
    } catch (er) {
        res.status(500);
        res.JSON(Utils.webErrorMessage(er, debugOn));
    }
});
+
// delete
    app.delete("/querydefs", async (req, res) => {
        totalCalls++;
        try {
            let ret = await this.pquerydefs.remove(req.body);
            res.status(200);
            res.json(ret);
        } catch (er) {
            res.status(500);
            res.JSON(Utils.webErrorMessage(er, debugOn));
        }
    });
// add
app.post("/querydefs", async (req, res) => {
    totalCalls++;
    try {

        let ret = await this.pquerydefs.update(req.body);
        res.status(200);
        res.json(ret);
    } catch (er) {
        res.status(500);
        res.JSON(Utils.webErrorMessage(er, debugOn));
    }

});

/*********************
 * template
 *********************/
// list
app.get("/template", async (req, res) => {
    totalCalls++;
    try {
        res.status = 200;
        res.json(await this.ptemplate.listQueries());
    } catch (er) {

        if (er.className() === "Exception")
            er.consoleLog();
        else
            console.log(er);
        res.status = 500;
        res.json({status: "error", msg: er});
    }
});
// get one
app.get("/template/:name", async (req, res) => {
    totalCalls++;
    try {
        let ret = await this.ptemplate.get(req.params.name);
        res.status(200);
        res.json(ret);
    } catch (er) {
        res.status(500);
        res.JSON(Utils.webErrorMessage(er, debugOn));
    }
});
// reset cache
app.get("/template/resetCache", async (req, res) => {
    totalCalls++;
    try {
        let ret = this.ptemplate.resetCache();
        res.status(200)
        res.JSON(ret);
    } catch (er) {
        res.status(500);
        res.JSON(Utils.webErrorMessage(er, debugOn));
    }

});
// update
app.put("/template", async (req, res) => {
    totalCalls++;
    try {

        let ret = await this.ptemplate.update(req.body);
        res.status(200);
        res.json(ret);
    } catch (er) {
        res.status(500);
        res.JSON(Utils.webErrorMessage(er, debugOn));
    }
});
+
// delete
    app.delete("/template", async (req, res) => {
        totalCalls++;
        try {
            let ret = await this.ptemplate.remove(req.body);
            res.status(200);
            res.json(ret);
        } catch (er) {
            res.status(500);
            res.JSON(Utils.webErrorMessage(er, debugOn));
        }
    });
// add
app.post("/template", async (req, res) => {
    totalCalls++;
    try {

        let ret = await this.ptemplate.update(req.body);
        res.status(200);
        res.json(ret);
    } catch (er) {
        res.status(500);
        res.JSON(Utils.webErrorMessage(er, debugOn));
    }

});


app.listen(port, async () => {
    console.log(`app started at http://${appConfig.hostUrl}:${port}   ${new Date().toLocaleTimeString()}`);
    this.pconnections = new collectionData(collectionsDefintion);
    await this.pconnections.loadData();
    log.info("collections: " + this.pconnections.collectionDefinitions.length + " collection entries loaded");

    if (this.pconnections && this.pconnections.collectionDefinitions.length) {
        let qd = await this.pconnections.getCollection("querydefs");
        if (qd) {
            this.pquerydefs = new queryDefData(qd);

            await this.pquerydefs.initialize().catch((er) => {
                console.log(er);
            });
            log.info("queryDef: " + this.pquerydefs.queryDefCollection.length + " queryDef entries loaded");
        }

        let qt = await this.pconnections.getCollection("templates");
        if (qt) {
            this.ptemplate = new templateData(qt);
            await this.ptemplate.initialize().catch((er) => {
                console.log(er);
            });
            log.info("templates: " + this.ptemplate.templateCollection.length + " template entries loaded");
        }
    }


});