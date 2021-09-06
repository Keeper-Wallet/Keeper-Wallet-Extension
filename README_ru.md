# Waves Keeper v1.1.12

[en](https://github.com/wavesplatform/waveskeeper/blob/master/README.md) | ru

Приложение для хранения данных пользователя
и проведения транзакций в блокчейн сети Waves.
[Информация о сети Waves](https://docs.wavesprotocol.org/en/)

## Waves Keeper API

На страницах браузера, работающим по протоколам http/https (не работает на локальных страничках по протоколу file://),
с установленным расширением Waves Keeper
становятся доступным глобальный объект WavesKeeper
в котором вы найдете следующие методы:

- `auth`
- `publicState`
- `signAndPublishCancelOrder`
- `signAndPublishOrder`
- `signAndPublishTransaction`
- `signCancelOrder`
- `signOrder`,
- `signTransaction`
- `signRequest`
- `signCustomData`
- `verifyCustomData`
- `signTransactionPackage`
- `resourceIsApproved`
- `resourceIsBlocked`
- `notification`
- `on`

> Все методы кроме `on` работают асинхронно и возвращают [Promise](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise)

В вашем коде вы можете использовать [TypeScript types](https://github.com/wavesplatform/waveskeeper-types)

При загрузке страницы в объекте WavesKeeper нет методов апи до окончания инициализации плагина.
Для облегчения работы с WavesKeeper при инициализации в window.WavesKeeper есть initialPromise
который отрабатывает в момент окончания инициализации.
Пример:

```js
    WavesKeeper.initialPromise
        .then((keeperApi) => {
            /*...инициализация работы приложения с WavesKeeper*/
            keeperApi.publicState().then( state => startApp(state));
        })

```

В Waves Keeper, для большей безопасности и удобства использования,
каждый новый сайт использующий API должен быть разрешен пользователем.
При первой попытке использования API (кроме `on`) пользователю будет показан запрос на
разрешение работы Waves Keeper с этим сайтом. Если пользователь согласен дать доступ,
сайт становится доверенным, и получает возможность использовать API на своих страницах.
В противном случае, сайт блокируется и на все запросы будет возвращена ошибка
`{message: "Api rejected by user", code: 12}`, пользователь не увидит новых уведомлений.
Для получения доступа, пользователь должен из интерфейса сделать сайт доверенным.

## Описание методов

### publicState

Если сайт доверенный, возвращает публичные данные кипера.

Пример:

```js
    WavesKeeper.publicState()
        .then(state => {
            console.log(state); //вывод в консоль результата
            /*...обработка данных */
        }).catch(error => {
            console.error(error); //вывод в консоль результата
            /*...обработка ошибок */
        })

```

или

```js
    const getPublicState = async () => {
        try {
            const state = await WavesKeeper.publicState();
            console.log(state); //вывод в консоль результата
            /*...обработка данных */
        } catch(error) {
            console.error(error); //вывод в консоль результата
            /*...обработка ошибок */
        }
      }

      const result = await getPublicState();
```

ОТВЕТ

```
{
    "initialized": true,
    "locked": true,
    "account": {
        "name": "foo",
        "publicKey": "bar",
        "address": "waves адресс",
        "networkCode": "байт сети",
        "balance": {
            "available": "баланс в waves",
            "leasedOut": "баланс в лизинге"
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

Описание возвращаемых полей

- `initialized` - boolean кипер проинициализирован
- `locked` - boolean кипер в режиме ожидания
- `account` - текущий аккаунт, если пользователь разрешит сайту доступ, или null
- `network` - текущая сеть waves, адрес ноды и матчера
- `messages` - статусы запросов на подпись
- `txVersion` - доступные версии транзакций для каждого типа

Возможные ошибки

- `{ message: "Init Waves Keeper and add account" }` - кипер не проинициализирован
- `{ message: "Add Waves Keeper account" }` - вход в кипер произведен, но нет аккаунтов
- `{ message: "User denied message" }` - пользователь запретил сайту работать с кипером

**encryptMessage**

Вы можете зашифровать текст для конкретного пользователя сети Waves, зная его публичный ключ.

WavesKeeper.encryptMessage(`текст для шифрования`, `публичный ключ в кодировке base58`, `префикс строкой уникальный для каждого приложения`)

Пример:

```js
       WavesKeeper.encryptMessage('My message', '416z9d8DQDy5MPTqDhvReRBaPb19gEyVRWvHcewpP6Nc', 'для меня')
       .then((encryptedMessage) => {
            console.log(encryptedMessage);
       });
```

Возможные ошибки

- `{ message: "Init Waves Keeper and add account" }` – кипер не проинициализирован
- `{ message: "App is locked" }` – кипер заблокирован

* `{ message: "Add Waves Keeper account" }` - вход в кипер произведен, но нет аккаунтов
* `{ message: "User denied message" }` - пользователь запретил сайту работать с кипером

**decryptMessage**
Вы можете расшифровать сообщение, зашифрованное для вас пользователем сети Waves, зная сообщение и публичный ключ отправителя.

WavesKeeper.decryptMessage(`зашифрованный текст`, `публичный ключ в кодировке base58`, `префикс строкой уникальный для каждого приложения`)

Example:

```js
       WavesKeeper.decryptMessage('**encrypted msg**', '416z9d8DQDy5MPTqDhvReRBaPb19gEyVRWvHcewpP6Nc')
       .then((message) => {
            console.log(message);
       });
```

Возможные ошибки

- `{ message: "Init Waves Keeper and add account" }` – кипер не проинициализирован
- `{ message: "App is locked" }` – кипер заблокирован

* `{ message: "Add Waves Keeper account" }` - вход в кипер произведен, но нет аккаунтов
* `{ message: "User denied message" }` - пользователь запретил сайту работать с кипером

### on

Позволяет подписаться на события из Waves Keeper.

Поддерживает события:

- `update` - подписаться на изменения стейта

Пример:

```
   WavesKeeper.on("update", state => {
        //state бъект как из WavesKeeper.publicState
   });
```

Если сайт не является доверенным, то события приходить не будут.

### notification

Метод для отправки пользователю сообщения от сайта. Разрешено посылать сообщение только разрешенным сайтам не чаще 1 раза за 30сек.

`notification` может принимать на вход следующие данные

- `title` - строка до 20 символов
- `message` - строка не более 250 символов (не обязательное)

Возвращает Promise

Пример:

```
       WavesKeeper.notification({
            title: 'Hello!',
            message: 'Congratulation!!!'
       });
```

ОШИБКИ

- `{message: "Incorrect notification data", data: "title has more than 20 characters", code: "19"}` - Длинный заголовок
- `{message: "Incorrect notification data", data: null, code: "19"}` - Ошибки в данных нотификации
- `{message: "Can't sent notification", data: {msg: "Min notification interval 30s. Wait 28.017s."}, code: "18"}` - Запрещено посылать сообщеня чаще 1 раза в 30 сек
- `{message: "Api rejected by user", code: 12}`сайт не является доверенным или запрещено посылать сообщения

### auth

Метод для получения подписи авторизационных данных при подтверждении пользователя Waves.
Работает аналогично [протоколу авторизации waves](https://docs.wavesprotocol.org/en/development-and-api/client-api/auth-api.html).

Пример:

```js
    const authData = { data: "Auth on my site" };
    WavesKeeper.auth(authData)
        .then(auth => {
            console.log(auth); //вывод в консоль результата
            /*...обработка данных */
        }).catch(error => {
            console.error(error); //вывод в консоль результата
            /*...обработка ошибок */
        })

```

или

```js
    const getAuthData = async authData => {
        try {
            const state = await WavesKeeper.auth(authData);
            console.log(state); //вывод в консоль результата
            /*...обработка данных */
        } catch(error) {
            console.error(error); //вывод в консоль результата
            /*...обработка ошибок */
        }
    }

    const authData = { data: "Auth on my site" };
    getAuthData(authData);
```

`auth` может принимать на вход следующие данные

- `name` - название сервиса (не обязательное поле)
- `data` - строка с любыми строковыми данными (обязательное поле)
- `referrer` - полный url до сайта для редиректа (не обязательное поле)
- `icon` - путь до лого, относительно `referrer` или origin сайта (не обязательное поле)
- `successPath` - относительный путь до апи аунтификации сайта (не обязательное поле)

Например

```js
    const authData = {
        data: "Generated string from server",
        name: "My test App",
        icon: "/img/icons/waves_logo.svg",
        referrer: "https://waves.exchange/",
        successPath: "login"
    };

    WavesKeeper.auth(authData).then((data) => {
        //data - данные от кипера
        //проверка подписи и сохранение адреса...
        console.log(data);
    }).catch((error) => {
        //обработка ошибки
    });


```

При удачном подтверждении кипер в Promise вернет объект содержащий данные для проверки подписи:

- `host` - хост, запросивший подпись
- `name` - название приложения запрашивающее подпись
- `prefix` - префикс учавствующий в подписи
- `address` - адрес в сети Waves
- `publicKey` - публичный ключ пользователя
- `signature` - подпись
- `version` - версия апи

[Как проверить подпись](https://docs.wavesprotocol.org/en/waves-api-and-sdk/client-api/auth-api.html#how-to-check-signature-validity)?

ОШИБКИ

- `{message: "Invalid data", data: "[{"field":"data","type":"string","message":"field is required"}]", code: 9}` - в данных на подпись есть ошибки
- `{message: "User denied message", code: 10}` - пользователь отклонил запрос
- `{message: "Api rejected by user", code: 12}`сайт не является доверенным

### signTransaction

Метод для подписи транзакций в сети Waves.

Пример:

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
        //data - строка готовая для отсылки на ноду(сервер) сети Waves
    }).catch((error) => {
        //Обработка ошибок
    });
```

> Апи возвращает строки, а не объект, так как в javascript при работе с 8 байтными целыми (long) происходит потеря точности.
>
> Описание поддерживаемых типов транзакций вы найдете ниже

В примере мы подписываем транзакцию на перевод токенов Waves на алиас `test` в сети Waves.

ОТВЕТ
`{"version":2,"assetId":"", "amount":156700000,"feeAssetId":"",fee:100000, "recipient":"получатель","attachment":"", "timestamp":1548770230589,"senderPublicKey":"публичный ключ","proofs":["подпись"],"type":4}`

ОШИБКИ

- `{message: "User denied message", code: 10}` - пользователь отклонил запрос
- `{message: "Api rejected by user", code: 12}` - cайт является не доверенным
- `{message: "Invalid data", data: "Причина", code: 9}` - неверные/неполные данные запроса

### signAndPublishTransaction

Аналогичен `signTransaction`, но плюс еще отправляет транзакцию в блокчейн.

Пример:

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
           //data - строка готовая для отсылки на ноду(сервер) сети Waves
       }).catch((error) => {
           //Обработка ошибок
       });
```

ОТВЕТ
Возвращается строкой ответ от сети Waves - полное содержание прошедшей транзакции

ОШИБКИ

- Аналогично `signTransaction`
- `{message: "Filed request", data: "Описание ошибки", code: 15}` - реквест подписали, но не смогли отправить дальше

### signTransactionPackage

Пакетная подпись транзакций.
Иногда надо подписать сразу несколько транзакций, для удобства пользователя,
допускается подписывать до 7 транзакций одновременно, и разрешены только
определенные типы транзакций:

- `3 - выпускает токен`
- `4 - переводит токен на другой аккаунт`
- `5 - довыпускает токен`
- `6 - уменьшает количество токена`
- `8 – передает WAVES в лизинг`
- `9 – прекращает лизинг`
- `10 - создает псевдоним адреса`
- `11 - массовый перевод`
- `12 - добавляет, изменяет или удаляет запись в хранилище данных аккаунта отправителя`
- `13 - устанавливает dApp-скрипт или скрипт аккаунта`
- `14 - устанавливает или отменяет спонсирование`
- `15 - изменяет скрипт ассета`

Пример:

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

Подписать 2 транзакции:

- перевода на алиас test 1.567 Waves
- перевода на алиас merry 0.1 Waves

ОТВЕТ

массив из 2-х строк, подписанных и готовых к отправке транзакций.

ОШИБКИ
Аналогично `signTransaction`.

## [Транзакции](https://docs.wavesprotocol.org/en/waves-api-and-sdk/client-libraries/waves-transactions.html)

У каждого пользователя в сети waves есть стейт (балансы, ассеты, данные, скрипты),
любая прошедшая транзакция меняет эти данные.
В wavesKeeper API - отличается от [NODE REST API](https://docs.wavesprotocol.org/en/waves-api-and-sdk/waves-node-rest-api.html).

`signTransaction`, `signAndPublishTransaction` принимают транзакцию в следующем виде

```
{
    type: number //тип транзакции,
    data: {
        ... //данные транзакции
    }
}
```

Условные обозначения

> \* - необязательное поле, данные подставятся автоматически из WavesKeeper.
> [x,y] - oграничение длины от x, до y.
> [,x] - oграничение длины до x.
> [y,] - oграничение длины от y.
> [x-y] - число от x до y.
> x/y - x или y.
> (JLM) - JAVA LONG MAX = 9 223 372 036 854 775 807
> MoneyLike - цена

MoneyLike может иметь вид:

- `{ tokens: 1, assetId: "WAVES" }`
- `{ coins: 100000000, assetId: "WAVES" }`;

В обоих записях указана одинаковая цена 1 WAVES. Можно свободно перевести `coins` в `tokens` и обратно,
зная в каком ассете указана цена и получив его точность `tokens = coins / (10 ** precision)`
Если в поле указаны дополнительные типы кроме MoneyLike, например string/MoneyLike , сумма указывается числом в `coins`.

---

### [Тип 3 ISSUE - выпуск токена](https://docs.wavesprotocol.org/en/blockchain/transaction-type/issue-transaction.html)

- `name` [4, 16] string - Название токена,
- `description` [0, 1000] string - Описание токена,
- `quantity` [0 - (JLM)] number/string - количество,
- `precision` [0 - 8] number - точность,
- `reissuable` true|false - возможно перевыпускать,
- `*fee` MoneyLike -комиссия
- `*script` string - [smart asset](https:/docs.wavesprotocol.org/ru/smart-contracts/smart-assets.html)
- `*senderPublicKey` string - публичный ключ отправителя в base58
- `*timestamp` number/string - время в мс

Пример:

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
        console.log("Ура! Я создал свой ассет!!!");
   }).catch((error) => {
        console.error("Что-то пошло не так", error);
   });
```

В случае успеха мы выпускаем новыйй ассет в количестве 1000000 шт.
которые будут на вашем балансе 10000.00 Best Token

### [Тип 4 TRANSFER - передача ассетов](https:/docs.wavesprotocol.org/ru/blockchain/transaction-type/transfer-transaction.html)

- `amount` MoneyLike - количество,
- `recipient` string - адрес получателя или алиас
- `attachment`[,140 bytes] string или Byte Array- доп информация
- `*fee` MoneyLike - комиссия
- `*senderPublicKey` string - публичный ключ отправителя в base58
- `*timestamp` number/string - время в мс

Пример:

```js
    WavesKeeper.signAndPublishTransaction({
        type: 4,
        data: {
            amount: { tokens: "3.3333333", assetId: "WAVES" },
            fee: { tokens: "0.001", assetId: "WAVES"},
            recipient: "merry"
        }
    }).then((tx) => {
         console.log("Ура! Я смог отправить Waves!!!");
    }).catch((error) => {
         console.error("Что-то пошло не так", error);
    });

```

### [Тип 5 REISSUE - довыпуск токенов](https:/docs.wavesprotocol.org/ru/blockchain/transaction-type/reissue-transaction.html)

- `assetId` string - "Id ассета",
- `quantity` [0 - (JLM)] number/string/MoneyLike - количество,
- `reissuable` false - запретить перевыпускать
- `*fee` MoneyLike -комиссия
- `*senderPublicKey` string - публичный ключ отправителя в base58
- `*timestamp` number/string - время в мс

Пример:

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
           console.log("Ура! Я довыпустил ассет!!!");
      }).catch((error) => {
           console.error("Что-то пошло не так", error);
      });
