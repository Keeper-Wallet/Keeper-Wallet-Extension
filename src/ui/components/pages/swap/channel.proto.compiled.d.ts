import * as $protobuf from "protobufjs";
/** Namespace proto. */
export namespace proto {

    /** Properties of a Request. */
    interface IRequest {

        /** Request exchange */
        exchange?: (proto.Request.Exchange|null);
    }

    /** Represents a Request. */
    class Request implements IRequest {

        /**
         * Constructs a new Request.
         * @param [properties] Properties to set
         */
        constructor(properties?: proto.IRequest);

        /** Request exchange. */
        public exchange?: (proto.Request.Exchange|null);

        /** Request payload. */
        public payload?: "exchange";

        /**
         * Creates a new Request instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Request instance
         */
        public static create(properties?: proto.IRequest): proto.Request;

        /**
         * Encodes the specified Request message. Does not implicitly {@link proto.Request.verify|verify} messages.
         * @param message Request message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: proto.Request, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Request message, length delimited. Does not implicitly {@link proto.Request.verify|verify} messages.
         * @param message Request message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: proto.Request, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Request message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Request
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.Request;

        /**
         * Decodes a Request message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Request
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.Request;

        /**
         * Verifies a Request message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Request message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Request
         */
        public static fromObject(object: { [k: string]: any }): proto.Request;

        /**
         * Creates a plain object from a Request message. Also converts values to other types if specified.
         * @param message Request
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: proto.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Request to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    namespace Request {

        /** Properties of an Exchange. */
        interface IExchange {

            /** Exchange id */
            id?: (string|null);

            /** Exchange source */
            source?: (string|null);

            /** Exchange target */
            target?: (string|null);

            /** Exchange amount */
            amount?: (Long|null);

            /** Exchange slippageTolerance */
            slippageTolerance?: (number|null);
        }

        /** Represents an Exchange. */
        class Exchange implements IExchange {

            /**
             * Constructs a new Exchange.
             * @param [properties] Properties to set
             */
            constructor(properties?: proto.Request.IExchange);

            /** Exchange id. */
            public id: string;

            /** Exchange source. */
            public source: string;

            /** Exchange target. */
            public target: string;

            /** Exchange amount. */
            public amount: Long;

            /** Exchange slippageTolerance. */
            public slippageTolerance: number;

            /**
             * Creates a new Exchange instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Exchange instance
             */
            public static create(properties?: proto.Request.IExchange): proto.Request.Exchange;

            /**
             * Encodes the specified Exchange message. Does not implicitly {@link proto.Request.Exchange.verify|verify} messages.
             * @param message Exchange message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: proto.Request.Exchange, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Exchange message, length delimited. Does not implicitly {@link proto.Request.Exchange.verify|verify} messages.
             * @param message Exchange message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: proto.Request.Exchange, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Exchange message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Exchange
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.Request.Exchange;

            /**
             * Decodes an Exchange message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Exchange
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.Request.Exchange;

            /**
             * Verifies an Exchange message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Exchange message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Exchange
             */
            public static fromObject(object: { [k: string]: any }): proto.Request.Exchange;

            /**
             * Creates a plain object from an Exchange message. Also converts values to other types if specified.
             * @param message Exchange
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: proto.Request.Exchange, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Exchange to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }

    /** Properties of a Response. */
    interface IResponse {

        /** Response id */
        id?: (string|null);

        /** Response exchange */
        exchange?: (proto.Response.Exchange|null);
    }

    /** Represents a Response. */
    class Response implements IResponse {

        /**
         * Constructs a new Response.
         * @param [properties] Properties to set
         */
        constructor(properties?: proto.IResponse);

        /** Response id. */
        public id: string;

        /** Response exchange. */
        public exchange?: (proto.Response.Exchange|null);

        /** Response payload. */
        public payload?: "exchange";

        /**
         * Creates a new Response instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Response instance
         */
        public static create(properties?: proto.IResponse): proto.Response;

