import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams } from 'ionic-angular';
import { UserService } from '../../../providers/user-service';
@IonicPage()
@Component({
  selector: 'page-popover-manage',
  templateUrl: 'popover-manage.html',
})
export class PopoverManagePage {
  member: any;
  creatorId: any;
  userId: any;
  memberId: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public userService: UserService
  ) {
    this.member = this.navParams.get('member');
    this.creatorId = parseInt(this.navParams.get('creatorId'));
    this.userId = parseInt(this.userService.getUserId());
    this.memberId = parseInt(this.member.memberId);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PopoverManagePage');
  }

  selected(value) {
    this.viewCtrl.dismiss({ value: value });
  }

  canRemoveModerator() {
    if (this.memberId == this.creatorId) {
      return false;
    } else if (this.member.memberRoles.moderator) {
      return true;
    } else {
      return false;
    }
  }

  canDeleteMember() {
    if (this.memberId == this.userId) {
      return false;
    }
    if (this.memberId == this.creatorId) {
      return false;
    }
    return true;
  }

}