```

В случае успеха мы довыпускаем новыйй ассет в количестве 1000000 `coins`.
которые будут на вашем балансе 10000.00 Best Token

### [Тип 6 BURN - сжигание токена](https:/docs.wavesprotocol.org/ru/blockchain/transaction-type/burn-transaction.html)

- `assetId` string - Id ассета,
- `amount` [0 - (JLM)] number/string/MoneyLike - количество,
- `*fee` MoneyLike -комиссия
- `*senderPublicKey` string - публичный ключ отправителя в base58
- `*timestamp` number/string - время в мс

Пример:

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
        console.log("Ура! Я сжег лишнее!!!");
   }).catch((error) => {
        console.error("Что-то пошло не так", error);
   });
```

В случае успеха сжигается 1000 `coins`.

### [Тип 8 LEASE - Передача в лизинг](https://docs.wavesprotocol.org/en/blockchain/transaction-type/lease-transaction.html)

- `recipient` string - адрес получателя или алиас,
- `amount` [0 - (JLM)] number/string/MoneyLike - количество,
- `*fee` MoneyLike -комиссия
- `*senderPublicKey` string - публичный ключ отправителя в base58
- `*timestamp` number/string - время в мс

Пример:

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
        console.log("Ура! Я смог передать в лизинг!!!");
   }).catch((error) => {
        console.error("Что-то пошло не так", error);
   });
