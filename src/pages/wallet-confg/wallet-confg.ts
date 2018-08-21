
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, Events, Slides, LoadingController, AlertController } from 'ionic-angular';
import { WalletProvider } from '../../providers/wallet/wallet';
import { ValidatorProvider } from '../../providers/validator/validator';
import { Helper } from '../../providers/helper-service';
import { RestDataProvider } from '../../providers/rest-data-service/rest-data-service';
import { MyWalletProvider } from '../../providers/wallet/my-wallet-provider';
import { WalletInfo } from '../../models/classes';

@IonicPage()
@Component({
  selector: 'page-wallet-confg',
  templateUrl: 'wallet-confg.html',
})
export class WalletConfgPage {

  title: string;
  @ViewChild(Slides) slides: Slides;
  seedStrings: string[];
  localSeedStrings: string[];
  ordered_chips: Array<string>;
  label_new_wallet = "New Wallet";
  label_secure_wallet = "Secure Wallet";
  label_verify_wallet = "Verify Mnemonic";
  label_encrypt_wallet = "Encrypt Wallet";
  slide_index = 0;
  wallet_password: any;
  wallet_c_password: any;
  wallet_pin: any;
  purse_loaded: boolean;
  my_purse: any;
  restore_keys: string[] = [];
  restore_key: string;
  creating_wallet: boolean = true;
  restore_wallet: boolean = false;

  constructor(
    public navCtrl: NavController,
    private wallet: WalletProvider,
    public myWallet: MyWalletProvider,
    public validator: ValidatorProvider,
    public restService: RestDataProvider,
    private helper: Helper,
    public events: Events,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController
  ) {
    this.title = this.label_new_wallet;
    this.ordered_chips = new Array();
  }

  ionViewDidLoad() {
    this.slides.lockSwipes(true);
    this.getPurse();
  }

  getPurse() {
    return new Promise((resolve) => {
      this.helper.showLoading();
      this.restService.getPurse()
        .subscribe(data => {
          this.helper.hideLoading();
          this.purse_loaded = true;
          this.my_purse = data;
          resolve(data);
        }, e => {
          this.helper.hideLoading();
          this.purse_loaded = false;
        });
    });
  }

  get have_primary_address() {
    if (this.purse_loaded) {
      if (this.my_purse.primaryAddress) {
        return true;
      }
      return false;
    }
    return false;
  }

  walletStarted() {
    try {
      let slide_index = this.slides.getActiveIndex();
      if (slide_index == 0) {
        return false;
      }
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }

  }

  get pageTitle() {
    if (this.slides) {
      let index = this.slides.getActiveIndex();
      switch (index) {
        case 0:
          return this.label_new_wallet;
        case 1:
          return this.label_secure_wallet;
        case 2:
          return this.label_verify_wallet;
        case 3:
          return this.label_encrypt_wallet;
        default:
          break;
      }
    }

  }

  createNewWallet() {
    if (this.have_primary_address) {
      this.helper.showConfirm("", "You already have a Wallet associated with your account. You can restore that with the Mnemonic keys if you stored them previousely. Are you still want to create a new Wallet?", "Yes", "No")
        .then(r => {
          this.createNew();
        }).catch(e => { })
    } else {
      this.createNew();
    }
  }

  createNew() {
    this.creating_wallet = true;
    this.restore_wallet = false;
    let seedStrings = WalletProvider.getSeedStrings();
    this.seedStrings = seedStrings;
    let localseeds = seedStrings.slice(); //prevent call by reference.
    this.localSeedStrings = this.shuffle(localseeds);
    this.slides.update();
    this.goNext();
  }

  restoreExisting() {
    this.restore_keys = [];
    this.restore_key = null;
    this.creating_wallet = false;
    this.restore_wallet = true;
    this.slides.update();
    this.goToSlide(3);
  }

  addRestorekey() {
    if (this.restore_key) {
      this.restore_keys.push(this.restore_key);
      this.restore_key = null;
    }

  }

  deleteFromRestoreKeys(i) {
    this.restore_keys.splice(i, 1);
  }

  reset() {
    this.title = this.label_new_wallet;
    this.slides.lockSwipes(false);
    this.slides.slideTo(0);
    this.slide_index = this.slides.getActiveIndex();
    this.slides.lockSwipes(true);
  }

  goNext() {
    this.slides.lockSwipes(false);
    this.slides.slideNext();
    this.slide_index = this.slides.getActiveIndex();
    this.slides.lockSwipes(true);
  }

  goToSlide(index) {
    setTimeout(() => {
      this.slides.lockSwipes(false);
      this.slides.slideTo(index);
      this.slide_index = this.slides.getActiveIndex();
      this.slides.lockSwipes(true);
    }, 300);
  }

