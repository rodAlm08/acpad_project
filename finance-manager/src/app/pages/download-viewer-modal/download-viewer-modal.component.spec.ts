import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DownloadViewerModalComponent } from './download-viewer-modal.component';

describe('DownloadViewerModalComponent', () => {
  let component: DownloadViewerModalComponent;
  let fixture: ComponentFixture<DownloadViewerModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DownloadViewerModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DownloadViewerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
