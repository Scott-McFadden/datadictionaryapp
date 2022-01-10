const log = require("cslog");
const Exception = require("./exception");
const _ = require("lodash");
const Utils = require("../utils");

const MongoCollection = require("./mongoCollection-mongodb");

/**
 * queryDefData
 *
 * objectives
 * 1. load the querydefs into cache table
 * 2. get queryDefs  (get)
 * 3. update queryDefs (update)
 * 4. remove queryDefs (remove)
 * 5. List queries  (listQueries)
 * 6. Add Query (add)
 * 7. reset cache table (resetcache)
 *
 */
class queryDefData {

    queryDefCollection = [];
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
        return this.queryDefCollection.find(a => a.name == name);
    }

    async update() {
        if (this.cacheRebuilding) await this.WaitForCache();
        let result = {};
        let item = Utils.getJson(data);
        log.info(`${Date().toString()} queryDefCollection.update  > updated queryDef   (${item.name})`);
        try {
            result = await this.dataAccess.findAndReplace(item);
            let loc = this.queryDefCollection.indexOf(a => a.name === item.name);
            this.queryDefCollection.splice(loc, 1, result);
        } catch (er) {
            throw new Exception("queryDefCollection.update", "Could not replace item",
                Utils.getJson(data), er.toString(), er);
        }
        return result;
    }

    /**
     * removes one querydef based on the data._id
     * @param data
     * @returns {Promise<awaited Query<T extends Document ? Require_id<T> : (Document<any, any, T> & Require_id<T> & TVirtuals & TMethods) | null, T extends Document ? Require_id<T> : (Document<any, any, T> & Require_id<T> & TVirtuals & TMethods), TQueryHelpers, T> & TQueryHelpers>}
     */
    async remove(data) {

        if (this.cacheRebuilding) await this.WaitForCache();
        let result = {};
        let item = Utils.getJson(data);

        try {
            result = await this.dataAccess.deleteById(item._id);
            let loc = this.collectionDefinitions.indexOf(a => a._id === item._id);
            this.collectionDefinitions.splice(loc, 1);
            log.info(`${Date().toString()} queryDefData.remove  > removed queryDef  (${item.name})`);
            log.info(JSON.stringify(result));
        } catch (er) {
            throw new Exception("queryDefData.remove", "Could not remove item",
                Utils.getJson(data), er.toString(), er);
        }
        return result;

    }

    /**
     * Adds one querydef
     * @param data
     * @returns {Promise<*|{}>}
     */
    async add(data) {
        if (this.cacheRebuilding) await this.WaitForCache();
        let result = {};
        let item = Utils.getJson(data);
        if (this.queryDefCollection.find(a => a.name === item.name))
            throw new Exception("queryDefData.add", "queryDef with " + item.name + " already exists in collection", Utils.getJson(data));

        try {
            result = await this.dataAccess.addOne(item);
            this.queryDefCollection.push(result);
            log.info(`${Date().toString()} queryDefData.add  > added queryDef  (${data.name})`);
        } catch (er) {
            throw new Exception("queryDefData.add", "Could not save item",
                Utils.getJson(data), er.toString(), er);
        }
        return result;
    }


    async listQueries(fieldList = ["name", "description", "tags"], tags = []) {
        if (this.cacheRebuilding)
            throw new Exception("collectionsData.listCollections", "rebuilding the cache");

        if (tags.length === 0) {
            return _.orderBy(Utils.reduceScope(this.queryDefCollection, fieldList), fieldList, ["asc"]);
        }

        let ans = this.queryDefCollection.filter(a => Utils.hasArrayItem(a.roles, [queryDefAdmin]));
        console.log(ans);
        return Utils.reduceScope(ans, ["name", "description", "tags"]);
    }

    /**
     * clears the cache and reloads the querydefs from the database
     * @returns {Promise<void>}
     */
    resetCache = async () => {
        //log.info(`${Date().toString()}   Rebuilding queryDefCollection cache`);
        this.cacheRebuilding = true;
        this.queryDefCollection = [];
        this.queryDefCollection = await this.dataAccess.getMany();
        this.cacheRebuilding = false;
        // log.info(`${Date().toString()}   Rebuilding queryDefCollection completed`);
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

module.exports = queryDefData;