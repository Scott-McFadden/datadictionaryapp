const mongo = require("./mongoCollection-mongodb");

const log = require("cslog");
const Exception = require("./exception");
const _ = require("lodash");
const Utils = require("../utils");

/**
 * This loads the collections from the mongo database.
 *
 * Class objectives:
 *
 * 1. loads collection information into the cache table.  (load Data)
 * 2. gets a list of available collections.  (listCollections)
 * 3. Allows the system to add a new collection - first to the database then to the cache.   (add collection)
 * 4. Allows the system to update a collection -  as above.    (updateCollection)
 * 5. Allows the system to remove a collection - as above.     (removeCollection)
 * 6. Allows the system user to get a collection by name.      (getCollection)
 * 7. Allows the system to ask the class to rebuild cache from the database.  (resetCache)
 *
 */
class collectionsData {

    constructor(connectionDefinition) {
        // super(props);
        this.connectionDef = connectionDefinition;
    }

    connectionDef;
    collectionsDB;

    collectionDefinitions = [];

    loadData = async () => {
        try {
            this.collectionsDB = new mongo(this.connectionDef);
            await this.collectionsDB.createModel();
            this.collectionDefinitions = await this.collectionsDB.getMany();
        } catch (er) {
            console.log("collectionsData.loadData could not load data");
            console.log(JSON.stringify(er));
        }

        //console.log(JSON.stringify(this.collectionDefinitions));

    };


    /**
     * Adds a new collection defintion
     * @param data
     * @returns {Promise<*>}
     */
    addCollection = async (data) => {
        if (this.cacheRebuilding) await this.WaitForCache();
        let result = {};
        let item = Utils.getJson(data);
        log.info(`${Date().toString()} collectionsData.addCollection > added collectionDefintion  (${data.name})`);
        try {
            result = await this.collectionsDB.addOne(item);
            this.collectionDefinitions.push(result);
        } catch (er) {
            throw new Exception("collectionsData.addCollection", "Could not save item",
                Utils.getJson(data), er.toString(), er);
        }
        return result;
    }

    /**
     * Gets the named collection from the collectionDefintions object
     * @param name
     * @returns {*}
     */
    // async getCollection(name) {
    //     if (this.cacheRebuilding)  await this.WaitForCache();
    //     let ret = this.collectionDefinitions.find(a => a.name == name);
    //
    //    // console.log(ret);
    //     return ret._doc;
    // }
    getCollection(name) {
        if (this.cacheRebuilding) this.WaitForCache();
        let ret = this.collectionDefinitions.find(a => a.name == name);

        // console.log(ret);
        return ret;
    }

    /**
     * returns a list of collection names in the cache.
     *
     * @returns {unknown[]}
     */
    async listCollections() {
        if (this.cacheRebuilding) await this.WaitForCache();
        let fieldList = ["name", "description"];
        return _.orderBy(Utils.reduceScope(this.collectionDefinitions, fieldList), ["name"], ["asc"]);
    }

    /**
     * replaces an existing document with an updated version/
     * @param data
     * @returns {Promise<*>}
     */
    updateCollection = async (data) => {
        if (this.cacheRebuilding) await this.WaitForCache();
        let result = {};
        let item = Utils.getJson(data);
        log.info(`${Date().toString()} collectionsData.updateCollection > updated collectionDefintion  (${data.name})`);
        try {
            result = await this.collectionsDB.findAndReplace(item);
            let loc = this.collectionDefinitions.indexOf(a => a.name === item.name);
            this.collectionDefinitions.splice(loc, 1, result);
        } catch (er) {
            throw new Exception("collectionsData.updateCollection", "Could not replace item",
                Utils.getJson(data), er.toString(), er);
        }
        return result;
    }

    /**
     * removes a collection object from the database and the cache.
     *
     * @param data  - the record to be removed
     * @returns
     */
    removeCollection = async (data) => {
        if (this.cacheRebuilding) await this.WaitForCache();
        let result = {};
        let item = Utils.getJson(data);
        log.info(`${Date().toString()} collectionsData.updateCollection > updated collectionDefintion  (${data.name})`);
        try {
            result = await this.collectionsDB.deleteById(item._id);
            let loc = this.collectionDefinitions.indexOf(a => a.name === item.name);
            this.collectionDefinitions.splice(loc, 1);
            log.info(`${Date().toString()} collectionsData.removeCollection > removed collectionDefintion (${result.name})`);
            log.info(JSON.stringify(result));
        } catch (er) {
            throw new Exception("collectionsData.removeCollection", "Could not remove item",
                Utils.getJson(data), er.toString(), er);
        }
        return result;
    }

    /**
     * clears the cache and reloads the collections from the database
     * @returns {Promise<void>}
     */
    resetCache = async () => {
        log.info(`${Date().toString()}   Rebuilding CollectionDefintions cache`);
        this.cacheRebuilding = true;
        this.collectionDefinitions = [];
        await this.loadData();
        this.cacheRebuilding = false;
        log.info(`${Date().toString()}   Rebuilding CollectionDefintions completed`);
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

module.exports = collectionsData;