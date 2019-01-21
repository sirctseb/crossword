import { createSelector } from 'reselect';
import { get, range, flatten } from 'lodash';

import { ACROSS } from './constants';

const getEditor = state => state.editor;

const getCrosswords = state => state.firebase.data.crosswords;

const getCrosswordId = (state, props) => props.params.crosswordId;

export const getCrossword = createSelector(
    [getCrosswords, getCrosswordId],
    (crosswords, id) => crosswords && crosswords[id],
);

export const getThemeEntries = createSelector(
    [getCrossword],
    crossword => Object.keys(crossword.themeEntries || {}),
);

export const getAcrossPattern = createSelector(
    [getEditor, getCrossword],
    ({ cursor: { row, column } }, crossword) => {
        const across = [];
        for (let i = column; i >= 0 && !get(crossword, `boxes.${row}.${i}.blocked`); i -= 1) {
            across.push(get(crossword, `boxes.${row}.${i}.content`, '.'));
        }
        across.reverse();
        for (let i = column + 1; i < crossword.rows && !get(crossword, `boxes.${row}.${i}.blocked`); i += 1) {
            across.push(get(crossword, `boxes.${row}.${i}.content`, '.'));
        }
        return `^${across.join('')}$`;
    }
);

export const getDownPattern = createSelector(
    [getEditor, getCrossword],
    ({ cursor: { row, column } }, crossword) => {
        const down = [];
        for (let i = row; i >= 0 && !get(crossword, `boxes.${i}.${column}.blocked`); i -= 1) {
            down.push(get(crossword, `boxes.${i}.${column}.content`, '.'));
        }
        down.reverse();
        for (let i = row + 1; i < crossword.rows && !get(crossword, `boxes.${i}.${column}.blocked`); i += 1) {
            down.push(get(crossword, `boxes.${i}.${column}.content`, '.'));
        }
        return `^${down.join('')}$`;
    },
);

export const getCursorSuggestions = createSelector(
    [getEditor, getAcrossPattern, getDownPattern],
    ({ suggestions }, acrossPattern, downPattern) => ({
        across: suggestions[acrossPattern] || [],
        down: suggestions[downPattern] || [],
    }),
);

export const getAmendedSuggestions = createSelector(
    [getCursorSuggestions, getThemeEntries, getAcrossPattern, getDownPattern],
    (suggestions, themeEntries, acrossPattern, downPattern) => ({
        across: [
            ...themeEntries.filter(entry => entry.match(acrossPattern)),
            ...suggestions.across,
        ],
        down: [
            ...themeEntries.filter(entry => entry.match(downPattern)),
            ...suggestions.down,
        ],
    }),
);

export const getCurrentAnswers = createSelector(
    [getCrossword],
    (crossword) => {
        const MISSING_VALUE = { blocked: true };
        const coordsToSignifier = (row, column) => {
            const { content, blocked } = get(crossword, `boxes.${row}.${column}`, MISSING_VALUE);
            return blocked ? '|' : (content || '.');
        };
        const lineToAnswers = line =>
            line.join('')
                .split('|')
                .filter(answer => answer.length > 0)
                .filter(answer => !answer.includes('.'));
        return flatten(range(crossword.rows).map(row =>
            [
                ...lineToAnswers(range(crossword.rows)
                    .map(column => coordsToSignifier(row, column))),
                ...lineToAnswers(range(crossword.rows)
                    .map(column => coordsToSignifier(column, row))),
            ]));
    }
);

const getCursor = state => state.editor.cursor;

export const getCursorContent = createSelector(
    [getCrossword, getCursor],
    (crossword, { row, column }) => get(crossword, ['boxes', row, column, 'content'])
);

export const getIsCursorAnswer = createSelector(
    [getCrossword, getCursor],
    (crossword, cursor) => (row, column) => {
        const box = get(crossword, `boxes.${row}.${column}`) || {};
        if (box.blocked) return false;
        if (row === cursor.row && column === cursor.column) return true;

        if (cursor.direction === ACROSS) {
            if (row !== cursor.row) {
                return false;
            }

            for (let increment = Math.sign(cursor.column - column), columnIter = column;
                columnIter >= 0 && columnIter < crossword.rows && !get(crossword, `boxes.${row}.${columnIter}.blocked`);
                columnIter += increment) {
                if (columnIter === cursor.column) {
                    return true;
                }
            }
            return false;
        }

        if (column !== cursor.column) {
            return false;
        }

        for (let increment = Math.sign(cursor.row - row), rowIter = row;
            rowIter >= 0 && rowIter < crossword.rows && !get(crossword, `boxes.${rowIter}.${column}.blocked`);
            rowIter += increment) {
            if (rowIter === cursor.row) {
                return true;
            }
        }
        return false;
    }
);

