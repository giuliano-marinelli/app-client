import { ActivatedRoute, Params, Router } from '@angular/router';

import moment from 'moment';

export type AttributeColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark'
  | 'primary-subtle'
  | 'secondary-subtle'
  | 'success-subtle'
  | 'danger-subtle'
  | 'warning-subtle'
  | 'info-subtle'
  | 'light-subtle'
  | 'dark-subtle'
  | 'body'
  | 'body-secondary'
  | 'body-tertiary'
  | 'black'
  | 'white'
  | 'transparent';
export type AttributeTextColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark'
  | 'primary-emphasis'
  | 'secondary-emphasis'
  | 'success-emphasis'
  | 'danger-emphasis'
  | 'warning-emphasis'
  | 'info-emphasis'
  | 'light-emphasis'
  | 'dark-emphasis'
  | 'body'
  | 'body-emphasis'
  | 'body-secondary'
  | 'body-tertiary'
  | 'black'
  | 'white'
  | 'muted';

export type Sort = 'ASC' | 'DESC' | null;
export type Criteria = 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne' | 'ilike';

export type PageView = 'columns' | 'rows';

export interface Attribute {
  name: string;
  type: string | string[];
  title?: string;
  category?: string;
  simple?: boolean;
  color?: AttributeColor;
  titleColor?: AttributeTextColor;
  categoryColor?: AttributeTextColor;
}

export interface SearchAttribute {
  id: string;
  attribute: Attribute;
  value: string | boolean;
  criteria: Criteria;
  sort: Sort;
}

export interface SearchParams {
  page?: number;
  pageSize?: number;
  pageView?: PageView;
  search?: string;
  refresh?: boolean;
  dirty?: boolean;
}

export const defaultSearchParams: SearchParams = {
  page: 0,
  pageSize: 10,
  pageView: 'columns',
  search: ''
};

export class Search {
  // receive a path like: 'profile.bio' and a value, and return a object:
  // { profile: { bio: value } }
  static attrPathToWhereInput(attrPath: string, value: any): any {
    let whereInput: any = {};
    let attr: any = whereInput;
    if (!attrPath.includes('.')) return { [attrPath]: value };
    attrPath.split('.').forEach((subAttribute, index, array) => {
      if (index == array.length - 1) attr[subAttribute] = value;
      else {
        attr[subAttribute] = {};
        attr = attr[subAttribute];
      }
    });
    return whereInput;
  }

  // receive a path like: 'profile.bio' and a value, and add to a existing where input:
  // { profile: { bio: { and: { eq: 'someValue' } } }
  // => { profile: { bio: { and: [ { eq: 'someValue' }, { eq: 'anotherValue' } ] } }
  static attrPathToExistingWhereInput(attrPath: string, value: any, whereInput: any): void {
    if (!attrPath.includes('.')) {
      if (!whereInput[attrPath]) whereInput[attrPath] = { and: [] };
      whereInput[attrPath]['and'].push(value);
    } else {
      attrPath.split('.').forEach((subAttribute, index, array) => {
        if (index == array.length - 1) {
          if (!whereInput[subAttribute]) whereInput[subAttribute] = { and: [] };
          whereInput[subAttribute]['and'].push(value);
        } else {
          if (!whereInput[subAttribute]) whereInput[subAttribute] = {};
          whereInput = whereInput[subAttribute];
        }
      });
    }
  }

  // create a search input (only where) from the attributes and search string
  static searchInput(attributes: Attribute[], searchString: string = '', useLikeWildcard: boolean = true): any {
    let whereInput: any = [];
    attributes.forEach((attribute) => {
      if (attribute.simple) {
        whereInput.push(
          this.attrPathToWhereInput(attribute.name, {
            ilike: useLikeWildcard ? '%' + searchString + '%' : searchString
          })
        );
      }
    });
    return { where: whereInput };
  }

