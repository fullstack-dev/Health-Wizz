import { Injectable } from "@angular/core";
import { IWalletPasswdProvider, WalletProvider } from "./wallet";
import { AlertController, Events } from "ionic-angular";
import { ConstProvider } from "../const/const";
import { RestDataProvider } from "../rest-data-service/rest-data-service";
import { Helper } from "../helper-service";
import { WalletInfo, LedgerInfo } from "../../models/classes";
import { UserService } from "../user-service";

@Injectable()
export class MyWalletProvider implements IWalletPasswdProvider {

    private _wallet_status: string;
    private _omp_balance: number;
    private _wallet_configured: boolean;
    private _have_wallet: boolean;
    private _wallet_locked: boolean;

    constructor(
        public alertCtrl: AlertController,
        private wallet: WalletProvider,
        private constants: ConstProvider,
        private events: Events,
        private helper: Helper,
        private userService: UserService,
        private restService: RestDataProvider
    ) {
        this.events.subscribe("wallet:lock", (value) => {
            this._wallet_locked = value;
        });

        // this.events.subscribe("wallet:setup_complete", () => {
        //     this.updateWalletStatus().then(r => {
        //         this.updateOmpBalance();
        //     }).catch(e => {
        //         console.log(e);
        //     });
        // });

        this.wallet.passwdProvider = this;

        this.userService.$loginObserver.subscribe((userId: string) => {
            this.updateWalletStatus().then(res => {
                if (res) {
                    this.updateOmpBalance();
                }
            });
            this.userService.userIdSubject.next(userId);
        })
    }

    /**
     * get user wallet status immediately after login or after creating new wallet
     * @param key (optional)
     */
    updateWalletStatus() {
        return new Promise<boolean>((resolve) => {
            this.wallet.walletReady.then(status => {
                switch (status) {
                    case this.constants.WALLET_STATUS.SUCCESS:
                        this._have_wallet = true;
                        this._wallet_configured = true;
                        break;
                    case this.constants.WALLET_STATUS.CORRUPT_WALLET:
                        this._have_wallet = true;
                        this._wallet_configured = false;
                        break;
                    default:
                        this._have_wallet = false;
                        this._wallet_configured = false;
                        break;
                }
                if (this.wallet.isWalletCreated) {
                    this._have_wallet = true;
                    this._wallet_configured = true;
                }
                resolve(true);
            }).catch(e => {
                this._have_wallet = false;
                this._wallet_configured = false;
                resolve(null);
            });
        });
    }

    /**
     * update wallet OMP balance
     */
    updateOmpBalance(purseId: string | number = null) {
        if (!this._have_wallet) {
            Promise.reject(new Error("no_wallet"));
        }
        return this.wallet.getOmpBalance()
            .then(bal => {
                // if (purseId && this.primaryAddress) {
                //     this.restService.updateUserPurse(new WalletInfo())
                // }
                return this._omp_balance = bal;
            });
    }

    createCampaignWallet(campaign, amount: number = 0) {
        return new Promise<string>((resolve) => {
            this.generateCampaignWalletAddress(campaign.id, true)
                .then((c_address: string) => {
                    if (c_address) {
                        const data = new WalletInfo(campaign.campaignInfo.purse.id, c_address, amount);
                        this.restService.updateCampaignPurse(campaign.id, data)
                            .subscribe(r => {
                                this.transferEtherToCampaign(c_address)
                                    .then(r => {
                                        resolve(c_address)
                                    }).catch(e => {
                                        resolve(null);
                                    });
                            }, e => {
                                resolve(null);
                            });
                    } else {
                        resolve(null);
                    }
                }).catch(e => {
                    resolve(null);
                });
        });
    }

    private transferEtherToCampaign(campaignAddress: string) {
        return this.wallet.transferEther(campaignAddress, 0.5);
    }

    public updateMyPurse() {
        return new Promise<boolean>((resolve) => {
            if (this.userService.myPurse) {
                this.updateOmpBalance()
                    .then(r => {
                        let data = new WalletInfo(this.userService.myPurse.id, this.userService.myPurse.primaryAddress, this.walletBalance);
                        if (!data.primaryAddress) {
                            data.primaryAddress = this.primaryAddress;
                        }
                        this.restService.updateUserPurse(data).subscribe(r => {
                            resolve(true);
                        }, e => {
                            resolve(false);
                        })
                    }).catch(e => {
                        resolve(false);
                    });
            } else {
                resolve(false);
            }
        });
    }

    getBalanceByAddress(address: string) {
        return this.wallet.getOmpBalance(address)
            .then(bal => {
                if (bal && typeof (bal) == 'number') {
                    return bal;
                }
                return 0;
            }).catch(e => {
                return e;
            });
    }

    get primaryAddress() {
        return this.wallet.primaryAddress;
    }

    /**
     * get wallet's current balance.
     */
    get walletBalance() {
        if (this._omp_balance && typeof this._omp_balance == 'number') {
            return this._omp_balance;
        }
        return 0;
    }

    /**
     * user already have a wallet or not
     * @returns boolean
     */
    get have_wallet(): boolean {
        return this._have_wallet;
    }

    /**
     * check if user wallet corrupted or not
     * @returns boolean
     */
    get configured_wallet(): boolean {
        return this._wallet_configured;
    }

    get wallet_locked() {
        return this._wallet_locked;
    }

    generateCampaignWalletAddress(campaign_id: string | number, new_campaign: boolean) {
        if (!campaign_id) {
            return Promise.reject(new Error("no_campaign_id"));
        }
        return new Promise((resolve, reject) => {
            this.wallet.generateNewAddress()
                .then(address => {
                    resolve(address);
                }).catch(e => {
                    if (this.configured_wallet) {
                        this.helper.showAlert("To publish this campaign, you need to setup a wallet for it.", "");
                    } else {
                        if (new_campaign) {
                            this.helper.showAlert("In order to setup rewards for this Campaign, you first need to configure your Wallet.", "No Wallet!");
                        } else {
                            this.helper.showAlert("In order to publish this Campaign, you first need to configure your Wallet.", "No Wallet!");
                        }
                    }
                    reject(e);
                });
        });
    }

    generateCampaignAddresses(count: number) {
        return this.wallet.generateNewAddress(count);
    }

    transferOmp(toAddress: string, quantity: number, fromAddress: string = null) {
        return this.wallet.transferOmp(toAddress, quantity, fromAddress);
    }

    updateUserLedger(description: string, amount: number, txId: string, txType: string, txHash: string) {
        const data = new LedgerInfo(null, null, description, null, amount, txId, txType, txHash);
        return this.restService.updateUserLedger(data);
    }

    updateCampaignLedger(campaignId, description: string, amount: number, txId: string, txType: string, txHash: string) {
        const data = new LedgerInfo(null, null, description, null, amount, txId, txType, txHash);
        return this.restService.updateCampaignLedger(campaignId, data);
    }

    getPassword(): Promise<string> {
        return this.openPasswordWindow();
    }

    openPasswordWindow(): Promise<string> {
        return new Promise((resolve, reject) => {
            let alert = this.alertCtrl.create({
                title: 'Enter your wallet password',
                inputs: [
                    {
                        name: 'password',
                        placeholder: 'password',
                        type: 'password'
                    }],
                buttons: [{
                    text: 'Ok',
                    handler: (data) => {
                        if (data.password) {
                            resolve(data.password);
                        } else {
                            resolve(null);
                        }
                    }
                }, {
                    text: "Cancel",
                    role: 'cancel',
                    handler: () => {
                        resolve(null);
                    }
                }]
            });
            alert.present();
        });
    }

}