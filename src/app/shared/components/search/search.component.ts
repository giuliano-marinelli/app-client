import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { v4 as uuidv4 } from 'uuid';
import {
  Attribute,
  AttributeColor,
  AttributeTextColor,
  Criteria,
  Search,
  SearchAttribute,
  Sort
} from '../../global/search';

@Component({
  selector: 'search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  imports: [
    FormsModule,
    MatButtonModule,
    MatIcon,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule
  ]
})
export class SearchComponent implements OnInit {
  //search input attributes
  @Input() attributes: Attribute[] = [];
  //options
  advanced = false; //disabled until its fully migrated to material
  @Input() startAdvanced = false;
  @Input() continuousSearching = false;
  @Input() continuousSearchingOnlySimple = false;
  @Input() useLikeWildcard = true;
  //style configurations
  @Input() searchClass = '';
  @Input() searchInputClass = '';
  @Input() searchTagsClass = '';
  @Input() searchTagClass = '';
  @Input() searchTagEditClass = '';
  @Input() defaultTagColor: AttributeColor = 'body-secondary';
  @Input() defaultTagTitleColor: AttributeTextColor = 'body';
  @Input() defaultTagCategoryColor: AttributeTextColor = 'body-emphasis';
  //loading state
  @Input() loading = false;

  @Input() search: any;
  @Output() searchChange = new EventEmitter<any>();

  @Input() searchString?: string;
  @Output() searchStringChange = new EventEmitter<any>();

  @Input() searchAttributes: SearchAttribute[] = [];
  @Output() searchAttributesChange = new EventEmitter<SearchAttribute[]>();

  optional = false;
  advancedCollapsed = true;

  ngOnInit(): void {
    this.advancedCollapsed = !this.startAdvanced;
  }

  addSearchAttribute(attribute: Attribute): void {
    this.searchAttributes.push({
      id: uuidv4(),
      attribute: attribute,
      value: Array.isArray(attribute.type) ? attribute.type[0] : attribute.type == 'boolean' ? true : '',
      criteria: attribute.type == 'string' ? 'ilike' : 'eq',
      sort: null
    });
  }

  removeSearchAttribute(searchAttribute: SearchAttribute): void {
    this.searchAttributes = this.searchAttributes.filter((sa) => sa.id !== searchAttribute.id);
  }

  changeSort(searchAttribute: SearchAttribute): void {
    if (!searchAttribute.sort) searchAttribute.sort = 'ASC';
    else if (searchAttribute.sort === 'ASC') searchAttribute.sort = 'DESC';
    else searchAttribute.sort = null;
  }

  changeCriteria(searchAttribute: SearchAttribute, criteria: Criteria /*tippy?: any*/): void {
    searchAttribute.criteria = criteria;
    // tippy?.hide();
  }

  criteriaByType(type: string | string[]): Criteria[] {
    if (Array.isArray(type)) return ['eq', 'ne'];
    switch (type) {
      case 'number':
      case 'Date':
        return ['eq', 'ne', 'gt', 'gte', 'lt', 'lte'];
      case 'string':
        return ['eq', 'ne', 'ilike'];
      default:
        return ['eq'];
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

  sortIcon(sort: Sort): string {
    switch (sort) {
      case 'ASC':
        return 'sort-up';
      case 'DESC':
        return 'sort-down';
      default:
        return 'sort';
    }
  }

  criteriaIcon(criteria: Criteria): string {
    switch (criteria) {
      case 'gt':
        return 'greater-than';
      case 'gte':
        return 'greater-than-equal';
      case 'lt':
        return 'less-than';
      case 'lte':
        return 'less-than-equal';
      case 'eq':
        return 'equals';
      case 'ne':
        return 'not-equal';
      case 'ilike':
        return 'star-of-life';
      default:
        return 'question';
    }
  }

  onSearch(isContinuous: boolean): void {
    if (this.advancedCollapsed) {
      if (!isContinuous || this.continuousSearching || this.continuousSearchingOnlySimple) {
        const searchInput: any = Search.searchInput(this.attributes, this.searchString, this.useLikeWildcard);
        this.searchChange.emit(searchInput);
        this.searchStringChange.emit(this.searchString);
      }
    } else {
      if (!isContinuous || this.continuousSearching) {
        const searchInputAdvanced: any = Search.searchInputAdvanced(
          this.searchAttributes,
          this.optional,
          this.useLikeWildcard
        );
        this.searchChange.emit(searchInputAdvanced);
        this.searchAttributesChange.emit(this.searchAttributes);
      }
    }
  }

  onKey(event: any): void {
    if (event.keyCode == 13) this.onSearch(false);
  }
}
