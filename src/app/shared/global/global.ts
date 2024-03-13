import { FormControl } from '@angular/forms';

export class Global {
  static createFormData(object: any): FormData {
    var formData: any = new FormData();
    var jsonData: any = {};

    Object.entries(object).forEach(([key, value]) => {
      if (value && (value instanceof File || value instanceof Blob) /*|| isBase64(value, { allowMime: true })*/)
        formData.append(key, value);
      else jsonData[key] = value;
    });
    formData.append('data', JSON.stringify(jsonData));

    return formData;
  }

  static cropImage(data: any, x: number, y: number, width: number, height: number) {
    // we return a Promise that gets resolved with our canvas element
    return new Promise((resolve) => {
      // this image will hold our source image data
      const inputImage: HTMLImageElement = new Image();
      // we need to wait for our image to load
      inputImage.onload = () => {
        const outputImage: HTMLCanvasElement = document.createElement('canvas');
        outputImage.width = width;
        outputImage.height = height;
        const ctx: any = outputImage.getContext('2d');
        ctx?.drawImage(inputImage, x, y, width, height, 0, 0, width, height);
        resolve(outputImage.toDataURL());
      };
      // start loading our image
      inputImage.src = data;
    });
  }

  //convert base64 url to file
  static dataURLtoFile(dataurl: string, filename: string): File {
    let arr: any = dataurl.split(',');
    let mime: any = arr[0].match(/:(.*?);/)[1];
    let bstr: any = atob(arr[1]);
    let n: number = bstr.length;
    let u8arr: Uint8Array = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  static setValid(control: FormControl): object {
    return {
      'is-invalid': !control.pending && control.dirty && !control.valid,
      'is-valid': !control.pending && control.dirty && control.valid,
      'is-pending': control.pending
    };
  }

  static filter(items: any[], filter: any): any {
    return items?.filter((item) => {
      var match = true;
      if (Object.keys(filter)[0] == '$and') {
        Object.keys(filter.$and).forEach((key) => {
          if (!Global.filterEqual(filter.$and[key], item[key])) match = false;
        });
      } else if (Object.keys(filter)[0] == '$or') {
        match = false;
        //check if $or is an array or an object and make the filter
        if (Array.isArray(filter.$or)) {
          filter.$or.forEach((or: any) => {
            Object.keys(or).forEach((key) => {
              if (Global.filterEqual(or[key], item[key])) match = true;
            });
          });
        } else {
          Object.keys(filter.$or).forEach((key) => {
            if (Global.filterEqual(filter.$or[key], item[key])) match = true;
          });
        }
      } else {
        Object.keys(filter).forEach((key) => {
          if (!Global.filterEqual(filter[key], item[key])) match = false;
        });
      }
      return match;
    });
  }

  static filterEqual(filter: any | { $not: any }, item: any): boolean {
    if (filter && Object.keys(filter)[0] == '$not') {
      return !this.filterEqual(filter.$not, item);
    } else {
      return filter == item;
    }
  }

  static compareById(a: any, b: any): boolean {
    return a.id === b.id;
  }
}