        /**
         * Encodes the specified Response message. Does not implicitly {@link proto.Response.verify|verify} messages.
         * @param message Response message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: proto.Response, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Response message, length delimited. Does not implicitly {@link proto.Response.verify|verify} messages.
         * @param message Response message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: proto.Response, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Response message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Response
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.Response;

        /**
         * Decodes a Response message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Response
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.Response;

        /**
         * Verifies a Response message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Response message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Response
         */
        public static fromObject(object: { [k: string]: any }): proto.Response;

        /**
         * Creates a plain object from a Response message. Also converts values to other types if specified.
         * @param message Response
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: proto.Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Response to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    namespace Response {

        /** Properties of an Error. */
        interface IError {

            /** Error code */
            code?: (proto.Response.Error.CODES|null);

            /** Error message */
            message?: (string|null);
        }

        /** Represents an Error. */
        class Error implements IError {

            /**
             * Constructs a new Error.
             * @param [properties] Properties to set
             */
            constructor(properties?: proto.Response.IError);

            /** Error code. */
            public code: proto.Response.Error.CODES;

            /** Error message. */
            public message: string;

            /**
             * Creates a new Error instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Error instance
             */
            public static create(properties?: proto.Response.IError): proto.Response.Error;

            /**
             * Encodes the specified Error message. Does not implicitly {@link proto.Response.Error.verify|verify} messages.
             * @param message Error message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: proto.Response.Error, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Error message, length delimited. Does not implicitly {@link proto.Response.Error.verify|verify} messages.
             * @param message Error message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: proto.Response.Error, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Error message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Error
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.Response.Error;

            /**
             * Decodes an Error message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Error
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.Response.Error;

            /**
             * Verifies an Error message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Error message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Error
             */
            public static fromObject(object: { [k: string]: any }): proto.Response.Error;

            /**
             * Creates a plain object from an Error message. Also converts values to other types if specified.
             * @param message Error
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: proto.Response.Error, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Error to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        namespace Error {

            /** CODES enum. */
            enum CODES {
                UNAVAILABLE = 0,
                UNEXPECTED = 1,
                INVALID_ASSET_PAIR = 2
            }
        }

        /** Properties of an Exchange. */
        interface IExchange {

            /** Exchange vendor */
            vendor?: (string|null);

            /** Exchange data */
            data?: (proto.Response.Exchange.Data|null);

            /** Exchange error */
            error?: (proto.Response.Error|null);
        }

        /** Represents an Exchange. */
        class Exchange implements IExchange {

            /**
             * Constructs a new Exchange.
             * @param [properties] Properties to set
             */
            constructor(properties?: proto.Response.IExchange);

            /** Exchange vendor. */
            public vendor: string;

            /** Exchange data. */
            public data?: (proto.Response.Exchange.Data|null);

            /** Exchange error. */
            public error?: (proto.Response.Error|null);

            /** Exchange result. */
            public result?: ("data"|"error");

            /**
             * Creates a new Exchange instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Exchange instance
             */
            public static create(properties?: proto.Response.IExchange): proto.Response.Exchange;

            /**
             * Encodes the specified Exchange message. Does not implicitly {@link proto.Response.Exchange.verify|verify} messages.
             * @param message Exchange message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: proto.Response.Exchange, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Exchange message, length delimited. Does not implicitly {@link proto.Response.Exchange.verify|verify} messages.
             * @param message Exchange message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: proto.Response.Exchange, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Exchange message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Exchange
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.Response.Exchange;

            /**
             * Decodes an Exchange message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Exchange
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.Response.Exchange;

            /**
             * Verifies an Exchange message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Exchange message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Exchange
             */
            public static fromObject(object: { [k: string]: any }): proto.Response.Exchange;

            /**
             * Creates a plain object from an Exchange message. Also converts values to other types if specified.
             * @param message Exchange
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: proto.Response.Exchange, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Exchange to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        namespace Exchange {

            /** Properties of a Pool. */
            interface IPool {

                /** Pool vendor */
                vendor?: (string|null);

                /** Pool type */
                type?: (string|null);

                /** Pool address */
                address?: (string|null);

                /** Pool source */
                source?: (string|null);

                /** Pool target */
                target?: (string|null);

                /** Pool estimatedAmount */
                estimatedAmount?: (Long|null);
            }

            /** Represents a Pool. */
            class Pool implements IPool {

