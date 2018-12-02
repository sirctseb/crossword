import { createSelector } from 'reselect';
import { get, range, flatten } from 'lodash';

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
