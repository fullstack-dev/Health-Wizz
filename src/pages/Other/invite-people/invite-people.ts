import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams, ModalController, ActionSheetController } from 'ionic-angular';
import { Contacts } from '@ionic-native/contacts';

import { Rest } from '../../../providers/rest';
import { InviteContact, InviteData, Participant, MemberRolesInfo, InviteScreenInfo } from '../../../models/classes';
import { RestDataProvider } from '../../../providers/rest-data-service/rest-data-service';
import { Helper } from '../../../providers/helper-service';
import { SMS } from '@ionic-native/sms';
import { Toast } from '@ionic-native/toast';

@IonicPage()
@Component({
  selector: 'page-invite-people',
  templateUrl: 'invite-people.html',
})
export class InvitePeoplePage {
  searchQuery: string;
  inviterData: any;
  avatars = [];
  srcAvatars = [];
  socialData: any;
  addInviters: any;
  errorMessage: string;
  config: any;
  social_id: any;
  avatarData: any;
  myContacts: Array<InviteContact>;
  contact_data_list = [];
  screen_info: InviteScreenInfo;
  contacts_to_invite: Array<InviteContact>;
  contacts_from_input: Array<InviteContact>;
  success_contacts: string[];
  failed_contacts: string[];
  members: Array<Participant>;
  input_value: { 'type': string, 'value': string } = { 'type': null, 'value': null };

  // phonePattern: RegExp = /^\+([1-9]{1,2})(?!0{10})[0-9]{10}$/ country code + 10 digits
  phonePattern: RegExp = /^(\+?([1-9]{1,2}))?\(?([0-9]{3})\)?[-.●\s]?([0-9]{3})[-.●\s]?([0-9]{4})$/

  emailPattern: RegExp = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"\d]{2,})$/

  show_back: boolean;

