export default class FirebaseChange {
  constructor(ref, update, undoUpdate) {
    this.ref = ref;
    this.update = update;
    this.undoUpdate = undoUpdate;
  }

  static FromValues(ref, newValue, oldValue) {
    return new FirebaseChange(
      ref.parent,
      { [ref.key]: newValue === undefined ? null : newValue },
      { [ref.key]: oldValue === undefined ? null : oldValue },
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
