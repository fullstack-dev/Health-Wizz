import { Injectable } from '@angular/core';
import { FCM } from '@ionic-native/fcm';
@Injectable()
export class NotificationProvider {

  constructor(
    public fcm: FCM
  ) {
    // fcm.onTokenRefresh().subscribe(token => {
    //   this.restService.registerToken(token).subscribe(result => {
    //     console.log("device fcm token refreshed")
    //   }, err => {
    //     console.log(err);
    //   });
    // });
  }

  // registerToken() {
  //   this.fcm.getToken().then(token => {
  //     this.restService.registerToken(token)
  //       .subscribe(result => {
  //         console.log("device registered to receive notifications.")
  //       }, err => {
  //         console.log(err);
  //       });
  //   });
  // }

  receiveNotifications() {

  }

}
