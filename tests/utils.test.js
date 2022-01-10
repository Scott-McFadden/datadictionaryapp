const Utils = require("../utils");
const Exception = require("../data/exception");

test("test getJson with string", () => {
    let invalue = "{ \"name\" : \"testString\" }";
    let outvalue = Utils.getJson(invalue);
//console.log(outvalue);
    // expect(typeof outvalue).toBe("object");
    expect(outvalue.name).toBe("testString");
});

test("test getJson with json", () => {
    let invalue = {name: "testnaame"};
    let outvalue = Utils.getJson(invalue);

    expect(typeof outvalue).toBe("object");
    expect(outvalue.name).toBe("testnaame");
});

test('reduce scope  no collection array', () => {
    let collection = {
        "_id": "61cf3395b1ae501ac74ad619",
        "name": "querydefs",
        "description": "connection info for querydefs",
        "engineType": "mongo",
        "connectionString": "mongodb://localhost:27017/",
        "dbName": "querydefs",
        "collectionName": "querydefs",
        "schema": {
            "name": {"type": "String", "unique": true},
            "description": {"type": "String"},
            "version": {"type": "Date"},
            "tags": {"type": ["String"]},
            "connection": {"type": "String"},
            "fields": {"type": ["Mixed"]},
            "baseQuery": {"type": "String"},
            "abilities": {
                "get": {"type": "Boolean"},
                "insert": {"type": "Boolean"},
                "delete": {"type": "Boolean"},
                "update": {"type": "Boolean"}
            },
            "roles": {"type": ["String"]},
            "Modifications": {"type": ["Mixed"]}
        },
        "uniqueKeys": ["name"],
        "__v": 0
    }
    let ans = Utils.reduceScope(collection, ["name", "description"]);

    expect(Object.keys(ans).length).toBeLessThan(Object.keys(collection).length);
    expect(ans.name).toBe(collection.name);
    expect(Object.keys(ans).length).toBe(2);

});
test('reduce scope  for collection array', () => {
    let collection = [
        {
            "_id": "61cf3395b1ae501ac74ad619",
            "name": "querydefs",
            "description": "connection info for querydefs",
            "engineType": "mongo",
            "connectionString": "mongodb://localhost:27017/",
            "dbName": "querydefs",
            "collectionName": "querydefs",
            "schema": {
                "name": {"type": "String", "unique": true},
                "description": {"type": "String"},
                "version": {"type": "Date"},
                "tags": {"type": ["String"]},
                "connection": {"type": "String"},
                "fields": {"type": ["Mixed"]},
                "baseQuery": {"type": "String"},
                "abilities": {
                    "get": {"type": "Boolean"},
                    "insert": {"type": "Boolean"},
                    "delete": {"type": "Boolean"},
                    "update": {"type": "Boolean"}
                },
                "roles": {"type": ["String"]},
                "Modifications": {"type": ["Mixed"]}
            },
            "uniqueKeys": ["name"],
            "__v": 0
        },
        {
            "_id": "61cf3395b1ae501ac74ad619",
            "name": "querydefs",
            "description": "connection info for querydefs",
            "engineType": "mongo",
            "connectionString": "mongodb://localhost:27017/",
            "dbName": "querydefs",
            "collectionName": "querydefs",
            "schema": {
                "name": {"type": "String", "unique": true},
                "description": {"type": "String"},
                "version": {"type": "Date"},
                "tags": {"type": ["String"]},
                "connection": {"type": "String"},
                "fields": {"type": ["Mixed"]},
                "baseQuery": {"type": "String"},
                "abilities": {
                    "get": {"type": "Boolean"},
                    "insert": {"type": "Boolean"},
                    "delete": {"type": "Boolean"},
                    "update": {"type": "Boolean"}
                },
                "roles": {"type": ["String"]},
                "Modifications": {"type": ["Mixed"]}
            },
            "uniqueKeys": ["name"],
            "__v": 0
        },
        {
            "_id": "61cf3395b1ae501ac74ad619",
            "name": "querydefs",
            "description": "connection info for querydefs",
            "engineType": "mongo",
            "connectionString": "mongodb://localhost:27017/",
            "dbName": "querydefs",
            "collectionName": "querydefs",
            "schema": {
                "name": {"type": "String", "unique": true},
                "description": {"type": "String"},
                "version": {"type": "Date"},
                "tags": {"type": ["String"]},
                "connection": {"type": "String"},
                "fields": {"type": ["Mixed"]},
                "baseQuery": {"type": "String"},
                "abilities": {
                    "get": {"type": "Boolean"},
                    "insert": {"type": "Boolean"},
                    "delete": {"type": "Boolean"},
                    "update": {"type": "Boolean"}
                },
                "roles": {"type": ["String"]},
                "Modifications": {"type": ["Mixed"]}
            },
            "uniqueKeys": ["name"],
            "__v": 0
        }
    ]

    let ans = Utils.reduceScope(collection, ["name", "description"]);

    expect(Object.keys(ans[0]).length).toBeLessThan(Object.keys(collection[0]).length);
    expect(ans[0].name).toBe(collection[0].name);
    expect(Object.keys(ans[0]).length).toBe(2);
    expect(ans.length).toBe(collection.length);

});

test("hasArrayItem good test", () => {
    let thisobject = ["red", "green", "blue", "black", "orange", 'pink', "gold"]
    let oneOfThese = ["gold", 'blue']
    let ans = Utils.hasArrayItem(thisobject, oneOfThese);

    expect(ans).toBe(true);


})

test("hasArrayItem not found test", () => {
    let thisobject = ["red", "green", "blue", "black", "orange", 'pink', "gold"]
    let oneOfThese = ["g", 'b']
    let ans = Utils.hasArrayItem(thisobject, oneOfThese);

    expect(ans).toBe(false);


})

test("hasArrayItem 1 of 2 found test", () => {
    let thisobject = ["red", "green", "blue", "black", "orange", 'pink', "gold"]
    let oneOfThese = ["g", 'orange']
    let ans = Utils.hasArrayItem(thisobject, oneOfThese);

    expect(ans).toBe(true);


})

test("hasArrayItem 1 item test", () => {
    let thisobject = ["red", "green", "blue", "black", "orange", 'pink', "gold"]
    let oneOfThese = ['orange']
    let ans = Utils.hasArrayItem(thisobject, oneOfThese);

    expect(ans).toBe(true);


})

test("time()", () => {
    expect(Utils.time()).not.toBe(null);
})

test("delay", async () => {
    let time = new Date().getTime();

    await Utils.delay();

    expect(time).toBeLessThan(new Date().getTime());
})

test("web error message exception class", () => {
    let x = new Exception("location", "message", {test: "test"});
    let r = {}
    try {
        throw x;
    } catch (er) {
        r = Utils.webErrorMessage(er, true);
    }
    expect(r).not.toBe({});
    expect(r.status).toBe("error");
    expect(r.exception.ex.msg).toBe("message");

})

test("webErrorMessage 2", () => {

    let r = {}
    try {
        throw "message";
    } catch (er) {
        r = Utils.webErrorMessage(er, true);
    }
    expect(r).not.toBe({});
    expect(r.status).toBe("error");
    expect(r.exception).toBe("message");
})