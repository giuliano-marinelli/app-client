import { SelectionField, SelectionType } from 'apollo-dynamic';

@SelectionType('Device')
export class Device {
  @SelectionField()
  client?: string;
  @SelectionField()
  os?: string;
  @SelectionField()
  brand?: string;
  @SelectionField()
  model?: string;
  @SelectionField()
  type?: string;
  @SelectionField()
  bot?: boolean;
  @SelectionField()
  ip?: string;
}
