const _ = require("lodash");
const log = require("cslog");
const Exception = require("./data/exception")

class Utils {
    /**
     * ensures the returned element is a json object
     * @param data
     * @returns {string|*}
     */
    static getJson(data) {
        if (typeof data === "string")
            return JSON.parse(data);
        else
            return data;
    }

    static reduceScope(collection, fieldList) {
        if (Array.isArray(collection)) {
            let ret = [];
            for (let a = 0; a < collection.length; a++) {
                let b = _.pick(collection[a], fieldList);

                ret.push(b);
            }

            return ret;
        } else {
            return _.pick(collection, fieldList);
        }

    }

    static hasArrayItem(thisobject, hasOneOfThese) {
        for (let a = 0; a < hasOneOfThese.length; a++) {
            if (thisobject.find(b => b === hasOneOfThese[a])) {
                return true;
            }
        }
        return false;
    }

    static time() {
        return new Date().toString();
    }

    static delay = async (time) => {
        return new Promise(resolve => setTimeout(resolve, time ?? 1000));
    }

    static webErrorMessage(er, debugOn = false) {
        let ret = {
            status: "error"

        }
        if (typeof er.ex === 'object') {


            er.consoleLog();
            if (debugOn) {
                ret.exception = Utils.getJson(er);
            }

        } else {
            log.error(er);
            if (debugOn)
                ret.exception = er.toString();
        }


        return ret;

    }
}

module.exports = Utils;




