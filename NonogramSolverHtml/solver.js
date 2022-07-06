// data from the test
const matrix1 = [
  ['W', 'W', 'W', 'W'],
  ['B', 'W', 'W', 'W'],
  ['B', 'W', 'B', 'B'],
  ['W', 'W', 'B', 'W'],
  ['B', 'B', 'W', 'W']
];
matrix2 = [
  ['W', 'W'],
  ['B', 'B'],
  ['B', 'B'],
  ['W', 'B']
];
const rows1_1 = [
  [],
  [1],
  [1, 2],
  [1],
  [2]
];
const columns1_1 = [
  [2, 1],
  [1],
  [2],
  [1]
];
rows1_2 = [[], [], [1], [1], [1, 1]];
columns1_2 = [[2], [1], [2], [1]];
rows1_3 = [[], [1], [3], [1], [2]];
columns1_3 = [[3], [1], [2], [1]];
rows1_4 = [[], [1, 1], [1, 2], [1], [2]];
columns1_4 = [[2, 1], [1], [2], [1]];
rows2_1 = [[], [2], [2], [1]];
columns2_1 = [[1, 1], [3]];
rows2_2 = [[], [2], [2], [1]];
columns2_2 = [[3], [3]];
rows2_3 = [[], [], [], []];
columns2_3 = [[], []];

// first, we need a separate multidimensional array of the columns, based off the provided player rows array
const getColumns = (rowsArray) => {
  let playerColumns = [];
  rowsArray.forEach((row, idx) => {
    row.forEach((val, idx2) => {
      if (!playerColumns[idx2]) {
        playerColumns[idx2] = [];
      }
      playerColumns[idx2] = [...playerColumns[idx2], val];
    });
  });
  return playerColumns;
}

// convert a row or column to the groupings of filled-in paces, the format of the winning sequences we've been provided
const convertMatrix = (playerMatrix) => {
  let convertedMatrix = [];
  playerMatrix.forEach((arr) => {
    // keep track of the current filled in spaces to drop into the playerSequences array
    let currentFilledSpacesInSequence = 0;
    let playerSequences = [];
    arr.forEach((space, idx) => {
      if (space === 'B' && idx < arr.length - 1) {
        // just keep the count going, since we're not at the end of the array
        currentFilledSpacesInSequence++;
      } else if (space === 'W' && currentFilledSpacesInSequence > 0) {
        // we hit a blank space, but it's after we've got a filled in space, so add it to the playerSequences array, then reset the count as we keep looping through
        playerSequences = [...playerSequences, currentFilledSpacesInSequence];
        currentFilledSpacesInSequence = 0;
      } else if (space === 'B' && idx === arr.length - 1) {
        // add this one to the count and then drop it into the array, since we've hit the end of the current row or column
        currentFilledSpacesInSequence++;
        playerSequences = [...playerSequences, currentFilledSpacesInSequence];
      }
    });
    // once the internal loop is done, add it to our multidimensional array we'll ultimately return once it finishes its own loop
    convertedMatrix = [...convertedMatrix, playerSequences];
  });

  return convertedMatrix;
};

// compare the columns or rows array against the winning rows or columns array
const isHalfWinner = (playerArray, winningArray) => {
  const trueWinner = winningArray.every((row, idx) => {
    if (row.length !== playerArray[idx].length) { // avoid provided empty array automatically returning true
      return false;
    }
    return row.every((val, idx2) => {
      return val === playerArray[idx][idx2];
    });
  });
  return trueWinner;
};

// kick the whole thing off and then compare our column and row equalities and decide if someobody won
const validateNonogram = (playerMatrix, winningRows, winningColumns) => {
  const columnsArray = getColumns(playerMatrix);
  const playerRows = convertMatrix(playerMatrix);
  const playerColumns = convertMatrix(columnsArray);

  const rowWinner = isHalfWinner(playerRows, winningRows);
  const columnWinner = isHalfWinner(playerColumns, winningColumns);

  // confirm player rows match winning rows AND player columns matches winning columns
  const isWinner = rowWinner && columnWinner ? true : false;
  return isWinner;
};

const isWinner1 = validateNonogram(matrix1, rows1_1, columns1_1); // expected true
const isWinner2 = validateNonogram(matrix1, rows1_2, columns1_2); // expected false
const isWinner3 = validateNonogram(matrix1, rows1_3, columns1_3); // expected false
const isWinner4 = validateNonogram(matrix1, rows1_4, columns1_4); // expected false
const isWinner5 = validateNonogram(matrix2, rows2_1, columns2_1); // expected false
const isWinner6 = validateNonogram(matrix2, rows2_2, columns2_2); // expected false
const isWinner7 = validateNonogram(matrix2, rows2_3, columns2_3); // expected false

console.log('isWinner1 is: ', isWinner1);
console.log('isWinner2 is: ', isWinner2);
console.log('isWinner3 is: ', isWinner3);
console.log('isWinner4 is: ', isWinner4);
console.log('isWinner5 is: ', isWinner5);
console.log('isWinner6 is: ', isWinner6);
console.log('isWinner7 is: ', isWinner7);
