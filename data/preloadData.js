import fs from "fs";
import mongoCollection from "./data/mongoCollection";
import log from "cslog";
import sqlServerCollection from "./data/sqlServerConnection";

async function loadPreDefinedData() {
    let rawData = fs.readFileSync("./data/preLoadData.json");
    let preLoadData = JSON.parse(rawData);

    let pconnections = preLoadData[2].connection;
    let ptemplates = preLoadData[0].templates;
    let pquerydefs = preLoadData[1].queryDefs;

    for (let a = 0; a < pconnections.length; a++) {
        if (pconnections[a].engineType === "mongo") {
            try {
                // log.info(pconnections[a]);
                connectionDef.push(new mongoCollection(pconnections[a]));
            } catch (er) {
                if (typeof er === 'Exception')
                    er.consoleLog();
                else
                    log.error(pconnections[a].name + " > " + er.toString());
            }

        } else if (pconnections[a].engineType === "sqlServer") {
            connectionDef.push(new sqlServerCollection(pconnections[a]));
        } else {
            log.error(`engine (${pconnections[a].engineType}) has not been configured `);
            throw new Exception("loadPreDefinedData", `engine (${pconnections[a].engineType}) has not been configured `);
        }

        let ret = "Preloading Mongo Tables";
        log.info(ret);

        // load templates

        for (let a = 0; a < ptemplates.length; a++)
            try {
                await getConnection('templates').addOne(ptemplates[a]);
            } catch (er) {
                if (typeof er === 'Exception')
                    er.consoleLog();
                else
                    console.log(er);
            }

        for (let a = 0; a < pconnections.length; a++)
            try {
                await getConnection('connections').addOne(pconnections[a]);
            } catch (er) {
                er.consoleLog();
            }
        for (let a = 0; a < pquerydefs.length; a++)
            try {
                await getConnection('querydefs').addOne(pquerydefs[a]);
            } catch (er) {
                er.consoleLog();
            }

    }
}
