# Keeper Wallet

[![""](https://badgen.net/chrome-web-store/v/lpilbniiabackdjcionkobglmddfbcjo)](https://chrome.google.com/webstore/detail/keeper-wallet/lpilbniiabackdjcionkobglmddfbcjo)
[![""](https://badgen.net/chrome-web-store/users/lpilbniiabackdjcionkobglmddfbcjo)](https://chrome.google.com/webstore/detail/keeper-wallet/lpilbniiabackdjcionkobglmddfbcjo)
[![""](https://badgen.net/chrome-web-store/rating/lpilbniiabackdjcionkobglmddfbcjo)](https://chrome.google.com/webstore/detail/keeper-wallet/lpilbniiabackdjcionkobglmddfbcjo)

[![""](https://badgen.net/amo/v/waves-keeper)](https://addons.mozilla.org/ru/firefox/addon/waves-keeper/)
[![""](https://badgen.net/amo/users/waves-keeper)](https://addons.mozilla.org/ru/firefox/addon/waves-keeper/)
[![""](https://badgen.net/amo/rating/waves-keeper)](https://addons.mozilla.org/ru/firefox/addon/waves-keeper/reviews/)

en | [ru](./README_ru.md)

Keeper Wallet is a browser extension that enables secure interaction with Waves-enabled web services.

Seed phrases and private keys are encrypted and stored within the extension and cannot be accessed by online dApps and services, making sure that users' funds are always protected from hackers and malicious websites. Completion of a transaction doesn't require entering any sensitive information.

Keeper Wallet is designed for convenience, so users can sign transactions with just one click. Users can create multiple wallets and switch between them easily. And if a user ever forgets the password to the account, it can be recovered from the seed phrase.

[Waves protocol documentation](https://docs.waves.tech/en/)

## Keeper Wallet API

On browser pages that operate under `http/https` (not local pages with `file://` protocol) with Keeper Wallet extension installed, `KeeperWallet` global object becomes available.

In `KeeperWallet` you will find the following methods:

- [publicState](#publicstate)
- [notification](#notification)
- [encryptMessage](#encryptmessage)
- [decryptMessage](#decryptmessage)
- [on](#on)
- [auth](#auth)
- [signTransaction](#signtransaction)
- [signAndPublishTransaction](#signandpublishtransaction)
- [signTransactionPackage](#signtransactionpackage)
- [signOrder](#signorder)
- [signAndPublishOrder](#signandpublishorder)
- [signCancelOrder](#signcancelorder)
- [signAndPublishCancelOrder](#signandpublishcancelorder)
- [signRequest](#signrequest)
- [signCustomData](#signcustomdata)
- [resourceIsApproved](#resourceisapproved)
- [resourceIsBlocked](#resourceisblocked)
- [verifyCustomData](#verifycustomdata)

All methods except for `on` operate asynchronously and return [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

In code, you can use [TypeScript types](https://github.com/wavesplatform/waveskeeper-types).

In Keeper Wallet, for greater security and ease of use, each new website using API has to be allowed by the user. At the first attempt to use API (except `on`), the user will see a request to allow the website to access Keeper Wallet. If the user agrees to allow access, the website is considered trusted and can use API on its pages. Otherwise, the website is blocked, and the error message `{message: "Api rejected by user", code: 12}` will be displayed in response to all requests. The user won't see new notifications. To grant access, the user has to mark the website as trusted in the interface.

### Description of methods

#### publicState

If a website is trusted, Keeper Wallet public data are returned.

Example:

```js
KeeperWallet.publicState()
  .then(state => {
    console.log(state); //displaying the result in the console
    /*...processing data */
  })
  .catch(error => {
    console.error(error); // displaying the result in the console
    /*...processing errors */
  });
```

or

```js
const getPublicState = async () => {
  try {
    const state = await KeeperWallet.publicState();
    console.log(state); // displaying the result in the console
    /*... processing data*/
  } catch (error) {
    console.error(error); // displaying the result in the console
    /*... processing errors */
  }
};

const result = await getPublicState();
```

Response:

```json
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
        "server": "https://nodes.wavesnodes.com/",
        "matcher": "https://matcher.waves.exchange/"
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

Response fields:

- `initialized` – boolean: Keeper Wallet is initialized.
- `locked` – boolean: Keeper Wallet is locked (password required).
- `account` – current account if the user allowed access to the website, `null` otherwise.
- `network` – current Waves network, node and matcher addresses.
- `messages` – signature request statuses.
- `txVersion` – available transaction versions for each type.

Possible errors:

- `{ message: "Init Keeper Wallet and add account" }` – Keeper Wallet is not initialized.
- `{ message: "Add Keeper Wallet account" }` – Keeper Wallet accessed, but there are no accounts.
- `{ message: "User denied message" }` – the user denied the website operation with Keeper Wallet.

#### notification

A method for sending a user a message from the site. You can send message only 1 time in 30 sec for trusted sites with send permission.

`notification` facilitates input of the following data:

- `title` – string, 20 chars max (required field).
- `message` – string, 250 chars max (optional field).

Example:

```js
KeeperWallet.notification({
  title: 'Hello!',
  message: 'Congratulation!!!',
});
```

Response: `Promise`.

Possible errors:

- `{message: "Incorrect notification data", data: "title has more than 20 characters", code: "19"}` – incorrect notification title.
- `{message: "Incorrect notification data", data: null, code: "19"}` – incorrect notification data.
- `{message: "Can't sent notification", data: {msg: "Min notification interval 30s. Wait 28.017s."}, code: "18"}` – try to send later, you can send 1 message in 30 sec.
- `{message: 'User denied message', data: 'rejected', code: '10'}` — the user rejected the request.
- `{message: 'User denied message', data: 'rejected_forever', code: '10'}` — the user rejected the request and blocked the website.
- `{ message: "Api rejected by user", code: 12 }` — the website was previously blocked by the user or sending messages is not allowed.

#### encryptMessage

You can encrypt string messages to account in Waves network.
You need have recipient publicKey.

KeeperWallet.encryptMessage(`*string to encrypt*`, `*public key in base58 string*`, `*prefix: a secret app string for encoding*`)

Example:

```js
KeeperWallet.encryptMessage(
  'My message',
  '416z9d8DQDy5MPTqDhvReRBaPb19gEyVRWvHcewpP6Nc',
  'my app',
).then(encryptedMessage => {
  console.log(encryptedMessage);
});
```

Possible errors:

- `{ message: "Init Keeper Wallet and add account" }` – Keeper Wallet is not initialized.
- `{ message: "App is locked" }` – Keeper Wallet is locked (password required).
- `{ message: "Add Keeper Wallet account" }` – Keeper Wallet accessed, but there are no accounts.
- `{ message: "User denied message" }` – the user denied the website operation with Keeper Wallet.

#### decryptMessage

You can decrypt string messages from account in Waves network to you.
You need to have user's public key and the encrypted message.

KeeperWallet.decryptMessage(`*string to decrypt*`, `*public key in base58 string*`, `*prefix: a secret app string for encoding*`)

Example:

```js
KeeperWallet.decryptMessage(
  '**encrypted msg**',
  '416z9d8DQDy5MPTqDhvReRBaPb19gEyVRWvHcewpP6Nc',
  'my app',
).then(message => {
  console.log(message);
});
```

Possible errors:

- `{ message: "Init Keeper Wallet and add account" }` – Keeper Wallet is not initialized.
- `{ message: "App is locked" }` – Keeper Wallet is locked (password required).
- `{ message: "Add Keeper Wallet account" }` – Keeper Wallet accessed, but there are no accounts.
- `{ message: "User denied message" }` – the user denied the website operation with Keeper Wallet.

#### on

Allows subscribing to Keeper Wallet events.

Supports events:

- `update` – subscribe for updates of the state.

Example:

```js
KeeperWallet.on('update', state => {
  //state object as from KeeperWallet.publicState
});
```

If a website is not trusted, events won't be displayed.

#### auth

This is a method for obtaining a signature of authorization data while verifying Waves' user. If the signature is valid, be sure that the given blockchain account belongs to that user.

Example:

```js
const authData = { data: 'Auth on my site' };
KeeperWallet.auth(authData)
  .then(auth => {
    console.log(auth); //displaying the result on the console
    /*...processing data */
  })
  .catch(error => {
    console.error(error); // displaying the result on the console
    /*...processing errors */
  });
```

or

```js
const getAuthData = async authData => {
  try {
    const state = await KeeperWallet.auth(authData);
    console.log(state); // displaying the result on the console
    /*... processing data */
  } catch (error) {
    console.error(error); // displaying the result on the console
    /*... processing errors */
  }
};

const authData = { data: 'Auth on my site' };
getAuthData(authData);
```

`auth` facilitates input of the following data:

- `name` – name of the service (optional field).
- `data` – a string line with any data (required field).
- `referrer` – a websites' full URL for redirect (optional field).
- `icon` – path to the logo relative to the `referrer` or origin of the website (optional field).
- `successPath` – relative path to the website's Auth API (optional field).

Example:

```js
const authData = {
  data: 'Generated string from server',
  name: 'My test App',
  icon: '/img/icons/waves_logo.svg',
  referrer: 'https://waves.exchange/',
  successPath: 'login',
};

KeeperWallet.auth(authData)
  .then(data => {
    //data – data from Keeper Wallet
    //verifying signature and saving the address...
    console.log(data);
  })
  .catch(error => {
    //processing the error
  });
```

If the verification is successful, Keeper Wallet returns to the `Promise` an object containing data for signature verification:

- `host` – host that requested a signature.
- `name` – name of an application that requested a signature.
- `prefix` – prefix participating in the signature.
- `address` – address in Waves network.
- `publicKey` – user's public key.
- `signature` – user's signature.
- `version` – API version.

Possible errors:

- `{message: "Invalid data", data: "[{"field":"data","type":"string","message":"field is required"}]", code: 9}` – signature data contain errors.
- `{message: "User denied message", code: 10}` – the user denied the request.
- `{ message: "Api rejected by user", code: 12 }` — the website was previously blocked by the user.

<details><summary><a id="validity"></a><b>How to check signature validity</b></summary>

Signed data consists of three parts: `prefix` (`WavesWalletAuthentication` string) + `host` + provided data. All strings are converted to `length bytes` + `value bytes` as in Data Transactions. Prefix string and the host is required for security purposes if malicious service tries to use data and signature.

We also suggest address validation in case the signature and public key is valid but the address was swapped.

**TypeScript example code**

```typescript
import { verifyAuthData, libs } from '@waves/waves-transactions';

const authValidate = (
  data: { host: string; data: string },
  signature: string,
  publicKey: string,
  chainId: string | number,
): boolean => {
  const chain =
    typeof chainId === 'string' ? chainId : String.fromCharCode(chainId);
  const address = libs.crypto.address({ publicKey }, chain);
  return verifyAuthData({ publicKey, address, signature }, data);
};

// Obtaining the signature
const data = await KeeperWallet.auth({ data: '123' });

authValidate(data, { host: data.host, data: '123' }); // true
```

**JS example code**

```js
import { verifyAuthData, libs } from '@waves/waves-transactions';

const authValidate = (signature, data, publicKey, chainId) => {
  const chain =
    typeof chainId === 'string' ? chainId : String.fromCharCode(chainId);
  const address = libs.crypto.address({ publicKey }, chain);
  return verifyAuthData({ publicKey, address, signature }, data);
};

// Obtaining the signature
const data = await KeeperWallet.auth({ data: '123' });

authValidate(data, { host: data.host, data: '123' }); // true
```

**Python example code**

```python
import axolotl_curve25519 as curve
import pywaves.crypto as crypto
import base58
from urllib.parse import urlparse, parse_qs


def str_with_length(string_data):
    string_length_bytes = len(string_data).to_bytes(2, byteorder='big')
    string_bytes = string_data.encode('utf-8')
    return string_length_bytes + string_bytes


def signed_data(host, data):
    prefix = 'WavesWalletAuthentication'
    return str_with_length(prefix) + str_with_length(host) + str_with_length(data)


def verify(public_key, signature, message):
    public_key_bytes = base58.b58decode(public_key)
    signature_bytes = base58.b58decode(signature)

    return curve.verifySignature(public_key_bytes, message, signature_bytes) == 0


def verifyAddress(public_key, address):
    public_key_bytes = base58.b58decode(public_key)
    unhashed_address = chr(1) + str('W') + crypto.hashChain(public_key_bytes)[0:20]
    address_hash = crypto.hashChain(crypto.str2bytes(unhashed_address))[0:4]
    address_from_public_key = base58.b58encode(crypto.str2bytes(unhashed_address + address_hash))

    return address_from_public_key == address

address = '3PCAB4sHXgvtu5NPoen6EXR5yaNbvsEA8Fj'
pub_key = '2M25DqL2W4rGFLCFadgATboS8EPqyWAN3DjH12AH5Kdr'
signature = '2w7QKSkxKEUwCVhx2VGrt5YiYVtAdoBZ8KQcxuNjGfN6n4fi1bn7PfPTnmdygZ6d87WhSXF1B9hW2pSmP7HucVbh'
data_string = '0123456789abc'
host_string = 'example.com'
message_bytes = signed_data(host_string, data_string)

print('Address:', address)
print('Public key:', pub_key)
print('Signed Data:', message_bytes)
print('Real signature:', signature)
print('Verified:', verify(pub_key, signature, message_bytes))
print('Address verified:', verifyAddress(pub_key, address))

fake_signature = '29qWReHU9RXrQdQyXVXVciZarWXu7DXwekyV1zPivkrAzf4VSHb2Aq2FCKgRkKSozHFknKeq99dQaSmkhUDtZWsw'

print('Fake signature:', fake_signature)
print('Fake signature verification:', verify(pub_key, fake_signature, message_bytes))
```

**PHP example code**

```php
<?php

/*
 * Requires WavesKit by deemru
 * https://github.com/deemru/WavesKit
 */

require_once __DIR__ . '/vendor/autoload.php';
use deemru\WavesKit;

function signed_data( $host, $data )
{
    $prefix = 'WavesWalletAuthentication';
    return str_with_length($prefix) . str_with_length($host) . str_with_length($data);
}

function str_with_length( $data )
{
    return pack('n', strlen($data)).$data;
}

$wk = new WavesKit("W");
$address = '3PCAB4sHXgvtu5NPoen6EXR5yaNbvsEA8Fj';
$pub_key = '2M25DqL2W4rGFLCFadgATboS8EPqyWAN3DjH12AH5Kdr';
$signature = '2w7QKSkxKEUwCVhx2VGrt5YiYVtAdoBZ8KQcxuNjGfN6n4fi1bn7PfPTnmdygZ6d87WhSXF1B9hW2pSmP7HucVbh';
$data_string = '0123456789abc';
$host_string = 'example.com';
$message_bytes = signed_data($host_string, $data_string);

$wk->log('i', 'Address: '. $address);
$wk->log('i', 'Public key:' . $pub_key);
$wk->log('i', 'Signed Data: ' . $message_bytes);
$wk->log('i', 'Real signature: '. $signature);

$wk->setPublicKey( $pub_key );
$is_address_verified = $address === $wk->getAddress();

if ( $is_address_verified === true)
    $wk->log('s', "Address: Verified: TRUE");
else
    $wk->log('e', "Address: Verified: FALSE");

$signature_verified = $wk->verify($wk->base58Decode($signature), $message_bytes);

if ( $signature_verified === true)
    $wk->log('s', "Signature Verified: TRUE");
else
    $wk->log('e', "Signature Verified: FALSE");

$fake_signature = '29qWReHU9RXrQdQyXVXVciZarWXu7DXwekyV1zPivkrAzf4VSHb2Aq2FCKgRkKSozHFknKeq99dQaSmkhUDtZWsw';
$wk->log('i', 'Fake Signature: '. $fake_signature);

$signature_verified = $wk->verify($wk->base58Decode($fake_signature), $message_bytes);

if ( $signature_verified === true)
    $wk->log('e', "Fake Signature Verified: TRUE");
else
    $wk->log('s', "Fake Signature Verified: FALSE");
?>
```

</details>

#### signTransaction

A method for signing transactions in Waves network. See the description of supported transaction types in [Transactions](#transactions) section below.

Example:

```js
const txData = {
  type: 4,
  data: {
    amount: {
      assetId: 'WAVES',
      tokens: '1.567',
    },
    fee: {
      assetId: 'WAVES',
      tokens: '0.001',
    },
    recipient: 'test',
  },
};
KeeperWallet.signTransaction(txData)
  .then(data => {
    //data – a line ready for sending to Waves network's node (server)
  })
  .catch(error => {
    //Processing errors
  });
```

> API returns lines, not an object, as in JavaScript precision is lost in operation with 8-byte integers.

In the example, we are signing a transaction for transferring WAVES to the alias `test` in Waves network.

Response:

```json
{
  "version": 2,
  "assetId": "",
  "amount": 156700000,
  "feeAssetId": "",
  "fee": 100000,
  "recipient": "recipient",
  "attachment": "",
  "timestamp": 1548770230589,
  "senderPublicKey": "public key",
  "proofs": ["signature"],
  "type": 4
}
```

Possible errors:

- `{message: "User denied message", code: 10}` – the user denied the request.
- `{ message: "Api rejected by user", code: 12 }` — the website was previously blocked by the user.
- `{message: "Invalid data", data: "Reason", code: 9}` – invalid/incomplete request data.

#### signAndPublishTransaction

This is similar to `signTransaction`, but it also broadcasts a transaction to the blockchain. See the description of supported transaction types in [Transactions](#transactions) section below.

Example:

```js
const txData = {
  type: 4,
  data: {
    amount: {
      assetId: 'WAVES',
      tokens: '1.567',
    },
    fee: {
      assetId: 'WAVES',
      tokens: '0.001',
    },
    recipient: 'test',
  },
};

KeeperWallet.signAndPublishTransaction(txData)
  .then(data => {
    //data - a line ready for sending to Waves network's node (server)
  })
  .catch(error => {
    //processing errors
  });
```

Response: a reply from Waves network returns as a line containing the entire past transaction.

Possible errors:

- Same as `signTransaction`.
- `{message: "Failed request", data: "Error description", code: 15}` – a request was signed but not broadcasted.

#### signTransactionPackage

A package transaction signature. Sometimes several transactions need to be simultaneously signed, and for users' convenience, up to seven transactions at once could be signed. See the description of supported transaction types in [Transactions](#transactions) section below.

Example:

```js
const name = 'For Test';
const tx = [
  {
    type: 4,
    data: {
      amount: {
        assetId: 'WAVES',
        tokens: '1.567',
      },
      fee: {
        assetId: 'WAVES',
        tokens: '0.001',
      },
      recipient: 'test',
    },
  },
  {
    type: 4,
    data: {
      amount: {
        assetId: 'WAVES',
        tokens: '0.51',
      },
      fee: {
        assetId: 'WAVES',
        tokens: '0.001',
      },
      recipient: 'merry',
    },
  },
];

KeeperWallet.signTransactionPackage(tx, name);
```

Sign two transaction:

- Transfer 1.567 WAVES to the alias `test`.
- Transfer 0.1 WAVES to the alias `merry`.

Response: a unit of two lines – transactions that are signed and ready to broadcast.

Possible errors:

Same as in `signTransaction`.

#### Transactions

Every user of Waves network has a state (balances, assets, data, scripts), and every past transaction changes this data. [More about transactions](https://docs.waves.tech/en/blockchain/transaction/)

In Keeper Wallet API transaction format is different from [Node REST API](https://docs.waves.tech/en/waves-node/node-api/). `signTransaction`, `signAndPublishTransaction`, and `signTransactionPackage` accept transactions as follows:

```js
{
    type: number, //transaction type
    data: {
        ... //transaction data
    }
}
```

Keeper Wallet supports the following types of transactions:

- [Issue transaction (type 3)](#issue-transaction-type-3)
- [Transfer transaction (type 4)](#transfer-transaction-type-4)
- [Reissue transaction (type 5)](#reissue-transaction-type-5)
- [Burn transaction (type 6)](#burn-transaction-type-6)
- [Lease transaction (type 8)](#lease-transaction-type-8)
- [Lease Cancel transaction (type 9)](#lease-cancel-transaction-type-9)
- [Create Alias transaction (type 10)](#create-alias-transaction-type-10)
- [Mass Transfer transaction (type 11)](#mass-transfer-transaction-type-11)
- [Data transaction (type 12)](#data-transaction-type-12)
- [Set Script transaction (type 13)](#set-script-transaction-type-13)
- [Sponsor Fee transaction (type 14)](#sponsor-fee-transaction-type-14)
- [Set Asset Script transaction (type 15)](#set-asset-script-transaction-type-15)
- [Invoke Script transaction (type 16)](#invoke-script-transaction-type-16)
- [Update Asset Info transaction (type 17)](#update-asset-info-transaction-type-17)

Legend keys:

- \* - optional field, data is automatically supplied from `KeeperWallet`.
- [x,y] – length limit from x to y.
- [,x] – length limit to x.
- [y,] – length limit from y.
- [x-y] – number from x to y.
- x/y – x or y.
- (JLM) – JAVA LONG MAX = 9 223 372 036 854 775 807.
- MoneyLike - price.

MoneyLike could look as:

- `{ tokens: 1, assetId: "WAVES" }`
- `{ coins: 100000000, assetId: "WAVES" }`;

In both messages, the same price of 1 WAVES is indicated. You can easily convert `coins` into `tokens` and back, if you know in what asset the price is indicated, and you have received its precision: `tokens = coins / (10 ** precision)`.

If the field contains other types than MoneyLike, for instance, string/MoneyLike, the sum is indicated as a number in  `coins`.

##### Transaction fee

See [Transaction fee](https://docs.waves.tech/en/blockchain/transaction/transaction-fee) section in the Waves protocol documentation.

##### Issue transaction (type 3)

See [Issue transaction details](https://docs.waves.tech/en/blockchain/transaction-type/issue-transaction) in the Waves protocol documentation.

Fields:

- `name`: [4, 16 bytes] string – token name.
- `description`: [0, 1000 bytes] string – token description.
- `quantity`: [0 - (JLM)] number/string – token quantity.
- `precision`: [0 - 8] number – precision.
- `reissuable`: true|false – reissuable.
- `*fee`: MoneyLike – fee.
- `*script`: string – asset script, see the [Smart Asset](https://docs.waves.tech/en/building-apps/smart-contracts/what-is-smart-asset) article.
- `*senderPublicKey`: string – user's public key in base58.
- `*timestamp`: number/string – time in ms.

Example:

```js
KeeperWallet.signAndPublishTransaction({
  type: 3,
  data: {
    name: 'Best Token',
    description: 'Great token',
    quantity: 1000000,
    precision: 2,
    reissuable: true,
    fee: {
      tokens: '1',
      assetId: 'WAVES',
    },
  },
})
  .then(tx => {
    console.log("Hurray! I've created my asset!!!");
  })
  .catch(error => {
    console.error('Something went wrong', error);
  });
```

In case of success, we issue a new asset in the quantity of 1,000,000, and your balance will show 10,000.00 Best Token.

##### Transfer transaction (type 4)

See [Transfer transaction details](https://docs.waves.tech/en/blockchain/transaction-type/transfer-transaction) in the Waves protocol documentation.

Fields:

- `amount`: MoneyLike – amount.
- `recipient`: string – recipient's address or alias.
- `attachment`: [,140 bytes]: string or byte array – arbitrary binary data (typically a comment to transfer).
- `*fee`: MoneyLike – fee.
- `*senderPublicKey`: string – user's public key in base58.
- `*timestamp`: number/string – time in ms.

Example:

```js
KeeperWallet.signAndPublishTransaction({
  type: 4,
  data: {
    amount: { tokens: '3.3333333', assetId: 'WAVES' },
    fee: { tokens: '0.001', assetId: 'WAVES' },
    recipient: 'merry',
  },
})
  .then(tx => {
    console.log("Hurray! I've been able to send WAVES!!!");
  })
  .catch(error => {
    console.error('Something went wrong', error);
  });
```

##### Reissue transaction (type 5)

See [Reissue transaction details](https://docs.waves.tech/en/blockchain/transaction-type/reissue-transaction) in the Waves protocol documentation.

Fields:

- `assetId`: string – asset ID in base58.
- `quantity`: [0 - (JLM)] number/string/MoneyLike – quantity.
- `reissuable`: false – deny reissue.
- `*fee`: MoneyLike – fee.
- `*senderPublicKey`: string – user's public key in base58.
- `*timestamp`: number/string – time in ms.

Example:

```js
KeeperWallet.signAndPublishTransaction({
  type: 5,
  data: {
    quantity: 1000,
    assetId: '4DZ1wnZAKr66kpPtYr8hH1kfViF7Z7vrALfUDDttSGzD',
    reissuable: true,
    fee: {
      tokens: '1',
      assetId: 'WAVES',
    },
  },
})
  .then(tx => {
    console.log("Hurray! I've reissued my asset!!!");
  })
  .catch(error => {
    console.error('Something went wrong', error);
  });
```

In case of success, we reissue the asset in the quantity of 1000, and user balance will show 10,010.00 Best Token.

##### Burn transaction (type 6)

See [Burn transaction details](https://docs.waves.tech/en/blockchain/transaction-type/burn-transaction) in the Waves protocol documentation.

Fields:

- `assetId`: string – asset ID in base58.
- `amount`: [0 - (JLM)] number/string/MoneyLike – quantity.
- `*fee`: MoneyLike – fee.
- `*senderPublicKey`: string – user's public key in base58.
- `*timestamp`: number/string – time in ms.

Example:

```js
KeeperWallet.signAndPublishTransaction({
  type: 6,
  data: {
    amount: 1000,
    assetId: '4DZ1wnZAKr66kpPtYr8hH1kfViF7Z7vrALfUDDttSGzD',
    fee: {
      tokens: '0.001',
      assetId: 'WAVES',
    },
  },
})
  .then(tx => {
    console.log("Hurray! I've burned unneeded tokens!!!");
  })
  .catch(error => {
    console.error('Something went wrong', error);
  });
```

In case of success, 1000 coins are burned.

##### Lease transaction (type 8)

See [Lease transaction details](https://docs.waves.tech/en/blockchain/transaction-type/lease-transaction) in the Waves protocol documentation.

Fields:

- `recipient`: string – recipient's address or alias.
- `amount`: [0 - (JLM)] number/string/MoneyLike – quantity.
- `*fee`: MoneyLike – fee.
- `*senderPublicKey`: string – user's public key in base58.
- `*timestamp`: number/string – time in ms.

Example:

```js
KeeperWallet.signAndPublishTransaction({
  type: 8,
  data: {
    amount: 1000,
    recipient: 'merry',
    fee: {
      tokens: '0.001',
      assetId: 'WAVES',
    },
  },
})
  .then(tx => {
    console.log("Hurray! I've been able to lease tokens!!!");
  })
  .catch(error => {
    console.error('Something went wrong', error);
  });
```

In case of success, 0.00001000 WAVES is leased.

##### Lease Cancel transaction (type 9)

See [Lease Cancel transaction details](https://docs.waves.tech/en/blockchain/transaction-type/lease-cancel-transaction) in the Waves protocol documentation.

Fields:

- `leaseId`: string – lease ID in base58.
- `*fee`: MoneyLike – fee.
- `*senderPublicKey`: string – user's public key in base58.
- `*timestamp`: number/string – time in ms.

Example:

```js
KeeperWallet.signAndPublishTransaction({
  type: 9,
  data: {
    leaseId: '6frvwF8uicAfyEfTfyC2sXqBJH7V5C8he5K4YH3BkNiS',
    fee: {
      tokens: '0.001',
      assetId: 'WAVES',
    },
  },
})
  .then(tx => {
    console.log("Hurray! I've cancelled leasing!!!");
  })
  .catch(error => {
    console.error('Something went wrong ', error);
  });
```

In case of success, the lease is cancelled.

##### Create Alias transaction (type 10)

See [Create Alias transaction details](https://docs.waves.tech/en/blockchain/transaction-type/create-alias-transaction) in the Waves protocol documentation.

Fields:

- `alias`: [4, 30 bytes] string – alias. See [alias requirements](https://docs.waves.tech/en/blockchain/account/alias#alias-requirements).
- `*fee`: MoneyLike – fee.
- `*senderPublicKey`: string - user's public key in base58.
- `*timestamp`: number/string – time in ms.

Example:

```js
KeeperWallet.signAndPublishTransaction({
  type: 10,
  data: {
    alias: 'test_alias',
    fee: {
      tokens: '0.001',
      assetId: 'WAVES',
    },
  },
})
  .then(tx => {
    console.log('Hurray! Now I have an alias!!!');
  })
  .catch(error => {
    console.error('Something went wrong', error);
  });
```

In case of success, an alias (another name) is created.

##### Mass Transfer transaction (type 11)

See [Mass Transfer transaction details](https://docs.waves.tech/en/blockchain/transaction-type/mass-transfer-transaction) in the Waves protocol documentation.

Fields:

- `totalAmount`: MoneyLike – total to be sent; instead of calculating the amount you may insert { `assetId`: "ID of the asset to be sent", `coins:` 0}.
- `transfers`  an array of objects:
  { `recipient`: string – address/alias, `amount`: number/string/MoneyLike }
- `*fee`: MoneyLike – fee.
- `attachment`: [,140 bytes]: string or byte array – arbitrary binary data (typically a comment to transfer).
- `*senderPublicKey`: string – user's public key in base58.
- `*timestamp`: number/string – time in ms.

Example:

```js
KeeperWallet.signAndPublishTransaction({
  type: 11,
  data: {
    totalAmount: { assetId: 'WAVES', coins: 0 },
    transfers: [
      { recipient: 'alias1', amount: '200000' },
      { recipient: 'alias2', amount: '200000' },
    ],
    fee: {
      tokens: '0.002',
      assetId: 'WAVES',
    },
  },
})
  .then(tx => {
    console.log("Hurray! I've sent hi to my friends!!!");
  })
  .catch(error => {
    console.error('Something went wrong', error);
  });
```

In case of success, 0.00200000 WAVES will be sent to alias1 and alias2.

##### Data transaction (type 12)

See [Data transaction details](https://docs.waves.tech/en/blockchain/transaction-type/data-transaction) in the Waves protocol documentation.

Fields:

- `data`: array of objects:
  - `type`: "binary"/string/"integer"/"boolean" – entry type.
  - `key`: string – entry key.
  - `value`: string(base64)/string/number/boolean, depending on `type`. `null` to delete the entry.
- `*version`: number – transaction version.
- `*fee`: MoneyLike – fee.
- `*senderPublicKey`: string – user's public key in base58.
- `*timestamp`: number/string – time in ms.

Example:

```js
KeeperWallet.signAndPublishTransaction({
  type: 12,
  data: {
    data: [
      {
        key: 'string',
        value: 'testVdfgdgf dfgdfgdfg dfg dfg al',
        type: 'string',
      },
      {
        key: 'binary',
        value: 'base64:AbCdAbCdAbCdAbCdAbCdAbCdAbCdAbCdAbCdAbCdAbCd',
        type: 'binary',
      },
      { key: 'integer', value: 20, type: 'integer' },
      { key: 'boolean', value: false, type: 'boolean' },
    ],
    fee: {
      tokens: '0.01',
      assetId: 'WAVES',
    },
  },
})
  .then(tx => {
    console.log("Hurray! I've saved data!!!");
  })
  .catch(error => {
    console.error('Something went wrong', error);
  });
```

In case of success, new data is stored in the account data storage.

To delete an entry, pass the entry `key` along with `value: null`. Entry deletion is available from version 2, so the `version` field is required.

Example:

```js
KeeperWallet.signAndPublishTransaction({
  type: 12,
  data: {
    version: 2,
    data: [{ key: 'binary', value: null }],
    fee: {
      tokens: '0.001',
      assetId: 'WAVES',
    },
  },
})
  .then(tx => {
    console.log("Hurray! I've deleted data!!!");
  })
  .catch(error => {
    console.error('Something went wrong', error);
  });
```

##### Set Script transaction (type 13)

See [Set Script transaction details](https://docs.waves.tech/en/blockchain/transaction-type/set-script-transaction) in the Waves protocol documentation.

Fields:

- `script`: string – account script or dApp script (see the [Smart Account](https://docs.waves.tech/en/building-apps/smart-contracts/what-is-smart-account) and [dApp](https://docs.waves.tech/en/building-apps/smart-contracts/what-is-a-dapp) articles in the Waves protocol documentation.
- `*fee`: MoneyLike – fee.
- `*senderPublicKey`: string – user's public key in base58.
- `*timestamp`: number/string – time in ms.

To develop and compile the script, use [Waves IDE](https://waves-ide.com/).

Example:

```js
KeeperWallet.signAndPublishTransaction({
  type: 13,
  data: {
    script:
      'base64:BQkACccAAAADCAUAAAACdHgAAAAJYm9keUJ5dGVzCQABkQAAAAIIBQAAAAJ0eAAAAAZwcm9vZnMAAAAAAAAAAAAIBQAAAAJ0eAAAAA9zZW5kZXJQdWJsaWNLZXmfT++m',
    fee: {
      tokens: '0.01',
      assetId: 'WAVES',
    },
  },
})
  .then(tx => {
    console.log("Hurray! I've added a script!!!");
  })
  .catch(error => {
    console.error('Something went wrong', error);
  });
```

In case of success, a new script will be added to the account (be careful!).

For cancelling a script set `script: null` or `script: ''`.

Example 2:

```js
KeeperWallet.signAndPublishTransaction({
  type: 13,
  data: {
    script: '',
    fee: {
      tokens: '0.04',
      assetId: 'WAVES',
    },
  },
})
  .then(tx => {
    console.log("Hurray! I've cancelled a script!!!");
  })
  .catch(error => {
    console.error('Something went wrong', error);
  });
```

In case of success, the script is removed from the account.

##### Sponsor Fee transaction (type 14)

See [Sponsor Fee transaction details](https://docs.waves.tech/en/blockchain/transaction-type/sponsor-fee-transaction) in the Waves protocol documentation.

Fields:

- `minSponsoredAssetFee`: MoneyLike – amount of the sponsored asset that is equivalent to 0.001 WAVES.
- `*fee`: MoneyLike – fee.
- `*senderPublicKey`: string – user's public key in base58.
- `*timestamp`: number/string – time in ms.

Example:

```js
KeeperWallet.signAndPublishTransaction({
  type: 14,
  data: {
    minSponsoredAssetFee: {
      assetId: '6frvwF8uicAfyEfTfyC2sXqBJH7V5C8he5K4YH3BkNiS',
      tokens: 0.1,
    },
    fee: {
      tokens: '1',
      assetId: 'WAVES',
    },
  },
})
  .then(tx => {
    console.log("Hurray! I've become a sponsor!!!");
  })
  .catch(error => {
    console.error('Something went wrong', error);
  });
```

In case of success, fees for Transfer and Invoke Script transactions can be paid in the asset.

##### Set Asset Script transaction (type 15)

See [Set Asset Script transaction details](https://docs.waves.tech/en/blockchain/transaction-type/set-asset-script-transaction) in the Waves protocol documentation.

Fields:

- `assetId`: string – asset ID in base58.
- `script`: string – asset script, see the [Smart Asset](https://docs.waves.tech/en/building-apps/smart-contracts/what-is-smart-asset) article in the Waves protocol documentation.
- `*fee`: MoneyLike – fee.
- `*senderPublicKey`: string – user's public key in base58.
- `*timestamp` number/string – time in ms.

It's impossible to remove the asset script; you can only change the script. To develop and compile the script, use [Waves IDE](https://waves-ide.com/).

Example:

```js
KeeperWallet.signAndPublishTransaction({
  type: 15,
  data: {
    assetId: '',
    script: 'base64:BQbtKNoM',
    fee: {
      tokens: '0.01',
      assetId: 'WAVES',
    },
  },
})
  .then(tx => {
    console.log('Hurray! I have reset a script to the asset!!!');
  })
  .catch(error => {
    console.error('Something went wrong', error);
  });
```

In case of success, the asset's script is reset.

##### Invoke Script transaction (type 16)

See [Invoke Script transaction details](https://docs.waves.tech/en/blockchain/transaction-type/invoke-script-transaction) in the Waves protocol documentation.

Fields:

- `dApp` string – address of the dApp account.
- `call` — object:
  - `function`: string – function name.
  - `args` — array of objects:
    - `type`: "binary"/string/"integer"/"boolean"/"list" – argument type.
    - `value`: string(base64)/string/number/boolean/array – argument value.
- `*fee`: MoneyLike – fee.
- `*payment`: array of MoneyLike.
- `*version`: number — transaction version
- `*senderPublicKey`: string – user's public key in base58.
- `*timestamp`: number/string – time in ms.

Example:

```js
KeeperWallet.signAndPublishTransaction({
  type: 16,
  data: {
    fee: {
      tokens: '0.05',
      assetId: 'WAVES',
    },
    dApp: '3N27HUMt4ddx2X7foQwZRmpFzg5PSzLrUgU',
    call: {
      function: 'tellme',
      args: [
        {
          type: 'string',
          value: 'Will?',
        },
      ],
    },
    payment: [{ assetId: 'WAVES', tokens: 2 }],
  },
})
  .then(tx => {
    console.log('Hurray! I've invoked the script!!!');
  })
  .catch(error => {
    console.error('Something went wrong', error);
  });
```

In case of success, the callable function `tellme` of Testnet account `3N27HUMt4ddx2X7foQwZRmpFzg5PSzLrUgU` will be invoked.

An example of an invocation of a function with a list argument:

```js
KeeperWallet.signAndPublishTransaction({
  type: 16,
  data: {
    dApp: '3N28o4ZDhPK77QFFKoKBnN3uNeoaNSNXzXm',
    call: {
      function: 'foo',
      args: [
        {
          type: 'list',
          value: [
            { type: 'string', value: 'alpha' },
            { type: 'string', value: 'beta' },
            { type: 'string', value: 'gamma' },
          ],
        },
      ],
    },
    payment: [],
    fee: {
      tokens: '0.005',
      assetId: 'WAVES',
    },
  },
})
  .then(tx => {
    console.log("Hurray! I've invoked the script!!!");
  })
  .catch(error => {
    console.error('Something went wrong', error);
  });
```

##### Update Asset Info transaction (type 17)

See [Update Asset Info transaction details](https://docs.waves.tech/en/blockchain/transaction-type/update-asset-info-transaction) in the Waves protocol documentation.

Fields:

- `name`: [4..16 bytes] string – token name.
- `description`: [0..1000 bytes] string – token description.
- `*fee`: MoneyLike – fee.
- `*senderPublicKey`: string – user's public key in base58.
- `*timestamp`: number/string – time in ms.

Example:

```js
KeeperWallet.signAndPublishTransaction({
  type: 17,
  data: {
    name: 'New name',
    description: 'New description',
    assetId: 'DS5fJKbhKDaFfcRpCd7hTcMqqxsfoF3iY9yEcmsTQV1T',
    fee: {
      assetId: 'WAVES',
      tokens: '0.001',
    },
  },
})
  .then(tx => {
    console.log("Hurray! I've renamed the asset!!!");
  })
  .catch(error => {
    console.error('Something went wrong', error);
  });
```

#### signOrder

Keeper Wallet's method for signing an order to the matcher (exchange service). As input, it accepts an object similar to a transaction like this:

```js
{
    data: {
        ...data
    }
}
```

See [order details](https://docs.waves.tech/en/blockchain/order) in the Waves protocol documentation.

See [how to calculate the order fee](https://docs.waves.exchange/en/waves-matcher/matcher-fee) in Waves.Exchange documentation.

Fields:

- `*version`: 1,2,3.
- `amount`: MoneyLike – amount.
- `price`: MoneyLike – price.
- `orderType`: 'sell'/'buy' – order type.
- `matcherFee`: MoneyLike – order fee.
- `matcherPublicKey`: string – public key of the matcher in base58.
- `expiration`: string/number – the order's expiration time in ms.
- `*timestamp`: string/number – current time in ms.
- `*senderPublicKey`: string – user's public key in base58.

Example:

```js
KeeperWallet.signOrder({
  data: {
    matcherPublicKey: '9cpfKN9suPNvfeUNphzxXMjcnn974eme8ZhWUjaktzU5',
    orderType: 'sell',
    expiration: Date.now() + 100000,
    amount: {
      tokens: '100',
      assetId: 'WAVES',
    },
    price: {
      tokens: '0.01',
      assetId: '8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS',
    },
    matcherFee: {
      tokens: '0.1',
      assetId: 'WAVES',
    },
  },
});
then(tx => {
  console.log("Hurray! I've signed an order!!!");
}).catch(error => {
  console.error('Something went wrong', error);
});
```

Response: a line with data for sending to the matcher.

Possible errors:

- `{ message: "User denied message", code: 10 }` – the user rejected the request.
- `{ message: "Api rejected by user", code: 12 }` — the website was previously blocked by the user.
- `{ message: "Invalid data", data: "Reason", code: 9 }` – invalid/incomplete request data.

#### signAndPublishOrder

Keeper Wallet's method for creating an order to the matcher is identical to `signOrder`, but it also tries to send data to the matcher.

Response: the matcher's reply line about successful creation of an order.

Possible errors:

- Same as for `signOrder`.
- `{message: "Failed request", data: "Error description", code: 15}` – a request has been signed, but not sent to the matcher.

#### signCancelOrder

Keeper Wallet's method for signing cancellation of an order to the matcher. As input, it accepts an object similar to a transaction like this:

```js
{
    data: {
        ...data
    }
}
```

Fields:

- `id`: string – order ID in base58.
- `*senderPublicKey`: string – user's public key in base58.

Example:

```js
KeeperWallet.signCancelOrder({
  data: {
    id: '31EeVpTAronk95TjCHdyaveDukde4nDr9BfFpvhZ3Sap',
  },
});
```

Response: a data line for sending to the matcher.

Possible errors:

- `{ message: "User denied message", code: 10 }` – the user rejected the request.
- `{ message: "Api rejected by user", code: 12 }` — the website was previously blocked by the user.
- `{ message: "Invalid data", data: "Reason", code: 9 }` – invalid/incomplete request data.

#### signAndPublishCancelOrder

Keeper Wallet's method for cancelling an order to the matcher. It works identically to `signCancelOrder`, but also tries to send data to the matcher. You should specify two more fields: `priceAsset` and `amountAsset` from the order.

Example:

```js
KeeperWallet.signAndPublishCancelOrder({
  priceAsset: 'WAVES',
  amountAsset: '8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS',
  data: {
    id: '31EeVpTAronk95TjCHdyaveDukde4nDr9BfFpvhZ3Sap',
  },
})
  .then(() => {
    console.log("Hurray! I've cancelled the order");
  })
  .catch(error => {
    console.error('Something went wrong', error);
  });
```

Response: data returned by the matcher.

Possible errors:

- Same as for `signCancelOrder`.
- `{message: "Failed request", data: "Error description", code: 15}` – a request has been signed, but not sent to the matcher.

#### signRequest

Keeper Wallet's method for signing typified data, for signing requests on various services. As input, it accepts an object similar to a transaction like this:

```js
{
    type: number,
    data: {
        ...data
    }
}
```

Currently, the method supports only signing data for a request to the matcher for your orders.

Fields:

- `timestamp`: number/string – time in ms.
- `*senderPublicKey`: string – user's public key in base58.

Example:

```js
KeeperWallet.signRequest({
  data: {
    timestamp: 234234242423423,
  },
});
```

Response: a line with a signature in base58.

Possible errors:

- `{ message: "User denied message", code: 10 }` – the user rejected the request.
- `{ message: "Api rejected by user", code: 12 }` — the website was previously blocked by the user.
- `{ message: "Invalid data", data: "Reason", code: 9 }` – invalid/incomplete request data.

#### signCustomData

Keeper Wallet's method for signing a custom data for different services. It accepts an object:

##### Version 1

- `version`: 1
- `binary`: string 'base64:....'.

Note: This method adds the `[255, 255, 255, 1]` prefix to the signed bytes. This was done to make it impossible to sign transaction data in this method, which can lead to unauthenticated transactions and phishing. For the details check [serializeCustomData](https://github.com/wavesplatform/waves-transactions/blob/master/src/requests/custom-data.ts#L63) method in waves-transactions library.

Example:

```js
KeeperWallet.signCustomData({
  version: 1,
  binary: 'base64:AADDEE==',
});
```

Response:

```
   {
        version: 1,
        binary: 'base64:AADDEE==',
        signature: '...',
        publicKey: '...'
   }
```

Possible errors:

- `{ message: "User denied message", code: 10 }` – the user rejected the request.
- `{ message: "Api rejected by user", code: 12 }` — the website was previously blocked by the user.
- `{ message: "Invalid data", data: "Reason", code: 9 }` – invalid/incomplete request data.

##### Version 2

- `version`: 2
- `data`: array of objects:
  - `type`: "binary"/string/"integer"/"boolean" – field type.
  - `key`: string – field name.
  - `value`: string(base64)/string/number/boolean

Bytes to sign: [255, 255, 255, 2, ...(from data array to bin)]. For the details check [serializeCustomData](https://github.com/wavesplatform/waves-transactions/blob/master/src/requests/custom-data.ts#L63) method in waves-transactions library.

Example:

```js
KeeperWallet.signCustomData({
  version: 2,
  data: [{ type: 'string', key: 'name', value: 'Mr. First' }],
});
```

Response:

```
   {
        version: 2,
        data: [{ type: 'string', key: 'name', value: 'Mr. First' }]
        signature: '...',
        publicKey: '...'
   }
```

Possible errors:

- `{ message: "User denied message", code: 10 }` – the user rejected the request.
- `{ message: "Api rejected by user", code: 12 }` — the website was previously blocked by the user.
- `{ message: "Invalid data", data: "Reason", code: 9 }` – invalid/incomplete request data.

#### verifyCustomData

Validate custom data:

```js
{
    version: 1,
    binary: 'base64:AADDEE==',
    signature: '...',
    publicKey: '...'
}
```

or

```js
{
    version: 2,
    data: [{ type: 'string', key: 'name', value: 'Mr. First' }],
    signature: '...',
    publicKey: '...'
}
```

Example:

```js
KeeperWallet.verifyCustomData({
  version: 1,
  binary: 'base64:AADDEE==',
  publicKey: '3BvAsKuGZe2LbSwKr9SA7eSXcNDKnRqN1j2K2bZaTn5X',
  signature:
    '2bLJYR68pwWrUUoatGbySz2vfY76VtzR8TScg1tt5f9DVDsFDCdecWrUiR4x6gFBnwF4Y51uszpouAwtSrg7EcGg',
}).then(result => {
  console.log(result);
});
```

Response: true/false.

Possible errors:

- `{ message: "User denied message", code: 10 }` – the user rejected the request.
- `{ message: "Api rejected by user", code: 12 }` — the website was previously blocked by the user.

#### resourceIsApproved

Check whether the user allowed your website to access Keeper Wallet.

Example:

```js
KeeperWallet.resourceIsApproved().then(result => {
  console.log(result);
});
```

Response: true/false.

#### resourceIsBlocked

Check whether the user blocked your website in Keeper Wallet.

Example:

```js
KeeperWallet.resourceIsBlocked().then(result => {
  console.log(result);
});
```

Response: true/false.
