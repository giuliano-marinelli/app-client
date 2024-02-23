import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { TippyDirective } from '@ngneat/helipopper';

import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';

export type Color =
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
export type TextColor =
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
export type Sort = 'asc' | 'desc' | null;
export type Criteria = '$gt' | '$gte' | '$lt' | '$lte' | '$eq' | '$ne' | '$like';

export interface Attribute {
  name: string;
  type: string | string[];
  title?: string;
  category?: string;
  color?: Color;
  titleColor?: TextColor;
  categoryColor?: TextColor;
}

export interface SearchAttribute {
  id: string;
  attribute: Attribute;
  value: string | boolean;
  criteria: Criteria;
  sort: Sort;
}

@Component({
  selector: 'search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  //search input attributes
  @Input() attributes: Attribute[] = [];
  //options
  @Input() advanced: boolean = true;
  @Input() startAdvanced: boolean = false;
  @Input() continuousSearching: boolean = false;
  @Input() continuousSearchingOnlySimple: boolean = false;
  //style configurations
  @Input() searchClass: string = '';
  @Input() searchInputClass: string = '';
  @Input() searchTagsClass: string = '';
  @Input() searchTagClass: string = '';
  @Input() searchTagEditClass: string = '';
  @Input() defaultTagColor: Color = 'body-secondary';
  @Input() defaultTagTitleColor: TextColor = 'body';
  @Input() defaultTagCategoryColor: TextColor = 'body-emphasis';

  @Input() search: any;
  @Output() searchChange = new EventEmitter<any>();

  searchSimple: string = '';
  searchAttributes: SearchAttribute[] = [];
  optional: boolean = false;
  advancedCollapsed: boolean = true;

  constructor() {}

  ngOnInit(): void {
    this.advancedCollapsed = !this.startAdvanced;
  }

  addSearchAttribute(attribute: Attribute): void {
    this.searchAttributes.push({
      id: uuidv4(),
      attribute: attribute,
      value: Array.isArray(attribute.type) ? attribute.type[0] : attribute.type == 'boolean' ? true : '',
      criteria: attribute.type == 'string' ? '$like' : '$eq',
      sort: null
    });
  }

  removeSearchAttribute(searchAttribute: SearchAttribute): void {
    this.searchAttributes = this.searchAttributes.filter((sa) => sa.id !== searchAttribute.id);
  }

  changeSort(searchAttribute: SearchAttribute): void {
    if (!searchAttribute.sort) searchAttribute.sort = 'asc';
    else if (searchAttribute.sort === 'asc') searchAttribute.sort = 'desc';
    else searchAttribute.sort = null;
  }

  changeCriteria(searchAttribute: SearchAttribute, criteria: Criteria, tippy?: TippyDirective): void {
    searchAttribute.criteria = criteria;
    tippy?.hide();
  }

  criteriaByType(type: string | string[]): Criteria[] {
    if (Array.isArray(type)) return ['$eq', '$ne'];
    switch (type) {
      case 'number':
      case 'Date':
        return ['$eq', '$ne', '$gt', '$gte', '$lt', '$lte'];
      case 'string':
        return ['$eq', '$ne', '$like'];
      default:
        return ['$eq'];
    }
  }

  inputByType(type: string | string[]): string {
    if (Array.isArray(type)) return 'select';
    switch (type) {
      case 'boolean':
        return 'checkbox';
      case 'number':
        return 'number';
      case 'Date':
        return 'datetime-local';
      case 'string':
      default:
        return 'text';
    }
  }

  typeAsArray(type: string | string[]): string[] {
    return Array.isArray(type) ? type : [type];
  }

  sortIcon(sort: Sort): IconProp {
    switch (sort) {
      case 'asc':
        return 'sort-up';
      case 'desc':
        return 'sort-down';
      default:
        return 'sort';
    }
  }

  criteriaIcon(criteria: Criteria): IconProp {
    switch (criteria) {
      case '$gt':
        return 'greater-than';
      case '$gte':
        return 'greater-than-equal';
      case '$lt':
        return 'less-than';
      case '$lte':
        return 'less-than-equal';
      case '$eq':
        return 'equals';
      case '$ne':
        return 'not-equal';
      case '$like':
        return 'star-of-life';
      default:
        return 'question';
    }
  }

  onSearch(isContinuous: boolean): void {
    if (this.advancedCollapsed) {
      if (!isContinuous || this.continuousSearching || this.continuousSearchingOnlySimple) {
        this.searchChange.emit({ $search: this.searchSimple });
      }
    } else {
      if (!isContinuous || this.continuousSearching) {
        let resultSearch: any = { $sort: [], $optional: this.optional };
        this.searchAttributes.forEach((searchAttribute) => {
          if (!resultSearch[searchAttribute.attribute.name]) resultSearch[searchAttribute.attribute.name] = [];
          resultSearch[searchAttribute.attribute.name].push({
            term:
              searchAttribute.attribute.type == 'Date'
                ? moment(searchAttribute.value as string).toDate()
                : searchAttribute.value,
            criteria: searchAttribute.criteria
          });
          if (searchAttribute.sort) resultSearch.$sort.push([searchAttribute.attribute.name, searchAttribute.sort]);
        });
        this.searchChange.emit(resultSearch);
      }
    }
  }

  onKey(event: any): void {
    if (event.keyCode == 13) this.onSearch(false);
  }
}
