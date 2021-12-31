/*
  mongoose collection

  by Scott McFadden 12/2021



 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const log = require("cslog");
const Exception = require("./exception");
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
    constructor(props) {
        // super(props);
        this.hydrate(props);
        this.createModel();
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

    name = "";
    description = "";
    engineType = "";
    dbName = "";
    collectionName = "";
    schema = "";
    curModel = null;
    mongooseSchema = null;
    connectionString = "";
    connection = null;
    lastId;
    modelReady = () => {
        if (this.connection.models[this.collectionName] === undefined)
            return false;

        return this.connection.models[this.collectionName].modelName === this.collectionName;
    }
    uniqueKeys = [];
    uniqueKeyJson = {};

    /**
     * sets up mongoose model
     * @returns {Promise<void>}
     */
    async createModel() {

        try {
            if (this.connection == null) {
                this.connection = await mongoose.createConnection(this.connectionString + this.dbName,
                    {family: 4, maxPoolSize: 10});
                // await new Promise(resolve => setTimeout(resolve, 1000));
            }

        } catch (er) {
            let er2 = "mongoCollection.createModel can not connect";
            log.error(er2);
            log.info(er);
            throw er2;

        }

        try {
            this.mongooseSchema = new Schema(this.schema);

        } catch (er) {
            let er2 = "mongoCollection.createModel bad Schema definition";
            log.error(er2);
            log.info(er);
            throw er2;

        }
        try {
            if (!this.modelReady())   // create the model if it does not exist
                this.curModel = this.connection.model(this.collectionName, this.mongooseSchema);
        } catch (er) {
            let er2 = "mongoCollection.createModel could not create model";
            log.error(er2);
            log.info(er);
            throw er2;
        }
        log.info(`${this.name} model ready`);


    }

    /**
     * addOne - adds a new document to the collection.
     *
     * @param props  valid json document
     * @returns {Promise<*>}
     */
    async addOne(props) {
        let p = {};
        let savedItem;
        let item;
        if (props == undefined) {
            throw "mongoCollection.addOne props is undefined";
        }
        if (!this.modelReady()) {
            await this.createModel();
        }
        try {

            p = this.getJson(props);

            item = new this.curModel(p);
        } catch (er) {
            throw new Exception("mongoCollection.addOne", "could not create new document",
                {"collectionName": this.collectionName, "props": p}, er);

        }

        if (this.uniqueKeys.length > 0) {
            let scratch = "";
            let comma = "";
            for (let a = 0; a < this.uniqueKeys.length; a++) {
                scratch += comma + "\"" + this.uniqueKeys[a] + "\" : \"" + p[this.uniqueKeys[a]] + "\"";
                comma = ",";
            }
            this.uniqueKeyJson = JSON.parse("{" + scratch + "}");
            //log.info(this.uniqueKeyJson);
            if (await this.curModel.exists(this.uniqueKeyJson)) {
                throw new Exception("mongoCollection.addOne", "item already exists in " + this.collectionName, JSON.stringify(this.uniqueKeyJson), null, null)
            }
        }
        try {

            savedItem = await item.save();
        } catch (er) {
            throw new Exception("mongoCollection.addOne",
                "mongoCollection.addOne save failed for " + this.collectionName,
                JSON.stringify(p), er, null);


        }

        if (p[this.uniqueKeys[0]] !== undefined)
            log.info(`mongoCollection.addOne ${this.collectionName}  created document ${savedItem[this.uniqueKeys[0]]}`);
        else
            log.info(`mongoCollection.addOne ${this.collectionName} created document ${savedItem._id}`);
        this.lastId = savedItem._id;
        return savedItem;

    }


    /**
     * getOne - this is a general search the returns the first document matching the provided
     *          query.
     * @param props  expected to be valid mongo query
     * @returns {Promise<*>}
     */
    async getOne(props) {
        let p = {};
        let dataModel;
        if (!this.modelReady()) {
            throw new Exception("mongoCollection.getOne",
                "model not ready ", null, null, null);
        }
        if (props == undefined) {
            throw new Exception("mongoCollection.getOne",
                "props undefined", null, null, null);
        }
        try {
            if (typeof props === 'string') {   // create json is not already json
                p = JSON.parse(props);
            }
            dataModel = this.curModel.findOne(props);
        } catch (er) {
            throw new Exception("mongoCollection.getOne",
                "get failed", {"collectionName": this.collectionName}, er);
        }

        return dataModel;
    }

    /**
     * getById - returns a single record based on the provided id.
     *
     * @param id
     * @returns {Promise<void>}
     */
    async getById(id) {
        let ret;
        if (!this.modelReady()) {
            throw new Exception("mongoCollection.getById",
                "model not ready ", null, null, null);
        }
        if (id) {
            try {
                ret = await this.curModel.findById(id);
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
        if (!this.modelReady()) {
            throw new Exception("mongoCollection.getMany",
                "model not ready ", null, null, null);
        }

        let ret;
        let q = {};

        if (props) {
            q = this.getJson(props);
        }

        try {
            ret = await this.curModel.find(q);
        } catch (er) {
            throw new Exception("mongoCollection.getById",
                "get failed", {"collectionName": this.collectionName, "targetQuery": q}, er);

        }

        return ret;
    }

    /**
     * deleteById - find the document by the provided id and removes it from the database.
     *              it will return back a copy of the deleted data.
     * @param id
     * @returns {Promise<awaited Query<T extends Document ? Require_id<T> : (Document<any, any, T> & Require_id<T> & TVirtuals & TMethods) | null, T extends Document ? Require_id<T> : (Document<any, any, T> & Require_id<T> & TVirtuals & TMethods), TQueryHelpers, T> & TQueryHelpers>}
     */
    async deleteById(id) {
        if (!this.modelReady()) {
            throw new Exception("mongoCollection.deleteById",
                "model not ready ", null, null, null);
        }
        let ret;
        if (id) {
            try {
                ret = await this.curModel.findByIdAndRemove(id);
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
        if (!this.modelReady()) {
            throw new Exception("mongoCollection.findAndReplace",
                "model not ready ", null, null, null);
        }
        if (doc) {
            try {
                ret = await this.curModel.findOneAndReplace({_id: doc._id}, doc, {
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

    getJson(data) {
        if (typeof data === "String")
            return JSON.stringify(data);
        else
            return data;
    }
}

module.exports = mongoCollection;