export const getIsFocusBox = createSelector(
    [getCursor],
    cursor => (row, column) => row === cursor.row && column === cursor.column
);

export const getIsBlockedBox = createSelector(
    [getCrossword],
    crossword => (row, column) => !!get(crossword, `boxes.${row}.${column}.blocked`)
);

export const getSize = createSelector(
    [getCrossword],
    ({ rows }) => rows,
);

const firstBoxAddress = (crossword, row, column/* , direction */) => {
    let rowIter = row;
    while ((rowIter - 1 >= 0) && !get(crossword, ['boxes', rowIter - 1, column, 'blocked'])) {
        rowIter -= 1;
    }
    return { row: rowIter, column };
};

const nextBlankWithinAnswer = (crossword, row, column/* , direction */) => {
    let rowIter = row;
    // search forward in the current word
    while (rowIter < crossword.rows && !get(crossword, ['boxes', rowIter, column, 'blocked'])) {
        if (!get(crossword, ['boxes', rowIter, column, 'content'])) {
            return { row: rowIter, column };
        }
        rowIter += 1;
    }
    return null;
};

const clueAddressAt = (crossword, row, column, direction, clueAddresses) => {
    const firstAddress = firstBoxAddress(crossword, row, column, direction);
    return clueAddresses[direction].find(address =>
        address.row === firstAddress.row && address.column === firstAddress.column);
};

const getClueAddresses = createSelector(
    [getCrossword],
    (crossword) => {
        const addresses = {
            across: [],
            down: [],
        };
        let clueIndex = 1;
        for (let row = 0; row < crossword.rows; row += 1) {
            for (let column = 0; column < crossword.rows; column += 1) {
                const blocked = get(crossword, `boxes.${row}.${column}.blocked`);
                const leftBlocked = column === 0 ||
                    get(crossword, `boxes.${row}.${column - 1}.blocked`);
                const topBlocked = row === 0 ||
                    get(crossword, `boxes.${row - 1}.${column}.blocked`);
                const indexBox = !blocked && (leftBlocked || topBlocked);
                if (indexBox && leftBlocked) {
                    addresses.across.push({ row, column, label: clueIndex });
                }
                if (indexBox && topBlocked) {
                    addresses.down.push({ row, column, label: clueIndex });
                }
                if (indexBox) {
                    clueIndex += 1;
                }
            }
        }
        return addresses;
    }
);

const nextAnswerAddress = (crossword, row, column, direction, clueAddresses) => {
    const { label: currentClueNumber } =
        clueAddressAt(crossword, row, column, direction, clueAddresses);
    let nextAddress = clueAddresses[direction].find(address =>
        address.label === currentClueNumber + 1);
    if (nextAddress === undefined) {
        [nextAddress] = clueAddresses[direction];
    }
    return nextAddress;
};

const nextBlankWithWrapping = (crossword, row, column, direction) => {
    // search forward in the current answer
    const firstTry = nextBlankWithinAnswer(crossword, row, column, direction);
    if (firstTry) {
        return firstTry;
    }

    // try from beginning of answer
    const { row: startRow, column: startColumn } =
        firstBoxAddress(crossword, row, column, direction);
    const secondTry = nextBlankWithinAnswer(crossword, startRow, startColumn, direction);
    if (secondTry) {
        return secondTry;
    }

    return null;
};

const nextBoxWithWrapping = (crossword, row, column/* , direction */) => {
    const nextRow = row + 1;
    if (nextRow < crossword.rows && !get(crossword, `boxes.${nextRow}.${column}.blocked`)) {
        return { row: nextRow, column };
    }

    let rowIter = row;
    while ((rowIter - 1) >= 0 && !get(crossword, `boxes.${(rowIter - 1)}.${column}.blocked`)) {
        rowIter -= 1;
    }

    return { row: rowIter, column };
};

export const getCursorAfterAdvancement = createSelector(
    [getCrossword, getCursor, getClueAddresses],
    (crossword, { row: cursorRow, column: cursorColumn, direction }, clueAddresses) => {
        // start from the box afer the cursor
        const { row, column } = nextBoxWithWrapping(crossword, cursorRow, cursorColumn, direction);

        const localBlank = nextBlankWithWrapping(crossword, row, column, direction);
        if (localBlank && (localBlank.row !== cursorRow || localBlank.column !== cursorColumn)) {
            return localBlank;
        }

        const localClueAddress = clueAddressAt(crossword, row, column, direction, clueAddresses);
        let next = nextAnswerAddress(crossword, row, column, direction, clueAddresses);
        while (next.label !== localClueAddress.label) {
            const iterBlank = nextBlankWithWrapping(crossword, next.row, next.column, direction);
            if (iterBlank) {
                return iterBlank;
            }
            next = nextAnswerAddress(crossword, next.row, next.column, direction, clueAddresses);
        }
        return { row, column };
    }
);
