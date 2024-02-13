export default class UndoHistory {
    constructor(name) {
        this.name = name;
        this.index = 0;
        this.history = [];

        UndoHistory.histories = UndoHistory.histories || {};
        UndoHistory.histories[name] = this;
    }

    static getHistory(name) {
        if (UndoHistory.histories === undefined) {
            UndoHistory.histories = {};
        }
        if (!Object.prototype.hasOwnProperty.call(UndoHistory.histories, name)) {
            return new UndoHistory(name);
        }
        return UndoHistory.histories[name];
    }

    add(firebaseChange, alreadyPerformed = false) {
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
