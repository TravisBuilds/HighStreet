"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const console_1 = require("console");
const util_1 = __importDefault(require("util"));
const session = __importStar(require("express-session"));
const mongodb_1 = require("mongodb");
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default('connect-mongo');
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => { };
const unit = (a) => a;
function defaultSerializeFunction(session) {
    // Copy each property of the session to a new object
    const obj = {};
    let prop;
    for (prop in session) {
        if (prop === 'cookie') {
            // Convert the cookie instance to an object, if possible
            // This gets rid of the duplicate object under session.cookie.data property
            // @ts-ignore FIXME:
            obj.cookie = session.cookie.toJSON
                ? // @ts-ignore FIXME:
                    session.cookie.toJSON()
                : session.cookie;
        }
        else {
            // @ts-ignore FIXME:
            obj[prop] = session[prop];
        }
    }
    return obj;
}
function computeTransformFunctions(options) {
    if (options.serialize || options.unserialize) {
        return {
            serialize: options.serialize || defaultSerializeFunction,
            unserialize: options.unserialize || unit,
        };
    }
    if (options.stringify === false) {
        return {
            serialize: defaultSerializeFunction,
            unserialize: unit,
        };
    }
    // Default case
    return {
        serialize: JSON.stringify,
        unserialize: JSON.parse,
    };
}
class MongoStore extends session.Store {
    constructor({ collectionName = 'sessions', ttl = 1209600, mongoOptions = { useUnifiedTopology: true }, autoRemove = 'native', autoRemoveInterval = 10, touchAfter = 0, stringify = true, crypto, ...required }) {
        super();
        this.crypto = null;
        debug('create MongoStore instance');
        const options = {
            collectionName,
            ttl,
            mongoOptions,
            autoRemove,
            autoRemoveInterval,
            touchAfter,
            stringify,
            crypto: {
                ...{
                    secret: false,
                    algorithm: 'aes-256-gcm',
                    hashing: 'sha512',
                    encodeas: 'base64',
                    key_size: 32,
                    iv_size: 16,
                    at_size: 16,
                },
                ...crypto,
            },
            ...required,
        };
        // Check params
        console_1.assert(options.mongoUrl || options.clientPromise || options.client, 'You must provide either mongoUrl|clientPromise|client in options');
        console_1.assert(options.createAutoRemoveIdx === null ||
            options.createAutoRemoveIdx === undefined, 'options.createAutoRemoveIdx has been reverted to autoRemove and autoRemoveInterval');
        console_1.assert(!options.autoRemoveInterval || options.autoRemoveInterval <= 71582, 
        /* (Math.pow(2, 32) - 1) / (1000 * 60) */ 'autoRemoveInterval is too large. options.autoRemoveInterval is in minutes but not seconds nor mills');
        this.transformFunctions = computeTransformFunctions(options);
        let _clientP;
        if (options.mongoUrl) {
            _clientP = mongodb_1.MongoClient.connect(options.mongoUrl, options.mongoOptions);
        }
        else if (options.clientPromise) {
            _clientP = options.clientPromise;
        }
        else if (options.client) {
            _clientP = Promise.resolve(options.client);
        }
        else {
            throw new Error('Cannot init client. Please provide correct options');
        }
        console_1.assert(!!_clientP, 'Client is null|undefined');
        this.clientP = _clientP;
        this.options = options;
        this.collectionP = _clientP
            .then((con) => con.db(options.dbName))
            .then((db) => db.collection(options.collectionName))
            .then((collection) => {
            this.setAutoRemove(collection);
            return collection;
        });
        if (options.crypto.secret) {
            this.crypto = require('kruptein')(options.crypto);
        }
    }
    static create(options) {
        return new MongoStore(options);
    }
    setAutoRemove(collection) {
        const removeQuery = () => ({
            expires: {
                $lt: new Date(),
            },
        });
        switch (this.options.autoRemove) {
            case 'native':
                debug('Creating MongoDB TTL index');
                collection.createIndex({ expires: 1 }, { expireAfterSeconds: 0, ...this.options.writeOperationOptions });
                break;
            case 'interval':
                debug('create Timer to remove expired sessions');
                this.timer = setInterval(() => collection.deleteMany(removeQuery(), {
                    ...this.options.writeOperationOptions,
                    w: 0,
                    j: false,
                }), this.options.autoRemoveInterval * 1000 * 60);
                this.timer.unref();
                break;
            case 'disabled':
            default:
                break;
        }
    }
    computeStorageId(sessionId) {
        if (this.options.transformId &&
            typeof this.options.transformId === 'function') {
            return this.options.transformId(sessionId);
        }
        return sessionId;
    }
    /**
     * promisify and bind the `this.crypto.get` function.
     * Please check !!this.crypto === true before using this getter!
     */
    get cryptoGet() {
        if (!this.crypto) {
            throw new Error('Check this.crypto before calling this.cryptoGet!');
        }
        return util_1.default.promisify(this.crypto.get).bind(this.crypto);
    }
    /**
     * Decrypt given session data
     * @param session session data to be decrypt. Mutate the input session.
     */
    async decryptSession(session) {
        if (this.crypto && session) {
            const plaintext = await this.cryptoGet(this.options.crypto.secret, session.session).catch((err) => {
                throw new Error(err);
            });
            // @ts-ignore
            session.session = JSON.parse(plaintext);
        }
    }
    /**
     * Get a session from the store given a session ID (sid)
     * @param sid session ID
     */
    get(sid, callback) {
        ;
        (async () => {
            try {
                debug(`MongoStore#get=${sid}`);
                const collection = await this.collectionP;
                const session = await collection.findOne({
                    _id: this.computeStorageId(sid),
                    $or: [
                        { expires: { $exists: false } },
                        { expires: { $gt: new Date() } },
                    ],
                });
                if (this.crypto && session) {
                    await this.decryptSession(session).catch((err) => callback(err));
                }
                const s = session && this.transformFunctions.unserialize(session.session);
                if (this.options.touchAfter > 0 && (session === null || session === void 0 ? void 0 : session.lastModified)) {
                    s.lastModified = session.lastModified;
                }
                this.emit('get', sid);
                callback(null, s);
            }
            catch (error) {
                callback(error);
            }
        })();
    }
    /**
     * Upsert a session into the store given a session ID (sid) and session (session) object.
     * @param sid session ID
     * @param session session object
     */
    set(sid, session, callback = noop) {
        ;
        (async () => {
            var _a;
            try {
                debug(`MongoStore#set=${sid}`);
                // Removing the lastModified prop from the session object before update
                // @ts-ignore
                if (this.options.touchAfter > 0 && (session === null || session === void 0 ? void 0 : session.lastModified)) {
                    // @ts-ignore
                    delete session.lastModified;
                }
                const s = {
                    _id: this.computeStorageId(sid),
                    session: this.transformFunctions.serialize(session),
                };
                // Expire handling
                if ((_a = session === null || session === void 0 ? void 0 : session.cookie) === null || _a === void 0 ? void 0 : _a.expires) {
                    s.expires = new Date(session.cookie.expires);
                }
                else {
                    // If there's no expiration date specified, it is
                    // browser-session cookie or there is no cookie at all,
                    // as per the connect docs.
                    //
                    // So we set the expiration to two-weeks from now
                    // - as is common practice in the industry (e.g Django) -
                    // or the default specified in the options.
                    s.expires = new Date(Date.now() + this.options.ttl * 1000);
                }
                // Last modify handling
                if (this.options.touchAfter > 0) {
                    s.lastModified = new Date();
                }
                if (this.crypto) {
                    const cryptoSet = util_1.default.promisify(this.crypto.set).bind(this.crypto);
                    try {
                        const data = await cryptoSet(this.options.crypto.secret, s.session).catch((err) => {
                            throw new Error(err);
                        });
                        s.session = data;
                    }
                    catch (error) {
                        callback(error);
                    }
                }
                const collection = await this.collectionP;
                const rawResp = await collection.updateOne({ _id: s._id }, { $set: s }, {
                    upsert: true,
                    ...this.options.writeOperationOptions,
                });
                if (rawResp.upsertedCount > 0) {
                    this.emit('create', sid);
                }
                else {
                    this.emit('update', sid);
                }
                this.emit('set', sid);
                callback(null);
            }
            catch (error) {
                callback(error);
            }
        })();
    }
    touch(sid, session, callback = noop) {
        ;
        (async () => {
            var _a;
            try {
                debug(`MongoStore#touch=${sid}`);
                const updateFields = {};
                const touchAfter = this.options.touchAfter * 1000;
                const lastModified = session.lastModified
                    ? session.lastModified.getTime()
                    : 0;
                const currentDate = new Date();
                // If the given options has a touchAfter property, check if the
                // current timestamp - lastModified timestamp is bigger than
                // the specified, if it's not, don't touch the session
                if (touchAfter > 0 && lastModified > 0) {
                    const timeElapsed = currentDate.getTime() - lastModified;
                    if (timeElapsed < touchAfter) {
                        debug(`Skip touching session=${sid}`);
                        return callback(null);
                    }
                    updateFields.lastModified = currentDate;
                }
                if ((_a = session === null || session === void 0 ? void 0 : session.cookie) === null || _a === void 0 ? void 0 : _a.expires) {
                    updateFields.expires = new Date(session.cookie.expires);
                }
                else {
                    updateFields.expires = new Date(Date.now() + this.options.ttl * 1000);
                }
                const collection = await this.collectionP;
                const rawResp = await collection.updateOne({ _id: this.computeStorageId(sid) }, { $set: updateFields }, this.options.writeOperationOptions);
                if (rawResp.matchedCount === 0) {
                    return callback(new Error('Unable to find the session to touch'));
                }
                else {
                    this.emit('touch', sid, session);
                    return callback(null);
                }
            }
            catch (error) {
                return callback(error);
            }
        })();
    }
    /**
     * Get all sessions in the store as an array
     */
    all(callback) {
        ;
        (async () => {
            try {
                debug('MongoStore#all()');
                const collection = await this.collectionP;
                const sessions = collection.find({
                    $or: [
                        { expires: { $exists: false } },
                        { expires: { $gt: new Date() } },
                    ],
                });
                const results = [];
                for await (const session of sessions) {
                    if (this.crypto && session) {
                        await this.decryptSession(session);
                    }
                    results.push(this.transformFunctions.unserialize(session.session));
                }
                this.emit('all', results);
                callback(null, results);
            }
            catch (error) {
                callback(error);
            }
        })();
    }
    /**
     * Destroy/delete a session from the store given a session ID (sid)
     * @param sid session ID
     */
    destroy(sid, callback = noop) {
        debug(`MongoStore#destroy=${sid}`);
        this.collectionP
            .then((colleciton) => colleciton.deleteOne({ _id: this.computeStorageId(sid) }, this.options.writeOperationOptions))
            .then(() => {
            this.emit('destroy', sid);
            callback(null);
        })
            .catch((err) => callback(err));
    }
    /**
     * Get the count of all sessions in the store
     */
    length(callback) {
        debug('MongoStore#length()');
        this.collectionP
            .then((collection) => collection.countDocuments())
            .then((c) => callback(null, c))
            // @ts-ignore
            .catch((err) => callback(err));
    }
    /**
     * Delete all sessions from the store.
     */
    clear(callback = noop) {
        debug('MongoStore#clear()');
        this.collectionP
            .then((collection) => collection.drop())
            .then(() => callback(null))
            .catch((err) => callback(err));
    }
    /**
     * Close database connection
     */
    close() {
        debug('MongoStore#close()');
        return this.clientP.then((c) => c.close());
    }
}
exports.default = MongoStore;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9uZ29TdG9yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvTW9uZ29TdG9yZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBZ0M7QUFDaEMsZ0RBQXVCO0FBQ3ZCLHlEQUEwQztBQUMxQyxxQ0FLZ0I7QUFDaEIsa0RBQXlCO0FBR3pCLE1BQU0sS0FBSyxHQUFHLGVBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQTtBQWdFcEMsZ0VBQWdFO0FBQ2hFLE1BQU0sSUFBSSxHQUFHLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQTtBQUNyQixNQUFNLElBQUksR0FBbUIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQTtBQUVyQyxTQUFTLHdCQUF3QixDQUMvQixPQUE0QjtJQUU1QixvREFBb0Q7SUFDcEQsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFBO0lBQ2QsSUFBSSxJQUFJLENBQUE7SUFDUixLQUFLLElBQUksSUFBSSxPQUFPLEVBQUU7UUFDcEIsSUFBSSxJQUFJLEtBQUssUUFBUSxFQUFFO1lBQ3JCLHdEQUF3RDtZQUN4RCwyRUFBMkU7WUFDM0Usb0JBQW9CO1lBQ3BCLEdBQUcsQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNO2dCQUNoQyxDQUFDLENBQUMsb0JBQW9CO29CQUNwQixPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTtnQkFDekIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUE7U0FDbkI7YUFBTTtZQUNMLG9CQUFvQjtZQUNwQixHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO1NBQzFCO0tBQ0Y7SUFFRCxPQUFPLEdBQTBCLENBQUE7QUFDbkMsQ0FBQztBQUVELFNBQVMseUJBQXlCLENBQUMsT0FBbUM7SUFDcEUsSUFBSSxPQUFPLENBQUMsU0FBUyxJQUFJLE9BQU8s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