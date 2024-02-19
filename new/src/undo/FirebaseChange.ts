import { DatabaseReference, update, set } from "firebase/database";

export abstract class FirebaseChange {
  abstract apply(): Promise<void>;
  abstract undo(): Promise<void>;
  abstract redo(): Promise<void>;
}

export class FirebaseUpdate implements FirebaseChange {
  constructor(
    private readonly ref: DatabaseReference,
    private readonly update: Object,
    private readonly undoUpdate: Object
  ) {}

  apply() {
    return update(this.ref, this.update);
  }
  undo() {
    return update(this.ref, this.undoUpdate);
  }
  redo() {
    return this.apply();
  }
}

export class FirebaseSet implements FirebaseChange {
  constructor(
    private readonly ref: DatabaseReference,
    private readonly newValue: Object,
    private readonly oldValue: Object
  ) {}

  apply() {
    return set(this.ref, this.newValue);
  }

  undo() {
    return update(this.ref, this.oldValue);
  }

  redo() {
    return this.apply();
  }
}
