import FirebaseChange from './FirebaseChange';

export default class UndoHistory {
  index: number;
  history: FirebaseChange[];

  static histories: Record<string, UndoHistory> = {};

  constructor(private readonly name: string) {
    this.index = 0;
    this.history = [];

    UndoHistory.histories[this.name] = this;
  }

  static getHistory(name: string) {
    if (UndoHistory.histories === undefined) {
      UndoHistory.histories = {};
    }
    if (!Object.prototype.hasOwnProperty.call(UndoHistory.histories, name)) {
      return new UndoHistory(name);
    }
    return UndoHistory.histories[name];
  }

  add(firebaseChange: FirebaseChange, alreadyPerformed = false) {
    this.history.splice(this.index, this.history.length, firebaseChange);

    this.index += 1;

    if (!alreadyPerformed) {
      firebaseChange.apply();
    }
  }

  undo() {
    if (this.canUndo()) {
      this.index -= 1;
      this.history[this.index].undo();
    }
  }

  redo() {
    if (this.canRedo()) {
      this.history[this.index].redo();
      this.index += 1;
    }
  }

  reset() {
    this.history = [];
    this.index = 0;
  }

  canUndo() {
    return this.index > 0;
  }

  canRedo() {
    return this.index < this.history.length;
  }
}
