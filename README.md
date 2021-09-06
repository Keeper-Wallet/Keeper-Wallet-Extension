# Waves Keeper v1.1.12

en | [ru](https://github.com/wavesplatform/waveskeeper/blob/master/README_ru.md)

Waves Keeper is an extension that allows users to securely interact with Waves-enabled web services from the Chrome browser.

Seed phrases and private keys are encrypted and stored within the extension and cannot be accessed by online dApps and services, making sure that users' funds are always protected from hackers and malicious websites. Completion of a transaction doesn't require entering any sensitive information.

Waves Keeper is designed for convenience, so users can sign transactions with just a couple of clicks. Users can create multiple wallets and switch between them easily. And if a user ever forgets the password to the account, it can be recovered from the seed phrase.

**Waves Keeper API**

On browser pages that operate under the http/https (not worked local pages with file:// protocol) with Waves Keeper extension installed, Waves Keeper global object becomes available, featuring the following methods:

- `auth`
- `publicState`
- `signAndPublishCancelOrder`
- `signAndPublishOrder`
- `signAndPublishTransaction`
- `signCancelOrder`
- `signOrder`
- `signTransaction`
- `signRequest`
- `signTransactionPackage`
- `signCustomData`
- `verifyCustomData`
- `notification`
- `encryptMessage`
- `decryptMessage`
- `resourceIsApproved`
- `resourceIsBlocked`
- `on`

All methods, except for "on" operate asynchronously and return [promises](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise).

In code you can use [TypeScript types](https://github.com/wavesplatform/waveskeeper-types)

On initialize window.WavesKeeper has not api methods.
You can use WavesKeeper.initialPromise for waiting end initializing api.
Example:

```
    WavesKeeper.initialPromise
        .then((keeperApi) => {
            /*...init app*/
            keeperApi.publicState().then( state => startApp(state));
        })

```

In Waves Keeper, for greater security and ease of use, each new website using API has to be allowed by the user. At the first attempt to use API (except "`on"`), the user will see a request to allow that website's access to Waves Keeper. If the user agrees to allow access, the website is considered trusted and can use API on its pages. Otherwise, the website is blocked, and an error message will be displayed in response to all requests `{message: "Api rejected by user", code: 12}.` The users won't see new notifications. To grant access, the user will mark the website as trusted in the interface.

**Description of methods**

**publicState**

If a website is trusted, Waves Keeper public data are returned.

Example:


```js
    WavesKeeper.publicState()
        .then(state => {
            console.log(state); //displaying the result in the console
            /*...processing data */
        }).catch(error => {
            console.error(error); // displaying the result in the console
            /*...processing errors */
        })


```

or

```js
    const getPublicState = async () => {
        try {
            const state = await WavesKeeper.publicState();
            console.log(state); // displaying the result in the console
            /*... processing data*/
        } catch(error) {
            console.error(error); // displaying the result in the console
            /*... processing errors */
        }
      }


      const result = await getPublicState();
```

REPLY


```js
{
    "initialized": true,
    "locked": true,
    "account": {
        "name": "foo",
        "publicKey": "bar",
        "address": "waves address",
        "networkCode": "network byte",
        "balance": {
            "available": "balance in waves",
            "leasedOut": "leased balance"
        }
    },
    "network": {
        "code": "W",
        "server": "https://nodes.wavesplatform.com/",
        "matcher": "https://matcher.wavesplatform.com/"
    },
    "messages": [],
    "txVersion": {
        "3": [ 2 ],
        "4": [ 2 ],
        "5": [ 2 ],
        ...
    }
}
```

Description of query return fields

- `initialized` - boolean keeper initialized
- `locked` - boolean keeper in wait mode
- `account` – current account, if the user allowed access to the website, or null
- `network` – current Waves network, node and matcher addresses
- `messages` – signature request statuses
- `txVersion` – available transaction versions for each type

Possible errors

- `{ message: "Init Waves Keeper and add account" }` – Waves Keeper is not initialized
- `{ message: "Add Waves Keeper account" }` – Waves Keeper accessed, but there are no accounts
- `{ message: "User denied message" }` – the user denied the website operation with Waves Keeper

### notification

Send message to keeper.
Ypu can send message only 1 time in 30 sec for trusted sites with send permission.

`notification` facilitates input of the following data

- `title` - string (20 chars max) (required field)
- `message` - string (250 chars max) (optional field)

return Promise

Example:

```js
       WavesKeeper.notification({
            title: 'Hello!',
            message: 'Congratulation!!!'
       });
```

Possible errors

- `{message: "Incorrect notification data", data: "title has more than 20 characters", code: "19"}` - Incorrect notification title
- `{message: "Incorrect notification data", data: null, code: "19"}` - Incorrect notification data
- `{message: "Can't sent notification", data: {msg: "Min notification interval 30s. Wait 28.017s."}, code: "18"}` - try send later, you can send 1 message in 30 sec
- `{message: "Api rejected by user", code: 12}` the user denied the request or the website is not trusted.

**encryptMessage**

You can encrypt string messages to account in Waves network.
You need have recipient publicKey.

WavesKeeper.encryptMessage(`*string to encrypt*`, `*public key in base58 string*`, `*prefix is secret app string need for encoding*`)

Example:

```js
       WavesKeeper.encryptMessage('My message', '416z9d8DQDy5MPTqDhvReRBaPb19gEyVRWvHcewpP6Nc', 'my app')
       .then((encryptedMessage) => {
            console.log(encryptedMessage);
       });
```

Possible errors

- `{ message: "Init Waves Keeper and add account" }` – Waves Keeper is not initialized
- `{ message: "App is locked" }` – Waves Keeper is locked
- `{ message: "Add Waves Keeper account" }` – Waves Keeper accessed, but there are no accounts
- `{ message: "User denied message" }` – the user denied the website operation with Waves Keeper

**decryptMessage**
You can decrypt string messages from account in Waves network to you.
You need have sender publicKey and encrypted message.

WavesKeeper.decryptMessage(`*string to decrypt*`, `*public key in base58 string*`, `*prefix is secret app string need for encoding*`)

Example:

```js
       WavesKeeper.decryptMessage('**encrypted msg**', '416z9d8DQDy5MPTqDhvReRBaPb19gEyVRWvHcewpP6Nc', 'my app')
       .then((message) => {
            console.log(message);
       });
```

Possible errors

- `{ message: "Init Waves Keeper and add account" }` – Waves Keeper is not initialized
- `{ message: "App is locked" }` – Waves Keeper is locked
- `{ message: "Add Waves Keeper account" }` – Waves Keeper accessed, but there are no accounts
- `{ message: "User denied message" }` – the user denied the website operation with Waves Keeper

**on**

Allows subscribing to Waves Keeper events.

Supports events:

- `update` – subscribe to updates of the state

Example:

```js   
   WavesKeeper.on("update", state => {
        //state object as from WavesKeeper.publicState
   });
```

If a website is not trusted, events won't show.

**auth**

This is a method for obtaining a signature of authorization data while verifying Waves' user. It works the same way as [Waves Auth API](https://docs.wavesprotocol.org/en/development-and-api/client-api/auth-api.html).

Example:

```js
    const authData = { data: "Auth on my site" };
    WavesKeeper.auth(authData)
        .then(auth => {
            console.log(auth); //displaying the result on the console
            /*...processing data */
        }).catch(error => {
            console.error(error); // displaying the result on the console
            /*...processing errors */
        })


```

or

```js
    const getAuthData = async authData => {
        try {
            const state = await WavesKeeper.auth(authData);
            console.log(state); // displaying the result on the console
            /*... processing data */
        } catch(error) {
            console.error(error); // displaying the result on the console
            /*... processing errors */
        }
    }


    const authData = { data: "Auth on my site" };
    getAuthData(authData);
```

`auth` facilitates input of the following data

- `name` – name of the service (optional field)
- `data` – a string line with any data (required field)
- `referrer` – a websites' full URL for redirect (optional field)
- `icon` – path to the logo relative to the `referrer`or origin of the website (optional field)
- `successPath` – relative path to the website's Auth API (optional field)

Example

```js
    const authData = { 
        data: "Generated string from server",
        name: "My test App",
        icon: "/img/icons/waves_logo.svg",
        referrer: "https://waves.exchange/",
        successPath: "login"
    };


    WavesKeeper.auth(authData).then((data) => {
        //data – data from Waves Keeper
        //verifying signature and saving the address...
        console.log(data);
    }).catch((error) => {
        //processing the error
    });




```

If the verification is successful, Waves Keeper will return in the promise an object containing data for signature verification:

- `host` – a host that requested a signature
- `name` – the name of an application that requested a signature
- `prefix` – a prefix participating in the signature
- `address` – an address in Waves network
- `publicKey` – the user's public key
- `signature` - signature
- `version` – API version

[How to verify a signature](https://docs.wavesprotocol.org/en/waves-api-and-sdk/client-api/auth-api.html#how-to-check-signature-validity)?

ERRORS

- `{message: "Invalid data", data: "[{"field":"data","type":"string","message":"field is required"}]", code: 9}` – signature data contain errors
- `{message: "User denied message", code: 10}` – the user denied the request
- `{message: "Api rejected by user", code: 12}` - the website is not trusted

**signTransaction**

A method for signing transactions in Waves' network.

Example:

```js
    const txData = {
        type: 4,
        data: {
            amount: {
               assetId: "WAVES",
               tokens: "1.567"
            },
            fee: {
                assetId: "WAVES",
                tokens: "0.001"
            },
            recipient: "test"
        }
    };
    WavesKeeper.signTransaction(txData).then((data) => {
        //data – a line ready for sending to Waves network's node (server)
    }).catch((error) => {
        //Processing errors
    });
```

API returns lines, not an object, as in javascript precision is lost in operation with 8-byte integers.

A description of supported transaction types is below.

In the example, we are signing a transaction for transferring WAVES to the alias `test`in Waves' network.

REPLY `{"version":2,"assetId":"", "amount":156700000,"feeAssetId":"",fee:100000, "recipient":"recipient","attachment":"", "timestamp":1548770230589,"senderPublicKey":"public key","proofs":["signature"],"type":4}`

ERRORS

- `{message: "User denied message", code: 10}` – The user denied the request.
- `{message: "Api rejected by user", code: 12}` – The website is not trusted.
- `{message: "Invalid data", data: "Reason", code: 9}` – invalid/incomplete request data.

**signAndPublishTransaction**

This is similar to "`signTransaction"`, but it also broadcasts a transaction to the blockchain.

Example:

```js
   const txData = {
           type: 4,
           data: {
               amount: {
                  assetId: "WAVES",
                  tokens: "1.567"
               },
               fee: {
                   assetId: "WAVES",
                   tokens: "0.001"
               },
               recipient: "test"
           }
       };
       WavesKeeper.signAndPublishTransaction(txData).then((data) => {
           //data - a line ready for sending to Waves network's node (server)
       }).catch((error) => {
           //processing errors
       });
```

REPLY A reply from Waves network returns as a line containing the entire past transaction.

ERRORS

- Same as `signTransaction`
- `{message: "Filed request", data: "Error description", code: 15}` – a request was signed but not broadcasted

**signTransactionPackage**

A package transaction signature. Sometimes several transactions need to be simultaneously signed, and for users' convenience, up to seven transactions at ones could be signed. Only certain types of transactions are permitted:

- `3 – issues a token`
- `4 – transfer a token`
- `5 – reissues a token`
- `6 – burns a token`
- `8 – leases WAVES`
- `9 – cancels the leasing`
- `10 – creating an alias for an address in Waves network`
- `11 – mass transfer`
- `12 - adds, modifies and deletes data entries in the sender's account data storage`
- `13 - assigns the dApp script or account script to the sender's account`
- `14 - configures sponsorship`
- `15 - modifies the asset script`

Example:

```js
    const name = "For Test";
    const tx = [{
        type: 4,
        data: {
            amount: {
               assetId: "WAVES",
               tokens: "1.567"
            },
            fee: {
                assetId: "WAVES",
                tokens: "0.001"
            },
            recipient: "test"
    }},{
        type: 4,
        data: {
            amount: {
               assetId: "WAVES",
               tokens: "0.51"
            },
            fee: {
                assetId: "WAVES",
                tokens: "0.001"
            },
            recipient: "merry"
        }
    }];


    WavesKeeper.signTransactionPackage(tx, name)
```

Sign two transaction:

- Transfer 1.567 WAVES to the alias test
- Transfer 0.1 WAVES to the alias merry

REPLY

A unit of two lines – transactions that are signed and ready to be broadcasted.

ERRORS Same as in "`signTransaction`"

**[Transactions](https://docs.wavesprotocol.org/en/waves-api-and-sdk/client-libraries/waves-transactions.html)**

Every user of Waves' network has a state (balances, assets, data, scripts), and every past transactions changes these data. \
In Waves Keeper API it is different from [NODE REST API](https://docs.wavesprotocol.org/en/waves-api-and-sdk/waves-node-rest-api.html).

`signTransaction`, `signAndPublishTransaction` accept transactions as follows

```js
{
    type: number //transaction type,
    data: {
        ... //transaction data
    }
}
```

Legend keys

- - optional field, data are automatically supplied from WavesKeeper. \
    [x,y] – length limit from x to y. \
    [,x] – length limit to x. \
    [y,] – length limit from y. \
    [x-y] – number from x to y. x/y - x or y. (JLM) - JAVA LONG MAX = 9 223 372 036 854 775 807 \
    MoneyLike - price

MoneyLike could look as:

- `{ tokens: 1, assetId: "WAVES" }`
- `{ coins: 100000000, assetId: "WAVES" }`;

In both messages, the same price of 1 WAVES is indicated. You can easily convert `coins`into `tokens`and back, if you know in what asset the price is indicated and you have received its precision `tokens = coins / (10 ** precision)` \
If the field contains other types than MoneyLike, for instance, string/MoneyLike , the sum is indicated as a number in  `coins`.

---

**[Type 3 ISSUE – token issue](https://docs.wavesprotocol.org/en/blockchain/transaction-type/issue-transaction.html)**

- `name` [4, 16] string – token name,
- `description` [0, 1000] string – token description,
- `quantity` [0 - (JLM)] number/string - quantity,
- `precision` [0 - 8] number - precision,
- `reissuable` true|false – reissuble,
- `*fee` MoneyLike -fee
- `*script` string – [smart asset](https://docs.wavesprotocol.org/en/smart-contracts/smart-assets.html)
- `*senderPublicKey` string – sender's public key in base58
- `*timestamp` number/string – time in ms

Example:

```js
   WavesKeeper.signAndPublishTransaction({
        type: 3,
        data: {
             "name": "Best Token",
             "description": "Greate token",
             "quantity": 1000000,
             "precision": 2,
             "reissuable": true,
             fee: {
                 "tokens": "1",
                 "assetId": "WAVES"
             }
        }
   }).then((tx) => {
        console.log("Hurray! I've created my asset!!!");
   }).catch((error) => {
        console.error("Something went wrong", error);
   });
```

In case of a success, we are issuing a new asset in the quantity of 1,000,000, and your balance will show 10,000.00 Best Token

**[Тype 4 TRANSFER – asset transfer](https://docs.wavesprotocol.org/en/blockchain/transaction-type/transfer-transaction.html)**

- `amount` MoneyLike - amount,
- `recipient` string – recipient's address or alias
- `attachment`[,140 bytes] string or byte Array – additional info in text
- `*fee` MoneyLike - fee
- `*senderPublicKey` string – sender's public key in base58
- `*timestamp` number/string – time in ms

Example:

```js
    WavesKeeper.signAndPublishTransaction({
        type: 4,
        data: {
            amount: { tokens: "3.3333333", assetId: "WAVES" },
            fee: { tokens: "0.001", assetId: "WAVES"},
            recipient: "merry"
        }
    }).then((tx) => {
         console.log("Hurray! I've been able to send WAVES!!!");
    }).catch((error) => {
         console.error("Something went wrong", error);
    });
```

**[Тype 5 REISSUE – token reissue](https://docs.wavesprotocol.org/en/blockchain/transaction-type/reissue-transaction.html)**

- `assetId` string - "asset ID",
- `quantity` [0 - (JLM)] number/string/MoneyLike - quantity,
- `reissuable` false – deny reissue
- `*fee` MoneyLike -fee
- `*senderPublicKey` string – sender's public key in base58
- `*timestamp` number/string – time in ms

Example:

```js
      WavesKeeper.signAndPublishTransaction({
           type: 5,
           data: {
                "quantity": 1000,
                "assetId": "8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS",
                "reissuable": true,
                fee: {
                    "tokens": "1",
                    "assetId": "WAVES"
                }
           }
      }).then((tx) => {
           console.log("Hurray! I've reissued my asset!!!");
      }).catch((error) => {
           console.error("Something went wrong", error);
      });
```

In case of a success, we are re-issuing a new asset in the quantity of 1,000,000, and your balance will show 10,000.00 Best Token

**[Тype 6 BURN – burning tokens](https://docs.wavesprotocol.org/en/blockchain/transaction-type/burn-transaction.html)**

- `assetId` string – asset ID,
- `amount` [0 - (JLM)] number/string/MoneyLike - quantity,
- `*fee` MoneyLike -fee
- `*senderPublicKey` string - sender's public key in base58
- `*timestamp` number/string – time in ms

Example:

```js
   WavesKeeper.signAndPublishTransaction({
        type: 6,
        data: {
             amount: 1000,
             assetId: "8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS",
             fee: {
                 "tokens": "0.001",
                 "assetId": "WAVES"
             }
        }
   }).then((tx) => {
        console.log("Hurray! I've burned unneeded tokens!!!");
   }).catch((error) => {
        console.error("Something went wrong", error);
   });
```

In case of a success, 1,000 coins `are burned`.

**[Тype 8 LEASE - Leasing](https://docs.wavesprotocol.org/en/blockchain/transaction-type/lease-transaction.html)**

- `recipient` string – recipient's address or alias,
- `amount` [0 - (JLM)] number/string/MoneyLike - quantity,
- `*fee` MoneyLike -fee
- `*senderPublicKey` string - sender's public key in base58
- `*timestamp` number/string – time in ms

Example:

```js
   WavesKeeper.signAndPublishTransaction({
        type: 8,
        data: {
             "amount": 1000,
             "recipient": "merry",
             fee: {
                 "tokens": "0.001",
                 "assetId": "WAVES"
             }
        }
   }).then((tx) => {
        console.log("Hurray! I've been able to lease tokens!!!");
   }).catch((error) => {
        console.error("Something went wrong", error);
   });
```

In case of a success, 0.00001000 WAVES is leased.

**[Тype 9 LEASE CANCEL – cancel leasing](https://docs.wavesprotocol.org/en/blockchain/transaction-type/lease-cancel-transaction.html)**

- `leaseId` string – leasing transaction ID,
- `*fee` MoneyLike -fee
- `*senderPublicKey` string - sender's public key in base58
- `*timestamp` number/string – time in ms

Example:

```js
   WavesKeeper.signAndPublishTransaction({
        type: 9,
        data: {
             leaseId: "6frvwF8uicAfyEfTfyC2sXqBJH7V5C8he5K4YH3BkNiS",
             fee: {
                 "tokens": "0.001",
                 "assetId": "WAVES"
             }
        }
   }).then((tx) => {
        console.log("Hurray! I've cancelled leasing!!!");
   }).catch((error) => {
        console.error("Something went wrong ", error);
   });
```

In case of a success, the leasing transaction is cancelled.

**[Тype 10 CREATE ALIAS – creating an alias for an address](https://docs.wavesprotocol.org/en/blockchain/transaction-type/create-alias-transaction.html)**

- `alias`[4, 30] string - alias
- `*fee` MoneyLike -fee
- `*senderPublicKey` string - sender's public key in base58
- `*timestamp` number/string – time in ms

Example:

```js
   WavesKeeper.signAndPublishTransaction({
        type: 10,
        data: {
             alias: "testAlias",
             fee: {
                 "tokens": "0.001",
                 "assetId": "WAVES"
             }
        }
   }).then((tx) => {
        console.log("Hurray! Now I have an alias!!!");
   }).catch((error) => {
        console.error("Something went wrong", error);
   });
```

In case of a success, an alias (another name) is created.

**[Тype 11 MASS TRANSFER - a mass transfer of an asset](https://docs.wavesprotocol.org/en/blockchain/transaction-type/mass-transfer-transaction.html)**

- `totalAmount` moneyLike – total to be sent // instead of calculating the amount you may insert { assetId: "ID of the asset to be sent", coins: 0},
- `transfers`  a mass of objects
  { `recipient`: string - address/alias, amount: number/string/moneyLike }
- `*fee` MoneyLike -fee
- `attachment` [,140 bytes в base58] string – additional info
- `*senderPublicKey` string - sender's public key in base58
- `*timestamp` number/string – time in ms

Example:

```js
   WavesKeeper.signAndPublishTransaction({
        type: 11,
        data: {
             totalAmount: { assetId: "WAVES", coins: 0},
             transfers: [
                { recipient: "alias1", amount: "200000" },
                { recipient: "alias2", amount: "200000" },
             ],
             fee: {
                 "tokens": "0.002",
                 "assetId": "WAVES"
             }
        }
   }).then((tx) => {
        console.log("Hurray! I've sent hi to my friends!!!");
   }).catch((error) => {
        console.error("Something went wrong", error);
   });
```

In case of a success, 0.002 WAVES will be sent to alias1 and alias2.

**[Тype 12 DATA TRANSACTION - saving data](https://docs.wavesprotocol.org/en/blockchain/transaction-type/data-transaction.html)**

- `data`  mass of objects
  - `type` "binary"/string/"integer"/"boolean" - type,
  - `key` string – field name
  - `value` /string/string/number/boolean depends on the type
- `*fee` MoneyLike - fee
- `*senderPublicKey` string - sender's public key in base58
- `*timestamp` number/string – time in ms

Field:

```js
   WavesKeeper.signAndPublishTransaction({
        type: 12,
        data: {
             data: [
                  { key: "string", value: "testVdfgdgf dfgdfgdfg dfg dfg al", type: "string" },
                  { key: "binary", value: "base64:AbCdAbCdAbCdAbCdAbCdAbCdAbCdAbCdAbCdAbCdAbCd", type: "binary" },
                  { key: "integer", value: 20, type: "integer" },
                  { key: "boolean", value: false, type: "boolean" },
             ],
             fee: {
                 "tokens": "0.01",
                 "assetId": "WAVES"
             }
        }
   }).then((tx) => {
        console.log("Hurray! I've saved data!!!");
   }).catch((error) => {
        console.error("Something went wrong", error);
   });
```

In case of a success, new data will be stored in the state.

**[Тype 13 SET SCRIPT – scrypting an account](https://docs.wavesprotocol.org/en/blockchain/transaction-type/set-script-transaction.html)**

- `script` string - [script](https://docs.wavesprotocol.org/en/technical-details/waves-contracts-language-description/creating-and-deploying-a-script-manually.html#section-5e6520b97a7ead921d7fb6bce7292ce0)
- `*fee` MoneyLike -fee
- `*senderPublicKey` string - sender's public key in base58
- `*timestamp` number/string – time in ms

For cancelling a script the field `script`has to be "". [Script development on RIDE](https://ide.wavesplatform.com/)

Example:

```js
   WavesKeeper.signAndPublishTransaction({
        type: 13,
        data: {
             script: "",
             fee: {
                 "tokens": "0.04",
                 "assetId": "WAVES"
             }
        }
   }).then((tx) => {
        console.log("Hurray! I've cancelled a script!!!");
   }).catch((error) => {
        console.error("Something went wrong", error);
   });
```

In case of a success, the script will be removed from the account.

Example 2:

```js
   WavesKeeper.signAndPublishTransaction({
        type: 13,
        data: {
             script: "base64:AQa3b8tHAQa3b8tHAQa3b8tHAQa3b8tHAQa3b8tHAQa3b8tHAQa3b8tHAQa3b8tHAQa3b8tHAQa3b8tHAQa3b8tH",
             fee: {
                 "tokens": "0.01",
                 "assetId": "WAVES"
             }
        }
   }).then((tx) => {
        console.log("Hurray! I've added a script!!!");
   }).catch((error) => {
        console.error("Something went wrong", error);
   });
```

In case of a success, a new script will be added to the account, allowing any transactions without a signature (be careful!).

**[Тype 14 Sponsored Fee Transaction - Sponsorship](https://docs.wavesprotocol.org/en/blockchain/transaction-type/fee-sponsoring-transaction.html)**

- `minSponsoredAssetFee` MoneyLike – fee price in the asset.
- `*fee` MoneyLike - fee
- `*senderPublicKey` string - sender's public key in base58
- `*timestamp` number/string – time in ms

Example:

```js
   WavesKeeper.signAndPublishTransaction({
        type: 14,
        data: {
             minSponsoredAssetFee: {
                assetId: "6frvwF8uicAfyEfTfyC2sXqBJH7V5C8he5K4YH3BkNiS",
                tokens: 0.1
             },
             fee: {
                 "tokens": "1",
                 "assetId": "WAVES"
             }
        }
   }).then((tx) => {
        console.log("Hurray! I've become a sponsor!!!");
   }).catch((error) => {
        console.error("Something went wrong", error);
   });
```

In case of a success, a transfer fee can be paid in the asset.

**[Тype 15 SET ASSET SCRIPT – setting a script to an asset](https://docs.wavesprotocol.org/en/blockchain/transaction-type/set-asset-script-transaction.html)**

- `assetId` string – asset ID
- `script` string – [script](https://docs.wavesprotocol.org/en/technical-details/waves-contracts-language-description/creating-and-deploying-a-script-manually.html#section-5e6520b97a7ead921d7fb6bce7292ce0)
- `*fee` MoneyLike – fee
- `*senderPublicKey` string - sender's public key in base58
- `*timestamp` number/string – time in ms

It's now impossible to cancel a script, you can only add a new script. [Script development on RIDE](https://ide.wavesplatform.com/)

Example:

```js
   WavesKeeper.signAndPublishTransaction({
        type: 15,
        data: {
             assetId: "",
             script: "base64:AQa3b8tH",
             fee: {
                 "tokens": "0.01",
                 "assetId": "WAVES"
             }
        }
   }).then((tx) => {
        console.log("Hurray! I have reset a script to the asset!!!");
   }).catch((error) => {
        console.error("Something went wrong", error);
   });
```

In case of a success, the asset's script will be reset.

**[Тип 16 SCRIPT INVOCATION - call account script function](https://docs.wavesprotocol.org/en/blockchain/transaction-type/invoke-script-transaction.html)**

- `dApp` string – address script account
- `call` object –
  - `function` string function name
  - `args` array
    - `type` "binary"/string/"integer"/"boolean" - type,
    - `value` /string/string/number/boolean - value for type
- `*fee` MoneyLike – fee
- `*payment` array MoneyLike (at now can use only 1 payment)
- `*senderPublicKey` string - public key in base58
- `*timestamp` number/string - number/string – time in ms

Example:

```js
   WavesKeeper.signAndPublishTransaction({
        type: 16,
        data: {
             fee: {
                 "tokens": "0.05",
                 "assetId": "WAVES"
             },
             dApp: '3N27HUMt4ddx2X7foQwZRmpFzg5PSzLrUgU',
             call: {
             		function: 'tellme',
             		args: [
             		    {
             		      "type": "string",
             		      "value": "Will?"
             		    }]
             	}, payment: [{assetId: "WAVES", tokens: 2}]
        }
   }).then((tx) => {
        console.log("Ура! Я выполнил скрипт!!!");
   }).catch((error) => {
        console.error("Что-то пошло не так", error);
   });

```

In case of a success, invoke script function `tellme` in testnet account `3N27HUMt4ddx2X7foQwZRmpFzg5PSzLrUgU`

**[Calculating transaction fees](https://docs.wavesprotocol.org/blockchain/transaction/transaction-fee.html)**

---

**signOrder**

Waves Keeper's method for signing an order to the matcher. As input, it accepts an object similar to a transaction like this:

```js
    {
        type: 1002,
        data: {
            ...data
        }
    }

```

- `*version` 1,2,3
- `amount` MoneyLike - amount
- `price` MoneyLike - price
- `orderType` 'sell'/'buy' – order type
- `matcherFee` MoneyLike - fee (0.003 WAVES minimum),
- `matcherPublicKey` string - the public key of the exchange service
- `expiration` string/number – the order's expiration time
- `*timestamp` string/number - current time
- `*senderPublicKey` string - public key in base58

Example:

```js
   WavesKeeper.signOrder({
        type: 1002,
        data: {
             matcherPublicKey: "7kPFrHDiGw1rCm7LPszuECwWYL3dMf6iMifLRDJQZMzy",
             orderType: "sell",
             expiration: Date.now() + 100000,
             amount: {
                 tokens: "100",
                 assetId: "WAVES"
             },
             price: {
                 tokens: "0.01",
                 assetId: "8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS"
             },
             matcherFee: {
                 tokens: "0.03",
                 assetId: "WAVES"
             }
        }
   }).then((tx) => {
        console.log("Hurray! I've signed an order!!!");
   }).catch((error) => {
        console.error("Something went wrong", error);
   });
```

REPLY: A line with data for sending to the matcher.

ERRORS:

- `{ message: "User denied message", code: 10 }` – the user rejected the request
- `{ message: "Api rejected by user", code: 12 }` – The website is not trusted
- `{ message: "Invalid data", data: "Reason", code: 9 }` - invalid/incomplete request data

**signAndPublishOrder**

Waves Keeper's method for creating an order to the matcher is identical to `signOrder`, but it also tries to send data to the matcher.

REPLY: the matcher's reply line about successful creation of an order.

ERRORS:

- Same as for `signOrder`
- `{message: "Filed request", data: "Error description", code: 15}` – a request has been signed, but not sent to the matcher

**signCancelOrder**

Waves Keeper's method for signing cancellation of an order to the matcher. As input, it accepts an object similar to a transaction like this:

```js
    {
        type: 1003,
        data: {
            ...data
        }
    }

```

- `id` string – order ID
- `*senderPublicKey` - string - sender's public key in base58

Example:

```js
    WavesKeeper.signCancelOrder({
        type: 1003,
        data: {
            id: '31EeVpTAronk95TjCHdyaveDukde4nDr9BfFpvhZ3Sap'
        }
    });
```

REPLY: A data line for sending to the matcher.

ERRORS:

- `{ message: "User denied message", code: 10 }` – the user rejected the request
- `{ message: "Api rejected by user", code: 12 }` – The website is not trusted
- `{ message: "Invalid data", data: "Reason", code: 9 }` - invalid/incomplete request data

**signAndPublishCancelOrder**

Waves Keeper's method for cancelling an order to the matcher. It works identically to `signCancelOrder`,
but also tries to send data to the matcher. For api need know also 2 field `priceAsset` and `amountAsset` from order.

Example:

```js
    WavesKeeper.signAndPublishCancelOrder({
        type: 1003,
        priceAsset: '8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS',
        amountAsset: 'WAVES',
        data: {
            id: '31EeVpTAronk95TjCHdyaveDukde4nDr9BfFpvhZ3Sap'
        }
    }).then(() => {
        console.log("Hurray! I've cancelled an order");
    }).catch((error) => {
        console.error("Something went wrong", error);
    });
```

REPLY: Data that came from the matcher

ERRORS:

- Same as for `signCancelOrder`
- `{message: "Filed request", data: "Error description", code: 15}` – a request has been signed, but not sent to the matcher

**signRequest**

Waves Keeper's method for signing typified data, for signing requests on various services. As input, it accepts an object similar to a transaction like this:

```js
    {
        type: number,
        data: {
            ...data
        }
    }
```

Currently, the method supports the following types:

**1001 – signing data for a request to the matcher for your orders**

- `timestamp` number/string
- `*senderPublicKey` string public key in base58

Example:

```js
    WavesKeeper.signRequest({
        type: 1001,
        data: {
            timestamp: 234234242423423
        }
    });
```

REPLY: a line with a signature in base58.

ERRORS:

- `{ message: "User denied message", code: 10 }` – the user rejected the request
- `{ message: "Api rejected by user", code: 12 }` – The website is not trusted
- `{ message: "Invalid data", data: "Reason", code: 9 }` - invalid/incomplete request data

**1004 – signing data for a request to Coinomat**

- `timestamp` number/string

Request:

```js
    WavesKeeper.signRequest({
        type: 1004,
        data: {
            timestamp: 234234242423423
        }
    });
```

REPLY: a line with a signature in base58.

ERRORS:

- `{ message: "User denied message", code: 10 }` – the user rejected the request
- `{ message: "Api rejected by user", code: 12 }` – The website is not trusted
- `{ message: "Invalid data", data: "Reason", code: 9 }` - invalid/incomplete request data


### signCustomData

Method Waves Keeper for sign custom data for different services, it accepts an object:

#### version 1

- `version` 1
- `binary` string 'base64:....'

Note: This method adds the `[255, 255, 255, 1]` prefix to the signed bytes. This was done to make it impossible to sign transaction data in this method, which can lead to unauthenticated transactions and phishing. [For the details check serializeCustomData method in waves-transaction library.](https://github.com/wavesplatform/waves-transactions/blob/master/src/requests/custom-data.ts#L60)

Example:

```js
    WavesKeeper.signCustomData({
         version: 1,
         binary: 'base64:AADDEE=='
    });
```

REPLY:
```
   {
        version: 1,
        binary: 'base64:AADDEE==',
        signature: '...',
        publicKey: '...'
   }
```
ERRORS:

- `{ message: "User denied message", code: 10 }` – the user rejected the request
- `{ message: "Api rejected by user", code: 12 }` – The website is not trusted
- `{ message: "Invalid data", data: "Reason", code: 9 }` - invalid/incomplete request data


#### version 2

- `version` 2
- `data` Array of
  - `type` "binary"/string/"integer"/"boolean" - field type,
  - `key` string - field name
  - `value` /string/string/number/boolean

Bytes to sign: [255, 255, 255, 2, ...(from data Array to bin)]
[waves-transaction library](https://github.com/wavesplatform/waves-transactions/blob/master/src/requests/custom-data.ts)

Example:

```js
    WavesKeeper.signCustomData({
         version: 2,
         data: [{ type: 'string', key: 'name', value: 'Mr. First' }]
    });
```

REPLY:

```
   {
        version: 2,
        data: [{ type: 'string', key: 'name', value: 'Mr. First' }]
        signature: '...',
        publicKey: '...'
   }
```      

ERRORS:

- `{ message: "User denied message", code: 10 }` – the user rejected the request
- `{ message: "Api rejected by user", code: 12 }` – The website is not trusted
- `{ message: "Invalid data", data: "Reason", code: 9 }` - invalid/incomplete request data

### verifyCustomData
Validate custom data:
```
       {
           version: 1,
           binary: 'base64:AADDEE==',
           signature: '...',
           publicKey: '...'
       }
       или
       {
            version: 2,
            data: [{ type: 'string', key: 'name', value: 'Mr. First' }]
            signature: '...',
            publicKey: '...'
       }
```
Example:
```js
    WavesKeeper.verifyCustomData({
        "version" : 1,
        "binary" : "base64:AADDEE==",
        "publicKey" : "3BvAsKuGZe2LbSwKr9SA7eSXcNDKnRqN1j2K2bZaTn5X",
        "signature": "2bLJYR68pwWrUUoatGbySz2vfY76VtzR8TScg1tt5f9DVDsFDCdecWrUiR4x6gFBnwF4Y51uszpouAwtSrg7EcGg"
    }).then(result => { console.log(result) });
```

REPLY: true/false

- `{ message: "User denied message", code: 10 }` – the user rejected the request
- `{ message: "Api rejected by user", code: 12 }` – The website is not trusted


### resourceIsApproved
Check allow API status for your origin

Example:

```js
    WavesKeeper.resourceIsApproved().then(result => { console.log(result) });
```     

REPLY: true/false
 

### resourceIsBlocked
Check block API status for your origin

Example:

```js
    WavesKeeper.resourceIsBlocked().then(result => { console.log(result) });
```     

REPLY: true/false