                /**
                 * Constructs a new Pool.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: proto.Response.Exchange.IPool);

                /** Pool vendor. */
                public vendor: string;

                /** Pool type. */
                public type: string;

                /** Pool address. */
                public address: string;

                /** Pool source. */
                public source: string;

                /** Pool target. */
                public target: string;

                /** Pool estimatedAmount. */
                public estimatedAmount: Long;

                /**
                 * Creates a new Pool instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Pool instance
                 */
                public static create(properties?: proto.Response.Exchange.IPool): proto.Response.Exchange.Pool;

                /**
                 * Encodes the specified Pool message. Does not implicitly {@link proto.Response.Exchange.Pool.verify|verify} messages.
                 * @param message Pool message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: proto.Response.Exchange.Pool, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Pool message, length delimited. Does not implicitly {@link proto.Response.Exchange.Pool.verify|verify} messages.
                 * @param message Pool message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: proto.Response.Exchange.Pool, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Pool message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Pool
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.Response.Exchange.Pool;

                /**
                 * Decodes a Pool message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Pool
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.Response.Exchange.Pool;

                /**
                 * Verifies a Pool message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Pool message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Pool
                 */
                public static fromObject(object: { [k: string]: any }): proto.Response.Exchange.Pool;

                /**
                 * Creates a plain object from a Pool message. Also converts values to other types if specified.
                 * @param message Pool
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: proto.Response.Exchange.Pool, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Pool to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a Route. */
            interface IRoute {

                /** Route pools */
                pools?: (proto.Response.Exchange.Pool[]|null);
            }

            /** Represents a Route. */
            class Route implements IRoute {

                /**
                 * Constructs a new Route.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: proto.Response.Exchange.IRoute);

                /** Route pools. */
                public pools: proto.Response.Exchange.Pool[];

                /**
                 * Creates a new Route instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Route instance
                 */
                public static create(properties?: proto.Response.Exchange.IRoute): proto.Response.Exchange.Route;

                /**
                 * Encodes the specified Route message. Does not implicitly {@link proto.Response.Exchange.Route.verify|verify} messages.
                 * @param message Route message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: proto.Response.Exchange.Route, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Route message, length delimited. Does not implicitly {@link proto.Response.Exchange.Route.verify|verify} messages.
                 * @param message Route message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: proto.Response.Exchange.Route, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Route message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Route
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.Response.Exchange.Route;

                /**
                 * Decodes a Route message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Route
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.Response.Exchange.Route;

                /**
                 * Verifies a Route message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Route message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Route
                 */
                public static fromObject(object: { [k: string]: any }): proto.Response.Exchange.Route;

                /**
                 * Creates a plain object from a Route message. Also converts values to other types if specified.
                 * @param message Route
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: proto.Response.Exchange.Route, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Route to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of an Argument. */
            interface IArgument {

                /** Argument integerValue */
                integerValue?: (Long|null);

                /** Argument binaryValue */
                binaryValue?: (Uint8Array|null);

                /** Argument stringValue */
                stringValue?: (string|null);

                /** Argument booleanValue */
                booleanValue?: (boolean|null);

                /** Argument list */
                list?: (proto.Response.Exchange.Argument.List|null);
            }

            /** Represents an Argument. */
            class Argument implements IArgument {

                /**
                 * Constructs a new Argument.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: proto.Response.Exchange.IArgument);

                /** Argument integerValue. */
                public integerValue?: (Long|null);

                /** Argument binaryValue. */
                public binaryValue?: (Uint8Array|null);

                /** Argument stringValue. */
                public stringValue?: (string|null);

                /** Argument booleanValue. */
                public booleanValue?: (boolean|null);

                /** Argument list. */
                public list?: (proto.Response.Exchange.Argument.List|null);

                /** Argument value. */
                public value?: ("integerValue"|"binaryValue"|"stringValue"|"booleanValue"|"list");

                /**
                 * Creates a new Argument instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Argument instance
                 */
                public static create(properties?: proto.Response.Exchange.IArgument): proto.Response.Exchange.Argument;

