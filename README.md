# Waves Keeper v1.0.8 
en | [ru](https://github.com/wavesplatform/waveskeeper/blob/master/README_ru.md)

Waves Keeper is an extension that allows users to securely interact with Waves-enabled web services from the Chrome browser.

Seed phrases and private keys are encrypted and stored within the extension and cannot be accessed by online dApps and services, making sure that users' funds are always protected from hackers and malicious websites. Completion of a transaction doesn't require entering any sensitive information.

Waves Keeper is designed for convenience, so users can sign transactions with just a couple of clicks. Users can create multiple wallets and switch between them easily. And if a user ever forgets the password to the account, it can be recovered from the seed phrase.

**Waves Keeper API**

On browser pages that operate under the http/https with Waves Keeper extension installed, Waves Keeper global object becomes available, featuring the following methods:



*   `auth`
*   `publicState`
*   `signAndPublishCancelOrder`
*   `signAndPublishOrder`
*   `signAndPublishTransaction`
*   `signCancelOrder`
*   `signOrder`
*   `signTransaction`
*   `signRequest`
*   `signTransactionPackage`
*   `on`

All methods, except for "on" operate asynchronously and return [promises](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise).

In Waves Keeper, for greater security and ease of use, each new website using API has to be allowed by the user. At the first attempt to use API (except "`on"`), the user will see a request to allow that website's access to Waves Keeper. If the user agrees to allow access, the website is considered trusted and can use API on its pages. Otherwise, the website is blocked, and an error message will be displayed in response to all requests `{message: "Api rejected by user", code: 12}.` The users won't see new notifications. To grant access, the user will mark the website as trusted in the interface.

**Description of methods**

**publicState**

If a website is trusted, Waves Keeper public data are returned.

Example:


```
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


```
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


```
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



*   `initialized` - boolean keeper initialized
*   `locked` - boolean keeper in wait mode
*   `account` – current account, if the user allowed access to the website, or null
*   `network` – current Waves network, node and matcher addresses
*   `messages` – signature request statuses
*   `txVersion` – available transaction versions for each type

Possible errors



*   `{ message: "Init Waves Keeper and add account" }` – Waves Keeper is not initialized
*   `{ message: "Add Waves Keeper account" }` – Waves Keeper accessed, but there are no accounts 
*   `{ message: "User denied message" }` – the user denied the website operation with Waves Keeper 

**on**

Allows subscribing to Waves Keeper events.

Supports events:



*   `update` – subscribe to updates of the state

Example:


```
   WavesKeeper.on("update", state => {
        //state object as from WavesKeeper.publicState
   });
```


If a website is not trusted, events won't show.

**auth**

This is a method for obtaining a signature of authorization data while verifying Waves' user. It works the same way as [Waves Auth API](https://docs.wavesplatform.com/en/development-and-api/client-api/auth-api.html).

Example:


```
    const authData = { data: "Auth on my site" };
    Waves.auth(authData)
        .then(auth => {
            console.log(state); //displaying the result on the console
            /*...processing data */
        }).catch(error => {
            console.error(error); // displaying the result on the console
            /*...processing errors */
        })


```


or


```
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



*   `name` – name of the service (optional field)
*   `data` – a line with any data (required field)
*   `referrer` – a websites' full URL for redirect (optional field)
*   `icon` – path to the logo relative to the `referrer `or origin of the website (optional field)
*   `successPath` – relative path to the website's Auth API (optional field)

Example


```
    const authData = { 
        data: "Generated string from server",
        name: "My test App",
        icon: "/img/icons/waves_logo.svg",
        referrer: "https://client.wavesplatform.com/",
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



*   `host` – a host that requested a signature
*   `name` – the name of an application that requested a signature
*   `prefix` – a prefix participating in the signature
*   `address` – an address in Waves network
*   `publicKey` – the user's public key
*   `signature` - signature
*   `version` – API version

[How to verify a signature](https://docs.wavesplatform.com/en/development-and-api/client-api/auth-api.html#section-2adf854e6133a03ce3003956df1f5c3b)?

ERRORS



*   `{message: "Invalid data", data: "[{"field":"data","type":"string","message":"field is required"}]", code: 9}` – signature data contain errors
*   `{message: "User denied message", code: 10}` – the user denied the request
*   `{message: "Api rejected by user", code: 12} - the website is not trusted`

**signTransaction**

A method for signing transactions in Waves' network.

Example:


```
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

In the example, we are signing a transaction for transferring WAVES to the alias `test `in Waves' network.

REPLY `{"version":2,"assetId":"", "amount":156700000,"feeAssetId":"",fee:100000, "recipient":"recipient","attachment":"", "timestamp":1548770230589,"senderPublicKey":"public key","proofs":["signature"],"type":4}`

ERRORS



*   `{message: "User denied message", code: 10}` – The user denied the request.
*   `{message: "Api rejected by user", code: 12}` – The website is not trusted.
*   `{message: "Invalid data", data: "Reason", code: 9}` – invalid/incomplete request data.

**signAndPublishTransaction**

This is similar to "`signTransaction"`, but it also broadcasts a transaction to the blockchain.

Example:


```
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



*    Same as `signTransaction`
*   `{message: "Filed request", data: "Error description", code: 15}` – a request was signed but not broadcasted

**signTransactionPackage**

A package transaction signature. Sometimes several transactions need to be simultaneously signed, and for users' convenience, up to seven transactions at ones could be signed. Only certain types of transactions are permitted:



*   `3 – token issue`
*   `4 – token transfer`
*   `5 – token re-issue`
*   `6 – token burning`
*   `10 – creating an alias for an address in Waves' network`
*   `11 – mass transfer`
*   `12 - DataTransaction`

Example:


```
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



*   Transfer 1.567 WAVES to the alias test 
*   Transfer 0.1 WAVES to the alias merry

REPLY

A unit of two lines – transactions that are signed and ready to be broadcasted.

ERRORS Same as in "`signTransaction`"

**[Transactions](https://docs.wavesplatform.com/en/development-and-api/client-libraries/waves-transactions.html)**

Every user of Waves' network has a state (balances, assets, data, scripts), and every past transactions changes these data. \
In Waves Keeper API it is different from [NODE REST API](https://docs.wavesplatform.com/en/development-and-api/waves-node-rest-api.html).

`signTransaction`, `signAndPublishTransaction` accept transactions as follows


```
{
    type: number //transaction type,
    data: {
        ... //transaction data
    }
}
```


Legend keys

* - optional field, data are automatically supplied from WavesKeeper. \
[x,y] – length limit from x to y. \
[,x] – length limit to x. \
[y,] – length limit from y. \
[x-y] – number from x to y. x/y - x or y. (JLM) - JAVA LONG MAX = 9 223 372 036 854 775 807 \
MoneyLike - price

MoneyLike could look as:



*   `{ tokens: 1, assetId: "WAVES" }`
*   `{ coins: 100000000, assetId: "WAVES" }`;

In both messages, the same price of 1 WAVES is indicated. You can easily convert `coins `into `tokens `and back, if you know in what asset the price is indicated and you have received its precision `tokens = coins / (10 ** precision)` \
If the field contains other types than MoneyLike, for instance, string/MoneyLike , the sum is indicated as a number in  `coins`.



---


**[Type 3 ISSUE – token issue](https://docs.wavesplatform.com/en/platform-features/assets-custom-tokens.html#section-8b6593d26c82bcc46ea77e373128b6f3)**



*   `name` [4, 16] string – token name,
*   `description` [0, 1000] string – token description,
*   `quantity` [0 - (JLM)] number/string - quantity,
*   `precision` [0 - 8] number - precision,
*   `reissuable` true|false – reissuble,
*   `fee` MoneyLike -fee
*   `*script` string – [asset script](https://docs.wavesplatform.com/en/technical-details/waves-contracts-language-description/creating-and-deploying-a-script-manually.html#section-5e6520b97a7ead921d7fb6bce7292ce0)
*   `*senderPublicKey` string – sender's public key in base58
*   `*timestamp` number/string – time in ms

Example:


```
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

**[Тype 4 TRANSFER – asset transfer](https://docs.wavesplatform.com/en/development-and-api/waves-node-rest-api/asset-transactions/public-functions.html#section-0c8edc11ae61814aebb41d3eeccbb831)**



*   `amount` MoneyLike - amount,
*   `recipient` string – recipient's address or alias
*   `attachment`[,140 bytes] string – additional info in text
*   `bytesAttachment`[,140 bytes] Array – additional info in bytes
*   `fee` MoneyLike - fee
*   `*senderPublicKey` string – sender's public key in base58
*   `*timestamp` number/string – time in ms

Example:


```
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


**[Тype 5 REISSUE – token reissue](https://docs.wavesplatform.com/en/platform-features/assets-custom-tokens.html#section-2afead90ebe874ae06338a9253b0dc9d)**



*   `assetId` string - "asset ID",
*   `quantity` [0 - (JLM)] number/string/MoneyLike - quantity,
*   `reissuable` false – deny reissue
*   `fee` MoneyLike -fee
*   `*senderPublicKey` string – sender's public key in base58
*   `*timestamp` number/string – time in ms

Example:


```
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

**[Тype 6 BURN – burning tokens](https://docs.wavesplatform.com/en/platform-features/assets-custom-tokens.html#section-423d9cffbd0e1a0b1298bf22c176fac3)**



*   `assetId` string – asset ID,
*   `amount` [0 - (JLM)] number/string/MoneyLike - quantity,
*   `fee` MoneyLike -fee
*   `*senderPublicKey` string - sender's public key in base58
*   `*timestamp` number/string – time in ms

Example:


```
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

**[Тype 8 LEASE - Leasing](https://docs.wavesplatform.com/en/platform-features/assets-custom-tokens.html#section-423d9cffbd0e1a0b1298bf22c176fac3)**



*   `recipient` string – recipient's address or alias,
*   `amount` [0 - (JLM)] number/string/MoneyLike - quantity,
*   `fee` MoneyLike -fee
*   `*senderPublicKey` string - sender's public key in base58
*   `*timestamp` number/string – time in ms

Example:


```
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

**[Тype 9 LEASE CANCEL – cancel leasing](https://docs.wavesplatform.com/en/technical-details/data-structures.html#section-92869b0109414c29eb600dfc6caf4520)**



*   `leaseId` string – leasing transaction ID,
*   `fee` MoneyLike -fee
*   `*senderPublicKey` string - sender's public key in base58
*   `*timestamp` number/string – time in ms

Example:


```
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

**[Тype 10 CREATE ALIAS – creating an alias for an address](https://docs.wavesplatform.com/en/technical-details/data-structures.html#section-e4657fe644ac2cf0d4e382fe676f0477)**



*   `alias`[4, 30] string - alias
*   `fee` MoneyLike -fee
*   `*senderPublicKey` string - sender's public key in base58
*   `*timestamp` number/string – time in ms

Example:


```
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

**[Тype 11 MASS TRANSFER - a mass transfer of an asset](https://docs.wavesplatform.com/en/technical-details/data-structures.html#section-bccba990c89ceec7ef3751e8e763ecc6)**



*   `totalAmount` moneyLike – total to be sent // instead of calculating the amount you may insert { assetId: "ID of the asset to be sent", coins: 0},
*   `transfers`  a mass of objects
    *   { `recipient`: string - address/alias, amount: number/string/moneyLike }
*   `fee` MoneyLike -fee
*   `attachment` [,140 bytes в base58] string – additional info
*   `*senderPublicKey` string - sender's public key in base58
*   `*timestamp` number/string – time in ms

Example:


```
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

**[Тype 12 DATA TRANSACTION - saving data](https://docs.wavesplatform.com/en/technical-details/data-structures.html#section-f6e7a2443d41af2a0ef8b4c4c33ba6b3)**



*   `data`  mass of objects
    *   `type` "binary"/string/"integer"/"boolean" - type,
    *   `key` string – field name
    *   `value` /string/string/number/boolean depends on the type
*   `fee` MoneyLike - fee
*   `*senderPublicKey` string - sender's public key in base58
*   `*timestamp` number/string – time in ms

Field:


```
   WavesKeeper.signAndPublishTransaction({
        type: 12,
        data: {
             data: [
                  { key: "string", value: "testVal", type: "string" },
                  { key: "binary", value: "base64:AbCd", type: "binary" },
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

**[Тype 13 SET SCRIPT – scrypting an account](https://docs.wavesplatform.com/en/technical-details/data-structures.html#section-11573fe1c896857a6d3fcfcf6cf6571d)**



*   `script` string - [scriptт](https://docs.wavesplatform.com/en/technical-details/waves-contracts-language-description/creating-and-deploying-a-script-manually.html#section-5e6520b97a7ead921d7fb6bce7292ce0)
*   `fee` MoneyLike -fee
*   `*senderPublicKey` string - sender's public key in base58
*   `*timestamp` number/string – time in ms

For cancelling a script the field `script `has to be "". [Script development on RIDE](https://ide.wavesplatform.com/)

Example:


```
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


```
   WavesKeeper.signAndPublishTransaction({
        type: 13,
        data: {
             script: "base64:AQa3b8tH",
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

**[Тype 14 Sponsored Fee Transaction - Sponsorship](https://docs.wavesplatform.com/en/technical-details/data-structures.html#section-730bd9c8fe7e7628ba840d36df3c726e)**



*   `minSponsoredAssetFee` MoneyLike – fee price in the asset.
*   `fee` MoneyLike - fee
*   `*senderPublicKey` string - sender's public key in base58
*   `*timestamp` number/string – time in ms

Example:


```
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

**[Тype 15 SET ASSET SCRIPT – setting a script to an asset](https://docs.wavesplatform.com/en/technical-details/data-structures.html#section-9459bb3757b06f2d75f1a07f24f873ce)**



*   `assetId` string – asset ID
*   `script` string - [script](https://docs.wavesplatform.com/en/technical-details/waves-contracts-language-description/creating-and-deploying-a-script-manually.html#section-5e6520b97a7ead921d7fb6bce7292ce0)
*   `fee` MoneyLike -fee
*   `*senderPublicKey` string - sender's public key in base58
*   `*timestamp` number/string – time in ms

It's now impossible to cancel a script, you can only add a new script. [Script development on RIDE](https://ide.wavesplatform.com/)

Example:


```
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

**[Calculating transaction fees](https://docs.wavesplatform.com/en/technical-details/transactions-fees.html)**



---


**signOrder**

Waves Keeper's method for signing an order to the matcher. As input, it accepts an object similar to a transaction like this:


```
    {
        type: 1002,
        data: {
            ...data
        }
    }

```



*   `amount` MoneyLike - amount
*   `price` MoneyLike - price
*   `orderType` 'sell'/'buy' – order type
*   `matcherFee` MoneyLike - fee (0.003 WAVES minimum),
*   `matcherPublicKey` string - the public key of the exchange service
*   `expiration` string/number – the order's expiration time
*   `*timestamp` string/number - current time
*   `*senderPublicKey` string - public key in base58

Example:


```
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



*   `{ message: "User denied message", code: 10 }` – the user rejected the request
*   `{ message: "Api rejected by user", code: 12 }` – The website is not trusted
*   `{ message: "Invalid data", data: "Reason", code: 9 }` - invalid/incomplete request data

**signAndPublishOrder**

Waves Keeper's method for creating an order to the matcher is identical to `signOrder`, but it also tries to send data to the matcher.

REPLY: the matcher's reply line about successful creation of an order.

ERRORS:



*   Same as for `signOrder`
*   `{message: "Filed request", data: "Error description", code: 15}` – a request has been signed, but not sent to the matcher

**signCancelOrder**

Waves Keeper's method for signing cancellation of an order to the matcher. As input, it accepts an object similar to a transaction like this:


```
    {
        type: 1003,
        data: {
            ...data
        }
    }

```



*   `id` string – order ID
*   `*senderPublicKey` - string - sender's public key in base58

Example:


```
    WavesKeeper.signCancelOrder({
        type: 1003,
        data: {
            id: '31EeVpTAronk95TjCHdyaveDukde4nDr9BfFpvhZ3Sap'	
        }
    });
```


REPLY: A data line for sending to the matcher.

ERRORS:



*   `{ message: "User denied message", code: 10 }` – the user rejected the request
*   `{ message: "Api rejected by user", code: 12 }` – The website is not trusted
*   `{ message: "Invalid data", data: "Reason", code: 9 }` - invalid/incomplete request data

**signAndPublishCancelOrder**

Waves Keeper's method for cancelling an order to the matcher. It works identically to `signCancelOrder`, but also tries to send data to the matcher.

Example:


```
    WavesKeeper.signAndPublishCancelOrder({
        type: 1003,
        data: {
            id: '31EeVpTAronk95TjCHdyaveDukde4nDr9BfFpvhZ3Sap'
        }
    }).then(() => {
        console.log('Hurray! I've cancelled an order');
    }).catch((error) => {
        console.error("Something went wrong", error);
    })
```


REPLY: Data that came from the matcher

ERRORS:



*   Same as for `signCancelOrder`
*   `{message: "Filed request", data: "Error description", code: 15}` – a request has been signed, but not sent to the matcher

**signRequest**

Waves Keeper's method for signing typified data, for signing requests on various services. As input, it accepts an object similar to a transaction like this:


```
    {
        type: number,
        data: {
            ...data
        }
    }
```


Currently, the method supports the following types:

**1001 – signing data for a request to the matcher for your orders**



*   `timestamp` number/string
*   `*senderPublicKey` string public key in base58

Example:


```
    WavesKeeper.signRequest({
        type: 1001,
        data: {
            timestamp: 234234242423423
        }
    });
```


REPLY: a line with a signature in base58.

ERRORS:



*   `{ message: "User denied message", code: 10 }` – the user rejected the request
*   `{ message: "Api rejected by user", code: 12 }` – The website is not trusted
*   `{ message: "Invalid data", data: "Reason", code: 9 }` - invalid/incomplete request data

**1004 – signing data for a request to Coinomat**



*   `timestamp` number/string

Request:


```
    WavesKeeper.signRequest({
        type: 1004,
        data: {
            timestamp: 234234242423423
        }
    });
```


REPLY: a line with a signature in base58.

ERRORS:



*   `{ message: "User denied message", code: 10 }` – the user rejected the request
*   `{ message: "Api rejected by user", code: 12 }` – The website is not trusted
*   `{ message: "Invalid data", data: "Reason", code: 9 }` - invalid/incomplete request data

