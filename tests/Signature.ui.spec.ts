describe('Signature', function () {
    function checkAnyTransaction() {
        it('Is shown');

        it('Rejected');

        it('Approved');
    }

    describe('Permission request from origin', function () {
        checkAnyTransaction.call(this);
    });

    describe('Authentication request from origin', function () {
        checkAnyTransaction.call(this);
    });

    describe('Transactions', function () {
        describe('Issue', function () {
            checkAnyTransaction.call(this);

            it('Copying script to the clipboard');
        });

        describe('Transfer', function () {
            checkAnyTransaction.call(this);

            it('Address');

            it('Alias');

            it('Waves / asset / smart asset');

            it('Attachment');

            it('Transfers to Gateways');
        });

        describe('Reissue', function () {
            checkAnyTransaction.call(this);
        });

        describe('Burn', function () {
            checkAnyTransaction.call(this);
        });

        describe('Exchange', function () {
            checkAnyTransaction.call(this);
        });

        describe('Lease', function () {
            checkAnyTransaction.call(this);
        });

        describe('LeaseCancel', function () {
            checkAnyTransaction.call(this);
        });

        describe('Alias', function () {
            checkAnyTransaction.call(this);

            it('Minimum alias length');

            it('Maximum alias length');
        });

        describe('MassTransfer', function () {
            checkAnyTransaction.call(this);
        });

        describe('Data', function () {
            checkAnyTransaction.call(this);
        });

        describe('SetScript', function () {
            checkAnyTransaction.call(this);

            it('Copying script to the clipboard');

            it('Set');

            it('Cancel');
        });

        describe('SponsorFee', function () {
            checkAnyTransaction.call(this);

            it('Set');

            it('Cancel');
        });

        describe('SetAssetScript', function () {
            checkAnyTransaction.call(this);

            it('Copying script to the clipboard');
        });

        describe('InvokeScript', function () {
            checkAnyTransaction.call(this);

            it('dApp: address / alias');

            it('Function name at max length');

            it('Default function call');

            it('Maximum number of arguments');

            it('Arguments of all types (primitives and List of unions)');

            describe('Payment', function () {
                it('Zero count');

                it('Maximum count');

                it('Waves / asset / smart asset');
            });
        });

        describe('UpdateAssetInfo', function () {
            checkAnyTransaction.call(this);
        });
    });

    describe('Order', function () {
        it('Create');

        it('Cancel');
    });

    describe('Multiple transactions package', function () {
        checkAnyTransaction.call(this);
    });

    describe('Signature of message', function () {
        checkAnyTransaction.call(this);
    });
});
