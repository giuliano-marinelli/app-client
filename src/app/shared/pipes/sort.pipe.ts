import { Pipe, PipeTransform } from '@angular/core';

import { Many, orderBy } from 'lodash';

@Pipe({
  name: 'sort'
})
export class SortPipe implements PipeTransform {
  transform(
    array: any,
    sortBy: string | string[],
    order: boolean | 'asc' | 'desc' | Many<boolean | 'asc' | 'desc'> = 'desc'
  ): any[] {
    if (typeof sortBy == 'string') sortBy = [sortBy];
    if (typeof order == 'string') order = [order];

    return orderBy(array, sortBy, order);
  }
}