```

В случае успеха передается в лизинг 0.00001000 Waves.

### [Тип 9 LEASE CANCEL - отмена лизинга](https://docs.wavesprotocol.org/en/blockchain/transaction-type/lease-cancel-transaction.html)

- `leaseId` string - id транзакции лизинга,
- `*fee` MoneyLike -комиссия
- `*senderPublicKey` string - публичный ключ отправителя в base58
- `*timestamp` number/string - время в мс

Пример:

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
        console.log("Ура! Я отменил лизинг!!!");
   }).catch((error) => {
        console.error("Что-то пошло не так", error);
   });
```

В случае успеха отменяется лизинг.

### [Тип 10 CREATE ALIAS - создание алиаса для адреса](https://docs.wavesprotocol.org/en/blockchain/transaction-type/create-alias-transaction.html)

- `alias`[4, 30] string - имя
- `*fee` MoneyLike -комиссия
- `*senderPublicKey` string - публичный ключ отправителя в base58
- `*timestamp` number/string - время в мс

Пример:

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
        console.log("Ура! Я теперь с алиасом!!!");
   }).catch((error) => {
        console.error("Что-то пошло не так", error);
   });
```

В случае успеха для адреса создается алиас (дополнительное имя).

### [Тип 11 MASS TRANSFER - массовая рассылка ассета](https://docs.wavesprotocol.org/en/blockchain/transaction-type/mass-transfer-transaction.html)

- `totalAmount` moneyLike - итого отошлется // можно не считать сумму и вставить { assetId: "id отправляемого ассета", coins: 0},
- `transfers` массив объектов
  - { `recipient`: string - адрес/алиас, amount: number/string/moneyLike }
- `attachment` [,140 bytes в base58] string - доп информация
- `*fee` MoneyLike -комиссия
- `*senderPublicKey` string - публичный ключ отправителя в base58
- `*timestamp` number/string - время в мс

Пример:

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
        console.log("Ура! Я друзьям отправил приветов!!!");
   }).catch((error) => {
        console.error("Что-то пошло не так", error);
   });
```

