import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import {ExportDataService} from '../services/export-data.service';
import {DomSanitizer} from '@angular/platform-browser';
import { ModalController } from '@ionic/angular';
import { DownloadViewerModalComponent } from '../pages/download-viewer-modal/download-viewer-modal.component';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
})
export class AppHeaderComponent implements OnInit {
  errorMessage: string | null = null;
  pdfUrl: any;


  constructor(
    private authService: AuthService,
    private router: Router,
    private ExportData: ExportDataService,
    private sanitizer: DomSanitizer,
    public modalController: ModalController
    ) {}

  ngOnInit() {}

  async logout() {
    await this.authService.logout();
    this.router.navigateByUrl('/', { replaceUrl: true });
  }

  exportData() {
    this.ExportData.exportToPDF('contentToExport')
      .then(blobUrl => {
        this.modalController.create({
          component: DownloadViewerModalComponent,
          componentProps: { pdfUrl: this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl) }
        }).then(modal => modal.present());
      })
      .catch(error => console.error('Export failed', error));
  }
}

