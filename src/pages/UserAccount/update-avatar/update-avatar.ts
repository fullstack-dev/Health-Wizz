import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController } from 'ionic-angular';
import { UserService } from '../../../providers/user-service';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Crop } from '@ionic-native/crop';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { HttpService } from '../../../providers/http-service';
import { Helper } from '../../../providers/helper-service';
import { Rest } from '../../../providers/rest';
import { LanguageProvider } from '../../../providers/language/language';

@IonicPage()
@Component({
  selector: 'page-update-avatar',
  templateUrl: 'update-avatar.html',
})
export class UpdateAvatarPage {

  profilePic: any;
  profilePic1: any;
  options: CameraOptions;
  lang_resource: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private userService: UserService,
    public actionSheetCtrl: ActionSheetController,
    private camera: Camera,
    private crop: Crop,
    private transfer: FileTransfer,
    private httpService: HttpService,
    private helper: Helper,
    public rest: Rest,
    private language_provider: LanguageProvider
  ) {
    this.profilePic = userService.getProfilePic();
    this.lang_resource = this.language_provider.getLanguageResource();
    this.options = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
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
  }

  ionViewDidLoad() {
    // this.profilePic1 = this.profilePic;

    console.log('ionViewDidLoad UpdateAvatarPage');
  }
  changePicture() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Update your profile picture.',
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
    this.crop.crop(image, { quality: 100, targetHeight: 100, targetWidth: 100 })
      .then(croppedImage => {
        // this.profilePic = 'data:image/jpeg;base64,' + croppedImage;
        this.profilePic = croppedImage;

      }).catch(err => {
        console.log(err);
      })
  }

  uploadPicture(image) {
    try {
      let uploadOptions: FileUploadOptions = {
        fileKey: "file",
        fileName: image.substr(image.lastIndexOf('/') + 1),
        mimeType: "image/jpeg",
        chunkedMode: false,
        httpMethod: "POST",
        headers: {
          "Authorization": "Bearer " + localStorage.getItem('authToken')
        }
      }

      const fileTransfer: FileTransferObject = this.transfer.create();

      let uploadUri = this.httpService.getServiceUri() + 'users/' + this.userService.getUserId() + '/profilePic';

      this.helper.showLoading();
      fileTransfer.upload(image, uploadUri, uploadOptions)
        .then(result => {
          this.helper.hideLoading();
          this.userService.setProfilePic(this.profilePic);
          this.navCtrl.setRoot('EditProfilePage');
        }).catch(err => {
          this.helper.hideLoading();
          this.helper.showAlert("An image update error has occured.", "");
          console.log(err);
        });
    } catch (e) {
      console.log(e);
    }

  }

  public Before() {
    this.navCtrl.setRoot('EditProfilePage');
  }

  public Done = () => {
    this.uploadPicture(this.profilePic);
  }

  public setDefaultPic = () => {
    let gender = this.userService.getProfile().gender;
    if (gender == "1" || gender == 1) {
      this.rest.getDefaultMaleAvtar().subscribe(picUrl => {
        // let img = JSON.stringify(picUrl);
        this.profilePic = picUrl;
      }, err => {
        this.helper.showToast("Unknown error");
      })
    } else if (gender == "2" || gender == 2) {
      this.rest.getDefaultFemaleAvtar().subscribe(picUrl => {
        this.profilePic = picUrl;
      }, err => {
        this.helper.showToast("Unknown error")
      });
    } else {
      this.helper.showAlert("Unknown gender", "");
    }
  }
}
