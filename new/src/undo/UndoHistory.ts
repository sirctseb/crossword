import { FirebaseChange } from "./FirebaseChange";

export default class UndoHistory {
  private index: number = 0;
  private readonly history: FirebaseChange[] = [];

  private static readonly histories: Record<string, UndoHistory> = {};

  constructor(private readonly name: string) {
    UndoHistory.histories[name] = this;
  }

  static getHistory(name: string) {
    if (!UndoHistory.histories[name]) {
      return new UndoHistory(name);
    }
    return UndoHistory.histories[name];
  }

  add(firebaseChange: FirebaseChange, alreadyPerformed: boolean = false) {
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
    this.history.splice(0, this.history.length);
    this.index = 0;
  }

  canUndo() {
    return this.index > 0;
  }

  canRedo() {
    return this.index < this.history.length;
  }
}