В случае успеха на адреса alias1, alias2 прийдет по 0.002 Waves.

### [Тип 12 DATA TRANSACTION - сохранение данных](https://docs.wavesprotocol.org/en/blockchain/transaction-type/data-transaction.html)

- `data` массив объектов
  - `type` "binary"/string/"integer"/"boolean" - тип,
  - `key` string - название поля
  - `value` /string/string/number/boolean зависит от типа
- `*fee` MoneyLike -комиссия
- `*senderPublicKey` string - публичный ключ отправителя в base58
- `*timestamp` number/string - время в мс

Пример:

```js
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
        console.log("Ура! Я сохранил данные!!!");
   }).catch((error) => {
        console.error("Что-то пошло не так", error);
   });
```

В случае успеха в стейте будут хранится новые данные.

### [Тип 13 SET SCRIPT - скриптовать акаунт](https://docs.wavesprotocol.org/en/blockchain/transaction-type/set-script-transaction.html)

- `script` string - [скрипт](https://docs.wavesprotocol.org/en/technical-details/waves-contracts-language-description/creating-and-deploying-a-script-manually.html#section-5e6520b97a7ead921d7fb6bce7292ce0)
- `*fee` MoneyLike -комиссия
- `*senderPublicKey` string - публичный ключ отправителя в base58
- `*timestamp` number/string - время в мс

Для снятия скрипта поле `script` равно ``.
[Разаработка скрипта в RIDE](https://ide.wavesplatform.com/)

Пример:

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
        console.log("Ура! Я отменил скрипт!!!");
   }).catch((error) => {
        console.error("Что-то пошло не так", error);
   });
