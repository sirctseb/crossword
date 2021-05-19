import firebase from 'firebase';

export type FirebaseAssignment = Object | boolean | string | number | null | undefined;

export class FirebaseChangeError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export default class FirebaseChange {
  constructor(
    private readonly ref: firebase.database.Reference,
    private readonly update: Object,
    private readonly undoUpdate: Object
  ) {}

  static FromValues(ref: firebase.database.Reference, newValue: FirebaseAssignment, oldValue: FirebaseAssignment) {
    const parent = ref.parent;
    // there are the same condition, but having both helps with typing in subsequent lines
    if (!parent || ref.key === null) {
      throw new Error('Cannot create a change at the root');
    }
    return new FirebaseChange(
      parent,
      { [ref.key]: newValue === undefined ? null : newValue },
      { [ref.key]: oldValue === undefined ? null : oldValue }
    );
  }

  apply() {
    this.ref.update(this.update);
  }
  undo() {
    this.ref.update(this.undoUpdate);
  }
  redo() {
    this.apply();
  }
}
