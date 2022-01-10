/**
 * Standard Exception definition
 *
 * location is marker to find class and method.
 * msg is the message to be passed.
 * data is the data that was used in conjunction with the definition
 * er is the error message returned from the operation that caused the error - used when the
 *    method throwing the exception does not use this class.
 * innerEx is the exception definition (this class) thrown by the target method.
 *
 *
 * Scott McFadden  12/21
 */
class Exception {

    ex = {
        location: "",
        msg: "",
        data: {},
        er: {},
        innerEx: {}
    }

    static className() {
        return this.constructor.name;
    }

    /**
     *
     * @param location marker to find class and method.
     * @param msg  the message to be passed.
     * @param data data that was used in conjunction with the definition
     * @param er error message returned from the operation that caused the error
     * @param innerEx Exception class definition from the error
     */
    constructor(location, msg, data = null, er = null, innerEx = null) {
        this.ex.location = location;
        this.ex.msg = msg;
        this.ex.data = data ?? null;
        this.ex.er = er ?? "";
        this.ex.innerEx = innerEx ?? null;
    }

    /**
     * common console log message
     */
    consoleLog() {
        console.log(new Date().toString() + " -------------------");
        console.error("ERROR " + this.ex.location + " " + this.ex.msg);
        if (this.ex.data) console.log("DATA: " + JSON.stringify(this.ex.data));
        if (this.ex.er) {
            console.log("er EXCEPTION: ");
            if (typeof er === "object") {
                let p = Object.getOwnPropertyNames(this.ex.innerEx);
                for (let a = 0; a < p.length; a++)
                    console.log(p[a], this.ex.innerEx[p[a]]);
            } else
                console.log("er", this.ex.er);

        }
        if (this.ex.innerEx) {
            console.log("INNER EXCEPTION: ");
            if (typeof this.ex.innerEx === "Exception") {
                console.log(this.ex.innerEx.consoleLog());
            } else if (typeof this.ex.innerEx === "object") {
                let p = Object.getOwnPropertyNames(this.ex.innerEx);
                for (let a = 0; a < p.length; a++)
                    console.log(p[a], this.ex.innerEx[p[a]]);
            }

        }
    }

    /**
     * returns json version of this class
     * @returns {string}
     */
    getJsonString = () => {
        return JSON.stringify(this.ex)
    };

    /**
     * returns json string
     * @returns {string}
     */
    toString() {
        return JSON.stringify(this.ex)
    }

    /**
     * only returns message from this exception
     * @returns {string}
     */

    getMessage() {
        return this.ex.msg;
    }

    /**
     * returns inner exception
     * @returns {{}}
     */
    getInnerException() {
        return this.ex.innerEx;
    }
}

module.exports = Exception;