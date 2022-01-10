/*
  mongoose collection

  by Scott McFadden 12/2021



 */

const mongo = require("mongodb");

const log = require("cslog");
const Exception = require("./exception");
const Utils = require("../utils");

/*

Used to create a class
example props
{
        "name": "connections",
        "description": "connection info for connections",
        "engineType": "mongo",
        "connectionString": "mongodb://localhost:27017/",
        "dbName" : "querydefs",
        "collectionName": "connections",
        "schema" :"\"name\" : String, \"Description\" : String, engineType: String, dbName: String, collectionName: String "
 }
 */

/**
 * mongoCollection - builds a data access service based on the connection object passed via the properties.
 *
 */
class mongoCollection {


    constructor(props = null) {
        // super(props);
        if (props) {
            this.hydrate(props);

        }
    }

    /**
     * populates properties based on the connection object (props)
     * @param props  connection object.
     */
    hydrate(props) {
        if (props === undefined)
            throw "mongoCollection.hydrate  props undefined";

        if (!Boolean(props.collectionName) ||
            !Boolean(props.dbName) ||
            !Boolean(props.connectionString))
            throw new Exception("mongoCollection.hydrate", "  props incomplete", null, null, null);

        this.name = props.name ?? "";
        this.description = props.description ?? "";
        this.collectionName = props.collectionName ?? "";
        this.engineType = props.engineType ?? "";
        this.dbName = props.dbName ?? "";
        this.schema = props.schema ?? "";
        this.connectionString = props.connectionString;
        if (!this.connectionString.endsWith("/"))
            this.connectionString += "/";
        this.uniqueKeys = props.uniqueKeys ?? [];
    }

    /*
         Properties
     */

    collection = null;
    collectionName = "";
    connection = null;
    connectionString = "";
    database = null;
    dbName = "";
    description = "";
    engineType = "";
    lastId;
    modelReady = false;
    name = "";
    schema = "";
    uniqueKeyJson = {};
    uniqueKeys = [];

    /**
     * sets up mongoose model
     * @returns {Promise<void>}
     */
    async createModel() {
        if (this.connection && this.connection.closed === true)
            this.modelReady = false;

        if (this.modelReady) return;

        try {
            if (this.connection == null) {
                this.connection = new mongo.MongoClient(this.connectionString);

                await this.connection.connect();
                this.database = this.connection.db(this.dbName);
                this.collection = this.database.collection(this.collectionName);
                this.modelReady = true;
            }

        } catch (er) {
            throw new Exception(
                "mongoCollection.createModel can not connect",
                {
                    connectionString: this.connectionString,
                    "database": this.database,
                    collectionName: this.collectionName
                },
                er);
        }
    }

    /**
     * addOne - adds a new document to the collection.
     *
     * @param props  valid json document
     * @returns {Promise<*>}
     */
    async addOne(props) {
        let p = {};
        let item;
        if (props === undefined) {
            throw "mongoCollection.addOne props is undefined";
        }
        if (!this.modelReady) {
            await this.createModel();
        }

        if (this.uniqueKeys.length > 0) {
            let scratch = "";
            let comma = "";
            for (let a = 0; a < this.uniqueKeys.length; a++) {
                scratch += comma + "\"" + this.uniqueKeys[a] + "\" : \"" + p[this.uniqueKeys[a]] + "\"";
                comma = ",";
            }
            this.uniqueKeyJson = JSON.parse("{" + scratch + "}");

            if (await this.collection.findOne(this.uniqueKeyJson)) {
                throw new Exception("mongoCollection.addOne", "item already exists in " + this.collectionName, JSON.stringify(this.uniqueKeyJson), null, null)
            }
        }

        try {
            p = Utils.getJson(props);
            item = await this.collection.insertOne(p);
        } catch (er) {
            throw new Exception("mongoCollection.addOne", "could not create new document",
                {"collectionName": this.collectionName, "props": p}, er);

        }


        if (p[this.uniqueKeys[0]] !== undefined)
            log.info(`mongoCollection.addOne ${this.collectionName}  created document ${item[this.uniqueKeys[0]]}`);
        else
            log.info(`mongoCollection.addOne ${this.collectionName} created document ${item._id}`);
        this.lastId = item._id;
        return item;

    }


    /**
     * getOne - this is a general search the returns the first document matching the provided
     *          query.
     * @param props  expected to be valid mongo query
     * @returns {Promise<*>}
     */
    async getOne(props) {
        let p = {};
        let ret;

        if (props === undefined) {
            throw new Exception("mongoCollection.getOne",
                "props undefined", null, null, null);
        }
        try {
            p = Utils.getJson(props);
            ret = this.collection.findOne(p);
        } catch (er) {
            throw new Exception("mongoCollection.getOne",
                "get failed", {"collectionName": this.collectionName}, er);
        }

        return ret;
    }

    /**
     * getById - returns a single record based on the provided id.
     *
     * @param id
     * @returns {Promise<void>}
     */
    async getById(id) {
        if (id) {
            try {
                return await this.collection.findById(id);
            } catch (er) {

                throw new Exception("mongoCollection.getById",
                    "get failed", {"collectionName": this.collectionName, "targetId": id}, er);
            }
        } else
            throw new Exception("mongoCollection.getById",
                "no id provided", {"collectionName": this.collectionName}, null);
    }

    /**
     * getMany - returns documents based on the query provided.
     *           the query is expected to be a viable mongo query
     * @param props
     * @returns {Promise<*>}
     */
    async getMany(props) {
        /*
          this expects props to be a properly formatted mongo query
         */

        let p = {};

        if (props) {
            p = Utils.getJson(props);
        }

        try {
            return await this.collection.find(p).toArray();
        } catch (er) {
            throw new Exception("mongoCollection.getById",
                "get failed", {"collectionName": this.collectionName, "targetQuery": q}, er);
        }
    }

    /**
     * deleteById - find the document by the provided id and removes it from the database.
     *              it will return back a copy of the deleted data.
     * @param id
     * @returns
     */
    async deleteById(id) {
        let ret = null;
        if (id) {
            try {
                ret = await this.collection.findByIdAndRemove(id);
            } catch (er) {
                throw new Exception("mongoCollection.deleteById",
                    "operation failed", {"collectionName": this.collectionName, "id": id}, er);

            }

        } else
            throw new Exception("mongoCollection.deleteById",
                "no id provided", {"collectionName": this.collectionName});
        log.success(`{ "action" : "mongoCollection.deleteById ", "collection": "${this.collectionName}" , "_id" : "${ret._id.toString()}" }`);
        return ret;
    }

    /**
     * findAndReplace  - finds the document and replaces it with a new version.
     *                   if it does not exist, it will add a new one
     *
     * @param doc
     * @returns {Promise<*>}
     */
    async findAndReplace(doc) {
        let ret;

        if (doc) {
            try {
                ret = await this.collection.findOneAndReplace({_id: doc._id}, doc, {
                    upsert: true,
                    returnNewDocument: true
                });
            } catch (er) {
                throw new Exception("mongoCollection.findAndReplace",
                    "operation failed", {"collectionName": this.collectionName, data: doc}, er);
            }
        } else
            throw new Exception("mongoCollection.findAndReplace",
                "no doc provided ", {"collectionName": this.collectionName});

        log.success(`{ "action" : "mongoCollection.findAndReplace ", "collection": "${this.collectionName}" , "_id" : "${ret._id.toString()}" }`);

        return ret;
    }


}

module.exports = mongoCollection;