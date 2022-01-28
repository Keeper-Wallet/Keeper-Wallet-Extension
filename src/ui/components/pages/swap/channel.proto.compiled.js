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

        Response.Exchange = (function() {

            /**
             * Properties of an Exchange.
             * @memberof proto.Response
             * @interface IExchange
             * @property {proto.Response.Exchange.Result|null} [result] Exchange result
             * @property {Array.<string>|null} [errors] Exchange errors
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
                this.errors = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Exchange result.
             * @member {proto.Response.Exchange.Result|null|undefined} result
             * @memberof proto.Response.Exchange
             * @instance
             */
            Exchange.prototype.result = null;

            /**
             * Exchange errors.
             * @member {Array.<string>} errors
             * @memberof proto.Response.Exchange
             * @instance
             */
            Exchange.prototype.errors = $util.emptyArray;

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
                if (message.result != null && Object.hasOwnProperty.call(message, "result"))
                    $root.proto.Response.Exchange.Result.encode(message.result, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                if (message.errors != null && message.errors.length)
                    for (let i = 0; i < message.errors.length; ++i)
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.errors[i]);
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
                        message.result = $root.proto.Response.Exchange.Result.decode(reader, reader.uint32());
                        break;
                    case 2:
                        if (!(message.errors && message.errors.length))
                            message.errors = [];
                        message.errors.push(reader.string());
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
                if (message.result != null && message.hasOwnProperty("result")) {
                    let error = $root.proto.Response.Exchange.Result.verify(message.result);
                    if (error)
                        return "result." + error;
                }
                if (message.errors != null && message.hasOwnProperty("errors")) {
                    if (!Array.isArray(message.errors))
                        return "errors: array expected";
                    for (let i = 0; i < message.errors.length; ++i)
                        if (!$util.isString(message.errors[i]))
                            return "errors: string[] expected";
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
                if (object.result != null) {
                    if (typeof object.result !== "object")
                        throw TypeError(".proto.Response.Exchange.result: object expected");
                    message.result = $root.proto.Response.Exchange.Result.fromObject(object.result);
                }
                if (object.errors) {
                    if (!Array.isArray(object.errors))
                        throw TypeError(".proto.Response.Exchange.errors: array expected");
                    message.errors = [];
                    for (let i = 0; i < object.errors.length; ++i)
                        message.errors[i] = String(object.errors[i]);
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
                if (options.arrays || options.defaults)
                    object.errors = [];
                if (options.defaults)
                    object.result = null;
                if (message.result != null && message.hasOwnProperty("result"))
                    object.result = $root.proto.Response.Exchange.Result.toObject(message.result, options);
                if (message.errors && message.errors.length) {
                    object.errors = [];
                    for (let j = 0; j < message.errors.length; ++j)
                        object.errors[j] = message.errors[j];
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
                 * @property {string|null} [key] Pool key
                 * @property {string|null} [address] Pool address
                 * @property {number|null} [version] Pool version
                 * @property {string|null} [source] Pool source
                 * @property {string|null} [target] Pool target
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
                 * Pool key.
                 * @member {string} key
                 * @memberof proto.Response.Exchange.Pool
                 * @instance
                 */
                Pool.prototype.key = "";

                /**
                 * Pool address.
                 * @member {string} address
                 * @memberof proto.Response.Exchange.Pool
                 * @instance
                 */
                Pool.prototype.address = "";

                /**
                 * Pool version.
                 * @member {number} version
                 * @memberof proto.Response.Exchange.Pool
                 * @instance
                 */
                Pool.prototype.version = 0;

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
                    if (message.key != null && Object.hasOwnProperty.call(message, "key"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.key);
                    if (message.address != null && Object.hasOwnProperty.call(message, "address"))
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.address);
                    if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                        writer.uint32(/* id 3, wireType 0 =*/24).int32(message.version);
                    if (message.source != null && Object.hasOwnProperty.call(message, "source"))
                        writer.uint32(/* id 4, wireType 2 =*/34).string(message.source);
                    if (message.target != null && Object.hasOwnProperty.call(message, "target"))
                        writer.uint32(/* id 5, wireType 2 =*/42).string(message.target);
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
                            message.key = reader.string();
                            break;
                        case 2:
                            message.address = reader.string();
                            break;
                        case 3:
                            message.version = reader.int32();
                            break;
                        case 4:
                            message.source = reader.string();
                            break;
                        case 5:
                            message.target = reader.string();
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
                    if (message.key != null && message.hasOwnProperty("key"))
                        if (!$util.isString(message.key))
                            return "key: string expected";
                    if (message.address != null && message.hasOwnProperty("address"))
                        if (!$util.isString(message.address))
                            return "address: string expected";
                    if (message.version != null && message.hasOwnProperty("version"))
                        if (!$util.isInteger(message.version))
                            return "version: integer expected";
                    if (message.source != null && message.hasOwnProperty("source"))
                        if (!$util.isString(message.source))
                            return "source: string expected";
                    if (message.target != null && message.hasOwnProperty("target"))
                        if (!$util.isString(message.target))
                            return "target: string expected";
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
                    if (object.key != null)
                        message.key = String(object.key);
                    if (object.address != null)
                        message.address = String(object.address);
                    if (object.version != null)
                        message.version = object.version | 0;
                    if (object.source != null)
                        message.source = String(object.source);
                    if (object.target != null)
                        message.target = String(object.target);
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
                        object.key = "";
                        object.address = "";
                        object.version = 0;
                        object.source = "";
                        object.target = "";
                    }
                    if (message.key != null && message.hasOwnProperty("key"))
                        object.key = message.key;
                    if (message.address != null && message.hasOwnProperty("address"))
                        object.address = message.address;
                    if (message.version != null && message.hasOwnProperty("version"))
                        object.version = message.version;
                    if (message.source != null && message.hasOwnProperty("source"))
                        object.source = message.source;
                    if (message.target != null && message.hasOwnProperty("target"))
                        object.target = message.target;
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

            Exchange.Result = (function() {

                /**
                 * Properties of a Result.
                 * @memberof proto.Response.Exchange
                 * @interface IResult
                 * @property {Long|null} [amount] Result amount
                 * @property {Long|null} [worstAmount] Result worstAmount
                 * @property {number|null} [priceImpact] Result priceImpact
                 * @property {Array.<proto.Response.Exchange.Pool>|null} [route] Result route
                 */

                /**
                 * Constructs a new Result.
                 * @memberof proto.Response.Exchange
                 * @classdesc Represents a Result.
                 * @implements IResult
                 * @constructor
                 * @param {proto.Response.Exchange.IResult=} [properties] Properties to set
                 */
                function Result(properties) {
                    this.route = [];
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Result amount.
                 * @member {Long} amount
                 * @memberof proto.Response.Exchange.Result
                 * @instance
                 */
                Result.prototype.amount = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                /**
                 * Result worstAmount.
                 * @member {Long} worstAmount
                 * @memberof proto.Response.Exchange.Result
                 * @instance
                 */
                Result.prototype.worstAmount = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                /**
                 * Result priceImpact.
                 * @member {number} priceImpact
                 * @memberof proto.Response.Exchange.Result
                 * @instance
                 */
                Result.prototype.priceImpact = 0;

                /**
                 * Result route.
                 * @member {Array.<proto.Response.Exchange.Pool>} route
                 * @memberof proto.Response.Exchange.Result
                 * @instance
                 */
                Result.prototype.route = $util.emptyArray;

                /**
                 * Creates a new Result instance using the specified properties.
                 * @function create
                 * @memberof proto.Response.Exchange.Result
                 * @static
                 * @param {proto.Response.Exchange.IResult=} [properties] Properties to set
                 * @returns {proto.Response.Exchange.Result} Result instance
                 */
                Result.create = function create(properties) {
                    return new Result(properties);
                };

                /**
                 * Encodes the specified Result message. Does not implicitly {@link proto.Response.Exchange.Result.verify|verify} messages.
                 * @function encode
                 * @memberof proto.Response.Exchange.Result
                 * @static
                 * @param {proto.Response.Exchange.Result} message Result message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Result.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.amount != null && Object.hasOwnProperty.call(message, "amount"))
                        writer.uint32(/* id 1, wireType 0 =*/8).int64(message.amount);
                    if (message.worstAmount != null && Object.hasOwnProperty.call(message, "worstAmount"))
                        writer.uint32(/* id 2, wireType 0 =*/16).int64(message.worstAmount);
                    if (message.priceImpact != null && Object.hasOwnProperty.call(message, "priceImpact"))
                        writer.uint32(/* id 3, wireType 5 =*/29).float(message.priceImpact);
                    if (message.route != null && message.route.length)
                        for (let i = 0; i < message.route.length; ++i)
                            $root.proto.Response.Exchange.Pool.encode(message.route[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified Result message, length delimited. Does not implicitly {@link proto.Response.Exchange.Result.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof proto.Response.Exchange.Result
                 * @static
                 * @param {proto.Response.Exchange.Result} message Result message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Result.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a Result message from the specified reader or buffer.
                 * @function decode
                 * @memberof proto.Response.Exchange.Result
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {proto.Response.Exchange.Result} Result
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Result.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.proto.Response.Exchange.Result();
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
                            message.priceImpact = reader.float();
                            break;
                        case 4:
                            if (!(message.route && message.route.length))
                                message.route = [];
                            message.route.push($root.proto.Response.Exchange.Pool.decode(reader, reader.uint32()));
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a Result message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof proto.Response.Exchange.Result
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {proto.Response.Exchange.Result} Result
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Result.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a Result message.
                 * @function verify
                 * @memberof proto.Response.Exchange.Result
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Result.verify = function verify(message) {
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
                    if (message.route != null && message.hasOwnProperty("route")) {
                        if (!Array.isArray(message.route))
                            return "route: array expected";
                        for (let i = 0; i < message.route.length; ++i) {
                            let error = $root.proto.Response.Exchange.Pool.verify(message.route[i]);
                            if (error)
                                return "route." + error;
                        }
                    }
                    return null;
                };

                /**
                 * Creates a Result message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof proto.Response.Exchange.Result
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {proto.Response.Exchange.Result} Result
                 */
                Result.fromObject = function fromObject(object) {
                    if (object instanceof $root.proto.Response.Exchange.Result)
                        return object;
                    let message = new $root.proto.Response.Exchange.Result();
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
                    if (object.route) {
                        if (!Array.isArray(object.route))
                            throw TypeError(".proto.Response.Exchange.Result.route: array expected");
                        message.route = [];
                        for (let i = 0; i < object.route.length; ++i) {
                            if (typeof object.route[i] !== "object")
                                throw TypeError(".proto.Response.Exchange.Result.route: object expected");
                            message.route[i] = $root.proto.Response.Exchange.Pool.fromObject(object.route[i]);
                        }
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a Result message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof proto.Response.Exchange.Result
                 * @static
                 * @param {proto.Response.Exchange.Result} message Result
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Result.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.arrays || options.defaults)
                        object.route = [];
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
                    if (message.route && message.route.length) {
                        object.route = [];
                        for (let j = 0; j < message.route.length; ++j)
                            object.route[j] = $root.proto.Response.Exchange.Pool.toObject(message.route[j], options);
                    }
                    return object;
                };

                /**
                 * Converts this Result to JSON.
                 * @function toJSON
                 * @memberof proto.Response.Exchange.Result
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Result.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return Result;
            })();

            return Exchange;
        })();

        return Response;
    })();

    return proto;
})();

export { $root as default };
