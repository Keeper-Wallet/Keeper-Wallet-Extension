# Keeper Wallet

[![""](https://badgen.net/chrome-web-store/v/lpilbniiabackdjcionkobglmddfbcjo)](https://chrome.google.com/webstore/detail/keeper-wallet/lpilbniiabackdjcionkobglmddfbcjo)
[![""](https://badgen.net/chrome-web-store/users/lpilbniiabackdjcionkobglmddfbcjo)](https://chrome.google.com/webstore/detail/keeper-wallet/lpilbniiabackdjcionkobglmddfbcjo)
[![""](https://badgen.net/chrome-web-store/rating/lpilbniiabackdjcionkobglmddfbcjo)](https://chrome.google.com/webstore/detail/keeper-wallet/lpilbniiabackdjcionkobglmddfbcjo)

[![""](https://badgen.net/amo/v/waves-keeper)](https://addons.mozilla.org/ru/firefox/addon/waves-keeper/)
[![""](https://badgen.net/amo/users/waves-keeper)](https://addons.mozilla.org/ru/firefox/addon/waves-keeper/)
[![""](https://badgen.net/amo/rating/waves-keeper)](https://addons.mozilla.org/ru/firefox/addon/waves-keeper/reviews/)

[en](./README.md) | ru

Keeper Wallet — это расширение для браузера, которое обеспечивает безопасное взаимодействие с веб-сервисами на блокчейне Waves.

Секретные фразы и приватные ключи зашифрованы и хранятся в расширении, и у онлайн-приложений и сервисов нет к ним доступа. Это обеспечивает защиту средств пользователей от хакеров и вредоносных веб-сайтов. Завершение транзакции не требует ввода конфиденциальной информации.

Keeper Wallet разработан для удобства, чтобы пользователи могли подписывать транзакции в один клик и легко переключаться между несколькими аккаунтами. При потере пароля можно восстановить доступ к аккаунтам с помощью секретных фраз или из резервной копии.

[Документация протокола Waves](https://docs.waves.tech/ru/)

## Keeper Wallet API

На страницах браузера, работающих по протоколу `http/https` (но не на локальных страницах с протоколом `file://`), с установленным расширением Keeper Wallet становится доступным глобальный объект `KeeperWallet`.

В объекте `KeeperWallet` вы найдете следующие методы:

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

> Все методы, кроме `on`, работают асинхронно и возвращают [Promise](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise).

В коде вы можете использовать [типы TypeScript](https://github.com/wavesplatform/waveskeeper-types).

В Keeper Wallet, для большей безопасности и удобства использования,
каждый новый сайт, использующий API, должен быть разрешен пользователем.
При первой попытке использования API (кроме `on`) пользователю будет показан запрос на
разрешение работы Keeper Wallet с этим сайтом. Если пользователь согласен дать доступ,
сайт становится доверенным, и получает возможность использовать API на своих страницах.
В противном случае сайт блокируется и на все запросы будет возвращена ошибка
`{message: "Api rejected by user", code: 12}`, пользователь не увидит новых уведомлений.
Чтобы выдать доступ, пользователь должен из интерфейса сделать сайт доверенным.

### Описание методов

#### publicState

Если сайт доверенный, возвращает публичные данные Keeper.

Пример:

```js
KeeperWallet.publicState()
  .then(state => {
    console.log(state); //вывод в консоль результата
    /*...обработка данных */
  })
  .catch(error => {
    console.error(error); //вывод в консоль результата
    /*...обработка ошибок */
  });
```

или

```js
const getPublicState = async () => {
  try {
    const state = await KeeperWallet.publicState();
    console.log(state); //вывод в консоль результата
    /*...обработка данных */
  } catch (error) {
    console.error(error); //вывод в консоль результата
    /*...обработка ошибок */
  }
};

const result = await getPublicState();
```

Ответ:

```json
{
    "initialized": true,
    "locked": true,
    "account": {
        "name": "foo",
        "publicKey": "bar",
        "address": "waves адрес",
        "networkCode": "байт сети",
        "balance": {
            "available": "баланс в waves",
            "leasedOut": "баланс в лизинге"
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

Поля ответа:

- `initialized`: boolean — признак того, что Keeper Wallet проинициализирован.
- `locked`: boolean — Keeper Wallet в режиме ожидания (требуется ввод пароля).
- `account` — текущий аккаунт, если пользователь разрешил сайту доступ, или `null` в противном случае.
- `network` — текущая сеть Waves, адрес ноды и матчера.
- `messages` — статусы запросов на подпись.
- `txVersion` — доступные версии транзакций для каждого типа.

Возможные ошибки:

- `{ message: "Init Keeper Wallet and add account" }` — Keeper Wallet не проинициализирован.
- `{ message: "Add Keeper Wallet account" }` — вход в Keeper Wallet выполнен, но в нем нет аккаунтов.
- `{ message: "User denied message" }` — пользователь запретил сайту работать с Keeper Wallet.

#### encryptMessage

Вы можете зашифровать текст для конкретного пользователя сети Waves, зная его публичный ключ.

KeeperWallet.encryptMessage(`текст для шифрования`, `публичный ключ в кодировке base58`, `префикс: строка, уникальная для каждого приложения`)

Пример:

```js
KeeperWallet.encryptMessage(
  'My message',
  '416z9d8DQDy5MPTqDhvReRBaPb19gEyVRWvHcewpP6Nc',
  'для меня',
).then(encryptedMessage => {
  console.log(encryptedMessage);
});
```

Возможные ошибки

- `{ message: "Init Keeper Wallet and add account" }` — Keeper Wallet не проинициализирован.
- `{ message: "App is locked" }` — Keeper Wallet в режиме ожидания (требуется ввод пароля).
- `{ message: "Add Keeper Wallet account" }` — вход в Keeper Wallet выполнен, но в нем нет аккаунтов.
- `{ message: "User denied message" }` — пользователь запретил сайту работать с Keeper Wallet.

#### decryptMessage

Вы можете расшифровать сообщение, зашифрованное для вас пользователем сети Waves, зная публичный ключ отправителя.

```js
KeeperWallet.decryptMessage(
  `зашифрованный текст`,
  `публичный ключ в кодировке base58`,
  `префикс: строка, уникальная для каждого приложения`,
);
```

Пример:

```js
KeeperWallet.decryptMessage(
  '**encrypted msg**',
  '416z9d8DQDy5MPTqDhvReRBaPb19gEyVRWvHcewpP6Nc',
).then(message => {
  console.log(message);
});
```

Возможные ошибки:

- `{ message: "Init Keeper Wallet and add account" }` — Keeper Wallet не проинициализирован.
- `{ message: "App is locked" }` — Keeper Wallet в режиме ожидания (требуется ввод пароля).
- `{ message: "Add Keeper Wallet account" }` — вход в Keeper Wallet выполнен, но в нем нет аккаунтов.
- `{ message: "User denied message" }` — пользователь запретил сайту работать с Keeper Wallet.

#### on

Позволяет подписаться на события из Keeper Wallet.

Поддерживает события:

- `update` — подписаться на изменения стейта.

Пример:

```js
KeeperWallet.on('update', state => {
  //state — объект как из KeeperWallet.publicState
});
```

Если сайт не является доверенным, то события приходить не будут.

### notification

Метод для отправки пользователю сообщения от сайта. Отправка возможна, если у сайта есть разрешением на отправку сообщений, и не чаще 1 раза в 30 секунд.

`notification` может принимать на вход следующие данные:

- `title` — строка, не более 20 символов (обязательное поле).
- `message` — строка, не более 250 символов (необязательное поле).

Возвращает `Promise`.

Пример:

```js
KeeperWallet.notification({
  title: 'Hello!',
  message: 'Congratulation!!!',
});
```

Возможные ошибки:

- `{message: "Incorrect notification data", data: "title has more than 20 characters", code: "19"}` — длинный заголовок.
- `{message: "Incorrect notification data", data: null, code: "19"}` — некорректное сообщение.
- `{message: "Can't sent notification", data: {msg: "Min notification interval 30s. Wait 28.017s."}, code: "18"}` — повторите отправку позже, вы можете отправить не более 1 сообщения каждые 30 секунд.
- `{message: 'User denied message', data: 'rejected', code: '10'}` — пользователь отклонил запрос.
- `{message: 'User denied message', data: 'rejected_forever', code: '10'}` — пользователь отклонил запрос доступа и заблокировал сайт.
- `{ message: "Api rejected by user", code: 12 }` — сайт уже заблокирован пользователем ранее или отправка сообщений не разрешена.

#### auth

Метод для получения подписи авторизационных данных при подтверждении пользователя Waves.
Проверив достоверность подписи, вы сможете убедиться, что аккаунт Waves принадлежит именно этому пользователю.

Пример:

```js
const authData = { data: 'Auth on my site' };
KeeperWallet.auth(authData)
  .then(auth => {
    console.log(auth); //вывод в консоль результата
    /*...обработка данных */
  })
  .catch(error => {
    console.error(error); //вывод в консоль результата
    /*...обработка ошибок */
  });
```

или

```js
const getAuthData = async authData => {
  try {
    const state = await KeeperWallet.auth(authData);
    console.log(state); //вывод в консоль результата
    /*...обработка данных */
  } catch (error) {
    console.error(error); //вывод в консоль результата
    /*...обработка ошибок */
  }
};

const authData = { data: 'Auth on my site' };
getAuthData(authData);
```

`auth` может принимать на вход следующие данные:

- `name` — название сервиса (необязательное поле).
- `data` — строка с любыми данными (обязательное поле).
- `referrer` — полный URL для редиректа (необязательное поле).
- `icon` — путь к логотипу относительно `referrer` или origin сайта (необязательное поле).
- `successPath` — относительный путь к API аутентификации сайта (необязательное поле).

Например

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
    //data - данные от кипера
    //проверка подписи и сохранение адреса...
    console.log(data);
  })
  .catch(error => {
    //обработка ошибки
  });
```

При удачном подтверждении Keeper Wallet вернет в `Promise` объект, содержащий данные для проверки подписи:

- `host` — хост, запросивший подпись.
- `name` — название приложения, запросившего подпись.
- `prefix` — префикс подписанных данных.
- `address` — адрес аккаунта Waves.
- `publicKey` — публичный ключ пользователя.
- `signature` — подпись.
- `version` — версия API.

Возможные ошибки:

- `{message: "Invalid data", data: "[{"field":"data","type":"string","message":"field is required"}]", code: 9}` — подписываемые данные содержат ошибку.
- `{message: "User denied message", code: 10}` — пользователь отклонил запрос.
- `{message: "Api rejected by user", code: 12}` — сайт уже заблокирован пользователем.

<details><summary><a id="validity"></a><b>Как проверить валидность подписи</b></summary>

Подписанные данные состоят из трех частей: `prefix` (строка `WavesWalletAuthentication`) + `host` + предоставленные вами данные. Все строки конвертируются в `length bytes` + `value bytes`, как в транзакции данных. `prefix` и `host` нужны в целях безопасности, на случай, если вредоносный сервис попытается использовать данные и подпись.

Мы рекомендуем использовать валидацию адреса на случай, если подпись и публичный ключ действительны, но адрес был подменен.

##### Пример кода на TypeScript

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

// Получение подписи
const data = await KeeperWallet.auth({ data: '123' });

authValidate(data, { host: data.host, data: '123' }); // true
```

##### Пример кода на JS

```js
import { verifyAuthData, libs } from '@waves/waves-transactions';

const authValidate = (signature, data, publicKey, chainId) => {
  const chain =
    typeof chainId === 'string' ? chainId : String.fromCharCode(chainId);
  const address = libs.crypto.address({ publicKey }, chain);
  return verifyAuthData({ publicKey, address, signature }, data);
};

// Получение подписи
const data = await KeeperWallet.auth({ data: '123' });

authValidate(data, { host: data.host, data: '123' }); // true
```

##### Пример кода на Python

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

##### Пример кода на PHP

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

Метод для подписания транзакций в сети Waves. Описание поддерживаемых транзакций см. в разделе [Транзакции](#транзакции) ниже.

Пример:

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
    //data - строка, готовая для отправки на ноду (сервер) сети Waves
  })
  .catch(error => {
    //Обработка ошибок
  });
```

> API возвращает строки, а не объект, так как в JavaScript при работе с 8-байтными целыми (long) происходит потеря точности.

В примере мы подписываем транзакцию на перевод токенов WAVES на псевдоним `test` в сети Waves.

Ответ:

```json
{
  "version": 2,
  "assetId": "",
  "amount": 156700000,
  "feeAssetId": "",
  "fee": 100000,
  "recipient": "получатель",
  "attachment": "",
  "timestamp": 1548770230589,
  "senderPublicKey": "публичный ключ",
  "proofs": ["подпись"],
  "type": 4
}
```

Возможные ошибки:

- `{message: "User denied message", code: 10}` — пользователь отклонил запрос.
- `{message: "Api rejected by user", code: 12}` — сайт уже заблокирован пользователем.
- `{message: "Invalid data", data: "Причина", code: 9}` — неверные/неполные данные запроса.

#### signAndPublishTransaction

Аналогичен `signTransaction`, но еще отправляет транзакцию в блокчейн. Описание поддерживаемых транзакций см. в разделе [Транзакции](#транзакции) ниже.

Пример:

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
    //data - строка готовая для отсылки на ноду(сервер) сети Waves
  })
  .catch(error => {
    //Обработка ошибок
  });
```

Ответ: возвращаемый в виде строки ответ от сети Waves — полное содержание прошедшей транзакции.

Возможные ошибки:

- Те же, что в `signTransaction`.
- `{message: "Failed request", data: "Описание ошибки", code: 15}` — транзакция подписана, но не отправлена в сеть.

### signTransactionPackage

Пакетное подписание транзакций. Иногда надо подписать сразу несколько транзакций, и для удобства пользователя допускается подписывать до 7 транзакций одновременно. Описание поддерживаемых транзакций см. в разделе [Транзакции](#транзакции) ниже.

Пример:

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

Подписать 2 транзакции:

- Перевод 1,567 WAVES на псевдоним `test`.
- Перевод 0.1 WAVES на псевдоним `merry`.

Ответ: массив из двух строк — подписанных и готовых к отправке транзакций.

Возможные ошибки: те же, что в `signTransaction`.

#### Транзакции

У каждого пользователя в сети waves есть стейт (балансы, ассеты, данные, скрипты), и любая прошедшая транзакция меняет эти данные. [Подробнее о транзакциях](https://docs.waves.tech/en/building-apps/waves-api-and-sdk/client-libraries/waves-transactions)

В Keeper Wallet API формат транзакции отличается от [Node REST API](https://docs.waves.tech/ru/waves-node/node-api/). Методы `signTransaction`, `signAndPublishTransaction` и `signTransactionPackage` принимают транзакции в следующем виде:

```js
{
    type: number, //тип транзакции
    data: {
        ... //данные транзакции
    }
}
```

Keeper Wallet поддерживает следующие типы транзакций:

- [Транзакция выпуска (тип 3)](#транзакция-выпуска-тип-3)
- [Транзакция перевода (тип 4)](#транзакция-перевода-тип-4)
- [Транзакция довыпуска (тип 5)](#транзакция-довыпуска-тип-5)
- [Транзакция сжигания токена (тип 6)](#транзакция-сжигания-токена-тип-6)
- [Транзакция лизинга (тип 8)](#транзакция-лизинга-тип-8)
- [Транзакция отмены лизинга (тип 9)](#транзакция-отмены-лизинга-тип-9)
- [Транзакция создания псевдонима (тип 10)](#транзакция-создания-псевдонима-тип-10)
- [Транзакция массового перевода (тип 11)](#транзакция-массового-перевода-тип-11)
- [Транзакция данных (тип 12)](#транзакция-данных-тип-12)
- [Транзакция установки скрипта (тип 13)](#транзакция-установки-скрипта-тип-13)
- [Транзакция спонсирования (тип 14)](#транзакция-спонсирования-тип-14)
- [Транзакция установки скрипта ассета (тип 15)](#транзакция-установки-скрипта-ассета-тип-15)
- [Транзакция вызова скрипта (тип 16)](#транзакция-вызова-скрипта-тип-16)
- [Транзакция обновления информации ассета (тип 17)](#транзакция-обновления-информации-ассета-тип-17)

Условные обозначения:

> \* — необязательное поле, данные подставятся автоматически из `KeeperWallet`.
> [x,y] — ограничение длины от x до y.
> [,x] — ограничение длины до x.
> [y,] — ограничение длины от y.
> [x-y] — число от x до y.
> x/y — x или y.
> (JLM) — JAVA LONG MAX = 9 223 372 036 854 775 807
> MoneyLike — стоимость.

MoneyLike может иметь вид:

- `{ tokens: 1, assetId: "WAVES" }`
- `{ coins: 100000000, assetId: "WAVES" }`;

В обеих записях указана одинаковая сумма: 1 WAVES. Можно свободно перевести `coins` в `tokens` и обратно, зная, в каком ассете указана сумма, и количество знаков после запятой: `tokens = coins / (10 ** precision)`.

Если в поле указаны дополнительные типы, кроме MoneyLike, например string/MoneyLike, сумма указывается числом в `coins`.

##### Комиссия за транзакцию

Как рассчитывается минимальная комиссия, см. в разделе [Комиссия за транзакцию](https://docs.waves.tech/ru/blockchain/transaction/transaction-fee) документации протокола Waves.

##### Транзакция выпуска (тип 3)

Подробное [описание транзакции выпуска](https://docs.waves.tech/ru/blockchain/transaction-type/issue-transaction) приведено в документации протокола Waves.

Поля:

- `name`: [4, 16 байт] string — имя токена.
- `description`: [0, 1000 байт] string — описание токена.
- `quantity`: [0 - (JLM)] number/string — количество токена.
- `precision`: [0 - 8] number — точность (количество знаков после запятой).
- `reissuable`: true|false — флаг возможности довыпуска.
- `*fee`: MoneyLike — комиссия за транзакцию.
- `*script`: string — скрипт ассета, см. раздел [Смарт-ассет](https://docs.waves.tech/ru/building-apps/smart-contracts/what-is-smart-asset).
- `*senderPublicKey`: string — публичный ключ пользователя в кодировке base58.
- `*timestamp`: number/string — время в миллисекундах.

Пример:

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
    console.log('Ура! Я создал свой ассет!!!');
  })
  .catch(error => {
    console.error('Что-то пошло не так', error);
  });
```

В случае успеха будет выпущен новый ассет в количестве 1 000 000, и на балансе пользователя будет отображаться 10 000.00 Best Token.

##### Транзакция перевода (тип 4)

Подробное [описание транзакции перевода](https://docs.waves.tech/ru/blockchain/transaction-type/transfer-transaction) приведено в документации протокола Waves.

Поля:

- `amount`: MoneyLike — количество токена.
- `recipient`: string — адрес или псевдоним получателя.
- `attachment`: [,140 байт] string or byte array — произвольные данные (обычно комментарий к транзакции).
- `*fee`: MoneyLike — комиссия за транзакцию.
- `*senderPublicKey`: string — публичный ключ пользователя в кодировке base58.
- `*timestamp`: number/string — время в миллисекундах.

Пример:

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
    console.log('Ура! Я смог отправить Waves!!!');
  })
  .catch(error => {
    console.error('Что-то пошло не так', error);
  });
```

##### Транзакция довыпуска (тип 5)

Подробное [описание транзакции довыпуска](https://docs.waves.tech/ru/blockchain/transaction-type/reissue-transaction) приведено в документации протокола Waves.

Поля:

- `assetId`: string — идентификатор ассета в кодировке base58.
- `quantity`: [0 - (JLM)] number/string/MoneyLike — количество ассета.
- `reissuable`: false — отмена возможности довыпуска.
- `*fee`: MoneyLike — комиссия за транзакцию.
- `*senderPublicKey`: string — публичный ключ пользователя в кодировке base58.
- `*timestamp`: number/string — время в миллисекундах.

Пример:

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
    console.log('Ура! Я довыпустил ассет!!!');
  })
  .catch(error => {
    console.error('Что-то пошло не так', error);
  });
```

В случае успеха аккаунт довыпускает ассет в количестве 1000, и на балансе добавляется 10.00 Best Token.

##### Транзакция сжигания токена (тип 6)

Подробное [описание транзакции сжигания токена](https://docs.waves.tech/ru/blockchain/transaction-type/burn-transaction) приведено в документации протокола Waves.

Поля:

- `assetId`: string — идентификатор ассета в кодировке base58.
- `amount`: [0 - (JLM)] number/string/MoneyLike — количество ассета.
- `*fee`: MoneyLike — комиссия за транзакцию.
- `*senderPublicKey`: string — публичный ключ пользователя в кодировке base58.
- `*timestamp`: number/string — время в миллисекундах.

Пример:

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
    console.log('Ура! Я сжег лишнее!!!');
  })
  .catch(error => {
    console.error('Что-то пошло не так', error);
  });
```

В случае успеха сжигается 1000 монет.

##### Транзакция лизинга (тип 8)

Подробное [описание транзакции лизинга](https://docs.waves.tech/ru/blockchain/transaction-type/lease-transaction) приведено в документации протокола Waves.

Поля:

- `recipient`: string — адрес или псевдоним получателя.
- `amount`: [0 - (JLM)] number/string/MoneyLike — количество.
- `*fee`: MoneyLike — комиссия за транзакцию.
- `*senderPublicKey`: string — публичный ключ пользователя в кодировке base58.
- `*timestamp`: number/string — время в миллисекундах.

Пример:

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
    console.log('Ура! Я смог передать в лизинг!!!');
  })
  .catch(error => {
    console.error('Что-то пошло не так', error);
  });
```

В случае успеха 0.00001000 WAVES передается в лизинг.

##### Транзакция отмены лизинга (тип 9)

Подробное [описание транзакции отмены лизинга](https://docs.waves.tech/ru/blockchain/transaction-type/lease-cancel-transaction) приведено в документации протокола Waves.

Поля:

- `leaseId`: string — идентификатор лизинга.
- `*fee`: MoneyLike — комиссия за транзакцию.
- `*senderPublicKey`: string — публичный ключ пользователя в кодировке base58.
- `*timestamp`: number/string — время в миллисекундах.

Пример:

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
    console.log('Ура! Я отменил лизинг!!!');
  })
  .catch(error => {
    console.error('Что-то пошло не так', error);
  });
```

В случае успеха лизинг прекращается.

##### Транзакция создания псевдонима (тип 10)

Подробное [описание транзакции создания псевдонима](https://docs.waves.tech/ru/blockchain/transaction-type/create-alias-transaction) приведено в документации протокола Waves.

Поля:

- `alias`: [4, 30 байт] string — псевдоним. См. [требования к псевдониму](https://docs.waves.tech/ru/blockchain/account/alias#%D1%82%D1%80%D0%B5%D0%B1%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F-%D0%BA-%D0%BF%D1%81%D0%B5%D0%B2%D0%B4%D0%BE%D0%BD%D0%B8%D0%BC%D1%83).
- `*fee`: MoneyLike — комиссия за транзакцию.
- `*senderPublicKey`: string — публичный ключ пользователя в кодировке base58.
- `*timestamp`: number/string — время в миллисекундах.

Пример:

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
    console.log('Ура! Теперь у меня есть псевдоним!!!');
  })
  .catch(error => {
    console.error('Что-то пошло не так', error);
  });
```

В случае успеха для адреса создается псевдоним (дополнительное имя).

##### Транзакция массового перевода (тип 11)

Подробное [описание транзакции массового перевода](https://docs.waves.tech/ru/blockchain/transaction-type/mass-transfer-transaction) приведено в документации протокола Waves.

Поля:

- `totalAmount`: MoneyLike — суммарное количество ассета; вместо вычисления можно указать { `assetId`: "ID of the asset to be sent", `coins`: 0}.
- `transfers` — массив объектов { `recipient`: string — адрес или псевдоним получателя, `amount`: number/string/MoneyLike }.
- `*fee`: MoneyLike — комиссия за транзакцию.
- `attachment`: [,140 байт] string or byte array — произвольные данные (обычно комментарий к транзакции).
- `*senderPublicKey`: string — публичный ключ пользователя в кодировке base58.
- `*timestamp`: number/string — время в миллисекундах.

Пример:

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
    console.log('Ура! Я друзьям отправил приветов!!!');
  })
  .catch(error => {
    console.error('Что-то пошло не так', error);
  });
```

В случае успеха на адреса alias1, alias2 придет по 0.00200000 Waves.

##### Транзакция данных (тип 12)

Подробное [описание транзакции данных](https://docs.waves.tech/ru/blockchain/transaction-type/data-transaction) приведено в документации протокола Waves.

Поля:

- `data`: массив объектов.
  - `type`: "binary"/string/"integer"/"boolean" — тип записи.
  - `key`: string — ключ записи.
  - `value`: string(base64)/string/number/boolean в зависимости от типа. `null` для удаления записи.
- `*version`: number — версия транзакции.
- `*fee`: MoneyLike — комиссия за транзакцию.
- `*senderPublicKey`: string — публичный ключ пользователя в кодировке base58.
- `*timestamp`: number/string — время в миллисекундах.

Пример:

```js
KeeperWallet.signAndPublishTransaction({
  type: 12,
  data: {
    data: [
      { key: 'string', value: 'testVal', type: 'string' },
      { key: 'binary', value: 'base64:AbCd', type: 'binary' },
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
    console.log('Ура! Я сохранил данные!!!');
  })
  .catch(error => {
    console.error('Что-то пошло не так', error);
  });
```

В случае успеха в хранилище данных аккаунта будут записаны новые данные.

Для удаления записи передайте ключ записи `key` вместе с `value: null`. Удаление записи доступно начиная с версии 2, поэтому необходимо указать поле `version`.

Пример:

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

##### Транзакция установки скрипта (тип 13)

Подробное [описание транзакции установки скрипта](https://docs.waves.tech/ru/blockchain/transaction-type/set-script-transaction) приведено в документации протокола Waves.

Поля:

- `script`: string — скрипт аккаунта или dApp-скрипт (см. разделы [Смарт-аккаунт](https://docs.waves.tech/ru/building-apps/smart-contracts/what-is-smart-account)) и [dApp](https://docs.waves.tech/ru/building-apps/smart-contracts/what-is-a-dapp) документации протокола Waves).
- `*fee`: MoneyLike — комиссия за транзакцию.
- `*senderPublicKey`: string — публичный ключ пользователя в кодировке base58.
- `*timestamp`: number/string — время в миллисекундах.

Для разработки и компиляции скрипта используйте [Waves IDE](https://waves-ide.com/).

Пример:

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
    console.log('Ура! Я поставил скрипт!!!');
  })
  .catch(error => {
    console.error('Что-то пошло не так', error);
  });
```

В случае успеха на аккаунте будет новый скрипт (будьте осторожны!).

Для удаления скрипта укажите `script: null` или `script: ''`.

Пример 2:

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
    console.log('Ура! Я отменил скрипт!!!');
  })
  .catch(error => {
    console.error('Что-то пошло не так', error);
  });
```

В случае успеха скрипт будет удален с аккаунта.

##### Транзакция спонсирования (тип 14)

Подробное [описание транзакции спонсирования](https://docs.waves.tech/ru/blockchain/transaction-type/sponsor-fee-transaction) приведено в документации протокола Waves.

Поля:

- `minSponsoredAssetFee`: MoneyLike — количество спонсорского ассета, эквивалентное 0,001 WAVES.
- `*fee`: MoneyLike — комиссия за транзакцию.
- `*senderPublicKey`: string — публичный ключ пользователя в кодировке base58.
- `*timestamp`: number/string — время в миллисекундах.

Пример:

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
    console.log('Ура! Я стал спонсором!!!');
  })
  .catch(error => {
    console.error('Что-то пошло не так', error);
  });
```

В случае успеха комиссия за транзакции перевода и вызова скрипта может быть оплачена ассетом.

##### Транзакция установки скрипта ассета (тип 15)

Подробное [описание транзакции установки скрипта ассета](https://docs.waves.tech/ru/blockchain/transaction-type/set-asset-script-transaction) приведено в документации протокола Waves.

Поля:

- `assetId`: string — идентификатор ассета в кодировке base58.
- `script` string — скрипт ассета, см. раздел [Смарт-ассет](https://docs.waves.tech/ru/building-apps/smart-contracts/what-is-smart-asset).
- `*fee`: MoneyLike — комиссия за транзакцию.
- `*senderPublicKey`: string — публичный ключ пользователя в кодировке base58.
- `*timestamp`: number/string — время в миллисекундах.

Удалить скрипт невозможно, только заменить. Для разработки и компиляции скрипта используйте [Waves IDE](https://waves-ide.com/).

Пример:

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
    console.log('Ура! Я переставил скрипт на ассете!!!');
  })
  .catch(error => {
    console.error('Что-то пошло не так', error);
  });
```

В случае успеха скрипт ассета будет перезаписан.

##### Транзакция вызова скрипта (тип 16)

Подробное [описание транзакции вызова скрипта](https://docs.waves.tech/ru/blockchain/transaction-type/invoke-script-transaction) приведено в документации протокола Waves.

Поля:

- `dApp`: string — адрес аккаунта dApp.
- `call` — объект:
  - `function`: string — имя функции.
  - `args` — массив объектов:
    - `type`: "binary"/string/"integer"/"boolean"/"list" — тип аргумента.
    - `value` string(base64)/string/number/boolean/массив — значение аргумента.
- `*fee`: MoneyLike — комиссия за транзакцию.
- `*payment`: массив MoneyLike.
- `*version`: number — версия транзакции.
- `*senderPublicKey`: string — публичный ключ пользователя в кодировке base58.
- `*timestamp`: number/string — время в миллисекундах.

Пример:

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
    console.log('Ура! Я выполнил скрипт!!!');
  })
  .catch(error => {
    console.error('Что-то пошло не так', error);
  });
```

В случае успеха будет вызвана функция `tellme` аккаунта `3N27HUMt4ddx2X7foQwZRmpFzg5PSzLrUgU` на Testnet.

Пример вызова функции, аргументом которой является список:

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
    console.log('Ура! Я выполнил скрипт!!!');
  })
  .catch(error => {
    console.error('Что-то пошло не так', error);
  });
```

##### Транзакция обновления информации ассета (тип 17)

Подробное [описание транзакции обновления информации ассета](https://docs.waves.tech/ru/blockchain/transaction-type/update-asset-info-transaction) приведено в документации протокола Waves.

Поля:

- `name`: [4,16 байт] string — имя токена.
- `description`: [0,1000 байт] string — описание токена.
- `*fee`: MoneyLike — комиссия за транзакцию.
- `*senderPublicKey`: string — публичный ключ пользователя в кодировке base58.
- `*timestamp`: number/string — время в миллисекундах.

Пример:

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

Метод Keeper Wallet для подписи ордера в матчер (сервис обмена). Принимает на вход объект, похожий на транзакцию:

```js
{
    data: {
        ...данные
    }
}
```

Подробное [описание ордера](https://docs.waves.tech/ru/blockchain/order) приведено в документации протокола Waves.

Как рассчитывается комиссия для ордера, см. в разделе [Комиссия матчера](https://docs.waves.exchange/ru/waves-matcher/matcher-fee) документации Waves.Exchange.

Поля:

- `*version`: 1,2,3.
- `amount`: MoneyLike — количество.
- `price`: MoneyLike — цена.
- `orderType`: 'sell'/'buy' — тип ордера.
- `matcherFee`: MoneyLike — комиссия ордера.
- `matcherPublicKey`: string — публичный ключ матчера в кодировке base58.
- `expiration`: string/number — время окончания срока действия ордера в миллисекундах.
- `*timestamp`: string/number — текущее время в миллисекундах.
- `*senderPublicKey`: string — публичный ключ пользователя в кодировке base58.

Пример:

```js
KeeperWallet.signOrder({
  data: {
    matcherPublicKey: '7kPFrHDiGw1rCm7LPszuECwWYL3dMf6iMifLRDJQZMzy',
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
      tokens: '0.03',
      assetId: 'WAVES',
    },
  },
})
  .then(tx => {
    console.log('Ура! Я подписал ордер!!!');
  })
  .catch(error => {
    console.error('Что-то пошло не так', error);
  });
```

Ответ: строка с данными для отправки на матчер.

Возможные ошибки:

- `{ message: "User denied message", code: 10 }` — пользователь отклонил запрос.
- `{ message: "Api rejected by user", code: 12 }` — сайт уже заблокирован пользователем.
- `{ message: "Invalid data", data: "Причина", code: 9 }` — неверные/неполные данные запроса.

#### signAndPublishOrder

Метод Keeper Wallet для создания ордера. Работает идентично `signOrder`, но еще пытается отправить ордер на матчер.

Ответ: строка ответ матчера об успешном создании ордера.

Возможные ошибки:

- Те же, что в `signOrder`.
- `{message: "Failed request", data: "Описание ошибки", code: 15}` — ордер подписан, но отправить его на матчер не удалось.

#### signCancelOrder

Метод Keeper Wallet для подписания отмены ордера. Принимает на вход объект, похожий на транзакцию:

```js
{
    data: {
        ...данные
    }
}
```

Поля:

- `id`: string — идентификатор ордера.
- `*senderPublicKey`: string — публичный ключ пользователя в кодировке base58.

Пример:

```js
KeeperWallet.signCancelOrder({
  data: {
    id: '31EeVpTAronk95TjCHdyaveDukde4nDr9BfFpvhZ3Sap',
  },
});
```

Ответ: строка с данными для отправки на матчер.

Возможные ошибки:

- `{ message: "User denied message", code: 10 }` — пользователь отклонил запрос.
- `{ message: "Api rejected by user", code: 12 }` — сайт уже заблокирован пользователем.
- `{ message: "Invalid data", data: "Причина", code: 9 }` — неверные/неполные данные запроса.

#### signAndPublishCancelOrder

Метод Keeper Wallet для отмены ордера. Работает идентично `signCancelOrder`, но еще и отправляет данные на матчер. Для этого необходимо дополнительно передать два поля из ордера: `priceAsset` и `amountAsset`.

Пример:

```js
KeeperWallet.signAndPublishCancelOrder({
  priceAsset: '8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS',
  amountAsset: 'WAVES',
  data: {
    id: '31EeVpTAronk95TjCHdyaveDukde4nDr9BfFpvhZ3Sap',
  },
})
  .then(() => {
    console.log('Ура! Я отменил ордер');
  })
  .catch(error => {
    console.error('Что-то пошло не так', error);
  });
```

Ответ: данные, которые пришли с матчера.

Возможные ошибки:

- Те же, что в `signCancelOrder`.
- `{message: "Failed request", data: "Описание ошибки", code: 15}` — запрос на отмену ордера подписан, но отправить его на матчер не удалось.

#### signRequest

Метод Keeper Wallet для подписания типизированных данных для подтверждения запросов на разных сервисах.
Принимает на вход объект, похожий на транзакцию:

```js
{
    type: number,
    data: {
        ...данные
    }
}
```

В данный момент поддерживается только подписание данных для запроса на матчер на получение списка своих ордеров.

Поля:

- `timestamp`: number/string — время в миллисекундах.
- `*senderPublicKey`: string — публичный ключ пользователя в кодировке base58.

Пример:

```js
KeeperWallet.signRequest({
  data: {
    timestamp: 234234242423423,
  },
});
```

Ответ: строка с подписью в кодировке base58.

Возможные ошибки:

- `{ message: "User denied message", code: 10 }` — пользователь отклонил запрос.
- `{ message: "Api rejected by user", code: 12 }` — сайт уже заблокирован пользователем.
- `{ message: "Invalid data", data: "Причина", code: 9 }` — неверные/неполные данные запроса.

#### signCustomData

Метод Keeper Wallet для подписания данных для различных сервисов. Принимает на вход объект:

##### Версия 1

- `version`: 1
- `binary`: string 'base64:....'

> Метод добавляет префикс `[255, 255, 255, 1]` к подписываемым байтам. Это сделано для того, чтобы в этом методе было невозможно подписать данные транзакций, что может привести к транзакциям, не прошедшим проверку подлинности, и фишингу. Подробности см. в методе [serializeCustomData](https://github.com/wavesplatform/waves-transactions/blob/master/src/requests/custom-data.ts#L63) библиотеки waves-transactions.

Пример:

```js
KeeperWallet.signCustomData({
  version: 1,
  binary: 'base64:AADDEE==',
});
```

Ответ:

```js
{
    version: 1,
    binary: 'base64:AADDEE==',
    signature: '...',
    publicKey: '...'
}
```

Возможные ошибки:

- `{ message: "User denied message", code: 10 }` — пользователь отклонил запрос.
- `{ message: "Api rejected by user", code: 12 }` — сайт уже заблокирован пользователем.
- `{ message: "Invalid data", data: "Причина", code: 9 }` — неверные/неполные данные запроса.

##### Версия 2

- `version`: 2.
- `data` — массив объектов:
  - `type`: "binary"/string/"integer"/"boolean" — тип поля.
  - `key`: string — название поля.
  - `value`: string(base64)/string/number/boolean.

Байты для подписи: [255, 255, 255, 2, ...(from `data` array to bin)]. Подробности см. в методе[serializeCustomData](https://github.com/wavesplatform/waves-transactions/blob/master/src/requests/custom-data.ts#L63) библиотеки waves-transactions.

Пример:

```js
KeeperWallet.signCustomData({
  version: 2,
  data: [{ type: 'string', key: 'name', value: 'Mr. First' }],
});
```

Ответ:

```js
   {
        version: 2,
        data: [{ type: 'string', key: 'name', value: 'Mr. First' }],
        signature: '...',
        publicKey: '...'
   }
```

Возможные ошибки:

- `{ message: "User denied message", code: 10 }` — пользователь отклонил запрос.
- `{ message: "Api rejected by user", code: 12 }` — сайт уже заблокирован пользователем.
- `{ message: "Invalid data", data: "Причина", code: 9 }` — неверные/неполные данные запроса.

#### verifyCustomData

Валидация подписи пользовательских данных:

```js
{
    version: 1,
    binary: 'base64:AADDEE==',
    signature: '...',
    publicKey: '...'
}
```

или

```js
{
    version: 2,
    data: [{ type: 'string', key: 'name', value: 'Mr. First' }],
    signature: '...',
    publicKey: '...'
}
```

Пример:

```js
KeeperWallet.verifyCustomData({
  version: 2,
  data: [{ type: 'string', key: 'name', value: 'Mr. First' }],
  signature: 'wrong signature',
  publicKey: '7kPFrHDiGw1rCm7LPszuECwWYL3dMf6iMifLRDJQZMzy',
}).then(result => {
  console.log(result);
}); //true/false
```

Ответ: true/false.

Ошибки:

- `{ message: "User denied message", code: 10 }` — пользователь отклонил запрос.
- `{ message: "Api rejected by user", code: 12 }` — сайт уже заблокирован пользователем.

#### resourceIsApproved

Проверяет, что пользователь разрешил сайту доступ к Keeper Wallet.

Пример:

```js
KeeperWallet.resourceIsApproved().then(result => {
  console.log(result);
});
```

Ответ: true/false.

#### resourceIsBlocked

Проверка, что пользователь заблокировал сайту доступ к Keeper Wallet.

Пример:

```js
KeeperWallet.resourceIsBlocked().then(result => {
  console.log(result);
});
```

Ответ: true/false.
