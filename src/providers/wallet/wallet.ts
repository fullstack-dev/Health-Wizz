
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';

import * as LightWallet from 'eth-lightwallet';
import * as HWeb3Provider from 'hooked-web3-provider';
import * as Web3 from 'web3';
import * as TruffleContract from 'truffle-contract';
import { BigNumber } from 'bignumber.js';

import * as HealthWizzTokenJson from './contracts/HealthWizzToken.json'
import { UserService } from '../user-service';


/*
  Generated class for the WalletProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class WalletProvider {

    private hdPath: string = "m/44'/60'/0'/0";
    private storageKey: string = 'wallet';
    private myWeb3Host: string = 'http://hwnet.ethereum.healthwizz.io';

    private myKeyStore: any = null;
    private _web3: Web3 = null;
    private _passwdProvider: IWalletPasswdProvider = null;
    private _healthWizzContract: any = null;
    private _walletReady: Promise<string>;
    private cachedEncPasswd: object = null;
    private cachedPasswdKey: object = null;
    private passwdExpiryTmo: number = 5 * 60 * 1000; // 5 min in ms.
    private passwdExpiryTimerId: number;
    private healthWizzToken: any = <any>HealthWizzTokenJson;
    private healthWizzTokenObj: any;
    private hWeb3: HWeb3Provider = null;
    private gasMap: object = {};
    private lastGasTime: number;
    private lastGasPrice: BigNumber;
    // constructor(
    //     private storage: Storage,
    //     private events: Events,
    //     private userService: UserService
    // ) {
    //     console.log('Hello WalletProvider Provider');
    //     this.healthWizzTokenObj = TruffleContract(this.healthWizzToken);
    //     this.userService.$userId.subscribe((userId: string) => {
    //         this.storageKey += userId;
    //         console.log("storage key => ", this.storageKey);
    //         this._walletReady = storage.get(this.storageKey).then(val => {
    //             if ((val == undefined) || (val == null)) {
    //                 this.myKeyStore = null;
    //                 return 'no_wallet';
    //             }
    //             try {
    //                 this.myKeyStore = LightWallet.keystore.deserialize(val);
    //             } catch (err) {
    //                 this.myKeyStore = null;
    //                 return 'corrupt_wallet';
    //             }
    //             return this.setupWallet();
    //         }, err => {
    //             return 'unset_wallet';
    //         });
    //     });
    // }

    constructor(
        private storage: Storage,
        private events: Events,
        private userService: UserService
    ) {
        console.log('Hello WalletProvider Provider');
        this.healthWizzTokenObj = TruffleContract(this.healthWizzToken);

        this._walletReady = new Promise((resolve, reject) => {
            let subs = this.userService.$userId.subscribe((userId: string) => {
                this.storageKey += userId;
                subs.unsubscribe();
                storage.get(this.storageKey).then(val => {
                    if ((val == undefined) || (val == null)) {
                        this.myKeyStore = null;
                        resolve('no_wallet');
                        return;
                    }
                    try {
                        this.myKeyStore = LightWallet.keystore.deserialize(val);
                    } catch (err) {
                        this.myKeyStore = null;
                        resolve('corrupt_wallet');
                        return;
                    }
                    this.setupWallet().then(status => resolve(status));
                }, err => {
                    resolve('unset_wallet');
                });
            });
        });
    }

    private setupWallet(): Promise<string> {

        this.myKeyStore.passwordProvider = callback => this.wrapperPasswdProvider(callback);
        this.hWeb3 = new HWeb3Provider({ host: this.myWeb3Host, transaction_signer: this.myKeyStore });
        this._web3 = new Web3(this.hWeb3);
        this.healthWizzTokenObj.setProvider(this.hWeb3);

        this._web3.eth.getGasPrice((err, res) => {
            if (!err) {
                this.lastGasPrice = res;
                this.lastGasTime = Date.now();
            }
        });
        return this.healthWizzTokenObj.deployed().then(inst => {
            this.setupContract(inst);
            return 'success';
        }, err => {
            this._healthWizzContract = null;

            //Poll to create contract
            (<() => void>(() => {
                var tid = setInterval(() => {
                    if (this._healthWizzContract == null) {
                        this.healthWizzTokenObj.deployed().then(inst => {
                            this.setupContract(inst);
                            this.events.publish('wallet:setup_complete');
                            clearInterval(tid);
                        }, err => {
                        });
                    }
                    else {
                        clearInterval(tid);
                    }
                }, 5000);
            }))();

            return 'no_contract';
        });
    }

    private setupContract(contractInstance: any) {
        this._healthWizzContract = contractInstance;
        this._healthWizzContract.Transfer({ to: this.primaryAddress }, 'latest').watch((err, eventObj) => {
            if (!err) this.onTransfer('to', eventObj);
        });
        this._healthWizzContract.Transfer({ from: this.primaryAddress }, 'latest').watch((err, eventObj) => {
            if (!err) this.onTransfer('from', eventObj);
        });
    }

    private onTransfer(direction: string, eventObj: any) {
        this.events.publish('wallet:transfer', direction, this._web3.fromWei(eventObj.args.value, 'ether').toNumber());
    }

    get walletReady(): Promise<string> {
        return this._walletReady;
    }

    get passwdProvider(): IWalletPasswdProvider {
        return this._passwdProvider;
    }

    set passwdProvider(newPasswdProvider: IWalletPasswdProvider) {
        this._passwdProvider = newPasswdProvider;
    }

    get web3(): Web3 {
        return this._web3;
    }

    get healthWizzContract(): any {
        return this._healthWizzContract;
    }

    get isLocked(): boolean {
        return ((this.cachedEncPasswd == null) || (this.cachedPasswdKey == null));
    }

    get isWalletCreated(): boolean {
        return this.myKeyStore != null;
    }

    get isReady(): boolean {
        return ((this.myKeyStore != null) && (this._healthWizzContract != null));
    }

    get isConnected(): boolean {
        return this._web3.isConnected();
    }

    generateNewAddress(count?: number): Promise<string | string[]> {

        if (count === undefined) count = 1;
        if (this.myKeyStore == null)
            return Promise.reject(new Error('No wallet'));

        return this.getPassword(true).then(pwDerivedKey => {
            this.myKeyStore.generateNewAddress(pwDerivedKey, count);
            this.storage.set(this.storageKey, this.myKeyStore.serialize());
            let addrs = this.myKeyStore.getAddresses();
            if (count == 1) return addrs[addrs.length - 1];
            return addrs.slice(addrs.length - count);
        });
    }

    static getSeedStrings(entropy?: string): string[] {
        if ((entropy == undefined) || (entropy == '')) {
            entropy = (new Date()).getTime().toString() + Math.floor(Math.random() * 1000000).toString();
        }

        return LightWallet.keystore.generateRandomSeed(entropy).split(' ');
    }

    createWallet(passwd: string, seed: string[],
        passwdProvider: IWalletPasswdProvider = null, force: boolean = false): Promise<boolean> {

        let seedStr: string = seed.join(' ');
        if (!LightWallet.keystore.isSeedValid(seedStr)) {
            return Promise.reject(new Error('Invalid Seed'));
            // return;
        }

        if (this.myKeyStore != null) {
            if (!force) {
                return Promise.reject(new Error('Already Created'));
                // return;
            }
        }

        return new Promise<boolean>((resolve, reject) => {

            LightWallet.keystore.createVault({ password: passwd, seedPhrase: seedStr, hdPathString: this.hdPath },
                (err, ks) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    ks.keyFromPassword(passwd, (err, pwDerivedKey) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        this.cachedPasswdKey = pwDerivedKey;
                        // generate 2 new address/private key pairs
                        // 1st address in user's public address.
                        // 2nd address is for applications encryption use
                        ks.generateNewAddress(pwDerivedKey, 2);
                        this.myKeyStore = ks;
                        this.storage.set(this.storageKey, ks.serialize());
                        // use [1] address to encrypt passwd
                        this.cachedEncPasswd = LightWallet.encryption.multiEncryptString(ks, pwDerivedKey, passwd, ks.getAddresses()[1],
                            [LightWallet.encryption.addressToPublicEncKey(ks, pwDerivedKey, ks.getAddresses()[1])]);
                        this.passwdExpiryTimerId = setTimeout(() => this.clearPasswdCache(), this.passwdExpiryTmo);
                        this.events.publish('wallet:lock', false);
                        if (passwdProvider != null)
                            this._passwdProvider = passwdProvider;
                        // report success even if connection to contract not established.
                        // That would be due to network failure.
                        this.setupWallet().then(res => resolve((res === 'success') || (res === 'no_contract')),
                            err => reject(err));
                    });
                });
        });
    }

    changeWalletPasswd(oldPasswd: string, newPasswd: string): Promise<boolean> {

        if (this.myKeyStore == null) return Promise.reject(new Error('No wallet'));

        let oldKeyStore = this.myKeyStore;
        return this.getDerivedKey(oldPasswd).then(pwDerivedKey => {
            let seedStr: string[] = this.myKeyStore.getSeed(pwDerivedKey).split(' ');
            return this.createWallet(newPasswd, seedStr, null, true);
        }).then(success => {
            if (!success) {
                throw new Error('Change Passwd Failed');
            }
            return this.getDerivedKey(newPasswd);
        }).then(pwDerivedKey => {
            let addrs: string[] = oldKeyStore.getAddresses();
            if (addrs.length > 2) {
                this.myKeyStore.generateNewAddress(pwDerivedKey, addrs.length - 2);
                this.storage.set(this.storageKey, this.myKeyStore.serialize());
            }
            return (true);
        }).catch(err => {
            this.myKeyStore = oldKeyStore;
            this.storage.set(this.storageKey, this.myKeyStore.serialize());
            throw new Error(err);
        });
    }

    unlockWallet(passwd: string): Promise<boolean> {
        return this.getPassword(false).then(passwd => {
            return true;
        }).catch(err => {
            throw new Error(err);
        });
    }

    get primaryAddress(): string {
        if (this.myKeyStore == null) return null;
        return this.myKeyStore.getAddresses()[0];
    }

    get allAddresses(): string[] {
        if (this.myKeyStore == null) return null;
        return this.myKeyStore.getAddresses();
    }


    getEtherBalance(forAddress?: string): Promise<number> {

        if (!this._web3.isConnected()) {
            return Promise.reject(new Error('No net'));
        }

        if (forAddress === undefined)
            forAddress = this.primaryAddress;

        return new Promise((resolve, reject) => {

            this._web3.eth.getBalance(forAddress, (err, res) => {
                if (err) {
                    reject(new Error(err));
                    return;
                }
                resolve(this._web3.fromWei(res, 'ether').toNumber());
            });
        });
    }

    getOmpBalance(forAddress?: string): Promise<number> {

        if (!this._web3.isConnected()) {
            return Promise.reject(new Error('No net'));
        }

        if (this._healthWizzContract == null) {
            return Promise.reject(new Error('No Contract'));
        }

        if (forAddress === undefined)
            forAddress = this.primaryAddress;

        return (this._healthWizzContract.balanceOf(forAddress)).then(res => {
            return (this._web3.fromWei(res, 'ether').toNumber());
        }).catch(err => {
            return new Error(err);
        });
    }

    transferEther(toAddress: string, quantity: number, fromAddr: string = null): Promise<string> {

        if (this.myKeyStore == null) {
            return Promise.reject(new Error('No Wallet'));
        }

        if (!this._web3.isConnected()) {
            return Promise.reject(new Error('No net'));
        }

        let weiQuantity = this._web3.toWei(this._web3.toBigNumber(quantity), 'ether');

        return new Promise((resolve, reject) => {

            if (fromAddr == null) {
                fromAddr = this.primaryAddress;
                resolve(true);
            }
            else {
                this.myKeyStore.hasAddress(fromAddr, (err, res) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(res);
                });
            }
        }).then(validAddr => {
            if (!validAddr)
                throw new Error('Unknown Sender');

            if (this.gasMap['transferEther'] === undefined) {
                return new Promise((resolve, reject) => {
                    this._web3.eth.estimateGas({ from: fromAddr, to: toAddress, value: weiQuantity },
                        (err, gasEst) => {
                            if (err) {
                                reject(err);
                                return;
                            }
                            gasEst += 100;
                            this.gasMap['transferEther'] = gasEst;
                            resolve(gasEst);
                        });
                });
            }
            else {
                return (this.gasMap['transferEther']);
            }
        }).then(gasEst => {
            if ((Date.now() - this.lastGasTime) < 30000) {
                return ({ gasPrice: this.lastGasPrice, gasEst: gasEst });
            }
            return new Promise((resolve, reject) => {
                this._web3.eth.getGasPrice((err, gasPrice: BigNumber) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    this.lastGasPrice = gasPrice.plus(10);
                    this.lastGasTime = Date.now();
                    resolve({ gasPrice: this.lastGasPrice, gasEst: gasEst });
                });
            });

        }).then((gasObj: { gasPrice: BigNumber, gasEst: number }) => {
            return new Promise<string>((resolve, reject) => {
                this._web3.eth.sendTransaction({ from: fromAddr, to: toAddress, value: weiQuantity, gas: gasObj.gasEst, gasPrice: gasObj.gasPrice },
                    (err, txHash) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(txHash);
                    });
            });
        }).catch(err => {
            throw new Error(err);
        });
    }

    transferOmp(toAddress: string, quantity: number, fromAddr: string = null): Promise<string> {

        if (this.myKeyStore == null) {
            return Promise.reject(new Error('No Wallet'));
        }
        if (!this._web3.isConnected()) {
            return Promise.reject(new Error('No net'));
        }
        if (this._healthWizzContract == null) {
            return Promise.reject(new Error('No Contract'));
        }

        let weiQuantity = this._web3.toWei(this._web3.toBigNumber(quantity), 'ether');

        return new Promise((resolve, reject) => {

            if (fromAddr == null) {
                fromAddr = this.primaryAddress;
                resolve(true);
            }
            else {
                this.myKeyStore.hasAddress(fromAddr, (err, res) => {
                    if (err) {
                        reject(new Error(err));
                        return;
                    }
                    resolve(res);
                });
            }
        }).then(validAddr => {

            if (!validAddr)
                throw new Error('Unknown Sender');

            if (this.gasMap['transferOmp'] === undefined) {
                return (this._healthWizzContract.transfer.estimateGas(toAddress, weiQuantity, { from: fromAddr }).then(gasEst => {
                    gasEst += 100;
                    this.gasMap['transferOmp'] = gasEst;
                    return gasEst;
                }));
            }
            else {
                return (this.gasMap['transferOmp']);
            }
        }).then(gasEst => {
            if ((Date.now() - this.lastGasTime) < 30000) {
                return ({ gasPrice: this.lastGasPrice, gasEst: gasEst });
            }
            return new Promise((resolve, reject) => {
                this._web3.eth.getGasPrice((err, gasPrice: BigNumber) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    this.lastGasPrice = gasPrice.plus(10);
                    this.lastGasTime = Date.now();
                    resolve({ gasPrice: this.lastGasPrice, gasEst: gasEst });
                });
            });

        }).then((gasObj: { gasPrice: BigNumber, gasEst: number }) => {
            return this._healthWizzContract.transfer.sendTransaction(toAddress, weiQuantity, { from: fromAddr, gas: gasObj.gasEst, gasPrice: gasObj.gasPrice });
        }).catch(err => {
            throw new Error(err);
        });
    }

    private getDerivedKey(passwd: string): Promise<object> {

        if (this.myKeyStore == null) {
            return Promise.reject(new Error('No wallet'));
        }

        return new Promise((resolve, reject) => {

            this.myKeyStore.keyFromPassword(passwd, (err, pwDerivedKey) => {
                if (err) {
                    reject(new Error('Internal Error'));
                    return;
                }
                resolve(pwDerivedKey);
            })
        });
    }

    private getPassword(derivedPw: boolean): Promise<string | object> {

        if (this.myKeyStore == null) {
            return Promise.reject(new Error('No wallet'));
        }

        let cachePwd = this.cachedEncPasswd;
        let cacheKey = this.cachedPasswdKey;

        return new Promise<string | object>((resolve, reject) => {

            if ((cachePwd != null) && (cacheKey != null)) {

                let passwd: string | boolean = false;

                if (derivedPw) {
                    passwd = '';
                }
                else {
                    let addr = this.myKeyStore.getAddresses()[1];
                    passwd = LightWallet.encryption.multiDecryptString(this.myKeyStore, cacheKey, cachePwd,
                        LightWallet.encryption.addressToPublicEncKey(this.myKeyStore, cacheKey, addr), addr);
                }
                clearTimeout(this.passwdExpiryTimerId);
                if (passwd !== false) {
                    this.passwdExpiryTimerId = setTimeout(() => this.clearPasswdCache(), this.passwdExpiryTmo);
                    resolve(<string>passwd);
                    return;
                }
                cacheKey = null; cachePwd = null;
                this.clearPasswdCache();
            }

            if (this._passwdProvider == null)
                reject(new Error("No password provider"));

            this._passwdProvider.getPassword().then(passwd => {
                if ((passwd == null) || (passwd == '')) {
                    reject(new Error("Unable to get Password"));
                    return;
                }
                resolve(passwd);
            });
        }).then((passwd: string) => {
            if ((cachePwd != null) && (cacheKey != null)) {
                return ({ simple: passwd, derived: null });
            }
            return this.getDerivedKey(<string>passwd).then(pwDerivedKey => {
                return ({ simple: passwd, derived: pwDerivedKey });
            });
        }).then((passObj: { simple: string, derived: object }) => {
            if (passObj.derived == null) {
                return (derivedPw ? cacheKey : passObj.simple);
            }
            this.cachedPasswdKey = passObj.derived;
            let addr = this.myKeyStore.getAddresses()[1];
            this.cachedEncPasswd = LightWallet.encryption.multiEncryptString(this.myKeyStore, passObj.derived, passObj.simple, addr,
                [LightWallet.encryption.addressToPublicEncKey(this.myKeyStore, passObj.derived, addr)]);
            clearTimeout(this.passwdExpiryTimerId);
            this.passwdExpiryTimerId = setTimeout(() => this.clearPasswdCache(), this.passwdExpiryTmo);
            this.events.publish('wallet:lock', false);
            return (derivedPw ? passObj.derived : passObj.simple);
        }).catch(err => {
            clearTimeout(this.passwdExpiryTimerId);
            this.clearPasswdCache();
            throw new Error(err);
        });
    }

    private wrapperPasswdProvider(callback: (err: any, passwd: string) => void): void {

        this.getPassword(false).then(passwd => {
            callback(null, <string>passwd);
        }).catch(err => {
            callback(err, '');
        });
    }

    private clearPasswdCache() {

        this.cachedEncPasswd = null;
        this.cachedPasswdKey = null;
        this.events.publish('wallet:lock', true);
    }
}

export interface IWalletPasswdProvider {
    getPassword(): Promise<string>;
}
