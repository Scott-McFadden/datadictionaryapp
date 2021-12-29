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
const mongoCollection = require("./data/mongoCollection");
const sqlServerCollection = require("./data/sqlServerConnection");

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

const connectionDef = [];

let pconnections;   // connection configuration details
let ptemplates;     // template details
let pquerydefs;     // predefined query definitions


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
    log.info(ret);

    // load templates

    for(let a = 0; a< ptemplates.length; a++)
        try {
            await getConnection('templates').addOne(ptemplates[a]);
        }
         catch (er)
         {
             log.info(ptemplates[a].name + " > "+ er);
         }

    for(let a=0; a< pconnections.length; a++)
        try {
            await getConnection('connections').addOne(pconnections[a]);
        }
        catch (er)
        {
            log.info(pconnections[a].name + " > "+ er);
        }
    for(let a=0; a< pquerydefs.length; a++)
        try {
            await getConnection('querydefs').addOne(pquerydefs[a]);
        }
        catch (er)
        {
            log.info(pquerydefs[a].name + " > "+ er);
        }

  //  await mc.addOne(pconnections[0]);
  //  await mc.getOne({"_id" : mc.lastId});

   res.send("preload completed.  " );
}))

getConnection = (name) => {
    return connectionDef.find( a=> a.collectionName === name);
}


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

    let rawData = fs.readFileSync("./data/preLoadData.json");
    let preLoadData = JSON.parse(rawData);

    pconnections = preLoadData[2].connection;
    ptemplates = preLoadData[0].templates;
    pquerydefs = preLoadData[1].queryDefs;

    for (let a=0; a< pconnections.length; a++)
    {
        if(pconnections[a].engineType === "mongo")
        {
            try {
                log.info(pconnections[a]);
                connectionDef.push( new mongoCollection(pconnections[a]));
            }
            catch(er)
            {
                log.error(pconnections[a].name + " > " + er.toString());
            }

        }  else  if(pconnections[a].engineType === "sqlServer"){
            connectionDef.push(new sqlServerCollection(pconnections[a]));
        } else
        {
            log.error(`engine (${pconnections[a].engineType}) has not been configured `);
            throw `engine (${pconnections[a].engineType}) has not been configured `;
        }
    }

});