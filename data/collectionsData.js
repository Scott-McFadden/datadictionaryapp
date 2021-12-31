const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const log = require("cslog");
const Exception = require("./exception");

/**
 * This loads the collections from the mongo database.
 */
class collectionsData {

    async constructor(server) {
        // super(props);

        this.connectionString = server;
        await this.loadData();

    }

    connectionString = '';
    connection = null;
    connectionSchemaDefinition = {
        "name": {
            "type": "String", "unique": true
        },
        "description": {
            "type": "String"
        },
        "engineType": {
            "type": "String"
        },
        "connectionString": {
            "type": "String"
        },
        "dbName": {
            "type": "String"
        },
        "collectionName": {
            "type": "String"
        },
        "schema": {},
        "uniqueKeys": [{"type": "String"}]
    }
    schema = null;
    model = null;

    collectionDefinitions = [];

    loadData = async () => {
        if (this.connectionString === '') {
            throw "collectionData.loadData => connectionString is empty - can't load collections";
        }
        this.connection = new mongoose.createConnection(this.connectionString);
        this.schema = new Schema(this.connectionSchemaDefinition);
        this.model = this.connection.model('collections', this.schema);

        try {
            this.collectionDefinitions = await this.model.find({});
        } catch (er) {
            console.log("collectionsData.loadData could not load data");
            console.log(JSON.stringify(er));
        }

        console.log(JSON.stringify(this.collectionDefinitions));

    };

    addCollection = async (data) => {
        let p = {};
        let result = {};
        let item = new this.model(this.getJson(item));

        try {
            result = await item.save();
        } catch (er) {
            let er2 = new Exception("", "Could not save item", this.getJson(data), er, null);
            throw er2;

        }

    }

    getJson(data) {
        if (typeof data === "String")
            return JSON.stringify(data);
        else
            return data;
    }
}