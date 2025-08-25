import { Component, ElementRef, Input, OnInit, ViewChild, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { TranslocoService, translate } from '@jsverse/transloco';

import { NgxImageCompressService } from 'ngx-image-compress';
import { ImageCroppedEvent, ImageCropperComponent, base64ToFile } from 'ngx-image-cropper';

@Component({
  selector: 'picture-input',
  templateUrl: './picture-input.component.html',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatMenuModule,
    ImageCropperComponent
  ]
})
export class PictureInputComponent implements OnInit {
  _dialog: MatDialog = inject(MatDialog);
  _compressor: NgxImageCompressService = inject(NgxImageCompressService);
  _transloco: TranslocoService = inject(TranslocoService);

  @ViewChild('picture_view') pictureView!: ElementRef;

  @Input() control!: FormControl;
  @Input() fileControl!: FormControl<Blob | null>;
  @Input() defaultImage = 'assets/images/default-picture.png';

  @Input() uploadLabel?: string;
  @Input() removeLabel?: string;
  @Input() cropLabel?: string;
  @Input() saveLabel?: string;

  @Input() uploadIcon = 'camera_alt';
  @Input() removeIcon = 'delete';
  @Input() rounded = true;

  @Input() compression = true;
  @Input() compressionQuality = 50;
  @Input() compressionRatio = 50;
  @Input() cropSize: { width: number; height: number } = { width: 500, height: 500 };

  @Input() viewClass: string[] = [];

  pictureChange!: Event;

  ngOnInit(): void {
    this._transloco.selectTranslation().subscribe(() => {
      if (!this.uploadLabel) this.uploadLabel = translate('shared.pictureInput.uploadPicture');
      if (!this.removeLabel) this.removeLabel = translate('shared.pictureInput.removePicture');
      if (!this.cropLabel) this.cropLabel = translate('shared.pictureInput.cropPicture');
      if (!this.saveLabel) this.saveLabel = translate('shared.pictureInput.savePicture');
    });
  }

  onChangePicture(event: any, cropDialog: any): void {
    if (event.target.files[0]) {
      this._dialog.open(cropDialog);
      this.pictureChange = event;
    }
  }

  async onCroppedPicture(event: ImageCroppedEvent): Promise<void> {
    if (event.base64) {
      const compressedImage = this.compression
        ? await this._compressor.compressFile(
            event.base64,
            0,
            this.compressionRatio,
            this.compressionQuality,
            this.cropSize.width,
            this.cropSize.height
          ) // default: 50% ration, 50% quality, 500x500px max size
        : event.base64;
      this.fileControl.setValue(base64ToFile(compressedImage));
      this.fileControl.markAsDirty();
      this.pictureView.nativeElement.src = event.base64;
    }
  }
}
