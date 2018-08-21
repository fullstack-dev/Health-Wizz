import { Injectable } from "@angular/core";
import { LoadingController, AlertController, MenuController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { EmailComposer } from "@ionic-native/email-composer";
import { UserService } from "./user-service";
import { ConstProvider } from "./const/const";

function _window(): any {
    return window;
}
@Injectable()
export class Helper {
    public loading;

    constructor(
        public loadingCtrl: LoadingController,
        private alertCtrl: AlertController,
        private toastCtrl: ToastController,
        private menuCtrl: MenuController,
        public emailComposer: EmailComposer,
        private userService: UserService
    ) {
    }

    get window(): any {
        return _window();
    }

    openMenu() {
        if (!this.menuCtrl.isOpen()) {
            this.menuCtrl.enable(true);
            this.menuCtrl.open();
        }
    }

    public showLoading() {
        this.loading = this.loadingCtrl.create({
            cssClass: 'hw-loader',
            spinner: 'dots'
        });
        this.loading.present();
    }

    public hideLoading() {
        try {
            if (this.loading) {
                this.loading.dismiss();
            }
        } catch (e) {
            console.log(e);
        }
    }

    public showAlert(message: string, title: string) {
        let alert = this.alertCtrl.create({
            title: title,
            message: message,
            buttons: [{
                text: 'OK'
                // handler: () => {
                //     alert.dismiss();
                //     return false;
                // }
            }]
        });
        alert.present();
    }

    public showToast(message: string) {
        let toast = this.toastCtrl.create({
            message: message,
            duration: 3000,
            position: 'middle'
        });

        toast.onDidDismiss(() => {
            console.log('Dismissed toast');
        });

        toast.present();
    }

    public showConfirm(title, message, positiveBtnText, negativeBtnText) {
        const promise = new Promise((resolve, reject) => {
            let confirm = this.alertCtrl.create({
                cssClass: 'hw-alert',
                title: title,
                message: message,
                buttons: [
                    {
                        text: negativeBtnText,
                        handler: () => {
                            reject('CANCEL');
                        }
                    },
                    {
                        text: positiveBtnText,
                        handler: () => {
                            resolve('OK');
                        }
                    }
                ]
            });
            confirm.present();
        });
        return promise;
    }

    public showErrorConfirm(title, message, positiveBtnText) {
        const promise = new Promise((resolve, reject) => {
            let confirm = this.alertCtrl.create({
                cssClass: 'hw-alert',
                title: title,
                message: message,
                buttons: [
                    {
                        text: positiveBtnText,
                        handler: () => {
                            resolve('OK');
                        }
                    }
                ]
            });
            confirm.present();
        });
        return promise;
    }

    public getTimeDifference(old_time: number, indicator_code: string, frequencies: Array<any>) {
        let d = new Date();
        let n = d.getTime();
        let difference = "";
        let updatedDate = n - old_time;
        let yearsDifference = Math.floor(updatedDate / 1000 / 60 / 60 / 24 / 365);
        let daysDifference = Math.floor(updatedDate / 1000 / 60 / 60 / 24);
        let hoursDifference = Math.floor(updatedDate / 1000 / 60 / 60);
        let minutesDifference = Math.floor(updatedDate / 1000 / 60);
        let secondsDifference = Math.floor(updatedDate / 1000);

        if (yearsDifference > 0 && yearsDifference < 100) {
            difference = this.checkFrequency(yearsDifference, 'year', indicator_code, frequencies);
        } else if (daysDifference > 0 && daysDifference < 31) {
            difference = this.checkFrequency(daysDifference, 'day', indicator_code, frequencies);
        } else if (daysDifference >= 31) {
            daysDifference = daysDifference % 30;
            difference = this.checkFrequency(daysDifference, 'month', indicator_code, frequencies);
        } else {
            if (hoursDifference > 0) {
                difference = this.checkFrequency(hoursDifference, 'hour', indicator_code, frequencies);
            } else {
                if (minutesDifference > 0) {
                    difference = this.checkFrequency(minutesDifference, 'minute', indicator_code, frequencies);
                } else {
                    if (secondsDifference > 0) {
                        difference = this.checkFrequency(secondsDifference, 'second', indicator_code, frequencies);
                    } else {
                        // negative difference
                        difference = this.checkFrequency(1, 'second', indicator_code, frequencies);
                    }
                }
            }
        }
        return difference;
    }

    public checkFrequency(count: number, timespan: string, indicator_code: string, frequencies: Array<any>): string {
        let diffrence;
        frequencies.forEach(item => {
            if (indicator_code == item.indicatorCode) {
                const oldPr = this.getPriority(timespan);
                const newPr = this.getPriority(item.timespan);

                if (oldPr > newPr) {
                    if (count == 1)
                        diffrence = count + ' ' + timespan + ' late';
                    else
                        diffrence = count + ' ' + timespan + 's late';
                } else if (oldPr == newPr) {
                    let diff = count - item.count;
                    if (diff > 0) {
                        if (diff == 1)
                            diffrence = diff + ' ' + timespan + ' late';
                        else
                            diffrence = diff + ' ' + timespan + 's late';
                    } else {
                        if (count == 1)
                            diffrence = count + ' ' + timespan + ' ago';
                        else
                            diffrence = count + ' ' + timespan + 's ago';
                    }
                } else if (oldPr < newPr) {
                    if (count == 1)
                        diffrence = count + ' ' + timespan + ' ago';
                    else
                        diffrence = count + ' ' + timespan + 's ago';
                }
            }
        });
        return diffrence;
    }

    public getPriority(myKey) {
        const priorities: Array<{ key: string, value: number }> = [
            { 'key': 'second', 'value': 1 },
            { 'key': 'minute', 'value': 2 },
            { 'key': 'hour', 'value': 3 },
            { 'key': 'day', 'value': 4 },
            { 'key': 'month', 'value': 5 },
            { 'key': 'year', 'value': 6 }
        ];
        let myValue = 0;
        priorities.forEach(pr => {
            if (pr.key == myKey) {
                myValue = pr.value;
            }
        });
        return myValue;
    }

    public UTCtoLocalDate(UTC_date) {
        let d = UTC_date.split(" ");
        let first = d[0] + "T";
        let sec = d[1] + "00Z";
        return new Date(first + sec);
    }

    public convertDate(dateToConvert) {
        let d = new Date(dateToConvert);
        let y = d.getFullYear();
        let m: any = d.getMonth() + 1;
        if (m < 10) {
            m = "0" + m;
        }
        let date: any = d.getDate();
        if (date < 10) {
            date = "0" + date;
        }
        return y + "-" + m + "-" + date;
    }

    public sendEmailForShop(source, subject) {
        let profile = this.userService.getProfile();
        let name = profile.firstName;
        if (profile.lastName) {
            name = name + " " + profile.lastName;
        }
        let email = profile.email;

        // this.emailComposer.isAvailable().then((available: boolean) => {
        //     if (available) {
        //         //Now we know we can send
        //     }
        // });
        // Following user is interested in redeeming OmPoints for Amazon Gift Card:
        let options = {
            to: 'finance@healthwizz.com',
            subject: subject,
            body: '<div><h4>Following user is interested in <b>' + source + '</b>:</h4><p><b>User Name: </b><span>' + name + '</span></p><p><b>Email: </b><span>' + email + '</span></p></div>             ',
            isHtml: true
        };

        return this.emailComposer.open(options);
    }

    public getAmount(): Promise<number> {
        return new Promise((resolve) => {
            let alert = this.alertCtrl.create({
                title: 'Please fill in the amount for buying OmPoints <br/> (minimum $25)',
                inputs: [
                    {
                        name: 'amount',
                        placeholder: 'your amount',
                        type: 'number',
                        min: 25
                    }],
                buttons: [{
                    text: 'Ok',
                    handler: (data) => {
                        resolve(data.amount);
                    }
                }, {
                    text: "Cancel",
                    role: 'cancel',
                    handler: () => {
                        console.log("cancelled");
                        resolve(null);
                    }
                }]
            });

            alert.present();
        });
    }

    public getBudget(): Promise<number> {
        return new Promise((resolve) => {
            let alert = this.alertCtrl.create({
                title: 'What will be the reward budget for this campaign',
                inputs: [
                    {
                        name: 'amount',
                        placeholder: 'your amount',
                        type: 'number',
                        min: 25
                    }],
                buttons: [{
                    text: 'Ok',
                    handler: (data) => {
                        resolve(data.amount);
                    }
                }, {
                    text: "Cancel",
                    role: 'cancel',
                    handler: () => {
                        console.log("cancelled");
                        resolve(null);
                    }
                }]
            });

            alert.present();
        });
    }
}
