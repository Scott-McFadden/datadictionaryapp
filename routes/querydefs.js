const express = require('express');
const router = express.Router();
const Exception = require("../data/exception");
const asyncHandler = require('express-async-handler')
const log = require("cslog");
const Utils = require("../utils");

/*********************
 * queryDefs
 *********************/
// list
router.get("/", async (req, res) => {
    totalCalls++;
    try {
        res.status = 200;
        res.json(await pquerydefs.listQueries());
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
router.get("/:name", async (req, res) => {
    totalCalls++;
    try {
        let ret = await pquerydefs.get(req.params.name);
        res.status(200);
        res.json(ret);
    } catch (er) {
        res.status(500);
        res.json(Utils.webErrorMessage(er, debugOn));
    }
});
// reset cache
router.get("/resetCache", async (req, res) => {
    totalCalls++;
    try {
        let ret = pquerydefs.resetCache();
        res.status(200)
        res.json(ret);
    } catch (er) {
        res.status(500);
        res.json(Utils.webErrorMessage(er, debugOn));
    }

});
// update
router.put("/", async (req, res) => {
    totalCalls++;
    try {

        let ret = await pquerydefs.update(req.body);
        res.status(200);
        res.json(ret);
    } catch (er) {
        res.status(500);
        res.json(Utils.webErrorMessage(er, debugOn));
    }
});

// delete
router.delete("/", async (req, res) => {
    totalCalls++;
    try {
        let ret = await pquerydefs.remove(req.body);
        res.status(200);
        res.json(ret);
    } catch (er) {
        res.status(500);
        res.json(Utils.webErrorMessage(er, debugOn));
    }
});
// add
router.post("/", async (req, res) => {
    totalCalls++;
    try {

        let ret = await pquerydefs.update(req.body);
        res.status(200);
        res.json(ret);
    } catch (er) {
        res.status(500);
        res.json(Utils.webErrorMessage(er, debugOn));
    }

});


module.exports = router;