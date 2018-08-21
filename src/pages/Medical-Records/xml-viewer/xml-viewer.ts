import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { File } from '@ionic-native/file';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { FilePath } from '@ionic-native/file-path';

/**
 * Generated class for the XmlViewerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-xml-viewer',
  templateUrl: 'xml-viewer.html',
})
export class XmlViewerPage {

  headerAddedXmlString: any;

  constructor(
  	public navCtrl: NavController, 
  	public navParams: NavParams) {
  }

  ionViewDidLoad() {
    this.headerAddedXmlString = this.navParams.get('headerAddedXmlString');

    this.displayXml(this.headerAddedXmlString);
  }

  before() {
    this.navCtrl.setRoot('MyMedRecordsPage');
  }

  displayXml(xmlString) {
  	let xmlObject = this.stringToXML(xmlString);
        
    let xml = xmlObject;
    let xsl = this.loadXMLDoc("assets/data/CDA.xsl");
    
    if (document.implementation && document.implementation.createDocument) {
      let xsltProcessor = new XSLTProcessor();
      xsltProcessor.importStylesheet(xsl);
      let resultDocument = xsltProcessor.transformToFragment(xml, document);

      document.getElementById('container').appendChild(resultDocument);
    }
  }

  //Change String to XML
  stringToXML(oString) {
    return (new DOMParser()).parseFromString(oString, "text/xml");
  }

  // XML document loading
  loadXMLDoc(filename) {
    let xhttp = new XMLHttpRequest();
    xhttp.open("GET", filename, false);
    xhttp.send("");
    return xhttp.responseXML;
  }

}
