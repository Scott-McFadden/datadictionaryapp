/**
 * requires
 */

const mongoose = require('mongoose');
const express = require("express");
const morgan = require('morgan');
const fs = require("fs");
const path = require("path");
const config = require("config");
const asyncHandler = require('express-async-handler')
const log = require("cslog");
const events = require('events');
const mongoCollection = require("./data/mongoCollection");


/**
 * Load Config Files
 */
const appConfig = config.get('app');
const qdefConfig = config.get('qdefDB');
/**
 * App setup
 * @type {*|Express}
 */

const app=   express();
const port = appConfig.port;
const eventEmitter = new events.EventEmitter();




/**
 * Morgan logger setup
 * @type {WriteStream}
 */
const accessLogStream = fs.createWriteStream(path.join(__dirname, appConfig.logname), { flags: 'a' })
app.use(morgan('combined', { stream: accessLogStream }));





/**
 * gets hello world
 *
 */
app.get("/", (req,res) => {
    res.send('hello world');
});
/**
 * exits application
 */
app.get("/exit", (req, res) => {
    res.send("exiting");
    console.log("shutting down");
    process.exit();
});
/**
 * dumps data for diagnostic purposes.
 */
app.get("/data", asyncHandler(async (req,res) => {

    if (appConfig.debug === true)
    {
        let ret = { "appConfig" : appConfig, "qdefConfig" : qdefConfig };
        log.info("Dumping Data");
        log.info(JSON.stringify(ret));
        res.send(JSON.stringify(ret));
    }
    else
    {
        // 418 is I'm a teapot
        res.status(418).send("Sorry, the server is not in debug mode and can not provide the information  you requested.")
    }

}))

app.get("/preload", asyncHandler(async ( req, res) => {


    let ret = "Preloading Mongo Tables";

    let rawData = fs.readFileSync("./data/preLoadData.json");
    let preLoadData = JSON.parse(rawData);

    let pconnections = preLoadData[2].connection;
    let ptemplates = preLoadData[0];
    let pquerydefs = preLoadData[1];
    console.log(pconnections);

    let uniqueCollections = [];
    for (let con=0; con<pconnections.length; con++)
    {
        log.info("looking for " );
        log.info(pconnections[con].name);
        if ( !uniqueCollections.find( a => a.collectionName  == pconnections[con].collectionName && a.connectionString == pconnections[con].connectionString))
        {
            uniqueCollections.push({ "connectionString": pconnections[con].connectionString, "collection" : pconnections[con].collectionName });
        }
    }

    let mc = new mongoCollection(pconnections[0]);
    await mc.createModel();
    await mc.addOne(pconnections[0]);
    await mc.getOne({"_id" : mc.lastId});





   res.send("preload");
}))

app.get("/resetDatabase", asyncHandler(async ( req, res) => {
 //   let rawData = fs.readFileSync ("./data/preLoadData.json");
 //   let preLoadData = JSON.parse(rawData);

    let ret = "Removing Mongo Collections";
    log.h1(ret);

    ret = "Removing Mongo Database";
    log.h1(ret);

    res.send("preload");
}))











app.listen(port, ()=> {
    console.log(`app started at http://${appConfig.hostUrl}:${port}   ${new Date().toLocaleTimeString()}`);


});