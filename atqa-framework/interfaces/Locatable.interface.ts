import { Locator } from './Locator.interface';

export interface Locatable {
  [key: string]: Locator;
}