```

В случае успеха удалится скрипт с аккаунта.

Пример2:

```js
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
        console.log("Ура! Я поставил скрипт!!!");
   }).catch((error) => {
        console.error("Что-то пошло не так", error);
   });
```

В случае успеха на аккаунте будет новый скрипт
разрешающий на аккаунте любые транзакции без подписи (будте осторожны!).

### [Тип 14 Sponsored Fee Transaction - Спонсорство](https://docs.wavesprotocol.org/en/blockchain/transaction-type/fee-sponsoring-transaction.html)

- `minSponsoredAssetFee` MoneyLike - цена комиссии в ассете.
- `*fee` MoneyLike - комиссия
- `*senderPublicKey` string - публичный ключ отправителя в base58
- `*timestamp` number/string - время в мс

Пример:

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
        console.log("Ура! Я стал спонсором!!!");
   }).catch((error) => {
        console.error("Что-то пошло не так", error);
   });
```

В случае успеха, в ассете можно платить комиссию за трансфер

### [Тип 15 SET ASSET SCRIPT - скрипт на ассет](https://docs.wavesprotocol.org/en/blockchain/transaction-type/set-asset-script-transaction.html)

- `assetId` string - id ассета
- `script` string - [скрипт](https://docs.wavesprotocol.org/en/technical-details/waves-contracts-language-description/creating-and-deploying-a-script-manually.html#section-5e6520b97a7ead921d7fb6bce7292ce0)
- `*fee` MoneyLike -комиссия
- `*senderPublicKey` string - публичный ключ отправителя в base58
- `*timestamp` number/string - время в мс

Снятие скрипта невозможно, только записать новый.
[Разаработка скрипта в RIDE](https://ide.wavesplatform.com/)

Пример:

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
        console.log("Ура! Я переставил скрипт на ассете!!!");
   }).catch((error) => {
        console.error("Что-то пошло не так", error);
   });