  invite_as: string = "P"; // possible values M - for moderator, V - for validator, B - for both, P - for only participant

  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public modalCtrl: ModalController,
    public actionSheetCtrl: ActionSheetController,
    public navParams: NavParams,
    public rest: Rest,
    private contacts: Contacts,
    private restService: RestDataProvider,
    private helper: Helper,
    private sms: SMS,
    private toast: Toast
  ) {

    this.myContacts = new Array();
    this.contacts_to_invite = new Array();
    this.contacts_from_input = new Array();
    this.social_id = 0;
    let that = this

    this.config = {
      scrollbar: '.swiper-scrollbar',
      scrollbarHide: true,
      slidesPerView: 'auto',
      centeredSlides: true,
      observer: true,
      spaceBetween: 1,
      grabCursor: true,
      onSlideChangeEnd: function (swiper) {
        that.swipe(swiper);
      }
    };
    this.addInviters = [];
  }

  ionViewDidLoad() {
    this.show_back = this.navParams.get("show_back");
    this.screen_info = this.navParams.get('invite_screen_info');
    if (!this.screen_info.invities.moderators) {
      this.screen_info.invities.moderators = new Array();
    }
    if (!this.screen_info.invities.validators) {
      this.screen_info.invities.validators = new Array();
    }

    this.members = this.navParams.get('members');

    this.readContacts();

  }

  readContacts() {
    let myContacts: Array<InviteContact> = new Array();
    this.helper.showLoading();
    this.contacts.find(['phoneNumbers', 'emails'], { filter: "", multiple: true })
      .then(data => {
        if (data && data.length > 0) {
          data.forEach(contact => {
            if (contact.emails || contact.phoneNumbers) {
              let email = "";
              let phone = "";
              if (contact.emails) {
                email = contact.emails[0].value;
              }
              if (contact.phoneNumbers) {
                phone = contact.phoneNumbers[0].value;
              }

              let contact_name;
              if (contact.name && contact.name.formatted) {
                contact_name = contact.name.formatted;
              } else {
                if (phone != "") {
                  contact_name = phone;
                } else if (email != "") {
                  contact_name = email;
                }
              }
              if (phone && String(phone).length >= 10) {
                let new_contact = new InviteContact(contact_name, email, phone, false);
                myContacts.push(new_contact);
                // if (!this.checkMembership(new_contact)) {
                //   myContacts.push(new_contact);
                // }
              } else if (email && email != "") {
                let new_contact = new InviteContact(contact_name, email, null, false);
                myContacts.push(new_contact);
              }
              console.log(myContacts);
              // this.myContacts = myContacts.sort(this.sortContacts);

            }
          });

          if (myContacts && myContacts.length > 1) {
            myContacts = myContacts.sort(this.sortContacts);

          }
          this.myContacts = myContacts;
          this.helper.hideLoading();
          if (this.screen_info.action == 'add') {
            this.checkAdded();
          }
        } else {
          // there is some error in reading contacts or user have no contacts.
          this.helper.hideLoading();
          this.myContacts = new Array();
        }
      }).catch(err => {
        this.helper.hideLoading();
        console.log(err);
      });
  }

  getTitle() {
    if (this.screen_info.action == 'send') {
      return "Invite People";
    }
    if (this.screen_info.action == 'add') {
      if (this.screen_info.memberRoles.moderator == true) {
        return "Add Moderator";
      }
      if (this.screen_info.memberRoles.validator == true) {
        return "Add Validator";
      }
    }
  }

  checkAdded() {
    if (this.screen_info.memberRoles.moderator == true) {
      this.screen_info.invities.moderators.forEach(added => {
        this.myContacts.forEach(contact => {
          if ((added.email && added.email == contact.email) || (added.phone && added.phone == contact.phone)) {
            contact.selected = true;
          }
        });
      });
    }

    if (this.screen_info.memberRoles.validator == true) {
      this.screen_info.invities.validators.forEach(added => {
        this.myContacts.forEach(contact => {
          if ((added.email && added.email == contact.email) || (added.phone && added.phone == contact.phone)) {
            contact.selected = true;
          }
        });
      });
    }
  }

  sortContacts(a: InviteContact, b: InviteContact) {
    if (a.name && b.name) {
      if (a.name.toLowerCase() > b.name.toLowerCase()) {
        return 1;
      }
      if (a.name.toLowerCase() < b.name.toLowerCase()) {
        return -1;
      }
      if (a.name.toLowerCase() == b.name.toLowerCase()) {
        return 0;
      }
    } else {
      return -1;
    }
  }

  checkMembership(contact: InviteContact): boolean {
    if (this.members && this.members.length > 0) {
      this.members.forEach(member => {
        if (member.info.cell && member.info.cell == contact.phone) {
          // phone matches
          return true;
        } else if (member.info.email && member.info.email == contact.email) {
          // email matches
          return true;
        } else {
          // both not matches
          return false;
        }
      });
    } else {
      return false; //not a members
    }
  }

  swipe(swiper) {

    this.social_id = this.socialData[swiper.activeIndex].id;
    this.getAvatarData(this.avatarData, this.social_id);

  }

  getInviterData() {
    this.rest.getInviters()
      .subscribe(
        data => {
          this.inviterData = data;
          this.socialData = this.inviterData.socials;
          this.avatarData = this.inviterData.avatarData;
          this.getAvatarData(this.avatarData, this.social_id);
        },
        error => {
          this.errorMessage = <any>error;
        });
  }

  getAvatarData(value, id) {

    this.srcAvatars = value[id].data;
    this.avatars = value[id].data;

  }

  getItems(ev: any) {

    let val = ev.target.value;

    if (val && val.trim() != '') {
      this.avatars = this.srcAvatars.filter((item) => {
        let newItem = item.name;
        return (newItem.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    } else {
      this.avatars = this.srcAvatars;
    }

  }

  addValue(event, item, index) {

    item.value = !item.value;
    if (item.value == true) {
      this.addInviters.push(item);
    } else {
      this.addInviters = this.addInviters.filter((invitor) => item.id != invitor.id);
    }
  }

  before() {
    // this.navCtrl.setRoot(this.history.getHistory());
    this.viewCtrl.dismiss();
  }

  campDone() {
    this.viewCtrl.dismiss({ Inviters: this.addInviters });
  }

  cancel() {
    this.viewCtrl.dismiss({ inviters: '' });
  }

  validateInviteInput() {
    if (this.phonePattern.test(this.input_value.value)) {
      this.input_value.type = 'phone';
      return true;
    } else if (this.emailPattern.test(this.input_value.value)) {
      this.input_value.type = 'email';
      return true;
    } else {
      return false;
    }
  }

  // sendInviteFromInput() {
  //   try {
  //     let contact;
  //     switch (this.input_value.type) {
  //       case 'email':
  //         contact = new InviteContact(this.input_value.value, this.input_value.value, null, false);
  //         break;
  //       case 'phone':
  //         contact = new InviteContact(this.input_value.value, null, this.input_value.value, false);
  //         break;
  //       default:
  //         break;
  //     }

  //     if (contact) {
  //       this.sendInvite(contact, -1);
  //     }

  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  addInvitieFromInput() {
    try {
      let contact: InviteContact;
      switch (this.input_value.type) {
        case 'email':
          contact = new InviteContact(this.input_value.value, this.input_value.value, null, false);
          break;
        case 'phone':
          let phone = this.input_value.value.replace(/\D+/g, '');
          if (phone.length > 10) {
            phone = "+" + phone;
          }
          contact = new InviteContact(phone, null, this.input_value.value, false);
          break;
        default:
          break;
      }

      let flag;
      if (this.screen_info.memberRoles.moderator == true) {
        flag = this.screen_info.invities.moderators.find(item => {
          return (item.email && item.email == contact.email) || (item.phone && item.phone == contact.phone);
        });
      }

      if (this.screen_info.memberRoles.validator == true) {
        flag = this.screen_info.invities.validators.find(item => {
          return (item.email && item.email == contact.email) || (item.phone && item.phone == contact.phone);
        });
      }

      if (flag) {
        this.toast.showShortBottom("Already added!").subscribe(r => { });
        return;
      }

      if (contact) {
        this.addInvitie(contact, -1, true);
      }

    } catch (e) {
      console.log(e);
    }
  }

  addContactFromInput() {
    let contact: InviteContact;
    switch (this.input_value.type) {
      case 'email':
        contact = new InviteContact(this.input_value.value, this.input_value.value, null, false);
        break;
      case 'phone':
        let phone = this.input_value.value.replace(/\D+/g, '');
        if (phone.length > 10) {
          phone = "+" + phone;
        }
        contact = new InviteContact(phone, null, this.input_value.value, false);
        break;
      default:
        break;
    }
    let flag = this.contacts_to_invite.find(item => {
      return (item.email && item.email == contact.email) || (item.phone && item.phone == contact.phone);
    });

    if (flag) {
      this.toast.showShortBottom("Already added!").subscribe(r => { });
      return;
    }

    if (contact) {
      this.addContactForInvite(contact, true);
    }

  }

  done() {
    if (this.screen_info.action == 'send') {
      if (this.contacts_to_invite && this.contacts_to_invite.length > 0) {
        if (this.screen_info.item_type == "challenge") {
          if (this.screen_info.published) {
            this.showPublishedInviteOptions().then(r => {
              // this.sendingInvites();
              this.sendInvitesToContacts();
            }).catch(e => { });
          } else {
            this.showUnpublishedInviteOptions().then(r => {
              // this.sendingInvites();
              this.sendInvitesToContacts();
            }).catch(e => { });
          }
        } else {
          this.helper.showConfirm("Send invites?", "Send invites to selected contacts.", "Yes", "No")
            .then(r => {
              // this.sendingInvites();
              this.sendInvitesToContacts();
            }).catch(e => {
              this.navCtrl.pop();
            });

        }
      } else {
        this.navCtrl.pop();
      }
    }
    if (this.screen_info.action == 'add') {
      this.viewCtrl.dismiss(this.screen_info);
    }
  }

  showPublishedInviteOptions() {
    return new Promise((resolve, reject) => {
      let actionSheet = this.actionSheetCtrl.create({
        title: 'Send invites for',
        buttons: [
          {
            text: 'Moderator',
            handler: () => {
              this.invite_as = "M";
              resolve();
            }
          },
          {
            text: 'Validator',
            handler: () => {
              this.invite_as = "V";
              resolve();
            }
          },
          {
            text: 'Both moderator and validator',
            handler: () => {
              this.invite_as = "B";
              resolve();
            }
          },
          {
            text: 'Participate only',
            handler: () => {
              this.invite_as = "P";
              resolve();
            }
          },
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              reject();
            }
          }
        ]
      });
      actionSheet.present();
    });
  }

  showUnpublishedInviteOptions() {
    return new Promise((resolve, reject) => {
      let actionSheet = this.actionSheetCtrl.create({
        title: 'Send invites for',
        buttons: [
          {
            text: 'Moderator',
            handler: () => {
              this.invite_as = "M";
              resolve();
            }
          },
          {
            text: 'Validator',
            handler: () => {
              this.invite_as = "V";
              resolve();
            }
          },
          {
            text: 'Both moderator and validator',
            handler: () => {
              this.invite_as = "B";
              resolve();
            }
          },
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              reject();
            }
          }
        ]
      });
      actionSheet.present();
    });
  }

  // TODO: deprected
  sendingInvites() {
    if (this.contacts_to_invite && this.contacts_to_invite.length > 0) {
      let successes = [];
      let fails = [];
      this.helper.showLoading();
      this.contacts_to_invite.forEach((contact, i, a) => {
        this.sendMultipleInvites(contact)
          .then(name => {
            successes.push(name);
            if (i == a.length - 1) {
              this.showInviteResult(successes, fails);
            }
          })
          .catch(name => {
            fails.push(name);
            if (i == a.length - 1) {
              this.showInviteResult(successes, fails);
            }
          });
      });
    } else {
      this.showInviteResult([], []);
    }
  }

  sendInvitesToContacts() {
    if (this.contacts_to_invite && this.contacts_to_invite.length > 0) {
      this.success_contacts = [];
      this.failed_contacts = [];
      this.helper.showLoading();
      this.sendInvitesToEmailContacts()
        .then(r => {
          this.getLinksForPhoneContacts()
            .then((contacts_for_sms: any[]) => {
              this.helper.hideLoading();
              if (contacts_for_sms.length > 0) {
                this.sendInvitesToPhoneContacts(0, contacts_for_sms);
              } else {
                this.showInviteResult(this.success_contacts, this.failed_contacts);
              }
            });
        });
    } else {
      this.showInviteResult([], []);
    }
  }

  getContactsList(): ContactsList {
    let contacts_list = new ContactsList([], []);
    this.contacts_to_invite.forEach(contact => {
      if (contact.email && contact.email != "") {
        contacts_list.email_contacts.push(contact);
      } else if (contact.phone && contact.phone != "") {
        contacts_list.phone_contacts.push(contact);
      }
    });
    return contacts_list;
  }

  sendInvitesToEmailContacts() {
    let contacts = this.getContactsList().email_contacts;
    return new Promise((resolve) => {
      if (contacts.length < 1) {
        resolve();
      }
      contacts.forEach((contact, i) => {
        this.getInviteLink(contact, true)
          .then(res => {
            this.success_contacts.push(contact.name);
            if (i == contacts.length - 1) {
              resolve();
            }
          })
          .catch(name => {
            this.failed_contacts.push(name);
            if (i == contacts.length - 1) {
              resolve();
            }
          });
      });
    });
  }

  /**
   * @returns list for contacts:{phone:string, msg:string}[] for sending sms through native app.
   */
  getLinksForPhoneContacts() {
    let contacts = this.getContactsList().phone_contacts;
    let contacts_for_sms = [];
    return new Promise((resolve) => {
      if (contacts.length < 1) {
        resolve(contacts_for_sms);
      }
      contacts.forEach((contact, i) => {
        this.getInviteLink(contact, false)
          .then(res => {
            if (res) {
              this.success_contacts.push(contact.name);
              contacts_for_sms.push({ phone: contact.phone, msg: res });
              if (i == contacts.length - 1) {
                resolve(contacts_for_sms);
              }
            } else {
              if (i == contacts.length - 1) {
                resolve(contacts_for_sms);
              }
            }
          })
          .catch(name => {
            this.failed_contacts.push(name);
            if (i == contacts.length - 1) {
              resolve(contacts_for_sms);
            }
          });
      });
    });
  }

  sendInvitesToPhoneContacts(index: number, contacts: any[]) {
    let i = index;
    if (i < contacts.length) {
      this.sendMessage(contacts[i])
        .then(r => {
          let i2 = i + 1;
          this.sendInvitesToPhoneContacts(i2, contacts);
        }).catch(e => {
          this.failed_contacts.push(contacts[i].phone);
          let i2 = i + 1;
          this.sendInvitesToPhoneContacts(i2, contacts);
        });
    } else if (i == contacts.length) {
      this.showInviteResult(this.success_contacts, this.failed_contacts);
      return;
    }
  }

  sendMessage(data) {
    return this.sms.send(data.phone, data.msg, { android: { intent: "INTENT" } });
  }

  /**
   * get sms link for phone contacts and send mail to email contacts
   * @param contact 
   * @param isEmailContact 
   * @returns resolve null for email success and smsContent for phone success
   */
  getInviteLink(contact: InviteContact, isEmailContact: boolean) {
    let data;
    if (isEmailContact) {
      data = new InviteData((contact.email).toLowerCase(), null, this.MemberRoles);
    } else {
      data = new InviteData(null, contact.phone, this.MemberRoles);
    }
    return new Promise((resolve, reject) => {
      this.restService.inviteMember(this.screen_info.item_id, this.screen_info.item_type, data)
        .subscribe(res => {
          if (isEmailContact) {
            resolve(null)
          } else if (res.smsContent) {
            resolve(res.smsContent);
          } else {
            reject(contact.name);
          }
        }, err => {
          if (err.code == 409 || err.code == 403) {
            resolve(null);
          } else {
            reject(contact.name);
          }
        });
    });
  }

  showInviteResult(successes: Array<any>, fails: Array<any>) {
    this.helper.hideLoading();
    if ((successes && successes.length > 0) || (fails && fails.length > 0)) {
      let result_modal = this.modalCtrl.create('InviteResultPage', { 'successes': successes, 'fails': fails });
      result_modal.onDidDismiss(r => {
        this.navCtrl.pop();
      });
      result_modal.present();
    } else {
      this.navCtrl.pop();
    }
  }

  sendMultipleInvites(contact: InviteContact) {
    return new Promise((resolve, reject) => {
      let name;
      if (contact.phone && contact.phone != null) {
        name = contact.phone;
      } else if (contact.email && contact.email != null) {
        name = contact.email;
      }
      if (!name) {
        reject(contact.name);
      }

      if (contact.email == "") {
        contact.email = null;
      }

      if (contact.email) {
        contact.email = (contact.email).toLowerCase();
      }

      let data = new InviteData(contact.email, contact.phone, this.MemberRoles);
      this.restService.inviteMember(this.screen_info.item_id, this.screen_info.item_type, data)
        .subscribe(res => {
          if (res.smsContent) {
            if (this.sms.hasPermission) {
              this.sms.send(contact.phone, res.smsContent, { android: { intent: "" } })
                .then(r1 => {
                  resolve(contact.name);
                })
                .catch(e => {
                  reject(contact.name);
                });
            } else {
              reject(contact.name);
            }
          } else {
            if (contact.email) {
              resolve(contact.name);
            } else {
              reject(contact.name);
            }
          }
        }, err => {
          if (err.code == 409 || err.code == 403) {
            resolve(contact.name);
          } else {
            reject(contact.name);
            // this.helper.showAlert("Unable to generate the invitation link.", "");
          }
        });
    });
  }

  get MemberRoles(): MemberRolesInfo {
    // let memberRoles = new MemberRolesInfo(false, false, true);
    if (this.screen_info.item_type == "challenge") {
      switch (this.invite_as) {
        case "P": return new MemberRolesInfo(false, false, true);
        case "M": return new MemberRolesInfo(true, false, true);
        case "V": return new MemberRolesInfo(false, true, true);
        case "B": return new MemberRolesInfo(true, true, true);
        default: return new MemberRolesInfo(false, false, true);
      }
    } else {
      return new MemberRolesInfo(false, false, true);
    }
  }

  addContactForInvite(contact: InviteContact, from_input: boolean) {
    let name;
    if (contact.phone && contact.phone != null) {
      name = contact.phone;
    } else if (contact.email && contact.email != null) {
      name = contact.email;
    }
    if (!name) {
      this.toast.showShortBottom("Cannot add this person.").subscribe(r => { });
      return;
    }

    let flag = this.contacts_to_invite.find(item => {
      return (item.email && item.email == contact.email) || (item.phone && item.phone == contact.phone);
    });

    if (!flag) {
      this.contacts_to_invite.push(contact);
    }

    if (from_input == false) {
      contact.selected = true;
    }

    if (from_input == true) {
      contact.selected = true;
      this.contacts_from_input.push(contact);
      // setTimeout(() => {
      //   this.myContacts.unshift(contact);
      // }, 100);

      this.toast.showShortBottom("Added!").subscribe(r => { });
      this.input_value.value = "";
    }

  }

  removeContactFromInvite(contact: InviteContact) {
    let i = this.contacts_to_invite.findIndex(item => {
      return (item.email && item.email == contact.email) || (item.phone && item.phone == contact.phone);
    });
    if (i > -1) {
      this.contacts_to_invite.splice(i, 1);
      contact.selected = false;
    }
    let c = this.contacts_from_input.findIndex(item => {
      return (item.email && item.email == contact.email) || (item.phone && item.phone == contact.phone);
    });

    if (c > -1) {
      this.contacts_from_input.splice(i, 1);
    }
  }

  addInvitie(contact: InviteContact, contact_index, from_input: boolean) {
    let name;
    if (contact.phone && contact.phone != null) {
      name = contact.phone;
    } else if (contact.email && contact.email != null) {
      name = contact.email;
    }
    if (!name) {
      this.toast.showShortBottom("Cannot add this person.").subscribe(r => { });
      return;
    }

    // let data = new InviteData(contact.email, contact.phone, this.screen_info.memberRoles);
    if (this.screen_info.memberRoles.moderator == true) {
      let re = this.screen_info.invities.moderators.find(m_contact => {
        return m_contact.name == contact.name;
      });
      if (!re) {
        this.screen_info.invities.moderators.push(contact);
      }
    }
    if (this.screen_info.memberRoles.validator == true) {
      let re = this.screen_info.invities.validators.find(v_contact => {
        return v_contact.name == contact.name;
      });
      if (!re) {
        this.screen_info.invities.validators.push(contact);
      }
    }
    if (from_input == false) {
      // this.myContacts[contact_index].selected = true;
      contact.selected = true;
    }
    if (from_input == true) {
      this.toast.showShortBottom("Added!").subscribe(r => { });
      this.input_value.value = "";
    }
  }

  handleError(err) {
    console.log(err);
  }
}

class ContactsList {
  constructor(
    public email_contacts: InviteContact[],
    public phone_contacts: InviteContact[]
  ) { }
}