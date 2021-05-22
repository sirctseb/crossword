import { Direction } from './firebase-recoil/data';

// These are types that end up being use in multiple components or hooks
// but are not data entity types

export interface Coordinate {
  row: number;
  column: number;
}

export interface Cursor extends Coordinate {
  direction: Direction;
}

export interface Address extends Coordinate {
  label: number;
}
