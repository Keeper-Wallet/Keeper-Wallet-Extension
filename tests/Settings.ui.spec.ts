describe('Settings', function () {
    describe('General', function () {
        it('The current version of the extension is displayed');

        describe('Session Timeout', function () {
            // todo afterEach() login
            it('Logout after "Browser timeout"');
            it('Logout after 5 min / 10 min / 1 hour');
        });

        describe('Auto-click protection', function () {
            it('Can be enabled');
            it('Can be disabled');
            it('Display tooltip');
        });

        describe('Delete accounts', function () {
            it('Account deletion warning displays');
            it('Clicking "Back" button cancels the deletion');
            it('Clicking "Delete account" removes all accounts from current network');
        });

        describe('Logout', function () {
            // todo after() login
            it('Exit to the login screen');
        });
    });

    describe('Network', function () {
        describe('Node URL', function () {
            it('Is shown');
            it('Can be copied');
            it('Can be changed');
        });

        describe('Matcher URL', function () {
            it('Is shown');
            it('Can be copied');
            it('Can be changed');
        });

        describe('Set default', function () {
            it('Resets Node and Matcher URLs');
        });
    });

    describe('Permissions control', function () {
        describe('White list', function () {
            it('Default whitelisted services appears');

            describe('Changing autolimits in resource settings', function () {
                it('Enabling'); // "Approved + automatic signing" shown in resource
                it('Disabling');
            });

            describe('Verification of transactions with autolimits', function () {
                it('Transfer');
                it('MassTransfer');
                it('Data');
                it('InvokeScript');
            });
        });

        describe('Custom list', function () {
            it('Adding');
            it('Blocking');
            it('Removing');
            it('Adding autolimits when adding to "Custom list"'); // "Spending limit" available only if "Resolution time" set

            describe('Changing autolimits in resource settings', function () {
                it('Enabling'); // "Approved + automatic signing" shown in resource
                it('Disabling');
            });

            describe('Verification of transactions with autolimits', function () {
                it('Transfer');
                it('MassTransfer');
                it('Data');
                it('InvokeScript');
            });
        });
    });
});
