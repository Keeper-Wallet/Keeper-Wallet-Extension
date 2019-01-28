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
*или*
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

+ Если кипер не проинициализирован в ответе будет ошибка вида  
`{ message: "Init Waves Keeper and add account" }`

