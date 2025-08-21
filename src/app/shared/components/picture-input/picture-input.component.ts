import { Component, ElementRef, Input, ViewChild, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { NgxImageCompressService } from 'ngx-image-compress';
import { ImageCroppedEvent, ImageCropperComponent, base64ToFile } from 'ngx-image-cropper';

@Component({
  selector: 'picture-input',
  templateUrl: './picture-input.component.html',
  styleUrl: './picture-input.component.scss',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatMenuModule,
    ImageCropperComponent
  ]
})
export class PictureInputComponent {
  dialog: MatDialog = inject(MatDialog);
  compressor: NgxImageCompressService = inject(NgxImageCompressService);

  @ViewChild('picture_view') pictureView!: ElementRef;

  @Input() control!: FormControl;
  @Input() fileControl!: FormControl<Blob | null>;
  @Input() defaultImage = 'assets/images/default-picture.png';

  @Input() uploadLabel = 'Upload picture...';
  @Input() removeLabel = 'Remove picture';
  @Input() cropLabel = 'Crop picture';
  @Input() saveLabel = 'Save picture';

  @Input() uploadIcon = 'camera_alt';
  @Input() removeIcon = 'delete';
  @Input() rounded = true;

  @Input() compression = true;
  @Input() compressionQuality = 50;
  @Input() compressionRatio = 50;
  @Input() cropSize: { width: number; height: number } = { width: 500, height: 500 };

  @Input() viewClass: string[] = [];

  pictureChange!: Event;

  onChangePicture(event: any, cropDialog: any): void {
    if (event.target.files[0]) {
      this.dialog.open(cropDialog);
      this.pictureChange = event;
    }
  }

  async onCroppedPicture(event: ImageCroppedEvent): Promise<void> {
    if (event.base64) {
      const compressedImage = this.compression
        ? await this.compressor.compressFile(
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
