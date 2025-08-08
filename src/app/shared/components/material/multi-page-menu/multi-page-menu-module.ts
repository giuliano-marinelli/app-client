import { NgModule } from '@angular/core';

import { MatMenuPage } from './menu-page';
import { MatMenuPageLink } from './menu-page-link';
import { MatMultiPageMenu } from './multi-page-menu';

@NgModule({
  imports: [MatMultiPageMenu, MatMenuPage, MatMenuPageLink],
  exports: [MatMultiPageMenu, MatMenuPage, MatMenuPageLink]
})
export class MatMultiPageMenuModule {}
