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

        /** Properties of an Exchange. */
        interface IExchange {

            /** Exchange result */
            result?: (proto.Response.Exchange.Result|null);

            /** Exchange errors */
            errors?: (string[]|null);
        }

        /** Represents an Exchange. */
        class Exchange implements IExchange {

            /**
             * Constructs a new Exchange.
             * @param [properties] Properties to set
             */
            constructor(properties?: proto.Response.IExchange);

            /** Exchange result. */
            public result?: (proto.Response.Exchange.Result|null);

            /** Exchange errors. */
            public errors: string[];

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

                /** Pool key */
                key?: (string|null);

                /** Pool address */
                address?: (string|null);

                /** Pool version */
                version?: (number|null);

                /** Pool source */
                source?: (string|null);

                /** Pool target */
                target?: (string|null);
            }

            /** Represents a Pool. */
            class Pool implements IPool {

                /**
                 * Constructs a new Pool.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: proto.Response.Exchange.IPool);

                /** Pool key. */
                public key: string;

                /** Pool address. */
                public address: string;

                /** Pool version. */
                public version: number;

                /** Pool source. */
                public source: string;

                /** Pool target. */
                public target: string;

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

            /** Properties of a Result. */
            interface IResult {

                /** Result amount */
                amount?: (Long|null);

                /** Result priceImpact */
                priceImpact?: (number|null);

                /** Result priceSaved */
                priceSaved?: (number|null);

                /** Result route */
                route?: (proto.Response.Exchange.Pool[]|null);
            }

            /** Represents a Result. */
            class Result implements IResult {

                /**
                 * Constructs a new Result.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: proto.Response.Exchange.IResult);

                /** Result amount. */
                public amount: Long;

                /** Result priceImpact. */
                public priceImpact: number;

                /** Result priceSaved. */
                public priceSaved: number;

                /** Result route. */
                public route: proto.Response.Exchange.Pool[];

                /**
                 * Creates a new Result instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Result instance
                 */
                public static create(properties?: proto.Response.Exchange.IResult): proto.Response.Exchange.Result;

                /**
                 * Encodes the specified Result message. Does not implicitly {@link proto.Response.Exchange.Result.verify|verify} messages.
                 * @param message Result message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: proto.Response.Exchange.Result, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Result message, length delimited. Does not implicitly {@link proto.Response.Exchange.Result.verify|verify} messages.
                 * @param message Result message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: proto.Response.Exchange.Result, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Result message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Result
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.Response.Exchange.Result;

                /**
                 * Decodes a Result message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Result
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.Response.Exchange.Result;

                /**
                 * Verifies a Result message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Result message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Result
                 */
                public static fromObject(object: { [k: string]: any }): proto.Response.Exchange.Result;

                /**
                 * Creates a plain object from a Result message. Also converts values to other types if specified.
                 * @param message Result
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: proto.Response.Exchange.Result, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Result to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }
        }
    }
}