  shuffle(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }

  validPassword() {
    return this.wallet_password == this.wallet_c_password;
  }

  hideSeedString(seedString) {
    let mySeedString = this.ordered_chips.find(string => {
      return string == seedString;
    });
    if (mySeedString) {
      return true;
    }
    return false;
  }

  addChip(chip) {
    this.ordered_chips.push(chip);
    // this.chips.splice(i, 1);
  }

  deleteChip(i) {
    this.ordered_chips.splice(i, 1);
  }

  isOrderValid() {
    // if order of keys are similar to ordered keys
    if (this.slide_index != 2) {
      return false;
    }
    if (this.ordered_chips.length < 12) {
      return false;
    }
    return this.seedStrings.toString() == this.ordered_chips.toString();
  }

  createWallet() {
    if (this.restore_wallet) {
      if (this.restore_keys.length != 12) {
        this.helper.showAlert("Mnemonic keystore seed is not valid", "Invalid seed!");
        return;
      }
      this.seedStrings = this.restore_keys.slice();
    }

    let flag = false;
    let loader = this.loadingCtrl.create({
      spinner: 'crescent'
    });
    let alert = this.alertCtrl.create({
      title: "",
      message: "Wallet configuration can take a minute or more. Please wait until the loader finishes.",
      buttons: [{
        text: 'Ok',
        role: 'cancel',
        handler: () => {
          loader.present();
          // const timerId = setTimeout(() => {
          //   loader.dismiss();
          //   if (!flag) {
          //     this.helper.showAlert("Unable to process your request.", "Error!");
          //   }
          // }, 120000);

          this.wallet.createWallet(this.wallet_password, this.seedStrings)
            .then(r => {
              // clearTimeout(timerId);
              flag = true;

              this.myWallet.updateWalletStatus().then(r => {
                this.myWallet.updateOmpBalance();
              });

              // if (this.creating_wallet) {
              //   this.giveInitialAmount()
              //     .then(r => {
              //       console.log("1 OMP and GAS amount transferred");
              //     }).catch(e => {
              //       console.log("Initial amount not transferred.");
              //     });
              // }

              if (this.creating_wallet && !this.have_primary_address) {
                this.storePrimaryKey()
                  .then(r => {
                    loader.dismiss();
                    this.allSuccess();
                  })
                  .catch(e => {
                    loader.dismiss();
                    this.addressSaveFailed();
                  });
              } else {
                this.events.publish('wallet:created', true);
                loader.dismiss();
                this.allSuccess();
              }
            }).catch(e => {
              // clearTimeout(timerId);
              loader.dismiss();
              this.walletCreateRestoreFailed(e);
            });
        }
      }]
    });

    alert.present();
  }

  giveInitialAmount() {
    let promises = [];
    let address = this.myWallet.primaryAddress;
    if (!address) {
      return Promise.reject("no_address");
    }
    promises.push(this.restService.giveInitialGas(address).toPromise());
    promises.push(this.restService.giveInitialOMP(address).toPromise());
    return Promise.all(promises);
  }

  allSuccess() {
    setTimeout(() => {
      if (this.creating_wallet) {
        this.helper.showAlert("Your wallet has been created.", "Congratulations!");
      } else {
        this.helper.showAlert("Your wallet has been restored.", "Congratulations!");
      }
      this.exit();
    }, 100);
  }

  addressSaveFailed() {
    setTimeout(() => {
      if (this.creating_wallet) {
        this.helper.showAlert("Your wallet has been created.", "Congratulations!");
      } else {
        this.helper.showAlert("Your wallet has been restored.", "Congratulations!");
      }
      this.exit();
    }, 100);
  }

  walletCreateRestoreFailed(err) {
    setTimeout(() => {
      if (err.message == "Invalid Seed") {
        this.helper.showAlert("Mnemonic keystore seed is not valid", "Invalid seed!");
        this.slides.lockSwipes(false);
        this.slides.slidePrev();
        this.slide_index = this.slides.getActiveIndex();
        this.slides.lockSwipes(true);
      }
      else
        this.helper.showAlert("Unable to process your request.", "Error!");
    }, 100);
  }

  exit() {
    setTimeout(() => {
      this.navCtrl.pop();
    }, 100);
  }

  storePrimaryKey() {
    let primaryAddress = this.wallet.primaryAddress;
    if (primaryAddress) {
      return this.restService.updateUserPurse(new WalletInfo(this.my_purse.id, primaryAddress, this.myWallet.walletBalance)).toPromise();
    } else {
      return Promise.reject("no_address");
    }

  }

}