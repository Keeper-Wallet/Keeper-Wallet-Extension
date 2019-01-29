# Waves Keeper v1.0.8

Приложение для хранения данных пользователя  
и проведения транзакций в блокчейн сети Waves.


## Waves Keeper API

На страницах броузера с установленным расширением 
становятся доступным глобальный объект WavesKeeper 
в котором вы найдете следующие методы:
`auth`, `publicState`, `signAndPublishCancelOrder`, `signAndPublishOrder`, 
`signAndPublishTransaction`, `signCancelOrder`, `signOrder`, 
`signTransaction`, `signRequest`, `signTransactionPackage`, `on`.  
> Все методы работают асинхронно и возвращают [Promise](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise)

### publicState
Если сайт доверенный, возвращает публичные данные кипера.

Пример:
```
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
```
    const getPublicState = async state => {
        try {
            const state = await WavesKeeper.publicState();
            console.log(state); //вывод в консоль результата
            /*...обработка данных */
        } catch(error) {
            console.error(error); //вывод в консоль результата
            /*...обработка ошибок */
        }
      }
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
+ `initialized` - boolean кипер проинициализирован   
+ `locked` - boolean кипер в режиме ожидания  
+ `account` - текущий аккаунт, если пользователь разрешит сайту доступ или null  
+ `network` - текущая сеть waves, адрес ноды и матчера    
+ `messages` - статусы запросов на подпись    
+ `txVersion` - доступные версии транзакций для каждого типа   


ОШИБКИ

+ `{ message: "Init Waves Keeper and add account" }` - кипер не проинициализирован 
+ `{ message: "Add Waves Keeper account" }` - вход в кипер произведен, но нет аккаунтов  
+ `{ message: "User denied message" }` -  пользователь запретил сайту работать с кипером  

### on
Позволяет подписаться на евенты из кипера.  

Поддерживает события:
* `update` - подписаться на изменения стейта

Пример:
```
   WavesKeeper.on('update', state => {
        //state бъект как из WavesKeeper.publicState
   });
```
Если сайт не доверенный события приходить не будут.


### auth
Метод, для получения подписи авторизационных данных при подтверждении пользователя Waves.
Работает аналогично протоколу авторизации [waves](https://docs.wavesplatform.com/en/development-and-api/client-api/auth-api.html).

Пример:
```
    const authData = { data: "Auth on my site" };
    Waves.auth(authData)
        .then(auth => {
            console.log(state); //вывод в консоль результата
            /*...обработка данных */
        }).catch(error => {
            console.error(error); //вывод в консоль результата
            /*...обработка ошибок */
        })
      
```
или
```
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
+ `name` - название сервиса (не обязательное поле)
+ `data` - строка с любыми данными (обязательное поле)
+ `referrer` - полный url до сайта для редиректа (не обязательное поле)
+ `icon` - путь до лого, относительно `referrer` или origin сайта (не обязательное поле)
+ `successPath` - относительный путь до апи аунтификации сайта (не обязательное поле)

Например
```
    const authData = { 
        data: "Generated string from server",
        name: "My test App",
        icon: "/img/icons/waves_logo.svg",
        referrer: "https://client.wavesplatform.com/",
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
При удачном подтверждении кипер в происе вернет объект содержащий данные для проверки подписи:
+ `host` - хост, запросивший подпись
+ `name` - название приложения запрашивающее подпись
+ `prefix` - префикс учавствующий в подписи
+ `address` - адрес в сети Waves
+ `publicKey` - публичный ключ пользователя
+ `signature` - подпись
+ `version` - версия апи

Как [проверить подпись](https://docs.wavesplatform.com/en/development-and-api/client-api/auth-api.html#section-2adf854e6133a03ce3003956df1f5c3b)?

ОШИБКИ

+ ``{message: "Invalid data", data: "[{"field":"data","type":"string","message":"field is required"}]", code: 9}`` - в данных на подпись есть ошибки  
+ ``{message: "User denied message", code: 10}`` - пользователь отклонил запрос  
+ ``{message: "Api rejected by user", code: 12}``сайт не является доверенным


### signTransaction
Метод для подписи транзакций в сети Waves. 

Пример:
```
    const txData = {
        type: 4,
        data: {
            amount: {
               assetId: 'WAVES',
               tokens: "1.567"
            },
            fee: {
                assetId: 'WAVES',
                tokens: "0.001"
            },
            recipient: 'test'
        }
    };
    WavesKeeper.signTransaction(txData).then((data) => {
        //data - строка готовая для отсылки на ноду(сервер) сети Waves
    }).catch((error) => { 
        //Обработка ошибок
    });
```
>  
> Апи возвращает строки, а не объект, так как в javascript при работе с 8 байтными целыми происходит потеря точности.
> 
> Описание поддерживаемых типов транзакций вы найдете ниже

В примере мы подписываем транзакцию на перевод токенов Waves на алиас `test` в сети Waves.  

ОТВЕТ
``{"version":2,"assetId":"", "amount":156700000,"feeAssetId":"","fee":100000, "recipient":"получатель","attachment":"", "timestamp":1548770230589,"senderPublicKey":"публичный ключ","proofs":["подпись"],"type":4}``

ОШИБКИ
+ ``{message: "User denied message", code: 10}`` - пользователь отклонил запрос
+ ``{message: "Api rejected by user", code: 12}`` - Сайт является не доверенным
+ ``{message: "Invalid data", data: "Причина", code: 9}`` - неверные/неполные данные запроса


### signAndPublishTransaction
Аналогичен `signTransaction`, но плюс еще отправляет транзакцию в блокчейн.

Пример:
```
   const txData = {
           type: 4,
           data: {
               amount: {
                  assetId: 'WAVES',
                  tokens: "1.567"
               },
               fee: {
                   assetId: 'WAVES',
                   tokens: "0.001"
               },
               recipient: 'test'
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
``{message: "Filed request", data: "Описание ошибки", code: 15}`` - реквест подписали, но не смогли отправить дальше


### signTransactionPackage
Пакетная подпись транзакций.
Иногда надо подписать сразу несколько транзакций, для удобства пользователя, 
допускается подписывать до 7 транзакций одновременно, и разрешены только 
определенные типы транзакций:  

```
    3 - выпуск токена
    2 - перевод токенов
    5 - перевыпуск токенов
    6 - сжигание токенов
    10 - создaние алиса на адрес в сети waves
    11 - массовый перевод
    12 - транзакция с данными
```

Пример:

```
    const name = 'For Test';
    const tx = [{
        type: 4,
        data: {
            amount: {
               assetId: 'WAVES',
               tokens: "1.567"
            },
            fee: {
                assetId: 'WAVES',
                tokens: "0.001"
            },
            recipient: 'test'
    }},{
        type: 4,
        data: {
            amount: {
               assetId: 'WAVES',
               tokens: "0.51"
            },
            fee: {
                assetId: 'WAVES',
                tokens: "0.001"
            },
            recipient: 'merry'
        }
    }];
    
    WavesKeeper.signTransactionPackage(tx, name)
```

Подписать 2 транзакции:
+ перевода на алиас test 1.567 Waves
+ перевода на алиас merry 0.1 Waves
    
    
ОТВЕТ

массив из 2-х строк, подписанных и готовых к отправке транзакций.
