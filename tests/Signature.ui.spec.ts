describe('Signature', () => {
    describe('Transactions', () => {
        describe('Issue', () => {
            it('is_valid');
            it('копирование кода скрипта в буфер обмена');
        });
        describe('Transfer', () => {
            it('is_valid');
            it('адрес / алиас');
            it('waves / asset / smart asset');
            it('attachment (uint8array)');
            it('переводы на Gateways');
        });

        describe('Reissue', () => {
            it('is_valid');
        });
        describe('Burn', () => {
            it('is_valid');
        });
        describe('Exchange', () => {
            it('is_valid');
        });
        describe('Lease', () => {
            it('is_valid');
        });
        describe('LeaseCancel', () => {
            it('is_valid');
        });
        describe('Alias', () => {
            it('is_valid');
            it('4, 26 символов');
        });
        describe('MassTransfer', () => {
            it('is_valid');
        });
        describe('Data', () => {
            it('is_valid');
        });
        describe('SetScript', () => {
            it('is_valid');
            it('копирование кода скрипта в буфер обмена');
            it('установка / отмена (null)');
        });

        describe('SponsorFee', () => {
            it('is_valid');
            it('set/cancel');
        });
        describe('SetAssetScript', () => {
            it('is_valid');
            it('копирование кода скрипта в буфер обмена');
        });
        describe('InvokeScript', () => {
            it('is_valid');
            it('dApp: адрес / алиас');
            it('имя функции максимальной длины');
            it('default функция');
            it('максимальное количество аргументов (22)');
            it('все типы аргументов (примитивы и List union-ов)');
            it('пейменты (без них и максимальное количество). Waves / asset / smart asset');
        });

        describe('UpdateAssetInfo', () => {
            it('is_valid');
        });
    });

    describe('Order', () => {
        it('Создание ордера');
        it('Отмена ордера');
    });
});