                /**
                 * Encodes the specified Argument message. Does not implicitly {@link proto.Response.Exchange.Argument.verify|verify} messages.
                 * @param message Argument message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: proto.Response.Exchange.Argument, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Argument message, length delimited. Does not implicitly {@link proto.Response.Exchange.Argument.verify|verify} messages.
                 * @param message Argument message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: proto.Response.Exchange.Argument, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an Argument message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Argument
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.Response.Exchange.Argument;

                /**
                 * Decodes an Argument message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Argument
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.Response.Exchange.Argument;

                /**
                 * Verifies an Argument message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an Argument message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Argument
                 */
                public static fromObject(object: { [k: string]: any }): proto.Response.Exchange.Argument;

                /**
                 * Creates a plain object from an Argument message. Also converts values to other types if specified.
                 * @param message Argument
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: proto.Response.Exchange.Argument, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Argument to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            namespace Argument {

                /** Properties of a List. */
                interface IList {

                    /** List items */
                    items?: (proto.Response.Exchange.Argument[]|null);
                }

                /** Represents a List. */
                class List implements IList {

                    /**
                     * Constructs a new List.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: proto.Response.Exchange.Argument.IList);

                    /** List items. */
                    public items: proto.Response.Exchange.Argument[];

                    /**
                     * Creates a new List instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns List instance
                     */
                    public static create(properties?: proto.Response.Exchange.Argument.IList): proto.Response.Exchange.Argument.List;

                    /**
                     * Encodes the specified List message. Does not implicitly {@link proto.Response.Exchange.Argument.List.verify|verify} messages.
                     * @param message List message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: proto.Response.Exchange.Argument.List, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified List message, length delimited. Does not implicitly {@link proto.Response.Exchange.Argument.List.verify|verify} messages.
                     * @param message List message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: proto.Response.Exchange.Argument.List, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a List message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns List
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.Response.Exchange.Argument.List;

                    /**
                     * Decodes a List message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns List
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.Response.Exchange.Argument.List;

                    /**
                     * Verifies a List message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a List message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns List
                     */
                    public static fromObject(object: { [k: string]: any }): proto.Response.Exchange.Argument.List;

                    /**
                     * Creates a plain object from a List message. Also converts values to other types if specified.
                     * @param message List
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: proto.Response.Exchange.Argument.List, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this List to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };
                }
            }

            /** Properties of a Data. */
            interface IData {

                /** Data amount */
                amount?: (Long|null);

                /** Data worstAmount */
                worstAmount?: (Long|null);

                /** Data priceImpact */
                priceImpact?: (number|null);

                /** Data routes */
                routes?: (proto.Response.Exchange.Route[]|null);

                /** Data arguments */
                "arguments"?: (proto.Response.Exchange.Argument[]|null);
            }

            /** Represents a Data. */
            class Data implements IData {

                /**
                 * Constructs a new Data.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: proto.Response.Exchange.IData);

                /** Data amount. */
                public amount: Long;

                /** Data worstAmount. */
                public worstAmount: Long;

                /** Data priceImpact. */
                public priceImpact: number;

                /** Data routes. */
                public routes: proto.Response.Exchange.Route[];

                /** Data arguments. */
                public arguments: proto.Response.Exchange.Argument[];

                /**
                 * Creates a new Data instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Data instance
                 */
                public static create(properties?: proto.Response.Exchange.IData): proto.Response.Exchange.Data;

                /**
                 * Encodes the specified Data message. Does not implicitly {@link proto.Response.Exchange.Data.verify|verify} messages.
                 * @param message Data message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: proto.Response.Exchange.Data, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Data message, length delimited. Does not implicitly {@link proto.Response.Exchange.Data.verify|verify} messages.
                 * @param message Data message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: proto.Response.Exchange.Data, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Data message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Data
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.Response.Exchange.Data;

                /**
                 * Decodes a Data message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Data
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.Response.Exchange.Data;

                /**
                 * Verifies a Data message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Data message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Data
                 */
                public static fromObject(object: { [k: string]: any }): proto.Response.Exchange.Data;

                /**
                 * Creates a plain object from a Data message. Also converts values to other types if specified.
                 * @param message Data
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: proto.Response.Exchange.Data, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Data to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }
        }
    }
}