```

В случае успеха на ассете будет переписан скрипт

### [Тип 16 SCRIPT INVOCATION - выполнение функций скрипта](https:/docs.wavesprotocol.org/ru/blockchain/transaction-type/invoke-script-transaction.html)

- `dApp` string адрес контракта
- `call` объект слкдующей структуры
  - `function` string название функции
  - `args` массив аргументов вида
    - `type` "binary"/string/"integer"/"boolean" - тип,
    - `value` /string/string/number/boolean зависит от типа
- `*fee` MoneyLike комиссия
- `*payment` массив MoneyLike (пока поддерживается 1 платеж)
- `*senderPublicKey` string - публичный ключ отправителя в base58
- `*timestamp` number/string - время в мс

Пример:

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

В случае успеха будет запущен скрипт

### [Как расчитать комиссию](https:/docs.wavesprotocol.org/ru/blockchain/transaction/transaction-fee.html)

---

### signOrder

Метод Waves Keeper для подписи ордера в матчер
Принимает на вход объект похожий на транзакцию вида

```
    {
        type: 1002,
        data: {
            ...данные
        }
    }
```

- `*version` 1,2,3

* `amount` MoneyLike - количество
* `price` MoneyLike - цена
* `orderType` 'sell'/'buy' - тип ордера
* `matcherPublicKey` string публичный ключ exchange сервиса
* `expiration` string/number - время жизни ордера
* `*matcherFee` MoneyLike - комиссия (мин 0.003 Waves),
* `*timestamp` string/number щее время- теку
* `*senderPublicKey` string публичный ключ в base58

Пример:

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
        console.log("Ура! Я подписал ордер!!!");
   }).catch((error) => {
        console.error("Что-то пошло не так", error);
   });
```