  // create a search input (where + order) from the search attributes
  static searchInputAdvanced(searchAttributes: SearchAttribute[], optional: boolean, useLikeWildcard: boolean = true): any {
    let resultSearch: any = { order: [], where: optional ? [] : {} };
    searchAttributes.forEach((searchAttribute) => {
      let whereValue = searchAttribute.attribute.type == 'Date' ? moment(searchAttribute.value as string).toDate() : searchAttribute.value;
      whereValue = searchAttribute.criteria == 'ilike' && useLikeWildcard ? '%' + whereValue + '%' : whereValue;
      if (optional) {
        resultSearch.where.push(
          this.attrPathToWhereInput(searchAttribute.attribute.name, {
            [searchAttribute.criteria]: whereValue
          })
        );
      } else {
        this.attrPathToExistingWhereInput(searchAttribute.attribute.name, { [searchAttribute.criteria]: whereValue }, resultSearch.where);
      }
      if (searchAttribute.sort) resultSearch.order.push({ [searchAttribute.attribute.name]: searchAttribute.sort });
    });
    if (!searchAttributes?.length) resultSearch = null;
    return resultSearch;
  }

  // combine provided search params with current search params and convert them to query params
  // then navigate with the router
  static updateSearchParams(searchParams: SearchParams, currentSearchParams: SearchParams, router: Router): void {
    let queryParams: any = {};
    if (searchParams.page != null && searchParams.page !== currentSearchParams.page) queryParams.page = searchParams.page;
    if (searchParams.pageSize != null && searchParams.pageSize !== currentSearchParams.pageSize) queryParams.pageSize = searchParams.pageSize;
    if (searchParams.pageView != null && searchParams.pageView !== currentSearchParams.pageView) queryParams.pageView = searchParams.pageView;
    if (searchParams.search != null && searchParams.search !== currentSearchParams.search) queryParams.search = searchParams.search;
    if (searchParams.refresh) queryParams.refresh = true;

    router.navigate([], {
      queryParams: queryParams,
      queryParamsHandling: 'merge'
    });
  }

  // compare query params with current search params, and identify changes on page, pageSize, search
  // if any of these params have changed, it modifies the current search params and returns true
  // if refresh is true, it is removed by navigating, and returns true
  // if only pageView changed, it modifies the current search params and returns false
  // if its not dirty mark as dirty and returns true
  // if query params are empty restore current search params and returns true
  static restoreSearchParams(queryParams: Params, currentSearchParams: SearchParams, router: Router): boolean {
    let changed = false;
    // console.log(
    //   'what changes',
    //   Object.keys(queryParams).filter((key) => queryParams[key] != (currentSearchParams as any)[key])
    // );

    if (queryParams['page'] != null && queryParams['page'] != currentSearchParams.page) {
      currentSearchParams.page = +queryParams['page'];
      changed = true;
    }
    if (queryParams['pageSize'] != null && queryParams['pageSize'] != currentSearchParams.pageSize) {
      currentSearchParams.pageSize = +queryParams['pageSize'];
      changed = true;
    }
    if (queryParams['search'] != null && queryParams['search'] != currentSearchParams.search) {
      currentSearchParams.search = queryParams['search'];
      changed = true;
    }
    if (queryParams['pageView'] != null && queryParams['pageView'] != currentSearchParams.pageView) {
      currentSearchParams.pageView = queryParams['pageView'];
    }
    if (queryParams['refresh'] === true || queryParams['refresh'] === 'true') {
      router.navigate([], { queryParams: { refresh: null }, queryParamsHandling: 'merge' });
      changed = true;
    }
    if (!currentSearchParams.dirty) {
      currentSearchParams.dirty = true;
      changed = true;
    }
    if (Object.keys(queryParams).length === 0) {
      this.backToDefaultSearchParams(currentSearchParams);
      changed = true;
    }

    return changed;
  }

  // returns a copy of the default search params
  static getDefaultSearchParams(): SearchParams {
    return { ...defaultSearchParams };
  }

  // restores the default search params to the provided searchParams
  static backToDefaultSearchParams(searchParams: SearchParams): void {
    Object.assign(searchParams, Search.getDefaultSearchParams());
  }
}
