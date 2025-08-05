import { Pipe, PipeTransform } from '@angular/core';

import { Global } from '../global/global';

@Pipe({
  name: 'filter',
  pure: false
})
export class FilterPipe implements PipeTransform {
  transform(items: any[] | undefined, filter: any): any {
    if (!items || !filter) {
      return items;
    }
    // filter array items, items which match and return true will be
    // kept, false will be filtered out
    return Global.filter(items, filter);
  }
}