ОТВЕТ:
Строка с данными для отправки на матчер.

ОШИБКИ:

- `{ message: "User denied message", code: 10 }` - пользователь отклонил запрос
- `{ message: "Api rejected by user", code: 12 }` - cайт является не доверенным
- `{ message: "Invalid data", data: "Причина", code: 9 }` - неверные/неполные данные запроса

### signAndPublishOrder

Метод Waves Keeper создания ордера на матчер работает идентично `signOrder`,
но еще пытается отослать данные на матчер

ОТВЕТ:
Строка ответ матчера об успешной постановке ордера.

ОШИБКИ:

- аналогично `signOrder`
- `{message: "Filed request", data: "Описание ошибки", code: 15}` - реквест подписали, но не смогли отправить дальше

### signCancelOrder

Метод Waves Keeper подпись отмены ордера на матчер
Принимает на вход объект похожий на транзакцию вида

```
    {
        type: 1003,
        data: {
            ...данные
        }
    }
```

- `id` string - id ордера
- `*senderPublicKey` string публичный ключ в base58

Пример:

```js
    WavesKeeper.signCancelOrder({
        type: 1003,
        data: {
            id: '31EeVpTAronk95TjCHdyaveDukde4nDr9BfFpvhZ3Sap'
        }
    });
```

ОТВЕТ:
Строка с данными для отправки на матчер.

ОШИБКИ:

- `{ message: "User denied message", code: 10 }` - пользователь отклонил запрос
- `{ message: "Api rejected by user", code: 12 }` - cайт является не доверенным
- `{ message: "Invalid data", data: "Причина", code: 9 }` - неверные/неполные данные запроса

### signAndPublishCancelOrder

Метод Waves Keeper для отмены ордера на матчер, работает идентично `signCancelOrder`,
но еще пытается отослать данные на матчер, для которого необходимо передать еще 2 поля `priceAsset` и `amountAsset` из ордера.

Пример:

```js
    WavesKeeper.signAndPublishCancelOrder({
        type: 1003,
        priceAsset: '8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS',
        amountAsset: 'WAVES',
        data: {
        	id: '31EeVpTAronk95TjCHdyaveDukde4nDr9BfFpvhZ3Sap'
        }
    }).then(() => {
        console.log('Ура! Я отменил ордер');
    }).catch((error) => {
        console.error('Что-то пошло не так', error);
    });
```

ОТВЕТ:
Данные пришедшие с матчера

ОШИБКИ:

- аналогично `signCancelOrder`
- `{message: "Filed request", data: "Описание ошибки", code: 15}` - реквест подписали, но не смогли отправить дальше

### signRequest

Метод Waves Keeper для подписи типизированных данных, для подтверждения запросов на разных сервисах
Принимает на вход объект похожий на транзакцию вида

```
    {
        type: number,
        data: {
            ...данные
        }
    }
```

В данный момент метод поддерживает следующие типы:

