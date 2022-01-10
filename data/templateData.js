const log = require("cslog");
const Exception = require("./exception");
const _ = require("lodash");
const Utils = require("../utils");

const MongoCollection = require("./mongoCollection-mongodb");

/**
 * templateData
 *
 * objectives
 * 1. load the templates into cache table
 * 2. get templates  (get)
 * 3. update templates (update)
 * 4. remove templates (remove)
 * 5. List queries  (listQueries)
 * 6. Add Query (add)
 * 7. reset cache table (resetcache)
 *
 */
class templateData {

    templateCollection = [];
    collectionParameters = {};
    dataAccess = new MongoCollection();
    cacheRebuilding = false;

    constructor(collectionParameters = null) {
        if (collectionParameters) {
            this.collectionParameters = collectionParameters;
            // this.initialize();
        }

    }

    /**
     * Set up data access layer and load (reset) cache
     * @returns {Promise<void>}
     */
    async initialize() {
        await this.CreateDA();  //load Data Access Layer
        await this.resetCache();

    }

    /**
     * This creates the data access layer
     * @returns {Promise<void>}
     * @constructor
     */
    async CreateDA() {
        this.dataAccess = new MongoCollection(this.collectionParameters);
        await this.dataAccess.createModel();
    }

    className = () => {
        return this.constructor().name;
    }

    async get(name) {
        return this.templateCollection.find(a => a.name == name);
    }

    async update() {
        if (this.cacheRebuilding) await this.WaitForCache();
        let result = {};
        let item = Utils.getJson(data);
        log.info(`${Date().toString()} templateCollection.update  > updated template   (${item.name})`);
        try {
            result = await this.dataAccess.findAndReplace(item);
            let loc = this.templateCollection.indexOf(a => a.name === item.name);
            this.templateCollection.splice(loc, 1, result);
        } catch (er) {
            throw new Exception("templateCollection.update", "Could not replace item",
                Utils.getJson(data), er.toString(), er);
        }
        return result;
    }

    /**
     * removes one template based on the data._id
     * @param data
     * @returns
     * */
    async remove(data) {

        if (this.cacheRebuilding) await this.WaitForCache();
        let result = {};
        let item = Utils.getJson(data);

        try {
            result = await this.dataAccess.deleteById(item._id);
            let loc = this.collectionDefinitions.indexOf(a => a._id === item._id);
            this.collectionDefinitions.splice(loc, 1);
            log.info(`${Date().toString()} templateData.remove  > removed template  (${item.name})`);
            log.info(JSON.stringify(result));
        } catch (er) {
            throw new Exception("templateData.remove", "Could not remove item",
                Utils.getJson(data), er.toString(), er);
        }
        return result;

    }

    /**
     * Adds one template
     * @param data
     * @returns {Promise<*|{}>}
     */
    async add(data) {
        if (this.cacheRebuilding) await this.WaitForCache();
        let result = {};
        let item = Utils.getJson(data);
        if (this.templateCollection.find(a => a.name === item.name))
            throw new Exception("templateData.add", "template with " + item.name + " already exists in collection", Utils.getJson(data));

        try {
            result = await this.dataAccess.addOne(item);
            this.templateCollection.push(result);
            log.info(`${Date().toString()} templateData.add  > added template  (${data.name})`);
        } catch (er) {
            throw new Exception("templateData.add", "Could not save item",
                Utils.getJson(data), er.toString(), er);
        }
        return result;
    }


    async listQueries(fieldList = ["name", "description", "tags"], tags = []) {
        if (this.cacheRebuilding)
            throw new Exception("collectionsData.listCollections", "rebuilding the cache");

        if (tags.length === 0) {
            return _.orderBy(Utils.reduceScope(this.templateCollection, fieldList), fieldList, ["asc"]);
        }

        let ans = this.templateCollection.filter(a => Utils.hasArrayItem(a.roles, [templateAdmin]));
        console.log(ans);
        return Utils.reduceScope(ans, ["name", "description", "tags"]);
    }

    /**
     * clears the cache and reloads the templates from the database
     * @returns {Promise<void>}
     */
    resetCache = async () => {
        //log.info(`${Date().toString()}   Rebuilding templateCollection cache`);
        this.cacheRebuilding = true;
        this.templateCollection = [];
        this.templateCollection = await this.dataAccess.getMany();
        this.cacheRebuilding = false;
        // log.info(`${Date().toString()}   Rebuilding templateCollection completed`);
        return {status: 'ok', msg: 'cache reset'};
    }

    // wait for cache to reload
    async WaitForCache() {
        let its = 10;
        for (let a = 0; a < its; a++) {
            await Utils.delay();
            if (this.cacheRebuilding === false)
                break;
        }
    }
}

module.exports = templateData;