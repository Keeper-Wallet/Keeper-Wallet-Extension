import {expect, assert} from 'chai';
import {WalletController} from "../src/controllers";
import {encrypt} from "../src/lib/encryprtor";
import {Money} from "@waves/data-entities";
import * as SG from '@waves/signature-generator';

describe('WalletController', () => {
    const password = 'example';
    const initState = {vault: encrypt([], password)}
    const seed = 'talk lottery wasp evolve humble staff magnet unlock agent inner frequent assist elevator critic rice'
    it('Should init vault', () => {
        const controller = new WalletController();
        controller.initVault(password);
        expect(controller.store.getState().vault).to.be.a('string')
    });

    it('Initialized vault should be empty', () => {
        const controller = new WalletController();
        controller.initVault(password);
        controller.addWallet({type: 'seed', networkCode: 'T', seed});
        controller.initVault(password);
        expect(controller.wallets.length).to.eq(0)
    });

    it('Should not init vault without password', () => {
        const controller = new WalletController();
        expect(() => controller.initVault()).to.throw('Password is needed to init vault')
    });

    it('Should create controller from init state and lock/unlock it', () => {
        const controller = new WalletController({initState});
        controller.unlock(password);
        expect(controller.store.getState().locked).to.be.false;
        controller.lock();
        expect(controller.store.getState().locked).to.be.true;
    });

    it('Should set new password', () => {
        const controller = new WalletController({initState});
        controller.newPassword(password, 'newPassword');
        controller.unlock('newPassword');
        expect(controller.store.getState().locked).to.be.false;
    });

    it('Should not set new password with invalid old pass', () => {
        const controller = new WalletController({initState});
        expect(() => controller.newPassword('bad pass', 'newPassword')).to.throw('Invalid password')
    });

    it('Should not set new password with no new password', () => {
        const controller = new WalletController({initState});
        expect(() => controller.newPassword(undefined, 'newPassword')).to.throw('Password is required')
    });

    it('Should add wallets', () => {
        const controller = new WalletController({initState});
        controller.unlock(password);
        controller.addWallet({type: 'seed', networkCode: 'T', seed});
        expect(controller.wallets.length).to.eq(1)
    });

    it('Should not add wallets to locked vault', () => {
        const controller = new WalletController({initState});
        controller.lock();
        try {
            controller.addWallet({type: 'seed', networkCode: 'T', seed});
        } catch (e) {
            expect(e.message).to.eql('App is locked')
        }
        expect(controller.wallets.length).to.eq(0)
    });

    it('Should not add duplicate wallets', () => {
        const controller = new WalletController({initState});
        controller.unlock(password);
        controller.addWallet({type: 'seed', networkCode: 'T', seed});
        expect(() => controller.addWallet({type: 'seed', networkCode: 'T', seed})).to.throw(/Account with address .+/)
    });

    it('Should not add wallets with same seed for different networks', () => {
        const controller = new WalletController({initState});
        controller.unlock(password);
        controller.addWallet({type: 'seed', networkCode: 'T', seed});
        controller.addWallet({type: 'seed', networkCode: 'W', seed});
        expect(controller.wallets.length).to.eq(2)
    });

    it('Should remove wallets', () => {
        const controller = new WalletController({initState});
        controller.unlock(password);
        controller.addWallet({type: 'seed', networkCode: 'T', seed});
        controller.addWallet({type: 'seed', networkCode: 'T', seed: seed + '1'});

        controller.removeWallet(controller.wallets[0].getAccount().address);
        expect(controller.wallets.length).to.eq(1)
    });

    it('Should export account', () => {
        const controller = new WalletController({initState});
        controller.unlock(password);
        controller.addWallet({type: 'seed', networkCode: 'T', seed});

        const exported = controller.exportAccount(controller.wallets[0].getAccount().address, password);
        expect(exported).to.eq(seed)
    });

    it('Should not export on invalid password', () => {
        const controller = new WalletController({initState});
        controller.unlock(password);
        controller.addWallet({type: 'seed', networkCode: 'T', seed});


        const exported = () => controller.exportAccount(controller.wallets[0].getAccount().address);
        expect(exported).to.throw('Password is required')
    });

    it('Should sign tx', async () => {
        const controller = new WalletController({initState});
        controller.unlock(password);
        controller.addWallet({type: 'seed', networkCode: 'T', seed});

        // todo: request assset props from service by asset id
        const money = new Money(100000, {
            id: 'WAVES',
            name: 'Default Name',
            precision: 8,
            description: 'Default description',
            height: 10,
            timestamp: new Date('2016-04-12'),
            sender: '3N3Cn2pYtqzj7N9pviSesNe8KG9Cmb718Y1',
            quantity: 1000,
            reissuable: false
        })
        const tx = {
            type: 4,
            data: {
                assetId: 'WAVES',
                feeAssetId: 'WAVES',
                amount: money,
                fee: money,
                attachment: '',
                recipient: '3N3Cn2pYtqzj7N9pviSesNe8KG9Cmb718Y1'
            }
        }
        const address = controller.wallets[0].getAccount().address
        const txJson = await controller.signTx(address, tx)
        expect(JSON.parse(txJson).proofs.length).to.be.greaterThan(0)
    });


    it('Should sign auth data', async () => {
        const controller = new WalletController({initState});
        controller.unlock(password);
        controller.addWallet({type: 'seed', networkCode: 'T', seed});

        const authData = {
            type: 1000,
            data:
                {
                    data: 'hello',
                    prefix: 'WavesWalletAuthentication',
                    host: 'someorigin',
                    name: 'avcd',
                    icon: undefined
                }
        };

        const address = controller.wallets[0].getAccount().address
        const signed = await controller.auth(address, authData)
        expect(signed.signature).to.be.a('string')
    });

    it('Should sign request data', async () => {
        const controller = new WalletController({initState});
        controller.unlock(password);
        controller.addWallet({type: 'seed', networkCode: 'T', seed});

        const requestData = { type: 1001, data: { timestamp: 1540817062571 } };

        const address = controller.wallets[0].getAccount().address
        const signed = await controller.auth(address, requestData)
        expect(signed.signature).to.be.a('string')
    });

    it('Should sign arbitrary bytes', async () => {
        const controller = new WalletController({initState});
        controller.unlock(password);
        controller.addWallet({type: 'seed', networkCode: 'T', seed});

        const data =[2,3,4,5];

        const {address, publicKey } = controller.wallets[0].getAccount()
        const signature = await controller.signBytes(address, data)

        expect( SG.utils.crypto.isValidSignature(Uint8Array.from(data), signature, publicKey)).to.be.true
    });
});