import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DownloadViewerModalComponent } from './download-viewer-modal.component';


@NgModule({
  declarations: [DownloadViewerModalComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  exports: [DownloadViewerModalComponent]
})
export class DownloadViewerModalModule { }
