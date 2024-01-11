import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { ModalController } from '@ionic/angular';


@Component({
  selector: 'app-download-viewer-modal',
  templateUrl: './download-viewer-modal.component.html',
  styleUrls: ['./download-viewer-modal.component.scss'],
})
export class DownloadViewerModalComponent  implements OnInit {
  @Input() pdfUrl: string | undefined;

  constructor(public modalController: ModalController) { }

  ngOnInit() {}

  closeModal() {
    this.modalController.dismiss();
  }

}
