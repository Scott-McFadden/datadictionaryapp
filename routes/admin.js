const express = require('express');
const router = express.Router();
const Exception = require("../data/exception");
const asyncHandler = require('express-async-handler')
const log = require("cslog");
const Utils = require("../utils");
const fs = require("fs");

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
router.get("/exit", (req, res) => {
    res.send("exiting datadictionaryapp");
    console.log(new Date().toString(), "shutting down");
    process.exit();
});
/**
 * dumps data for diagnostic purposes.
 */
router.get("/data", asyncHandler(async (req, res) => {
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

router.get("/preload", asyncHandler(async (req, res) => {
    totalCalls++;
    let rawData = fs.readFileSync("./data/preLoadData.json");
    let preLoadData = JSON.parse(rawData);

    for (let a = 0; a < preLoadData[2].connection.length; a++) {
        pconnections.addCollection(preLoadData[2].connection[a]);
    }

    //  await mc.addOne(pconnections[0]);
    //  await mc.getOne({"_id" : mc.lastId});

    res.send("preload completed.  ");
}))


router.get("/resetDatabase", asyncHandler(async (req, res) => {
    //   let rawData = fs.readFileSync ("./data/preLoadData.json");
    //   let preLoadData = JSON.parse(rawData);
    totalCalls++;

    let ret = "Removing Mongo Collections";
    log.info(ret);

    ret = "Removing Mongo Database";
    log.info(ret);

    res.send("preload");
}))


module.exports = router;