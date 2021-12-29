/*
  sqlServer collection

  by Scott McFadden 12/2021



 */

const log = require("cslog");

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
class sqlServerCollection {
    constructor(props) {
        // super(props);
        this.hydrate(props);
    }

    /**
     * populates properties based on the connection object (props)
     * @param props  connection object.
     */
    async hydrate(props) {
        if (props === undefined)
            throw "sqlServerCollection.hydrate  props undefined";

        if (Boolean(props.collectionName) ||
            Boolean(props.dbName) ||
            Boolean(props.connectionString))
            throw "sqlServerCollection.hydrate  props incomplete";

        this.name = props.name ?? "";
        this.description = props.description ?? "";
        this.collectionName = props.collectionName ?? "";
        this.engineType = props.engineType ?? "";
        this.dbName = props.dbName ?? "";
        this.schema = props.schema ?? "";
        this.connectionString = props.connectionString;
        if (!this.connectionString.endsWith("/"))
            this.connectionString += "/";
        this.uniqueKeys = props.uniqueKeys;

        await this.createModel();
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
    
    connectionString = "";
    connection = null;
    lastId;
    modelReady = false;
   
    uniqueKeys = [];
    uniqueKeyJson = {};

    /**
     * sets up sql model
     * @returns {Promise<void>}
     */
    async createModel() {

        try {
            // open connection goes here
            log.info('open sql connection for ' + this.collectionName );
       

        } catch (er) {
            let er2 = "sqlServerCollection.createModel can not connect";
            log.error(er2);
            log.info(er);
            throw er2;

        }
        this.modelReady = true; 
        log.info(`${this.name} model ready`);


    }

    /**
     * addOne - adds a new document to the collection.
     *
     * @param props  valid json document
     * @returns {Promise<*>}
     */
    async addOne(props) {
        let p = '';
        let savedItem;
        if (props === undefined) {
            throw "sqlServerCollection.addOne props is undefined";
        }
        if (!this.modelReady) {
            throw "sqlServerCollection.addOne model not ready"
        }
        p = this.buildUniqueKeyString(props);
        // if (await this.curModel.exists(this.uniqueKeyJson)) {
        //     let er2 = "sqlServerCollection.addOne document already exists";
        //     log.error(er2);
        //
        //     throw er2;
        // }
        try {

            savedItem = 'saved item code goes here';
            
        } catch (er) {
            let er2 = "sqlServerCollection.addOne save failed";
            log.error(er2);
            log.info(er);
            throw er2;
        }
        

        log.info(`sqlServerCollection.addOne ${this.name} item saved`);
        this.lastId = savedItem._id;
        return savedItem;

    }

    /**
     * builds a uniqueKey string from list of unique keys
     * @param p
     */
    buildUniqueKeyString(p) {
        let scratch = "";
        let comma = "";
        for (let a = 0; a < this.uniqueKeys.length; a++) {
            scratch += comma +  this.uniqueKeys[a] + "= '" + p[this.uniqueKeys[a]] + "' ";
            comma = " and ";
        }

        log.info(this.uniqueKeyJson);
        return scratch;
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
        if (!this.modelReady) {
            throw "sqlServerCollection.getOne model not ready"
        }
        if (props === undefined) {
            throw "sqlServerCollection.getOne props is undefined";
        }
        try {
            if (typeof props === 'string') {   // create json is not already json
                p = JSON.parse(props);
            }
            else
            {
                p = props;
            }
            dataModel = 'code goes here' + p;
        } catch (er) {
            let er2 = "sqlServerCollection.getOne get failed";
            log.error(er2);
            log.info(er);
            throw er2;
        }
        ;
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
        if (!this.modelReady) {
            throw "sqlServerCollection.getById model not ready"
        }
        if (id) {
            try {
                ret = "code goes here";
            } catch (er) {
                let er2 = "sqlServerCollection.getById get failed";
                log.error(er2);
                log.info(er);
                throw er2;
            }

        } else
            throw "sqlServerCollection.getById no id provided";


        return ret;
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
        if (!this.modelReady) {
            throw "sqlServerCollection.getMany model not ready"
        }

        let ret;
        let q = {};

        if (props) {
            q = props;
        }

        try {
            ret = "code goes here" + q;
        } catch (er) {
            let er2 = "sqlServerCollection.getMany get failed";
            log.error(er2);
            log.info(er);
            throw er2;
        };
        return ret;
    }

    /**
     * deleteById - find the document by the provided id and removes it from the database.
     *              it will return back a copy of the deleted data.
     * @param id
     * @returns deleted document
     */
    async deleteById(id) {
        if (!this.modelReady) {
            throw "sqlServerCollection.deleteById model not ready"
        }
        let ret;
        if (id) {
            try {
                ret =  "code goes here";
            } catch (er) {
                let er2 = "sqlServerCollection.deleteById get failed";
                log.error(er2);
                log.info(er);
                throw er2;
            }
            ;
        } else
            throw "sqlServerCollection.deleteById no id provided";

        log.success(`{ "action" : "sqlServerCollection.deleteById ", "collection": "${this.collectionName}" , "_id" : "${ret._id.toString()}" }`);

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
        if (!this.modelReady) {
            throw "sqlServerCollection.findAndReplace model not ready"
        }
        if (doc) {
            try {
                ret =  "code goes here";
            } catch (er) {
                let er2 = "sqlServerCollection.deleteById get failed";
                log.error(er2);
                log.info(er);
                throw er2;
            }
            ;
        } else
            throw "sqlServerCollection.findAndReplace no doc provided";

        log.success(`{ "action" : "sqlServerCollection.findAndReplace ", "collection": "${this.collectionName}" , "_id" : "${ret._id.toString()}" }`);

        return ret;
    }
}

module.exports = sqlServerCollection;