#### 1001 - подпись данных для запроса на матчер за своими ордерами

- `timestamp` number/string
- `*senderPublicKey` string публичный ключ в base58

Пример:

```js
    WavesKeeper.signRequest({
        type: 1001,
        data: {
            timestamp: 234234242423423
        }
    });
```

ОТВЕТ:
Строка c подписью в base58.

ОШИБКИ:

- `{ message: "User denied message", code: 10 }` - пользователь отклонил запрос
- `{ message: "Api rejected by user", code: 12 }` - cайт является не доверенным
- `{ message: "Invalid data", data: "Причина", code: 9 }` - неверные/неполные данные запроса

#### 1004 - подпись данных для запроса к Coinomat

- `timestamp` number/string

Пример:

```js
    WavesKeeper.signRequest({
        type: 1004,
        data: {
            timestamp: 234234242423423
        }
    });
```

ОТВЕТ:
Строка c подписью в base58.

ОШИБКИ:

- `{ message: "User denied message", code: 10 }` - пользователь отклонил запрос
- `{ message: "Api rejected by user", code: 12 }` - cайт является не доверенным
- `{ message: "Invalid data", data: "Причина", code: 9 }` - неверные/неполные данные запроса


### signCustomData

Метод Waves Keeper для подписи данных, для подтверждения их на разных сервисах
Принимает на вход объект:

#### version 1

- `version` 1
- `binary` string 'base64:....'

Пример:

```js
    WavesKeeper.signCustomData({
         version: 1,
         binary: 'base64:AADDEE=='
    });
```

ОТВЕТ:
```
   {
        version: 1,
        binary: 'base64:AADDEE==',
        signature: '...',
        publicKey: '...'
   }
```
ОШИБКИ:

- `{ message: "User denied message", code: 10 }` - пользователь отклонил запрос
- `{ message: "Api rejected by user", code: 12 }` - cайт является не доверенным
- `{ message: "Invalid data", data: "Причина", code: 9 }` - неверные/неполные данные запроса


#### version 2

- `version` 2
- `data` массив объектов
  - `type` "binary"/string/"integer"/"boolean" - тип,
  - `key` string - название поля
  - `value` /string/string/number/boolean зависит от типа


Пример:

```js
    WavesKeeper.signCustomData({
         version: 2,
         data: [{ type: 'string', key: 'name', value: 'Mr. First' }]
    });
```

ОТВЕТ:

```
   {
        version: 2,
        data: [{ type: 'string', key: 'name', value: 'Mr. First' }]
        signature: '...',
        publicKey: '...'
   }
```      

ОШИБКИ:

- `{ message: "User denied message", code: 10 }` - пользователь отклонил запрос
- `{ message: "Api rejected by user", code: 12 }` - cайт является не доверенным
- `{ message: "Invalid data", data: "Причина", code: 9 }` - неверные/неполные данные запроса

### verifyCustomData
Валидация подписи данных типа:
```
       {
           version: 1,
           binary: 'base64:AADDEE==',
           signature: '...',
           publicKey: '...'
       }
       /// или
       {
            version: 2,
            data: [{ type: 'string', key: 'name', value: 'Mr. First' }]
            signature: '...',
            publicKey: '...'
       }
```

Пример:
```js
    WavesKeeper.verifyCustomData({
         version: 2,
         data: [{ type: 'string', key: 'name', value: 'Mr. First' }],
         signature: 'wrong signature',
         publicKey: '7kPFrHDiGw1rCm7LPszuECwWYL3dMf6iMifLRDJQZMzy'
    }).then((result) => { console.log(result) } ); //true/false
```

### resourceIsApproved
Проверка разрешения использования API кипера

Пример:

```js
    WavesKeeper.resourceIsApproved().then(result => { console.log(result) });
```     

Ответ: true/false
 

### resourceIsBlocked
Проверка запрета на использование API кипера

Пример:

```js
    WavesKeeper.resourceIsBlocked().then(result => { console.log(result) });
```     

Ответ: true/false
