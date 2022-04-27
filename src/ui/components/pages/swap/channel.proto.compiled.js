/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const proto = $root.proto = (() => {

    /**
     * Namespace proto.
     * @exports proto
     * @namespace
     */
    const proto = {};

    proto.Request = (function() {

        /**
         * Properties of a Request.
         * @memberof proto
         * @interface IRequest
         * @property {proto.Request.Exchange|null} [exchange] Request exchange
         */

        /**
         * Constructs a new Request.
         * @memberof proto
         * @classdesc Represents a Request.
         * @implements IRequest
         * @constructor
         * @param {proto.IRequest=} [properties] Properties to set
         */
        function Request(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Request exchange.
         * @member {proto.Request.Exchange|null|undefined} exchange
         * @memberof proto.Request
         * @instance
         */
        Request.prototype.exchange = null;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        /**
         * Request payload.
         * @member {"exchange"|undefined} payload
         * @memberof proto.Request
         * @instance
         */
        Object.defineProperty(Request.prototype, "payload", {
            get: $util.oneOfGetter($oneOfFields = ["exchange"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new Request instance using the specified properties.
         * @function create
         * @memberof proto.Request
         * @static
         * @param {proto.IRequest=} [properties] Properties to set
         * @returns {proto.Request} Request instance
         */
        Request.create = function create(properties) {
            return new Request(properties);
        };

        /**
         * Encodes the specified Request message. Does not implicitly {@link proto.Request.verify|verify} messages.
         * @function encode
         * @memberof proto.Request
         * @static
         * @param {proto.Request} message Request message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Request.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.exchange != null && Object.hasOwnProperty.call(message, "exchange"))
                $root.proto.Request.Exchange.encode(message.exchange, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Request message, length delimited. Does not implicitly {@link proto.Request.verify|verify} messages.
         * @function encodeDelimited
         * @memberof proto.Request
         * @static
         * @param {proto.Request} message Request message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Request.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Request message from the specified reader or buffer.
         * @function decode
         * @memberof proto.Request
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {proto.Request} Request
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Request.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.proto.Request();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.exchange = $root.proto.Request.Exchange.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Request message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof proto.Request
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {proto.Request} Request
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Request.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Request message.
         * @function verify
         * @memberof proto.Request
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Request.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.exchange != null && message.hasOwnProperty("exchange")) {
                properties.payload = 1;
                {
                    let error = $root.proto.Request.Exchange.verify(message.exchange);
                    if (error)
                        return "exchange." + error;
                }
            }
            return null;
        };

        /**
         * Creates a Request message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof proto.Request
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {proto.Request} Request
         */
        Request.fromObject = function fromObject(object) {
            if (object instanceof $root.proto.Request)
                return object;
            let message = new $root.proto.Request();
            if (object.exchange != null) {
                if (typeof object.exchange !== "object")
                    throw TypeError(".proto.Request.exchange: object expected");
                message.exchange = $root.proto.Request.Exchange.fromObject(object.exchange);
            }
            return message;
        };

        /**
         * Creates a plain object from a Request message. Also converts values to other types if specified.
         * @function toObject
         * @memberof proto.Request
         * @static
         * @param {proto.Request} message Request
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Request.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (message.exchange != null && message.hasOwnProperty("exchange")) {
                object.exchange = $root.proto.Request.Exchange.toObject(message.exchange, options);
                if (options.oneofs)
                    object.payload = "exchange";
            }
            return object;
        };

        /**
         * Converts this Request to JSON.
         * @function toJSON
         * @memberof proto.Request
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Request.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        Request.Exchange = (function() {

            /**
             * Properties of an Exchange.
             * @memberof proto.Request
             * @interface IExchange
             * @property {string|null} [id] Exchange id
             * @property {string|null} [source] Exchange source
             * @property {string|null} [target] Exchange target
             * @property {Long|null} [amount] Exchange amount
             * @property {number|null} [slippageTolerance] Exchange slippageTolerance
             */

            /**
             * Constructs a new Exchange.
             * @memberof proto.Request
             * @classdesc Represents an Exchange.
             * @implements IExchange
             * @constructor
             * @param {proto.Request.IExchange=} [properties] Properties to set
             */
            function Exchange(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Exchange id.
             * @member {string} id
             * @memberof proto.Request.Exchange
             * @instance
             */
            Exchange.prototype.id = "";

            /**
             * Exchange source.
             * @member {string} source
             * @memberof proto.Request.Exchange
             * @instance
             */
            Exchange.prototype.source = "";

            /**
             * Exchange target.
             * @member {string} target
             * @memberof proto.Request.Exchange
             * @instance
             */
            Exchange.prototype.target = "";

            /**
             * Exchange amount.
             * @member {Long} amount
             * @memberof proto.Request.Exchange
             * @instance
             */
            Exchange.prototype.amount = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Exchange slippageTolerance.
             * @member {number} slippageTolerance
             * @memberof proto.Request.Exchange
             * @instance
             */
            Exchange.prototype.slippageTolerance = 0;

            /**
             * Creates a new Exchange instance using the specified properties.
             * @function create
             * @memberof proto.Request.Exchange
             * @static
             * @param {proto.Request.IExchange=} [properties] Properties to set
             * @returns {proto.Request.Exchange} Exchange instance
             */
            Exchange.create = function create(properties) {
                return new Exchange(properties);
            };

            /**
             * Encodes the specified Exchange message. Does not implicitly {@link proto.Request.Exchange.verify|verify} messages.
             * @function encode
             * @memberof proto.Request.Exchange
             * @static
             * @param {proto.Request.Exchange} message Exchange message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Exchange.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                if (message.source != null && Object.hasOwnProperty.call(message, "source"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.source);
                if (message.target != null && Object.hasOwnProperty.call(message, "target"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.target);
                if (message.amount != null && Object.hasOwnProperty.call(message, "amount"))
                    writer.uint32(/* id 4, wireType 0 =*/32).int64(message.amount);
                if (message.slippageTolerance != null && Object.hasOwnProperty.call(message, "slippageTolerance"))
                    writer.uint32(/* id 5, wireType 0 =*/40).int32(message.slippageTolerance);
                return writer;
            };

            /**
             * Encodes the specified Exchange message, length delimited. Does not implicitly {@link proto.Request.Exchange.verify|verify} messages.
             * @function encodeDelimited
             * @memberof proto.Request.Exchange
             * @static
             * @param {proto.Request.Exchange} message Exchange message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Exchange.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an Exchange message from the specified reader or buffer.
             * @function decode
             * @memberof proto.Request.Exchange
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {proto.Request.Exchange} Exchange
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Exchange.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.proto.Request.Exchange();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.id = reader.string();
                        break;
                    case 2:
                        message.source = reader.string();
                        break;
                    case 3:
                        message.target = reader.string();
                        break;
                    case 4:
                        message.amount = reader.int64();
                        break;
                    case 5:
                        message.slippageTolerance = reader.int32();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an Exchange message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof proto.Request.Exchange
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {proto.Request.Exchange} Exchange
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Exchange.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Exchange message.
             * @function verify
             * @memberof proto.Request.Exchange
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Exchange.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isString(message.id))
                        return "id: string expected";
                if (message.source != null && message.hasOwnProperty("source"))
                    if (!$util.isString(message.source))
                        return "source: string expected";
                if (message.target != null && message.hasOwnProperty("target"))
                    if (!$util.isString(message.target))
                        return "target: string expected";
                if (message.amount != null && message.hasOwnProperty("amount"))
                    if (!$util.isInteger(message.amount) && !(message.amount && $util.isInteger(message.amount.low) && $util.isInteger(message.amount.high)))
                        return "amount: integer|Long expected";
                if (message.slippageTolerance != null && message.hasOwnProperty("slippageTolerance"))
                    if (!$util.isInteger(message.slippageTolerance))
                        return "slippageTolerance: integer expected";
                return null;
            };

            /**
             * Creates an Exchange message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof proto.Request.Exchange
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {proto.Request.Exchange} Exchange
             */
            Exchange.fromObject = function fromObject(object) {
                if (object instanceof $root.proto.Request.Exchange)
                    return object;
                let message = new $root.proto.Request.Exchange();
                if (object.id != null)
                    message.id = String(object.id);
                if (object.source != null)
                    message.source = String(object.source);
                if (object.target != null)
                    message.target = String(object.target);
                if (object.amount != null)
                    if ($util.Long)
                        (message.amount = $util.Long.fromValue(object.amount)).unsigned = false;
                    else if (typeof object.amount === "string")
                        message.amount = parseInt(object.amount, 10);
                    else if (typeof object.amount === "number")
                        message.amount = object.amount;
                    else if (typeof object.amount === "object")
                        message.amount = new $util.LongBits(object.amount.low >>> 0, object.amount.high >>> 0).toNumber();
                if (object.slippageTolerance != null)
                    message.slippageTolerance = object.slippageTolerance | 0;
                return message;
            };

            /**
             * Creates a plain object from an Exchange message. Also converts values to other types if specified.
             * @function toObject
             * @memberof proto.Request.Exchange
             * @static
             * @param {proto.Request.Exchange} message Exchange
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Exchange.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.id = "";
                    object.source = "";
                    object.target = "";
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.amount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.amount = options.longs === String ? "0" : 0;
                    object.slippageTolerance = 0;
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                if (message.source != null && message.hasOwnProperty("source"))
                    object.source = message.source;
                if (message.target != null && message.hasOwnProperty("target"))
                    object.target = message.target;
                if (message.amount != null && message.hasOwnProperty("amount"))
                    if (typeof message.amount === "number")
                        object.amount = options.longs === String ? String(message.amount) : message.amount;
                    else
                        object.amount = options.longs === String ? $util.Long.prototype.toString.call(message.amount) : options.longs === Number ? new $util.LongBits(message.amount.low >>> 0, message.amount.high >>> 0).toNumber() : message.amount;
                if (message.slippageTolerance != null && message.hasOwnProperty("slippageTolerance"))
                    object.slippageTolerance = message.slippageTolerance;
                return object;
            };

            /**
             * Converts this Exchange to JSON.
             * @function toJSON
             * @memberof proto.Request.Exchange
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Exchange.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Exchange;
        })();

        return Request;
    })();

    proto.Response = (function() {

        /**
         * Properties of a Response.
         * @memberof proto
         * @interface IResponse
         * @property {string|null} [id] Response id
         * @property {proto.Response.Exchange|null} [exchange] Response exchange
         */

        /**
         * Constructs a new Response.
         * @memberof proto
         * @classdesc Represents a Response.
         * @implements IResponse
         * @constructor
         * @param {proto.IResponse=} [properties] Properties to set
         */
        function Response(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Response id.
         * @member {string} id
         * @memberof proto.Response
         * @instance
         */
        Response.prototype.id = "";

        /**
         * Response exchange.
         * @member {proto.Response.Exchange|null|undefined} exchange
         * @memberof proto.Response
         * @instance
         */
        Response.prototype.exchange = null;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        /**
         * Response payload.
         * @member {"exchange"|undefined} payload
         * @memberof proto.Response
         * @instance
         */
        Object.defineProperty(Response.prototype, "payload", {
            get: $util.oneOfGetter($oneOfFields = ["exchange"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new Response instance using the specified properties.
         * @function create
         * @memberof proto.Response
         * @static
         * @param {proto.IResponse=} [properties] Properties to set
         * @returns {proto.Response} Response instance
         */
        Response.create = function create(properties) {
            return new Response(properties);
        };

        /**
         * Encodes the specified Response message. Does not implicitly {@link proto.Response.verify|verify} messages.
         * @function encode
         * @memberof proto.Response
         * @static
         * @param {proto.Response} message Response message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Response.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.exchange != null && Object.hasOwnProperty.call(message, "exchange"))
                $root.proto.Response.Exchange.encode(message.exchange, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Response message, length delimited. Does not implicitly {@link proto.Response.verify|verify} messages.
         * @function encodeDelimited
         * @memberof proto.Response
         * @static
         * @param {proto.Response} message Response message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Response.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Response message from the specified reader or buffer.
         * @function decode
         * @memberof proto.Response
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {proto.Response} Response
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Response.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.proto.Response();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.id = reader.string();
                    break;
                case 2:
                    message.exchange = $root.proto.Response.Exchange.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Response message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof proto.Response
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {proto.Response} Response
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Response.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Response message.
         * @function verify
         * @memberof proto.Response
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Response.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.exchange != null && message.hasOwnProperty("exchange")) {
                properties.payload = 1;
                {
                    let error = $root.proto.Response.Exchange.verify(message.exchange);
                    if (error)
                        return "exchange." + error;
                }
            }
            return null;
        };

        /**
         * Creates a Response message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof proto.Response
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {proto.Response} Response
         */
        Response.fromObject = function fromObject(object) {
            if (object instanceof $root.proto.Response)
                return object;
            let message = new $root.proto.Response();
            if (object.id != null)
                message.id = String(object.id);
            if (object.exchange != null) {
                if (typeof object.exchange !== "object")
                    throw TypeError(".proto.Response.exchange: object expected");
                message.exchange = $root.proto.Response.Exchange.fromObject(object.exchange);
            }
            return message;
        };

        /**
         * Creates a plain object from a Response message. Also converts values to other types if specified.
         * @function toObject
         * @memberof proto.Response
         * @static
         * @param {proto.Response} message Response
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Response.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults)
                object.id = "";
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.exchange != null && message.hasOwnProperty("exchange")) {
                object.exchange = $root.proto.Response.Exchange.toObject(message.exchange, options);
                if (options.oneofs)
                    object.payload = "exchange";
            }
            return object;
        };

        /**
         * Converts this Response to JSON.
         * @function toJSON
         * @memberof proto.Response
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Response.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        Response.Error = (function() {

            /**
             * Properties of an Error.
             * @memberof proto.Response
             * @interface IError
             * @property {proto.Response.Error.CODES|null} [code] Error code
             * @property {string|null} [message] Error message
             */

            /**
             * Constructs a new Error.
             * @memberof proto.Response
             * @classdesc Represents an Error.
             * @implements IError
             * @constructor
             * @param {proto.Response.IError=} [properties] Properties to set
             */
            function Error(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Error code.
             * @member {proto.Response.Error.CODES} code
             * @memberof proto.Response.Error
             * @instance
             */
            Error.prototype.code = 0;

            /**
             * Error message.
             * @member {string} message
             * @memberof proto.Response.Error
             * @instance
             */
            Error.prototype.message = "";

            /**
             * Creates a new Error instance using the specified properties.
             * @function create
             * @memberof proto.Response.Error
             * @static
             * @param {proto.Response.IError=} [properties] Properties to set
             * @returns {proto.Response.Error} Error instance
             */
            Error.create = function create(properties) {
                return new Error(properties);
            };

            /**
             * Encodes the specified Error message. Does not implicitly {@link proto.Response.Error.verify|verify} messages.
             * @function encode
             * @memberof proto.Response.Error
             * @static
             * @param {proto.Response.Error} message Error message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Error.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.code != null && Object.hasOwnProperty.call(message, "code"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.code);
                if (message.message != null && Object.hasOwnProperty.call(message, "message"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.message);
                return writer;
            };

            /**
             * Encodes the specified Error message, length delimited. Does not implicitly {@link proto.Response.Error.verify|verify} messages.
             * @function encodeDelimited
             * @memberof proto.Response.Error
             * @static
             * @param {proto.Response.Error} message Error message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Error.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an Error message from the specified reader or buffer.
             * @function decode
             * @memberof proto.Response.Error
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {proto.Response.Error} Error
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Error.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.proto.Response.Error();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.code = reader.int32();
                        break;
                    case 2:
                        message.message = reader.string();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an Error message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof proto.Response.Error
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {proto.Response.Error} Error
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Error.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Error message.
             * @function verify
             * @memberof proto.Response.Error
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Error.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.code != null && message.hasOwnProperty("code"))
                    switch (message.code) {
                    default:
                        return "code: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                        break;
                    }
                if (message.message != null && message.hasOwnProperty("message"))
                    if (!$util.isString(message.message))
                        return "message: string expected";
                return null;
            };

            /**
             * Creates an Error message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof proto.Response.Error
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {proto.Response.Error} Error
             */
            Error.fromObject = function fromObject(object) {
                if (object instanceof $root.proto.Response.Error)
                    return object;
                let message = new $root.proto.Response.Error();
                switch (object.code) {
                case "UNAVAILABLE":
                case 0:
                    message.code = 0;
                    break;
                case "UNEXPECTED":
                case 1:
                    message.code = 1;
                    break;
                case "INVALID_ASSET_PAIR":
                case 2:
                    message.code = 2;
                    break;
                }
                if (object.message != null)
                    message.message = String(object.message);
                return message;
            };

            /**
             * Creates a plain object from an Error message. Also converts values to other types if specified.
             * @function toObject
             * @memberof proto.Response.Error
             * @static
             * @param {proto.Response.Error} message Error
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Error.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.code = options.enums === String ? "UNAVAILABLE" : 0;
                    object.message = "";
                }
                if (message.code != null && message.hasOwnProperty("code"))
                    object.code = options.enums === String ? $root.proto.Response.Error.CODES[message.code] : message.code;
                if (message.message != null && message.hasOwnProperty("message"))
                    object.message = message.message;
                return object;
            };

            /**
             * Converts this Error to JSON.
             * @function toJSON
             * @memberof proto.Response.Error
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Error.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * CODES enum.
             * @name proto.Response.Error.CODES
             * @enum {number}
             * @property {number} UNAVAILABLE=0 UNAVAILABLE value
             * @property {number} UNEXPECTED=1 UNEXPECTED value
             * @property {number} INVALID_ASSET_PAIR=2 INVALID_ASSET_PAIR value
             */
            Error.CODES = (function() {
                const valuesById = {}, values = Object.create(valuesById);
                values[valuesById[0] = "UNAVAILABLE"] = 0;
                values[valuesById[1] = "UNEXPECTED"] = 1;
                values[valuesById[2] = "INVALID_ASSET_PAIR"] = 2;
                return values;
            })();

            return Error;
        })();

        Response.Exchange = (function() {

            /**
             * Properties of an Exchange.
             * @memberof proto.Response
             * @interface IExchange
             * @property {string|null} [vendor] Exchange vendor
             * @property {proto.Response.Exchange.Data|null} [data] Exchange data
             * @property {proto.Response.Error|null} [error] Exchange error
             */

            /**
             * Constructs a new Exchange.
             * @memberof proto.Response
             * @classdesc Represents an Exchange.
             * @implements IExchange
             * @constructor
             * @param {proto.Response.IExchange=} [properties] Properties to set
             */
            function Exchange(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Exchange vendor.
             * @member {string} vendor
             * @memberof proto.Response.Exchange
             * @instance
             */
            Exchange.prototype.vendor = "";

            /**
             * Exchange data.
             * @member {proto.Response.Exchange.Data|null|undefined} data
             * @memberof proto.Response.Exchange
             * @instance
             */
            Exchange.prototype.data = null;

            /**
             * Exchange error.
             * @member {proto.Response.Error|null|undefined} error
             * @memberof proto.Response.Exchange
             * @instance
             */
            Exchange.prototype.error = null;

            // OneOf field names bound to virtual getters and setters
            let $oneOfFields;

            /**
             * Exchange result.
             * @member {"data"|"error"|undefined} result
             * @memberof proto.Response.Exchange
             * @instance
             */
            Object.defineProperty(Exchange.prototype, "result", {
                get: $util.oneOfGetter($oneOfFields = ["data", "error"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new Exchange instance using the specified properties.
             * @function create
             * @memberof proto.Response.Exchange
             * @static
             * @param {proto.Response.IExchange=} [properties] Properties to set
             * @returns {proto.Response.Exchange} Exchange instance
             */
            Exchange.create = function create(properties) {
                return new Exchange(properties);
            };

            /**
             * Encodes the specified Exchange message. Does not implicitly {@link proto.Response.Exchange.verify|verify} messages.
             * @function encode
             * @memberof proto.Response.Exchange
             * @static
             * @param {proto.Response.Exchange} message Exchange message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Exchange.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.vendor != null && Object.hasOwnProperty.call(message, "vendor"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.vendor);
                if (message.data != null && Object.hasOwnProperty.call(message, "data"))
                    $root.proto.Response.Exchange.Data.encode(message.data, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.error != null && Object.hasOwnProperty.call(message, "error"))
                    $root.proto.Response.Error.encode(message.error, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified Exchange message, length delimited. Does not implicitly {@link proto.Response.Exchange.verify|verify} messages.
             * @function encodeDelimited
             * @memberof proto.Response.Exchange
             * @static
             * @param {proto.Response.Exchange} message Exchange message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Exchange.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an Exchange message from the specified reader or buffer.
             * @function decode
             * @memberof proto.Response.Exchange
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {proto.Response.Exchange} Exchange
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Exchange.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.proto.Response.Exchange();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.vendor = reader.string();
                        break;
                    case 2:
                        message.data = $root.proto.Response.Exchange.Data.decode(reader, reader.uint32());
                        break;
                    case 3:
                        message.error = $root.proto.Response.Error.decode(reader, reader.uint32());
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an Exchange message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof proto.Response.Exchange
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {proto.Response.Exchange} Exchange
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Exchange.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Exchange message.
             * @function verify
             * @memberof proto.Response.Exchange
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Exchange.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                let properties = {};
                if (message.vendor != null && message.hasOwnProperty("vendor"))
                    if (!$util.isString(message.vendor))
                        return "vendor: string expected";
                if (message.data != null && message.hasOwnProperty("data")) {
                    properties.result = 1;
                    {
                        let error = $root.proto.Response.Exchange.Data.verify(message.data);
                        if (error)
                            return "data." + error;
                    }
                }
                if (message.error != null && message.hasOwnProperty("error")) {
                    if (properties.result === 1)
                        return "result: multiple values";
                    properties.result = 1;
                    {
                        let error = $root.proto.Response.Error.verify(message.error);
                        if (error)
                            return "error." + error;
                    }
                }
                return null;
            };

            /**
             * Creates an Exchange message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof proto.Response.Exchange
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {proto.Response.Exchange} Exchange
             */
            Exchange.fromObject = function fromObject(object) {
                if (object instanceof $root.proto.Response.Exchange)
                    return object;
                let message = new $root.proto.Response.Exchange();
                if (object.vendor != null)
                    message.vendor = String(object.vendor);
                if (object.data != null) {
                    if (typeof object.data !== "object")
                        throw TypeError(".proto.Response.Exchange.data: object expected");
                    message.data = $root.proto.Response.Exchange.Data.fromObject(object.data);
                }
                if (object.error != null) {
                    if (typeof object.error !== "object")
                        throw TypeError(".proto.Response.Exchange.error: object expected");
                    message.error = $root.proto.Response.Error.fromObject(object.error);
                }
                return message;
            };

            /**
             * Creates a plain object from an Exchange message. Also converts values to other types if specified.
             * @function toObject
             * @memberof proto.Response.Exchange
             * @static
             * @param {proto.Response.Exchange} message Exchange
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Exchange.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.vendor = "";
                if (message.vendor != null && message.hasOwnProperty("vendor"))
                    object.vendor = message.vendor;
                if (message.data != null && message.hasOwnProperty("data")) {
                    object.data = $root.proto.Response.Exchange.Data.toObject(message.data, options);
                    if (options.oneofs)
                        object.result = "data";
                }
                if (message.error != null && message.hasOwnProperty("error")) {
                    object.error = $root.proto.Response.Error.toObject(message.error, options);
                    if (options.oneofs)
                        object.result = "error";
                }
                return object;
            };

            /**
             * Converts this Exchange to JSON.
             * @function toJSON
             * @memberof proto.Response.Exchange
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Exchange.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            Exchange.Pool = (function() {

                /**
                 * Properties of a Pool.
                 * @memberof proto.Response.Exchange
                 * @interface IPool
                 * @property {string|null} [vendor] Pool vendor
                 * @property {string|null} [type] Pool type
                 * @property {string|null} [address] Pool address
                 * @property {string|null} [source] Pool source
                 * @property {string|null} [target] Pool target
                 * @property {Long|null} [estimatedAmount] Pool estimatedAmount
                 */

                /**
                 * Constructs a new Pool.
                 * @memberof proto.Response.Exchange
                 * @classdesc Represents a Pool.
                 * @implements IPool
                 * @constructor
                 * @param {proto.Response.Exchange.IPool=} [properties] Properties to set
                 */
                function Pool(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Pool vendor.
                 * @member {string} vendor
                 * @memberof proto.Response.Exchange.Pool
                 * @instance
                 */
                Pool.prototype.vendor = "";

                /**
                 * Pool type.
                 * @member {string} type
                 * @memberof proto.Response.Exchange.Pool
                 * @instance
                 */
                Pool.prototype.type = "";

                /**
                 * Pool address.
                 * @member {string} address
                 * @memberof proto.Response.Exchange.Pool
                 * @instance
                 */
                Pool.prototype.address = "";

                /**
                 * Pool source.
                 * @member {string} source
                 * @memberof proto.Response.Exchange.Pool
                 * @instance
                 */
                Pool.prototype.source = "";

                /**
                 * Pool target.
                 * @member {string} target
                 * @memberof proto.Response.Exchange.Pool
                 * @instance
                 */
                Pool.prototype.target = "";

                /**
                 * Pool estimatedAmount.
                 * @member {Long} estimatedAmount
                 * @memberof proto.Response.Exchange.Pool
                 * @instance
                 */
                Pool.prototype.estimatedAmount = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                /**
                 * Creates a new Pool instance using the specified properties.
                 * @function create
                 * @memberof proto.Response.Exchange.Pool
                 * @static
                 * @param {proto.Response.Exchange.IPool=} [properties] Properties to set
                 * @returns {proto.Response.Exchange.Pool} Pool instance
                 */
                Pool.create = function create(properties) {
                    return new Pool(properties);
                };

                /**
                 * Encodes the specified Pool message. Does not implicitly {@link proto.Response.Exchange.Pool.verify|verify} messages.
                 * @function encode
                 * @memberof proto.Response.Exchange.Pool
                 * @static
                 * @param {proto.Response.Exchange.Pool} message Pool message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Pool.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.vendor != null && Object.hasOwnProperty.call(message, "vendor"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.vendor);
                    if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.type);
                    if (message.address != null && Object.hasOwnProperty.call(message, "address"))
                        writer.uint32(/* id 3, wireType 2 =*/26).string(message.address);
                    if (message.source != null && Object.hasOwnProperty.call(message, "source"))
                        writer.uint32(/* id 4, wireType 2 =*/34).string(message.source);
                    if (message.target != null && Object.hasOwnProperty.call(message, "target"))
                        writer.uint32(/* id 5, wireType 2 =*/42).string(message.target);
                    if (message.estimatedAmount != null && Object.hasOwnProperty.call(message, "estimatedAmount"))
                        writer.uint32(/* id 6, wireType 0 =*/48).int64(message.estimatedAmount);
                    return writer;
                };

                /**
                 * Encodes the specified Pool message, length delimited. Does not implicitly {@link proto.Response.Exchange.Pool.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof proto.Response.Exchange.Pool
                 * @static
                 * @param {proto.Response.Exchange.Pool} message Pool message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Pool.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a Pool message from the specified reader or buffer.
                 * @function decode
                 * @memberof proto.Response.Exchange.Pool
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {proto.Response.Exchange.Pool} Pool
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Pool.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.proto.Response.Exchange.Pool();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.vendor = reader.string();
                            break;
                        case 2:
                            message.type = reader.string();
                            break;
                        case 3:
                            message.address = reader.string();
                            break;
                        case 4:
                            message.source = reader.string();
                            break;
                        case 5:
                            message.target = reader.string();
                            break;
                        case 6:
                            message.estimatedAmount = reader.int64();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a Pool message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof proto.Response.Exchange.Pool
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {proto.Response.Exchange.Pool} Pool
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Pool.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a Pool message.
                 * @function verify
                 * @memberof proto.Response.Exchange.Pool
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Pool.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.vendor != null && message.hasOwnProperty("vendor"))
                        if (!$util.isString(message.vendor))
                            return "vendor: string expected";
                    if (message.type != null && message.hasOwnProperty("type"))
                        if (!$util.isString(message.type))
                            return "type: string expected";
                    if (message.address != null && message.hasOwnProperty("address"))
                        if (!$util.isString(message.address))
                            return "address: string expected";
                    if (message.source != null && message.hasOwnProperty("source"))
                        if (!$util.isString(message.source))
                            return "source: string expected";
                    if (message.target != null && message.hasOwnProperty("target"))
                        if (!$util.isString(message.target))
                            return "target: string expected";
                    if (message.estimatedAmount != null && message.hasOwnProperty("estimatedAmount"))
                        if (!$util.isInteger(message.estimatedAmount) && !(message.estimatedAmount && $util.isInteger(message.estimatedAmount.low) && $util.isInteger(message.estimatedAmount.high)))
                            return "estimatedAmount: integer|Long expected";
                    return null;
                };

                /**
                 * Creates a Pool message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof proto.Response.Exchange.Pool
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {proto.Response.Exchange.Pool} Pool
                 */
                Pool.fromObject = function fromObject(object) {
                    if (object instanceof $root.proto.Response.Exchange.Pool)
                        return object;
                    let message = new $root.proto.Response.Exchange.Pool();
                    if (object.vendor != null)
                        message.vendor = String(object.vendor);
                    if (object.type != null)
                        message.type = String(object.type);
                    if (object.address != null)
                        message.address = String(object.address);
                    if (object.source != null)
                        message.source = String(object.source);
                    if (object.target != null)
                        message.target = String(object.target);
                    if (object.estimatedAmount != null)
                        if ($util.Long)
                            (message.estimatedAmount = $util.Long.fromValue(object.estimatedAmount)).unsigned = false;
                        else if (typeof object.estimatedAmount === "string")
                            message.estimatedAmount = parseInt(object.estimatedAmount, 10);
                        else if (typeof object.estimatedAmount === "number")
                            message.estimatedAmount = object.estimatedAmount;
                        else if (typeof object.estimatedAmount === "object")
                            message.estimatedAmount = new $util.LongBits(object.estimatedAmount.low >>> 0, object.estimatedAmount.high >>> 0).toNumber();
                    return message;
                };

                /**
                 * Creates a plain object from a Pool message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof proto.Response.Exchange.Pool
                 * @static
                 * @param {proto.Response.Exchange.Pool} message Pool
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Pool.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.vendor = "";
                        object.type = "";
                        object.address = "";
                        object.source = "";
                        object.target = "";
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, false);
                            object.estimatedAmount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.estimatedAmount = options.longs === String ? "0" : 0;
                    }
                    if (message.vendor != null && message.hasOwnProperty("vendor"))
                        object.vendor = message.vendor;
                    if (message.type != null && message.hasOwnProperty("type"))
                        object.type = message.type;
                    if (message.address != null && message.hasOwnProperty("address"))
                        object.address = message.address;
                    if (message.source != null && message.hasOwnProperty("source"))
                        object.source = message.source;
                    if (message.target != null && message.hasOwnProperty("target"))
                        object.target = message.target;
                    if (message.estimatedAmount != null && message.hasOwnProperty("estimatedAmount"))
                        if (typeof message.estimatedAmount === "number")
                            object.estimatedAmount = options.longs === String ? String(message.estimatedAmount) : message.estimatedAmount;
                        else
                            object.estimatedAmount = options.longs === String ? $util.Long.prototype.toString.call(message.estimatedAmount) : options.longs === Number ? new $util.LongBits(message.estimatedAmount.low >>> 0, message.estimatedAmount.high >>> 0).toNumber() : message.estimatedAmount;
                    return object;
                };

                /**
                 * Converts this Pool to JSON.
                 * @function toJSON
                 * @memberof proto.Response.Exchange.Pool
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Pool.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return Pool;
            })();

            Exchange.Route = (function() {

                /**
                 * Properties of a Route.
                 * @memberof proto.Response.Exchange
                 * @interface IRoute
                 * @property {Array.<proto.Response.Exchange.Pool>|null} [pools] Route pools
                 */

                /**
                 * Constructs a new Route.
                 * @memberof proto.Response.Exchange
                 * @classdesc Represents a Route.
                 * @implements IRoute
                 * @constructor
                 * @param {proto.Response.Exchange.IRoute=} [properties] Properties to set
                 */
                function Route(properties) {
                    this.pools = [];
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Route pools.
                 * @member {Array.<proto.Response.Exchange.Pool>} pools
                 * @memberof proto.Response.Exchange.Route
                 * @instance
                 */
                Route.prototype.pools = $util.emptyArray;

                /**
                 * Creates a new Route instance using the specified properties.
                 * @function create
                 * @memberof proto.Response.Exchange.Route
                 * @static
                 * @param {proto.Response.Exchange.IRoute=} [properties] Properties to set
                 * @returns {proto.Response.Exchange.Route} Route instance
                 */
                Route.create = function create(properties) {
                    return new Route(properties);
                };

                /**
                 * Encodes the specified Route message. Does not implicitly {@link proto.Response.Exchange.Route.verify|verify} messages.
                 * @function encode
                 * @memberof proto.Response.Exchange.Route
                 * @static
                 * @param {proto.Response.Exchange.Route} message Route message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Route.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.pools != null && message.pools.length)
                        for (let i = 0; i < message.pools.length; ++i)
                            $root.proto.Response.Exchange.Pool.encode(message.pools[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified Route message, length delimited. Does not implicitly {@link proto.Response.Exchange.Route.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof proto.Response.Exchange.Route
                 * @static
                 * @param {proto.Response.Exchange.Route} message Route message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Route.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a Route message from the specified reader or buffer.
                 * @function decode
                 * @memberof proto.Response.Exchange.Route
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {proto.Response.Exchange.Route} Route
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Route.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.proto.Response.Exchange.Route();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            if (!(message.pools && message.pools.length))
                                message.pools = [];
                            message.pools.push($root.proto.Response.Exchange.Pool.decode(reader, reader.uint32()));
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a Route message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof proto.Response.Exchange.Route
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {proto.Response.Exchange.Route} Route
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Route.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a Route message.
                 * @function verify
                 * @memberof proto.Response.Exchange.Route
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Route.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.pools != null && message.hasOwnProperty("pools")) {
                        if (!Array.isArray(message.pools))
                            return "pools: array expected";
                        for (let i = 0; i < message.pools.length; ++i) {
                            let error = $root.proto.Response.Exchange.Pool.verify(message.pools[i]);
                            if (error)
                                return "pools." + error;
                        }
                    }
                    return null;
                };

                /**
                 * Creates a Route message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof proto.Response.Exchange.Route
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {proto.Response.Exchange.Route} Route
                 */
                Route.fromObject = function fromObject(object) {
                    if (object instanceof $root.proto.Response.Exchange.Route)
                        return object;
                    let message = new $root.proto.Response.Exchange.Route();
                    if (object.pools) {
                        if (!Array.isArray(object.pools))
                            throw TypeError(".proto.Response.Exchange.Route.pools: array expected");
                        message.pools = [];
                        for (let i = 0; i < object.pools.length; ++i) {
                            if (typeof object.pools[i] !== "object")
                                throw TypeError(".proto.Response.Exchange.Route.pools: object expected");
                            message.pools[i] = $root.proto.Response.Exchange.Pool.fromObject(object.pools[i]);
                        }
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a Route message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof proto.Response.Exchange.Route
                 * @static
                 * @param {proto.Response.Exchange.Route} message Route
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Route.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.arrays || options.defaults)
                        object.pools = [];
                    if (message.pools && message.pools.length) {
                        object.pools = [];
                        for (let j = 0; j < message.pools.length; ++j)
                            object.pools[j] = $root.proto.Response.Exchange.Pool.toObject(message.pools[j], options);
                    }
                    return object;
                };

                /**
                 * Converts this Route to JSON.
                 * @function toJSON
                 * @memberof proto.Response.Exchange.Route
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Route.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return Route;
            })();

            Exchange.Transaction = (function() {

                /**
                 * Properties of a Transaction.
                 * @memberof proto.Response.Exchange
                 * @interface ITransaction
                 * @property {string|null} [dApp] Transaction dApp
                 * @property {proto.Response.Exchange.Transaction.Call|null} [call] Transaction call
                 */

                /**
                 * Constructs a new Transaction.
                 * @memberof proto.Response.Exchange
                 * @classdesc Represents a Transaction.
                 * @implements ITransaction
                 * @constructor
                 * @param {proto.Response.Exchange.ITransaction=} [properties] Properties to set
                 */
                function Transaction(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Transaction dApp.
                 * @member {string} dApp
                 * @memberof proto.Response.Exchange.Transaction
                 * @instance
                 */
                Transaction.prototype.dApp = "";

                /**
                 * Transaction call.
                 * @member {proto.Response.Exchange.Transaction.Call|null|undefined} call
                 * @memberof proto.Response.Exchange.Transaction
                 * @instance
                 */
                Transaction.prototype.call = null;

                /**
                 * Creates a new Transaction instance using the specified properties.
                 * @function create
                 * @memberof proto.Response.Exchange.Transaction
                 * @static
                 * @param {proto.Response.Exchange.ITransaction=} [properties] Properties to set
                 * @returns {proto.Response.Exchange.Transaction} Transaction instance
                 */
                Transaction.create = function create(properties) {
                    return new Transaction(properties);
                };

                /**
                 * Encodes the specified Transaction message. Does not implicitly {@link proto.Response.Exchange.Transaction.verify|verify} messages.
                 * @function encode
                 * @memberof proto.Response.Exchange.Transaction
                 * @static
                 * @param {proto.Response.Exchange.Transaction} message Transaction message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Transaction.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.dApp != null && Object.hasOwnProperty.call(message, "dApp"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.dApp);
                    if (message.call != null && Object.hasOwnProperty.call(message, "call"))
                        $root.proto.Response.Exchange.Transaction.Call.encode(message.call, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified Transaction message, length delimited. Does not implicitly {@link proto.Response.Exchange.Transaction.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof proto.Response.Exchange.Transaction
                 * @static
                 * @param {proto.Response.Exchange.Transaction} message Transaction message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Transaction.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a Transaction message from the specified reader or buffer.
                 * @function decode
                 * @memberof proto.Response.Exchange.Transaction
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {proto.Response.Exchange.Transaction} Transaction
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Transaction.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.proto.Response.Exchange.Transaction();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.dApp = reader.string();
                            break;
                        case 2:
                            message.call = $root.proto.Response.Exchange.Transaction.Call.decode(reader, reader.uint32());
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a Transaction message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof proto.Response.Exchange.Transaction
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {proto.Response.Exchange.Transaction} Transaction
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Transaction.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a Transaction message.
                 * @function verify
                 * @memberof proto.Response.Exchange.Transaction
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Transaction.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.dApp != null && message.hasOwnProperty("dApp"))
                        if (!$util.isString(message.dApp))
                            return "dApp: string expected";
                    if (message.call != null && message.hasOwnProperty("call")) {
                        let error = $root.proto.Response.Exchange.Transaction.Call.verify(message.call);
                        if (error)
                            return "call." + error;
                    }
                    return null;
                };

                /**
                 * Creates a Transaction message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof proto.Response.Exchange.Transaction
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {proto.Response.Exchange.Transaction} Transaction
                 */
                Transaction.fromObject = function fromObject(object) {
                    if (object instanceof $root.proto.Response.Exchange.Transaction)
                        return object;
                    let message = new $root.proto.Response.Exchange.Transaction();
                    if (object.dApp != null)
                        message.dApp = String(object.dApp);
                    if (object.call != null) {
                        if (typeof object.call !== "object")
                            throw TypeError(".proto.Response.Exchange.Transaction.call: object expected");
                        message.call = $root.proto.Response.Exchange.Transaction.Call.fromObject(object.call);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a Transaction message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof proto.Response.Exchange.Transaction
                 * @static
                 * @param {proto.Response.Exchange.Transaction} message Transaction
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Transaction.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.dApp = "";
                        object.call = null;
                    }
                    if (message.dApp != null && message.hasOwnProperty("dApp"))
                        object.dApp = message.dApp;
                    if (message.call != null && message.hasOwnProperty("call"))
                        object.call = $root.proto.Response.Exchange.Transaction.Call.toObject(message.call, options);
                    return object;
                };

                /**
                 * Converts this Transaction to JSON.
                 * @function toJSON
                 * @memberof proto.Response.Exchange.Transaction
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Transaction.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                Transaction.Argument = (function() {

                    /**
                     * Properties of an Argument.
                     * @memberof proto.Response.Exchange.Transaction
                     * @interface IArgument
                     * @property {Long|null} [integerValue] Argument integerValue
                     * @property {Uint8Array|null} [binaryValue] Argument binaryValue
                     * @property {string|null} [stringValue] Argument stringValue
                     * @property {boolean|null} [booleanValue] Argument booleanValue
                     * @property {proto.Response.Exchange.Transaction.Argument.List|null} [list] Argument list
                     */

                    /**
                     * Constructs a new Argument.
                     * @memberof proto.Response.Exchange.Transaction
                     * @classdesc Represents an Argument.
                     * @implements IArgument
                     * @constructor
                     * @param {proto.Response.Exchange.Transaction.IArgument=} [properties] Properties to set
                     */
                    function Argument(properties) {
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * Argument integerValue.
                     * @member {Long|null|undefined} integerValue
                     * @memberof proto.Response.Exchange.Transaction.Argument
                     * @instance
                     */
                    Argument.prototype.integerValue = null;

                    /**
                     * Argument binaryValue.
                     * @member {Uint8Array|null|undefined} binaryValue
                     * @memberof proto.Response.Exchange.Transaction.Argument
                     * @instance
                     */
                    Argument.prototype.binaryValue = null;

                    /**
                     * Argument stringValue.
                     * @member {string|null|undefined} stringValue
                     * @memberof proto.Response.Exchange.Transaction.Argument
                     * @instance
                     */
                    Argument.prototype.stringValue = null;

                    /**
                     * Argument booleanValue.
                     * @member {boolean|null|undefined} booleanValue
                     * @memberof proto.Response.Exchange.Transaction.Argument
                     * @instance
                     */
                    Argument.prototype.booleanValue = null;

                    /**
                     * Argument list.
                     * @member {proto.Response.Exchange.Transaction.Argument.List|null|undefined} list
                     * @memberof proto.Response.Exchange.Transaction.Argument
                     * @instance
                     */
                    Argument.prototype.list = null;

                    // OneOf field names bound to virtual getters and setters
                    let $oneOfFields;

                    /**
                     * Argument value.
                     * @member {"integerValue"|"binaryValue"|"stringValue"|"booleanValue"|"list"|undefined} value
                     * @memberof proto.Response.Exchange.Transaction.Argument
                     * @instance
                     */
                    Object.defineProperty(Argument.prototype, "value", {
                        get: $util.oneOfGetter($oneOfFields = ["integerValue", "binaryValue", "stringValue", "booleanValue", "list"]),
                        set: $util.oneOfSetter($oneOfFields)
                    });

                    /**
                     * Creates a new Argument instance using the specified properties.
                     * @function create
                     * @memberof proto.Response.Exchange.Transaction.Argument
                     * @static
                     * @param {proto.Response.Exchange.Transaction.IArgument=} [properties] Properties to set
                     * @returns {proto.Response.Exchange.Transaction.Argument} Argument instance
                     */
                    Argument.create = function create(properties) {
                        return new Argument(properties);
                    };

                    /**
                     * Encodes the specified Argument message. Does not implicitly {@link proto.Response.Exchange.Transaction.Argument.verify|verify} messages.
                     * @function encode
                     * @memberof proto.Response.Exchange.Transaction.Argument
                     * @static
                     * @param {proto.Response.Exchange.Transaction.Argument} message Argument message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Argument.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.integerValue != null && Object.hasOwnProperty.call(message, "integerValue"))
                            writer.uint32(/* id 1, wireType 0 =*/8).int64(message.integerValue);
                        if (message.binaryValue != null && Object.hasOwnProperty.call(message, "binaryValue"))
                            writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.binaryValue);
                        if (message.stringValue != null && Object.hasOwnProperty.call(message, "stringValue"))
                            writer.uint32(/* id 3, wireType 2 =*/26).string(message.stringValue);
                        if (message.booleanValue != null && Object.hasOwnProperty.call(message, "booleanValue"))
                            writer.uint32(/* id 4, wireType 0 =*/32).bool(message.booleanValue);
                        if (message.list != null && Object.hasOwnProperty.call(message, "list"))
                            $root.proto.Response.Exchange.Transaction.Argument.List.encode(message.list, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
                        return writer;
                    };

                    /**
                     * Encodes the specified Argument message, length delimited. Does not implicitly {@link proto.Response.Exchange.Transaction.Argument.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof proto.Response.Exchange.Transaction.Argument
                     * @static
                     * @param {proto.Response.Exchange.Transaction.Argument} message Argument message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Argument.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes an Argument message from the specified reader or buffer.
                     * @function decode
                     * @memberof proto.Response.Exchange.Transaction.Argument
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {proto.Response.Exchange.Transaction.Argument} Argument
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Argument.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.proto.Response.Exchange.Transaction.Argument();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1:
                                message.integerValue = reader.int64();
                                break;
                            case 2:
                                message.binaryValue = reader.bytes();
                                break;
                            case 3:
                                message.stringValue = reader.string();
                                break;
                            case 4:
                                message.booleanValue = reader.bool();
                                break;
                            case 10:
                                message.list = $root.proto.Response.Exchange.Transaction.Argument.List.decode(reader, reader.uint32());
                                break;
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes an Argument message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof proto.Response.Exchange.Transaction.Argument
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {proto.Response.Exchange.Transaction.Argument} Argument
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Argument.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies an Argument message.
                     * @function verify
                     * @memberof proto.Response.Exchange.Transaction.Argument
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    Argument.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        let properties = {};
                        if (message.integerValue != null && message.hasOwnProperty("integerValue")) {
                            properties.value = 1;
                            if (!$util.isInteger(message.integerValue) && !(message.integerValue && $util.isInteger(message.integerValue.low) && $util.isInteger(message.integerValue.high)))
                                return "integerValue: integer|Long expected";
                        }
                        if (message.binaryValue != null && message.hasOwnProperty("binaryValue")) {
                            if (properties.value === 1)
                                return "value: multiple values";
                            properties.value = 1;
                            if (!(message.binaryValue && typeof message.binaryValue.length === "number" || $util.isString(message.binaryValue)))
                                return "binaryValue: buffer expected";
                        }
                        if (message.stringValue != null && message.hasOwnProperty("stringValue")) {
                            if (properties.value === 1)
                                return "value: multiple values";
                            properties.value = 1;
                            if (!$util.isString(message.stringValue))
                                return "stringValue: string expected";
                        }
                        if (message.booleanValue != null && message.hasOwnProperty("booleanValue")) {
                            if (properties.value === 1)
                                return "value: multiple values";
                            properties.value = 1;
                            if (typeof message.booleanValue !== "boolean")
                                return "booleanValue: boolean expected";
                        }
                        if (message.list != null && message.hasOwnProperty("list")) {
                            if (properties.value === 1)
                                return "value: multiple values";
                            properties.value = 1;
                            {
                                let error = $root.proto.Response.Exchange.Transaction.Argument.List.verify(message.list);
                                if (error)
                                    return "list." + error;
                            }
                        }
                        return null;
                    };

                    /**
                     * Creates an Argument message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof proto.Response.Exchange.Transaction.Argument
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {proto.Response.Exchange.Transaction.Argument} Argument
                     */
                    Argument.fromObject = function fromObject(object) {
                        if (object instanceof $root.proto.Response.Exchange.Transaction.Argument)
                            return object;
                        let message = new $root.proto.Response.Exchange.Transaction.Argument();
                        if (object.integerValue != null)
                            if ($util.Long)
                                (message.integerValue = $util.Long.fromValue(object.integerValue)).unsigned = false;
                            else if (typeof object.integerValue === "string")
                                message.integerValue = parseInt(object.integerValue, 10);
                            else if (typeof object.integerValue === "number")
                                message.integerValue = object.integerValue;
                            else if (typeof object.integerValue === "object")
                                message.integerValue = new $util.LongBits(object.integerValue.low >>> 0, object.integerValue.high >>> 0).toNumber();
                        if (object.binaryValue != null)
                            if (typeof object.binaryValue === "string")
                                $util.base64.decode(object.binaryValue, message.binaryValue = $util.newBuffer($util.base64.length(object.binaryValue)), 0);
                            else if (object.binaryValue.length)
                                message.binaryValue = object.binaryValue;
                        if (object.stringValue != null)
                            message.stringValue = String(object.stringValue);
                        if (object.booleanValue != null)
                            message.booleanValue = Boolean(object.booleanValue);
                        if (object.list != null) {
                            if (typeof object.list !== "object")
                                throw TypeError(".proto.Response.Exchange.Transaction.Argument.list: object expected");
                            message.list = $root.proto.Response.Exchange.Transaction.Argument.List.fromObject(object.list);
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from an Argument message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof proto.Response.Exchange.Transaction.Argument
                     * @static
                     * @param {proto.Response.Exchange.Transaction.Argument} message Argument
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    Argument.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (message.integerValue != null && message.hasOwnProperty("integerValue")) {
                            if (typeof message.integerValue === "number")
                                object.integerValue = options.longs === String ? String(message.integerValue) : message.integerValue;
                            else
                                object.integerValue = options.longs === String ? $util.Long.prototype.toString.call(message.integerValue) : options.longs === Number ? new $util.LongBits(message.integerValue.low >>> 0, message.integerValue.high >>> 0).toNumber() : message.integerValue;
                            if (options.oneofs)
                                object.value = "integerValue";
                        }
                        if (message.binaryValue != null && message.hasOwnProperty("binaryValue")) {
                            object.binaryValue = options.bytes === String ? $util.base64.encode(message.binaryValue, 0, message.binaryValue.length) : options.bytes === Array ? Array.prototype.slice.call(message.binaryValue) : message.binaryValue;
                            if (options.oneofs)
                                object.value = "binaryValue";
                        }
                        if (message.stringValue != null && message.hasOwnProperty("stringValue")) {
                            object.stringValue = message.stringValue;
                            if (options.oneofs)
                                object.value = "stringValue";
                        }
                        if (message.booleanValue != null && message.hasOwnProperty("booleanValue")) {
                            object.booleanValue = message.booleanValue;
                            if (options.oneofs)
                                object.value = "booleanValue";
                        }
                        if (message.list != null && message.hasOwnProperty("list")) {
                            object.list = $root.proto.Response.Exchange.Transaction.Argument.List.toObject(message.list, options);
                            if (options.oneofs)
                                object.value = "list";
                        }
                        return object;
                    };

                    /**
                     * Converts this Argument to JSON.
                     * @function toJSON
                     * @memberof proto.Response.Exchange.Transaction.Argument
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    Argument.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    Argument.List = (function() {

                        /**
                         * Properties of a List.
                         * @memberof proto.Response.Exchange.Transaction.Argument
                         * @interface IList
                         * @property {Array.<proto.Response.Exchange.Transaction.Argument>|null} [items] List items
                         */

                        /**
                         * Constructs a new List.
                         * @memberof proto.Response.Exchange.Transaction.Argument
                         * @classdesc Represents a List.
                         * @implements IList
                         * @constructor
                         * @param {proto.Response.Exchange.Transaction.Argument.IList=} [properties] Properties to set
                         */
                        function List(properties) {
                            this.items = [];
                            if (properties)
                                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                    if (properties[keys[i]] != null)
                                        this[keys[i]] = properties[keys[i]];
                        }

                        /**
                         * List items.
                         * @member {Array.<proto.Response.Exchange.Transaction.Argument>} items
                         * @memberof proto.Response.Exchange.Transaction.Argument.List
                         * @instance
                         */
                        List.prototype.items = $util.emptyArray;

                        /**
                         * Creates a new List instance using the specified properties.
                         * @function create
                         * @memberof proto.Response.Exchange.Transaction.Argument.List
                         * @static
                         * @param {proto.Response.Exchange.Transaction.Argument.IList=} [properties] Properties to set
                         * @returns {proto.Response.Exchange.Transaction.Argument.List} List instance
                         */
                        List.create = function create(properties) {
                            return new List(properties);
                        };

                        /**
                         * Encodes the specified List message. Does not implicitly {@link proto.Response.Exchange.Transaction.Argument.List.verify|verify} messages.
                         * @function encode
                         * @memberof proto.Response.Exchange.Transaction.Argument.List
                         * @static
                         * @param {proto.Response.Exchange.Transaction.Argument.List} message List message or plain object to encode
                         * @param {$protobuf.Writer} [writer] Writer to encode to
                         * @returns {$protobuf.Writer} Writer
                         */
                        List.encode = function encode(message, writer) {
                            if (!writer)
                                writer = $Writer.create();
                            if (message.items != null && message.items.length)
                                for (let i = 0; i < message.items.length; ++i)
                                    $root.proto.Response.Exchange.Transaction.Argument.encode(message.items[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                            return writer;
                        };

                        /**
                         * Encodes the specified List message, length delimited. Does not implicitly {@link proto.Response.Exchange.Transaction.Argument.List.verify|verify} messages.
                         * @function encodeDelimited
                         * @memberof proto.Response.Exchange.Transaction.Argument.List
                         * @static
                         * @param {proto.Response.Exchange.Transaction.Argument.List} message List message or plain object to encode
                         * @param {$protobuf.Writer} [writer] Writer to encode to
                         * @returns {$protobuf.Writer} Writer
                         */
                        List.encodeDelimited = function encodeDelimited(message, writer) {
                            return this.encode(message, writer).ldelim();
                        };

                        /**
                         * Decodes a List message from the specified reader or buffer.
                         * @function decode
                         * @memberof proto.Response.Exchange.Transaction.Argument.List
                         * @static
                         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                         * @param {number} [length] Message length if known beforehand
                         * @returns {proto.Response.Exchange.Transaction.Argument.List} List
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        List.decode = function decode(reader, length) {
                            if (!(reader instanceof $Reader))
                                reader = $Reader.create(reader);
                            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.proto.Response.Exchange.Transaction.Argument.List();
                            while (reader.pos < end) {
                                let tag = reader.uint32();
                                switch (tag >>> 3) {
                                case 1:
                                    if (!(message.items && message.items.length))
                                        message.items = [];
                                    message.items.push($root.proto.Response.Exchange.Transaction.Argument.decode(reader, reader.uint32()));
                                    break;
                                default:
                                    reader.skipType(tag & 7);
                                    break;
                                }
                            }
                            return message;
                        };

                        /**
                         * Decodes a List message from the specified reader or buffer, length delimited.
                         * @function decodeDelimited
                         * @memberof proto.Response.Exchange.Transaction.Argument.List
                         * @static
                         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                         * @returns {proto.Response.Exchange.Transaction.Argument.List} List
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        List.decodeDelimited = function decodeDelimited(reader) {
                            if (!(reader instanceof $Reader))
                                reader = new $Reader(reader);
                            return this.decode(reader, reader.uint32());
                        };

                        /**
                         * Verifies a List message.
                         * @function verify
                         * @memberof proto.Response.Exchange.Transaction.Argument.List
                         * @static
                         * @param {Object.<string,*>} message Plain object to verify
                         * @returns {string|null} `null` if valid, otherwise the reason why it is not
                         */
                        List.verify = function verify(message) {
                            if (typeof message !== "object" || message === null)
                                return "object expected";
                            if (message.items != null && message.hasOwnProperty("items")) {
                                if (!Array.isArray(message.items))
                                    return "items: array expected";
                                for (let i = 0; i < message.items.length; ++i) {
                                    let error = $root.proto.Response.Exchange.Transaction.Argument.verify(message.items[i]);
                                    if (error)
                                        return "items." + error;
                                }
                            }
                            return null;
                        };

                        /**
                         * Creates a List message from a plain object. Also converts values to their respective internal types.
                         * @function fromObject
                         * @memberof proto.Response.Exchange.Transaction.Argument.List
                         * @static
                         * @param {Object.<string,*>} object Plain object
                         * @returns {proto.Response.Exchange.Transaction.Argument.List} List
                         */
                        List.fromObject = function fromObject(object) {
                            if (object instanceof $root.proto.Response.Exchange.Transaction.Argument.List)
                                return object;
                            let message = new $root.proto.Response.Exchange.Transaction.Argument.List();
                            if (object.items) {
                                if (!Array.isArray(object.items))
                                    throw TypeError(".proto.Response.Exchange.Transaction.Argument.List.items: array expected");
                                message.items = [];
                                for (let i = 0; i < object.items.length; ++i) {
                                    if (typeof object.items[i] !== "object")
                                        throw TypeError(".proto.Response.Exchange.Transaction.Argument.List.items: object expected");
                                    message.items[i] = $root.proto.Response.Exchange.Transaction.Argument.fromObject(object.items[i]);
                                }
                            }
                            return message;
                        };

                        /**
                         * Creates a plain object from a List message. Also converts values to other types if specified.
                         * @function toObject
                         * @memberof proto.Response.Exchange.Transaction.Argument.List
                         * @static
                         * @param {proto.Response.Exchange.Transaction.Argument.List} message List
                         * @param {$protobuf.IConversionOptions} [options] Conversion options
                         * @returns {Object.<string,*>} Plain object
                         */
                        List.toObject = function toObject(message, options) {
                            if (!options)
                                options = {};
                            let object = {};
                            if (options.arrays || options.defaults)
                                object.items = [];
                            if (message.items && message.items.length) {
                                object.items = [];
                                for (let j = 0; j < message.items.length; ++j)
                                    object.items[j] = $root.proto.Response.Exchange.Transaction.Argument.toObject(message.items[j], options);
                            }
                            return object;
                        };

                        /**
                         * Converts this List to JSON.
                         * @function toJSON
                         * @memberof proto.Response.Exchange.Transaction.Argument.List
                         * @instance
                         * @returns {Object.<string,*>} JSON object
                         */
                        List.prototype.toJSON = function toJSON() {
                            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                        };

                        return List;
                    })();

                    return Argument;
                })();

                Transaction.Call = (function() {

                    /**
                     * Properties of a Call.
                     * @memberof proto.Response.Exchange.Transaction
                     * @interface ICall
                     * @property {string|null} ["function"] Call function
                     * @property {Array.<proto.Response.Exchange.Transaction.Argument>|null} ["arguments"] Call arguments
                     */

                    /**
                     * Constructs a new Call.
                     * @memberof proto.Response.Exchange.Transaction
                     * @classdesc Represents a Call.
                     * @implements ICall
                     * @constructor
                     * @param {proto.Response.Exchange.Transaction.ICall=} [properties] Properties to set
                     */
                    function Call(properties) {
                        this["arguments"] = [];
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * Call function.
                     * @member {string} function
                     * @memberof proto.Response.Exchange.Transaction.Call
                     * @instance
                     */
                    Call.prototype["function"] = "";

                    /**
                     * Call arguments.
                     * @member {Array.<proto.Response.Exchange.Transaction.Argument>} arguments
                     * @memberof proto.Response.Exchange.Transaction.Call
                     * @instance
                     */
                    Call.prototype["arguments"] = $util.emptyArray;

                    /**
                     * Creates a new Call instance using the specified properties.
                     * @function create
                     * @memberof proto.Response.Exchange.Transaction.Call
                     * @static
                     * @param {proto.Response.Exchange.Transaction.ICall=} [properties] Properties to set
                     * @returns {proto.Response.Exchange.Transaction.Call} Call instance
                     */
                    Call.create = function create(properties) {
                        return new Call(properties);
                    };

                    /**
                     * Encodes the specified Call message. Does not implicitly {@link proto.Response.Exchange.Transaction.Call.verify|verify} messages.
                     * @function encode
                     * @memberof proto.Response.Exchange.Transaction.Call
                     * @static
                     * @param {proto.Response.Exchange.Transaction.Call} message Call message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Call.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message["function"] != null && Object.hasOwnProperty.call(message, "function"))
                            writer.uint32(/* id 1, wireType 2 =*/10).string(message["function"]);
                        if (message["arguments"] != null && message["arguments"].length)
                            for (let i = 0; i < message["arguments"].length; ++i)
                                $root.proto.Response.Exchange.Transaction.Argument.encode(message["arguments"][i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                        return writer;
                    };

                    /**
                     * Encodes the specified Call message, length delimited. Does not implicitly {@link proto.Response.Exchange.Transaction.Call.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof proto.Response.Exchange.Transaction.Call
                     * @static
                     * @param {proto.Response.Exchange.Transaction.Call} message Call message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Call.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a Call message from the specified reader or buffer.
                     * @function decode
                     * @memberof proto.Response.Exchange.Transaction.Call
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {proto.Response.Exchange.Transaction.Call} Call
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Call.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.proto.Response.Exchange.Transaction.Call();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1:
                                message["function"] = reader.string();
                                break;
                            case 2:
                                if (!(message["arguments"] && message["arguments"].length))
                                    message["arguments"] = [];
                                message["arguments"].push($root.proto.Response.Exchange.Transaction.Argument.decode(reader, reader.uint32()));
                                break;
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a Call message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof proto.Response.Exchange.Transaction.Call
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {proto.Response.Exchange.Transaction.Call} Call
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Call.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a Call message.
                     * @function verify
                     * @memberof proto.Response.Exchange.Transaction.Call
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    Call.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message["function"] != null && message.hasOwnProperty("function"))
                            if (!$util.isString(message["function"]))
                                return "function: string expected";
                        if (message["arguments"] != null && message.hasOwnProperty("arguments")) {
                            if (!Array.isArray(message["arguments"]))
                                return "arguments: array expected";
                            for (let i = 0; i < message["arguments"].length; ++i) {
                                let error = $root.proto.Response.Exchange.Transaction.Argument.verify(message["arguments"][i]);
                                if (error)
                                    return "arguments." + error;
                            }
                        }
                        return null;
                    };

                    /**
                     * Creates a Call message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof proto.Response.Exchange.Transaction.Call
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {proto.Response.Exchange.Transaction.Call} Call
                     */
                    Call.fromObject = function fromObject(object) {
                        if (object instanceof $root.proto.Response.Exchange.Transaction.Call)
                            return object;
                        let message = new $root.proto.Response.Exchange.Transaction.Call();
                        if (object["function"] != null)
                            message["function"] = String(object["function"]);
                        if (object["arguments"]) {
                            if (!Array.isArray(object["arguments"]))
                                throw TypeError(".proto.Response.Exchange.Transaction.Call.arguments: array expected");
                            message["arguments"] = [];
                            for (let i = 0; i < object["arguments"].length; ++i) {
                                if (typeof object["arguments"][i] !== "object")
                                    throw TypeError(".proto.Response.Exchange.Transaction.Call.arguments: object expected");
                                message["arguments"][i] = $root.proto.Response.Exchange.Transaction.Argument.fromObject(object["arguments"][i]);
                            }
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from a Call message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof proto.Response.Exchange.Transaction.Call
                     * @static
                     * @param {proto.Response.Exchange.Transaction.Call} message Call
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    Call.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.arrays || options.defaults)
                            object["arguments"] = [];
                        if (options.defaults)
                            object["function"] = "";
                        if (message["function"] != null && message.hasOwnProperty("function"))
                            object["function"] = message["function"];
                        if (message["arguments"] && message["arguments"].length) {
                            object["arguments"] = [];
                            for (let j = 0; j < message["arguments"].length; ++j)
                                object["arguments"][j] = $root.proto.Response.Exchange.Transaction.Argument.toObject(message["arguments"][j], options);
                        }
                        return object;
                    };

                    /**
                     * Converts this Call to JSON.
                     * @function toJSON
                     * @memberof proto.Response.Exchange.Transaction.Call
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    Call.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    return Call;
                })();

                return Transaction;
            })();

            Exchange.Data = (function() {

                /**
                 * Properties of a Data.
                 * @memberof proto.Response.Exchange
                 * @interface IData
                 * @property {Long|null} [amount] Data amount
                 * @property {Long|null} [worstAmount] Data worstAmount
                 * @property {number|null} [priceImpact] Data priceImpact
                 * @property {Array.<proto.Response.Exchange.Route>|null} [routes] Data routes
                 * @property {proto.Response.Exchange.Transaction|null} [transaction] Data transaction
                 */

                /**
                 * Constructs a new Data.
                 * @memberof proto.Response.Exchange
                 * @classdesc Represents a Data.
                 * @implements IData
                 * @constructor
                 * @param {proto.Response.Exchange.IData=} [properties] Properties to set
                 */
                function Data(properties) {
                    this.routes = [];
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Data amount.
                 * @member {Long} amount
                 * @memberof proto.Response.Exchange.Data
                 * @instance
                 */
                Data.prototype.amount = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                /**
                 * Data worstAmount.
                 * @member {Long} worstAmount
                 * @memberof proto.Response.Exchange.Data
                 * @instance
                 */
                Data.prototype.worstAmount = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                /**
                 * Data priceImpact.
                 * @member {number} priceImpact
                 * @memberof proto.Response.Exchange.Data
                 * @instance
                 */
                Data.prototype.priceImpact = 0;

                /**
                 * Data routes.
                 * @member {Array.<proto.Response.Exchange.Route>} routes
                 * @memberof proto.Response.Exchange.Data
                 * @instance
                 */
                Data.prototype.routes = $util.emptyArray;

                /**
                 * Data transaction.
                 * @member {proto.Response.Exchange.Transaction|null|undefined} transaction
                 * @memberof proto.Response.Exchange.Data
                 * @instance
                 */
                Data.prototype.transaction = null;

                /**
                 * Creates a new Data instance using the specified properties.
                 * @function create
                 * @memberof proto.Response.Exchange.Data
                 * @static
                 * @param {proto.Response.Exchange.IData=} [properties] Properties to set
                 * @returns {proto.Response.Exchange.Data} Data instance
                 */
                Data.create = function create(properties) {
                    return new Data(properties);
                };

                /**
                 * Encodes the specified Data message. Does not implicitly {@link proto.Response.Exchange.Data.verify|verify} messages.
                 * @function encode
                 * @memberof proto.Response.Exchange.Data
                 * @static
                 * @param {proto.Response.Exchange.Data} message Data message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Data.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.amount != null && Object.hasOwnProperty.call(message, "amount"))
                        writer.uint32(/* id 1, wireType 0 =*/8).int64(message.amount);
                    if (message.worstAmount != null && Object.hasOwnProperty.call(message, "worstAmount"))
                        writer.uint32(/* id 2, wireType 0 =*/16).int64(message.worstAmount);
                    if (message.priceImpact != null && Object.hasOwnProperty.call(message, "priceImpact"))
                        writer.uint32(/* id 3, wireType 1 =*/25).double(message.priceImpact);
                    if (message.routes != null && message.routes.length)
                        for (let i = 0; i < message.routes.length; ++i)
                            $root.proto.Response.Exchange.Route.encode(message.routes[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                    if (message.transaction != null && Object.hasOwnProperty.call(message, "transaction"))
                        $root.proto.Response.Exchange.Transaction.encode(message.transaction, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified Data message, length delimited. Does not implicitly {@link proto.Response.Exchange.Data.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof proto.Response.Exchange.Data
                 * @static
                 * @param {proto.Response.Exchange.Data} message Data message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Data.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a Data message from the specified reader or buffer.
                 * @function decode
                 * @memberof proto.Response.Exchange.Data
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {proto.Response.Exchange.Data} Data
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Data.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.proto.Response.Exchange.Data();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.amount = reader.int64();
                            break;
                        case 2:
                            message.worstAmount = reader.int64();
                            break;
                        case 3:
                            message.priceImpact = reader.double();
                            break;
                        case 4:
                            if (!(message.routes && message.routes.length))
                                message.routes = [];
                            message.routes.push($root.proto.Response.Exchange.Route.decode(reader, reader.uint32()));
                            break;
                        case 5:
                            message.transaction = $root.proto.Response.Exchange.Transaction.decode(reader, reader.uint32());
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a Data message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof proto.Response.Exchange.Data
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {proto.Response.Exchange.Data} Data
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Data.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a Data message.
                 * @function verify
                 * @memberof proto.Response.Exchange.Data
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Data.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.amount != null && message.hasOwnProperty("amount"))
                        if (!$util.isInteger(message.amount) && !(message.amount && $util.isInteger(message.amount.low) && $util.isInteger(message.amount.high)))
                            return "amount: integer|Long expected";
                    if (message.worstAmount != null && message.hasOwnProperty("worstAmount"))
                        if (!$util.isInteger(message.worstAmount) && !(message.worstAmount && $util.isInteger(message.worstAmount.low) && $util.isInteger(message.worstAmount.high)))
                            return "worstAmount: integer|Long expected";
                    if (message.priceImpact != null && message.hasOwnProperty("priceImpact"))
                        if (typeof message.priceImpact !== "number")
                            return "priceImpact: number expected";
                    if (message.routes != null && message.hasOwnProperty("routes")) {
                        if (!Array.isArray(message.routes))
                            return "routes: array expected";
                        for (let i = 0; i < message.routes.length; ++i) {
                            let error = $root.proto.Response.Exchange.Route.verify(message.routes[i]);
                            if (error)
                                return "routes." + error;
                        }
                    }
                    if (message.transaction != null && message.hasOwnProperty("transaction")) {
                        let error = $root.proto.Response.Exchange.Transaction.verify(message.transaction);
                        if (error)
                            return "transaction." + error;
                    }
                    return null;
                };

                /**
                 * Creates a Data message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof proto.Response.Exchange.Data
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {proto.Response.Exchange.Data} Data
                 */
                Data.fromObject = function fromObject(object) {
                    if (object instanceof $root.proto.Response.Exchange.Data)
                        return object;
                    let message = new $root.proto.Response.Exchange.Data();
                    if (object.amount != null)
                        if ($util.Long)
                            (message.amount = $util.Long.fromValue(object.amount)).unsigned = false;
                        else if (typeof object.amount === "string")
                            message.amount = parseInt(object.amount, 10);
                        else if (typeof object.amount === "number")
                            message.amount = object.amount;
                        else if (typeof object.amount === "object")
                            message.amount = new $util.LongBits(object.amount.low >>> 0, object.amount.high >>> 0).toNumber();
                    if (object.worstAmount != null)
                        if ($util.Long)
                            (message.worstAmount = $util.Long.fromValue(object.worstAmount)).unsigned = false;
                        else if (typeof object.worstAmount === "string")
                            message.worstAmount = parseInt(object.worstAmount, 10);
                        else if (typeof object.worstAmount === "number")
                            message.worstAmount = object.worstAmount;
                        else if (typeof object.worstAmount === "object")
                            message.worstAmount = new $util.LongBits(object.worstAmount.low >>> 0, object.worstAmount.high >>> 0).toNumber();
                    if (object.priceImpact != null)
                        message.priceImpact = Number(object.priceImpact);
                    if (object.routes) {
                        if (!Array.isArray(object.routes))
                            throw TypeError(".proto.Response.Exchange.Data.routes: array expected");
                        message.routes = [];
                        for (let i = 0; i < object.routes.length; ++i) {
                            if (typeof object.routes[i] !== "object")
                                throw TypeError(".proto.Response.Exchange.Data.routes: object expected");
                            message.routes[i] = $root.proto.Response.Exchange.Route.fromObject(object.routes[i]);
                        }
                    }
                    if (object.transaction != null) {
                        if (typeof object.transaction !== "object")
                            throw TypeError(".proto.Response.Exchange.Data.transaction: object expected");
                        message.transaction = $root.proto.Response.Exchange.Transaction.fromObject(object.transaction);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a Data message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof proto.Response.Exchange.Data
                 * @static
                 * @param {proto.Response.Exchange.Data} message Data
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Data.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.arrays || options.defaults)
                        object.routes = [];
                    if (options.defaults) {
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, false);
                            object.amount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.amount = options.longs === String ? "0" : 0;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, false);
                            object.worstAmount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.worstAmount = options.longs === String ? "0" : 0;
                        object.priceImpact = 0;
                        object.transaction = null;
                    }
                    if (message.amount != null && message.hasOwnProperty("amount"))
                        if (typeof message.amount === "number")
                            object.amount = options.longs === String ? String(message.amount) : message.amount;
                        else
                            object.amount = options.longs === String ? $util.Long.prototype.toString.call(message.amount) : options.longs === Number ? new $util.LongBits(message.amount.low >>> 0, message.amount.high >>> 0).toNumber() : message.amount;
                    if (message.worstAmount != null && message.hasOwnProperty("worstAmount"))
                        if (typeof message.worstAmount === "number")
                            object.worstAmount = options.longs === String ? String(message.worstAmount) : message.worstAmount;
                        else
                            object.worstAmount = options.longs === String ? $util.Long.prototype.toString.call(message.worstAmount) : options.longs === Number ? new $util.LongBits(message.worstAmount.low >>> 0, message.worstAmount.high >>> 0).toNumber() : message.worstAmount;
                    if (message.priceImpact != null && message.hasOwnProperty("priceImpact"))
                        object.priceImpact = options.json && !isFinite(message.priceImpact) ? String(message.priceImpact) : message.priceImpact;
                    if (message.routes && message.routes.length) {
                        object.routes = [];
                        for (let j = 0; j < message.routes.length; ++j)
                            object.routes[j] = $root.proto.Response.Exchange.Route.toObject(message.routes[j], options);
                    }
                    if (message.transaction != null && message.hasOwnProperty("transaction"))
                        object.transaction = $root.proto.Response.Exchange.Transaction.toObject(message.transaction, options);
                    return object;
                };

                /**
                 * Converts this Data to JSON.
                 * @function toJSON
                 * @memberof proto.Response.Exchange.Data
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Data.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return Data;
            })();

            return Exchange;
        })();

        return Response;
    })();

    return proto;
})();

export { $root as default };
