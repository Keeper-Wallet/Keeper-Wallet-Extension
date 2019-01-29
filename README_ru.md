# Waves Keeper v1.0.8

Приложение для хранения данных пользователя  
и проведения транзакций в блокчейн сети Waves.


##Waves Keeper API

На страницах броузера с установленным расширением 
становятся доступным глобальный объект WavesKeeper 
в котором вы найдете следующие методы:
`auth`, `publicState`, `signAndPublishCancelOrder`, `signAndPublishOrder`, 
`signAndPublishTransaction`, `signBytes`, `signCancelOrder`, `signOrder`, 
`signRequest`, `signTransaction`, `signTransactionPackage`.  
> Все методы работают асинхронно и возвращают [Promise](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise)

###publicState

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

ОШИБКИ

+ `{ message: "Init Waves Keeper and add account" }` - кипер не проинициализирован 
+ `{ message: "Add Waves Keeper account"}` - вход в кипер произведен, но нет аккаунтов  
+ `{message: "User denied message"}` -  пользователь запретил сайту работать с кипером  

ОТВЕТЫ

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
+ `txVersion` - доступные версии транзакций для каждого типа   


###signTransactionPackage
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
