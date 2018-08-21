import { Component } from '@angular/core';
import { IonicPage, Platform, NavController, NavParams, ActionSheetController, ToastController, ViewController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { LocalDataProvider } from '../../../providers/local-data/local-data';
import { RestDataProvider } from '../../../providers/rest-data-service/rest-data-service';
import { CircleData, MemberRolesInfo, InviteScreenInfo, Invities } from '../../../models/classes';
import { Helper } from '../../../providers/helper-service';
import { LanguageProvider } from '../../../providers/language/language';
@IonicPage()
@Component({
  selector: 'page-create-circle',
  templateUrl: 'create-circle.html',
})
export class CreateCirclePage {

  circle_data: CircleData;
  lang_resource: any;
  name = "";
  description = "";
  isToggled: boolean;
  circleScope = "Public";

  member_name = "new circle member";
  pending_status = "";
  // avatar_url = "assets/imgs/AddMedImgs/Recent@2x.png";

  item: any = {};
  member_data: any = {};

  circle: any;
  members_data: any;
  circle_numberOfMember: string = '';
  status: string;//whether create page or edit page
  page_title: string;
  btn_name: string;

  selectedImage: any;
  circlePic: any;
  createhide: boolean = false;
  options: CameraOptions;
  name_pattern: RegExp = /^[A-Za-z1-9\s'-]+$/;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public platform: Platform,
    public actionsheetCtrl: ActionSheetController,
    public toastCtrl: ToastController,
    private camera: Camera,
    public local: LocalDataProvider,
    public restService: RestDataProvider,
    private helper: Helper,
    private language_provider: LanguageProvider,
    public actionSheetCtrl: ActionSheetController,
    private viewCtrl: ViewController
  ) {

    this.options = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      allowEdit: false,
      targetWidth: 310,
      targetHeight: 310,
      correctOrientation: true,
      saveToPhotoAlbum: true,
      cameraDirection: this.camera.Direction.FRONT
    }
    this.lang_resource = this.language_provider.getLanguageResource();
    this.isToggled = true;
    this.status = "create";
    this.page_title = "Create Circle";
    this.btn_name = "Create";
    this.circle_data = new CircleData(null, null, 'private', 'accept', null);
    this.status = this.navParams.get('status');

    if (this.status == "update") {
      this.createhide = true;
      this.circle = this.navParams.get('circle');
      if (this.circle && (this.circle.circlePic == null || this.circle.circlePic == undefined)) {
        this.circlePic = null;
      } else {
        this.circlePic = this.circle.circlePic;
      }
      if (this.circle.circleScope == "public") {
        this.isToggled = false;
      } else if (this.circle.circleScope == "private") {
        this.isToggled = true;
      }
      this.circle_data = new CircleData(this.circle.name, this.circle.description, this.circle.circleScope, this.circle.invitationState, this.circlePic);
    }
    this.page_title = this.status == "create" ? "Create Circle" : "Edit Circle";
    // this.btn_name = this.status == "create" ? "Create" : "Edit";
    this.btn_name = "Create";
  }

  ionViewDidLoad() {
    let imageview: any = document.getElementById('circleImage');
    if (this.status == "update") {
      let circle = this.local.getLocalCircle();
      if (circle.circlePic == null || circle.circlePic == undefined) {
        imageview.src = "assets/imgs/MenuIcons/Circles@2x.png";
      } else {
        imageview.src = "data:image/jpeg;base64," + circle.circlePic;
      }
    } else {
      imageview.src = "assets/imgs/MenuIcons/Circles@2x.png";
    }
  }

  getCircleName() {
    if (this.status == "create") {
      return this.lang_resource.circle.create_circle.new_circle;
    } else {
      return this.circle.name;
    }
  }

  public Before = () => {
    // this.navCtrl.setRoot(this.history.getHistory());
    this.viewCtrl.dismiss(false);
  }

  public Done = () => {
    if (!this.circle_data.name) {
      this.helper.showToast("Circle name is required.");
      return;
    } else if (this.status == "create") {
      this.Create();
    } else {
      this.update();
    }
  }

  public Create = () => {
    this.circle_data.circlePic = this.circlePic;
    this.helper.showLoading();
    this.restService.createCircle(this.circle_data)
      .subscribe(res => {
        this.helper.hideLoading();
        this.local.addCircle(res);
        let memberRoles: MemberRolesInfo = new MemberRolesInfo(false, false, true);
        let screen_info: InviteScreenInfo = new InviteScreenInfo('circle', res.id, memberRoles, 'send', new Invities([], []), false);
        this.navCtrl.push('InvitePeoplePage', { 'invite_screen_info': screen_info })
          .then(r => {
            // this.navCtrl.remove(this.navCtrl.getActive().index - 1, 1);
            this.viewCtrl.dismiss(true);
          });
      }, err => {
        this.helper.hideLoading();
        this.handleError(err);
      });
  }

  public update = () => {
    this.circle_data.circlePic = this.circlePic;
    this.helper.showLoading();
    this.restService.updateCircle(this.circle_data, this.circle.id)
      .subscribe(res => {
        this.helper.hideLoading();
        // this.circle.name = this.circle_data.name;
        // this.circle.description = this.circle_data.description;
        // this.circle.circleScope = this.circle_data.circleScope;
        // this.circle.circlePic = this.circle_data.circlePic;
        // this.circlePic = this.circle.circlePic;
        // this.local.updateCircle(this.circle);
        this.viewCtrl.dismiss(true);
        // this.navCtrl.setRoot('MyCirclesPage');
      }, err => {
        this.helper.hideLoading();
        this.handleError(err);
      });

  }

  public changePicture() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Update your profile pic.',
      buttons: [
        {
          text: 'CAMERA',
          handler: () => {
            this.openCamera();
          }
        }, {
          text: 'GALLERY',
          handler: () => {
            this.openGallery();
          }
        }
      ]
    });
    actionSheet.present();

  }
  openCamera() {
    this.options.sourceType = this.camera.PictureSourceType.CAMERA;
    this.camera.getPicture(this.options)
      .then((imageData) => {
        this.cropPicture(imageData);
      }, (err) => {
        // Handle error
      });
  }
  openGallery() {
    this.options.sourceType = this.camera.PictureSourceType.PHOTOLIBRARY;
    this.camera.getPicture(this.options)
      .then((imageData) => {
        this.cropPicture(imageData);
      }, (err) => {
        // Handle error
      });
  }
  cropPicture(image) {
    // let circleImage;
    this.circlePic = image;
    let imageview: any = document.getElementById('circleImage');
    imageview.src = "data:image/jpeg;base64," + image;
  }

  // input descriptions 
  public change(element_id) {
    // get elements
    let element = document.getElementById('messageInputBox');
    let textarea = element.getElementsByTagName('textarea')[0];

    // limit size to 96 pixels (6 lines of text)
    let scroll_height = textarea.scrollHeight;
    if (scroll_height > 120)
      scroll_height = 120;

    // apply new style
    element.style.height = scroll_height + "px";
    textarea.style.minHeight = scroll_height + "px";
    textarea.style.height = scroll_height + "px";

  }

  //change toggle
  public notify() {
    if (!this.isToggled)
      this.circle_data.circleScope = "public";
    else
      this.circle_data.circleScope = "private";
  }

  public handleError(err) {
    if (err.code) {
      if (err.code == 409) {
        this.helper.showAlert("Circle with this name already exists.", "");
      } else {
        this.helper.showAlert("Error while processing your request", "");
      }
    } else {
      this.helper.showAlert("Error while processing your request", "");
    }
  }

}
