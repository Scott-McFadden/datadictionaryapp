/*********************
 * Connections
 *********************/

router.get("/:name", async (req, res) => {
    totalCalls++;
    try {
        let ret = await pconnections.getCollection(req.params.name);
        res.status(200);
        res.json(ret);
    } catch (er) {
        res.status(500);
        res.JSON(Utils.webErrorMessage(er, debugOn));
    }

});

router.get("/", async (req, res) => {
    totalCalls++;
    try {
        let ret = await pconnections.listCollections();
        res.status(200);
        res.json(ret);
    } catch (er) {
        res.status(500);
        res.json(Utils.webErrorMessage(er, debugOn));
    }

});

router.get("/resetCache", async (req, res) => {
    totalCalls++;
    try {
        let ret = await pconnections.resetCache();
        res.status(200);
        res.json(ret);
    } catch (er) {
        res.status(500);
        res.json(Utils.webErrorMessage(er, debugOn));
    }
});

router.post("/", async (req, res) => {
    totalCalls++;
    try {

        let ret = await pconnections.addCollection(req.body);
        res.status(200);
        res.json(ret);
    } catch (er) {
        res.status(500);
        res.json(Utils.webErrorMessage(er, debugOn));
    }

});

router.put("/", async (req, res) => {
    totalCalls++;
    try {
        //console.log("updateCollection", JSON.stringify(req.body));
        let ret = await pconnections.updateCollection(req.body);
        res.status(200);
        res.json(ret);
    } catch (er) {
        res.status(500);
        res.json(Utils.webErrorMessage(er, debugOn));
    }

});

router.delete("/", async (req, res) => {
    totalCalls++;
    try {
        console.log("updateCollection", JSON.stringify(req.body));
        let ret = await pconnections.removeCollection(req.body);
        res.status(200);
        res.json(ret);
    } catch (er) {
        res.status(500);
        res.json(Utils.webErrorMessage(er, debugOn));
    }

});


module.exports = router