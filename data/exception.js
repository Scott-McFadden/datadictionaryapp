class Exception {

    ex = {
        location: "",
        msg: "",
        data: {},
        er: "",
        innerEx: {}
    }

    constructor(location, msg, data = null, er = null, innerEx = null) {
        this.ex.location = location;
        this.ex.msg = msg;
        this.ex.data = data ?? null;
        this.ex.er = er ?? "";
        this.ex.innerEx = innerEx ?? null;
    }

    consoleLog() {
        console.log(new Date().toString() + " -------------------");
        console.error("ERROR " + this.ex.location + " " + this.ex.msg);
        if (this.ex.data) console.log("DATA: " + JSON.stringify(this.ex.data));
        if (this.ex.innerEx) {
            console.log("INNER EXCEPTION: ");
            console.log(this.ex.innerEx.consoleLog());

        }
    }

    getJsonString = () => {
        return JSON.stringify(this.ex)
    };

    toString() {
        return JSON.stringify(this.ex)
    }

    getMessage() {
        return this.ex.msg;
    }

    getInnerException() {
        return this.ex.innerEx;
    }
}

module.exports = Exception;