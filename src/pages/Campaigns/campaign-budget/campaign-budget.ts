import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController } from 'ionic-angular';
import { MyWalletProvider } from '../../../providers/wallet/my-wallet-provider';
import { ValidatorProvider } from '../../../providers/validator/validator';

/**
 * Generated class for the CampaignBudgetPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-campaign-budget',
  templateUrl: 'campaign-budget.html',
})
export class CampaignBudgetPage {

  budget_value: number;
  rewards: any[];
  minimun_budget: number = 0;
  constructor(
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public myWallet: MyWalletProvider,
    public validator: ValidatorProvider
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CampaignBudgetPage');
    this.rewards = this.navParams.get('rewards');
    this.calculateMinBudget();
  }

  calculateMinBudget() {
    try {
      this.rewards.forEach(reward => {
        if (reward.amount) {
          this.minimun_budget += reward.amount;
        }
      });
      this.budget_value = this.minimun_budget;
    } catch (e) {
      console.log(e);
    }

  }

  lessBudget() {
    if (this.minimun_budget && this.budget_value) {
      return this.budget_value < this.minimun_budget;
    }
    return false;
  }

  budgetExceed() {
    if (this.myWallet.walletBalance) {
      return this.budget_value > this.myWallet.walletBalance;
    } else {
      return true;
    }
  }

  giveAmount() {
    this.viewCtrl.dismiss({ 'amount': this.budget_value });
  }

  close() {
    this.viewCtrl.dismiss(null);
  }

}
