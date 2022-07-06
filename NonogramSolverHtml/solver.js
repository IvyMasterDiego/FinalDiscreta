const DEBUG = false;

// Helpers
const isArray = Array.isArray;
const isInteger = Number.isInteger;
const min = (a, b) => a < b ? a : b;
const max = (a, b) => a > b ? a : b;
const natSum = max => (max + 1) * max / 2;

const permsCountMemo = new Map();
const permsCount = (len, full) => {
  const empty = len - full;
  const lower = min(full, empty);
  if (lower === 0) {
    return 1;
  }
  if (lower === 1) {
    return len;
  }
  const key = `${len}:${lower}`;
  if (permsCountMemo.has(key) === false) {
    permsCountMemo.set(key, permsCount(len-1, full-1) + permsCount(len-1, full));
  }
  return permsCountMemo.get(key);
}

// Basic functions and iterators
const id = x => x;
function* repeat(value) {
  while (true) {
    yield value;
  }
}
function* zeroNat(till) {
  let i = 0;
  while (i < till) {
    yield i++;
  }
}
const map = (cb) => function*(iter) {
  while (true) {
    let result = iter.next();
    if (result.done) {
      return;
    }
    yield cb(result.value);
  }
}
const iterateReturn = iter => {
  while (true) {
    let result = iter.next();
    if (result.done) {
      return result.value;
    }
  }
}

const fillArray = (size, value = null) => (new Array(size)).fill(value);
const fillArrayCb = (size, cb) => fillArray(size).map(cb);

// Set helpers

const setUnion = (a, b) => new Set([...a, ...b]);
const setInter = (a, b) => new Set(
  [...a].filter(value => b.has(value))
);
const setDiff = (a, b) => new Set(
  [...a].filter(value => b.has(value) === false)
);
const setSymDiff = (a, b) => setDiff(setUnion(a, b), setInter(a, b));

// HTML helpers

const mapRangeJoin = (count, cb) => [...map(cb)(zeroNat(count))].join('');
const htmlEscTable = new Map([
  ['&', '&amp;'], ['<', '&lt;'], ["'", '&#39;'], ['"', '&quot;']
]);
const htmlEsc = str => str.toString().replace(
  /[&<'"]/g, match => htmlEscTable.get(match[0])
);
const htmlAttrs = (attrsMap) => {
  const html = [...attrsMap]
    .map(([name, value]) => `${name}="${htmlEsc(value)}"`)
    .join(' ');
  return html ? ' '+html : '';
};
const htmlTag = (tagName, attrs = [], content = '') =>
  `<${tagName}${htmlAttrs(attrs)}>${content}</${tagName}>`;

const elById = id => document.getElementById(id);

// Structures

// class CellSlice

const UNKNOWN = Symbol('_ unknown');
const EMPTY = Symbol('0 empty');
const ONE = Symbol('1 one');
const VALUE_LABELS = new Map([
  [UNKNOWN, '_'], [EMPTY, '0'], [ONE, '1']
]);

const isNotUnknown = value => value !== UNKNOWN;
const isEmpty = value => value === EMPTY;
const isNotEmpty = value => value !== EMPTY;
const isValueOf = symbol => value => value === symbol;
const isNotValueOf = symbol => value => value !== symbol;
const toLabel = symbol => VALUE_LABELS.get(symbol);

const NO_MATCH = Symbol('No match')
const END_OF_SLICE = Symbol('End of slice');

class CellSlice
{
  constructor(cells, a, b, length, nums) {
    this.cells = cells;
    this.a = a;
    this.b = b;
    this.length = length;
    this.nums = nums;
  }
  
  get(index) {
    return this.cells[this.getCellOffset(index)];
  }
  
  set(index, value) {
    this.cells[this.getCellOffset(index)] = value;
  }
  
  getCellOffset(index) {
    if (index < 0 || index >= this.length) {
      throw new Error("Index out of slice");
    }
    return this.a + index * this.b;
  }
  
  *getCellOffsets() {
    let {length, a, b} = this;
    for (; length-->0; a += b) {
      yield a;
    }
  }
  
  *getCells() {
    const cells = this.cells;
    let index = 0;
    for (let offset of this.getCellOffsets()) {
      yield [cells[offset], index, offset];
      index++;
    }
  }

  some(cb, context) {
    const cells = this.cells;
    let index = 0;
    for (let offset of this.getCellOffsets()) {
      if (cb.call(context, cells[offset], index)) {
        return true;
      }
      index++;
    }
    return false;
  }
  
  slice(start = 0, end = null, nums = null) {
    const thisLength = this.length;
    if (start < 0) {
      start = thisLength + start;
    }
    if (end === null) {
      end = thisLength;
    }
    else if (end < 0) {
      end = thisLength + end;
    }
    const length = min(end - start, thisLength);
    let newNums = isArray(nums) ? nums
      : isInteger(nums) && nums > 0 && isArray(this.nums) ? this.nums.slice(numsOffset)
      : this.nums;
    if (length === 0) {
      return new CellSlice(this.cells, this.a, this.b, length, newNums);
    }
    let a = this.getCellOffset(start);
    
    return new CellSlice(this.cells, a, this.b, length, newNums);
  }
  
  firstMatch(index, till, match) {
    const length = this.length;
    if (index >= length) {
      return END_OF_SLICE;
    }
    till = min(till, length);
    for (; index < till; index++) {
      if (match(this.get(index))) {
        return index;
      }
    }
    return index === length ? END_OF_SLICE : NO_MATCH;
  }
  
  search(index, till, match) {
    const length = this.length;
    if (index >= length) {
      return length;
    }
    till = min(till, length);
    for (; index < till; index++) {
      if (match(this.get(index))) {
        return index;
      }
    }
    return index;
  }
  
  *combineAlignments(alignment, cache = null) {
    const sliceLength = this.length;
    const nums = this.nums;
    const numsLength = nums.length;
    if (numsLength === 0 || numsLength === 1 && nums[0] === 0) {
      alignment.forEach(set => set.add(EMPTY));
      yield;
      return;
    }
    
    const cacheKey = cache && `${numsLength}_${sliceLength}`;
    if (cache && cache.has(cacheKey)) {
      yield;
      return;
    }
    
    const isValue = isValueOf(ONE);
    const isNotValue = isNotValueOf(ONE);
    
    const num = nums[0];
    const otherNums = nums.slice(1);
    const otherNumsCount = otherNums.length;
    const otherLength = otherNums.reduce((a, b) => a + b, 0) + otherNumsCount;
   
    const till = sliceLength - otherLength - (num-1);
    for (let index = 0; index < till;) {
      if (index > 0 && isValue(this.get(index-1))) {
        return;
      }
      
      let endIndex = index + num;
      let anchor = null;
      
      let firstKnownIndex = this.firstMatch(index, endIndex + 1, isNotUnknown);
      if (firstKnownIndex !== NO_MATCH && firstKnownIndex !== END_OF_SLICE) {
        const firstKnownValue = this.get(firstKnownIndex);
        // EMPTY
        if (isEmpty(firstKnownValue)) {
          // if num does not fit
          if (firstKnownIndex < endIndex) {
            const firstNotEmptyIndex = this.firstMatch(
              firstKnownIndex + 1,
              sliceLength,
              isNotEmpty
            );
            // if no space to jump over
            if (firstNotEmptyIndex === END_OF_SLICE) {
              return;
            }
            // jump over
            index = firstNotEmptyIndex;
            continue;
          }
        }
        // VALUE
        else if (isValue(firstKnownValue)) {
          const firstEmptyIndex = this.firstMatch(
            firstKnownIndex + 1,
            endIndex,
            isEmpty
          );
          if (firstEmptyIndex !== NO_MATCH && firstEmptyIndex !== END_OF_SLICE) {
            return;
          }
          // try to consume next values
          let firstNotValueIndex = this.firstMatch(
            endIndex,
            firstKnownIndex + num + 1,
            isNotValue
          );
          // consumed too many
          if (firstNotValueIndex === NO_MATCH) {
            return;
          }
          if (firstNotValueIndex === END_OF_SLICE) {
            firstNotValueIndex = sliceLength;
          }
          // consumed too many
          if (firstNotValueIndex - firstKnownIndex > num) {
            return;
          }
          if (firstNotValueIndex > endIndex) {
            index = firstNotValueIndex - num;
            endIndex = firstNotValueIndex;
          }
          anchor = firstKnownIndex;
        }
      }
      
      if (otherNumsCount === 0 && firstKnownIndex !== END_OF_SLICE) {
        const unconsumedIndex = this.firstMatch(endIndex, sliceLength, isValue);
        if (unconsumedIndex !== END_OF_SLICE) {
          if (anchor !== null && unconsumedIndex - anchor + 1 > num) {
            return;
          }
          index = unconsumedIndex - num + 1;
          continue;
        }
      }

      if (endIndex === sliceLength) {
        alignment.slice(0, index).forEach(set => set.add(EMPTY));
        alignment.slice(index, endIndex).forEach(set => set.add(ONE));
        yield;
        
        cache.add(cacheKey);
        return;
      }
      
      const subIndex = endIndex + 1;
      const subSlice = this.slice(subIndex, null, otherNums);
      const subAlignment = alignment.slice(subIndex);
      
      let subCount = 0;
      for (let subResult of subSlice.combineAlignments(subAlignment, cache)) {
        subCount++;
      }
      
      if (subCount > 0) {
        alignment.slice(0, index).forEach(set => set.add(EMPTY));
        alignment.slice(index, subIndex).forEach(set => set.add(ONE));
      }
     
      index++;
    }
    
    cache.add(cacheKey);
    return;
  }
 
  // Yields undefined, returns solution
  *solve(debug) {
    const resultAlignment = fillArrayCb(this.length, () => new Set());
    if (debug) {
      debugger;
    }
    yield* this.combineAlignments(resultAlignment, new Set());
    
    const solution = new Map();
    for (let index of this.getUnsolvedCellIndexes()) {
      const set = resultAlignment[index];
      if (set.size === 1) {
        solution.set(index, set.values().next().value);
      }
    }
    return solution;
  }
  
  applySolution(solution) {
    for (let [index, value] of solution.entries()) {
      this.set(index, value);
    }
  }
    
  getUnsolvedCellIndexes() {
    const unsolvedCellIndexes = [];
    for (let [cell, index] of this.getCells()) {
      if (cell === UNKNOWN) {
        unsolvedCellIndexes.push(index);
      }
    }
    return unsolvedCellIndexes;
  }
  
  isAlignmentValid(alignment, log = false) {
    const hasError = (cell, index) => cell !== UNKNOWN && cell !== alignment[index];
    const isValid = this.some(hasError) === false;
    log && console.log(alignment.map(toLabel), isValid);
    return isValid;
  }
  
  easilyResolvable() {
    const nums = this.nums;
    const numsLength = nums.length;
    if (numsLength === 0 || numsLength === 1 && nums[0] === 0) {
      return true;
    }
    const maxNum = nums.reduce(max, 0);
    const compactLength = nums.reduce((a, b) => a + b, 0) + numsLength-1;
    return maxNum > this.length - compactLength;
  }
  
  countCombinations() {
    const nums = this.nums;
    const numsLength = nums.length;
    if (numsLength === 0 || numsLength === 1 && nums[0] === 0) {
      return 1;
    }
    const compactLength = nums.reduce((a, b) => a + b, 0) + numsLength;
    const occupiedCount = numsLength;
    const freeCount = this.length - compactLength;
    const totalCount = occupiedCount + freeCount;
    return permsCount(totalCount, occupiedCount);
  }
}

// class Field

class Field
{
  constructor(numbers) {
    const cols = numbers.cols;
    const rows = numbers.rows;
    
    const height = rows.length;
    const width = cols.length;
    const cells = fillArray(height * width, UNKNOWN);
    
    this.colNums = cols;
    this.rowNums = rows;
    this.height = height;
    this.width = width;
    this.cells = cells;
    this.colSlices = fillArray(width).map((_, i) => this.makeCol(i));
    this.rowSlices = fillArray(height).map((_, i) => this.makeRow(i));
    
    this.numsHeight = cols.map(nums => nums.length).reduce(max, 0);
    this.numsWidth = rows.map(nums => nums.length).reduce(max, 0);
  }
  
  makeCol(col) {
    const {cells, width, height} = this;
    const nums = this.colNums[col];
    return new CellSlice(cells, col, width, height, nums);
  }
  
  makeRow(row) {
    const {cells, width} = this;
    const nums = this.rowNums[row];
    return new CellSlice(cells, row*width, 1, width, nums);
  }
  
  get(row, col) {
    return this.cells[this.width * row + col];
  }
  
  set(row, col, value) {
    this.cells[this.width * row + col] = value;
  }

  *slices() {
    yield* this.colSlices;
    yield* this.rowSlices;
  }
  
  sliceIsCol(slice) {
    return this.colSlices.indexOf(slice) !== -1;
  }
  
  sliceIsRow(slice) {
    return this.rowSlices.indexOf(slice) !== -1;
  }
  
  pointerBySlice(slice) {
    let index = this.colSlices.indexOf(slice);
    if (index !== -1) {
      return {col: index};
    }
    index = this.rowSlices.indexOf(slice);
    if (index !== -1) {
      return {row: index};
    }
    return null;
  }

  // Yields undefined (as slice.solve), returns Set of slices
  *solveSlice(slice) {
    const solveIter = slice.solve(this.pointerBySlice(slice).row === 13);
    const solution = yield* solveIter;

    slice.applySolution(solution);
    const mapIndexesToSlices = this.sliceIsCol(slice) 
      ? map(index => this.rowSlices[index])
      : map(index => this.colSlices[index]);
    return new Set(mapIndexesToSlices(solution.keys()));
  }
  
  // Yileds:
  // - undefined
  // - slice pointer
  *solveAll() {
    let solvingSlices = new Set();
    for (let slice of this.slices()) {
      if (slice.easilyResolvable()) {
        yield this.pointerBySlice(slice);
        let modifiedSlices = yield* this.solveSlice(slice);
        solvingSlices = setUnion(solvingSlices, modifiedSlices);
      }
    }
    
    const sliceCountPairs = Array.from(
      map(slice => [slice, slice.countCombinations()])(this.slices())
    );
    sliceCountPairs.sort((a,b) => a[1] - b[1]);
    const orderedSlices = sliceCountPairs.map(pair => pair[0]);
    
    while (solvingSlices.size > 0) {
      for (let slice of orderedSlices) {
        if (solvingSlices.has(slice)) {
          yield this.pointerBySlice(slice);
          let modifiedSlices = yield* this.solveSlice(slice);
          solvingSlices = setUnion(solvingSlices, modifiedSlices);
          solvingSlices.delete(slice);
          break;
        }
      }
    }
    return;
  }
  
  render(element) {
    // render HTML
    const {numsHeight, numsWidth} = this;
    const tableHeight = this.height + numsHeight;
    const tableWidth = this.width + numsWidth;
    
    const tableHtml = `
      <table class="field">
        <tbody>
          ${mapRangeJoin(tableHeight, r => {
            const row = r - numsHeight;
            const isColCell = row >= 0;
            const fifthRowCls = row % 5 === 4 && 'fifth-row';
            return `<tr>
              ${mapRangeJoin(tableWidth, c => {
                const col = c - numsWidth;
                const isRowCell = col >= 0;
                const isCell = isColCell || isRowCell;
                const cellCls = isCell && 'js-cell cell';
                const fifthColCls = col % 5 === 4 && 'fifth-col';
                const clss = [cellCls, fifthColCls, fifthRowCls]
                  .filter(id)
                  .join(' ')
                ;
                const attrs = new Map([
                  ['class', clss],
                  isCell && ['data-row', row],
                  isCell && ['data-col', col],
                ].filter(id));
                return htmlTag('td', attrs);
              })}
            </tr>`
          })}
        </tbody>
      </table>
    `;

    element.innerHTML = tableHtml;
    
    // fulfill nums
    this.colNums.forEach((nums, col) => {
      nums.forEach((num, i) => {
        this.getCell(element, i-nums.length, col).innerText = num;
      })
    });

    this.rowNums.forEach((nums, row) => {
      nums.forEach((num, i) => {
        this.getCell(element, row, i-nums.length).innerText = num;
      })
    });
    
    // fulfill cells
    for (let row of zeroNat(this.height)) {
      for (let col of zeroNat(this.width)) {
        const cell = this.getCell(element, row, col);
        this.renderCell(cell, this.get(row, col));
      }
    }
    
    return;
  }

  highlightPointer(element, cssClass, pointer) {
    element.querySelectorAll(`.js-cell.${cssClass}`).forEach(cell => {
      cell.classList.remove(cssClass);
    });
    
    const cells = pointer && 'col' in pointer
      ? this.getColCells(element, pointer.col)
      : pointer && 'row' in pointer
      ? this.getRowCells(element, pointer.row)
      : [];
    cells.forEach(cell => {
      cell.classList.add(cssClass);
    });
  }

  updateSlice(element, pointer) {
    if (pointer && 'col' in pointer) {
      const col = pointer.col;
      this.getColCells(element, pointer.col).forEach(cell => {
        let row = 0|cell.getAttribute('data-row');
        this.renderCell(cell, this.get(row, col));
      });
    }
    
    if (pointer && 'row' in pointer) {
      const row = pointer.row;
      this.getRowCells(element, pointer.row).forEach(cell => {
        let col = 0|cell.getAttribute('data-col');
        this.renderCell(cell, this.get(row, col));
      });
    }
  }
  
  getCell(element, row, col) {
    const selector = `.js-cell[data-row="${row}"][data-col="${col}"]`;
    return element.querySelector(selector);
  }
  
  getColCells(element, col) {
    const selector = `.js-cell[data-col="${col}"]`;
    const cells = element.querySelectorAll(selector);
    return Array.from(cells).slice(this.numsHeight);
  }
  
  getRowCells(element, row) {
    const selector = `.js-cell[data-row="${row}"]`;
    const cells = element.querySelectorAll(selector);
    return Array.from(cells).slice(this.numsWidth);
  }

  renderCell(cell, value) {
    cell.classList.remove('undefined', 'empty', 'full');
    switch(value) {
      case UNKNOWN: cell.classList.add('undefined'); break;
      case EMPTY: cell.classList.add('empty'); break;
      case ONE: cell.classList.add('full'); break;
    }
  }
}

const timeoutDelay = (duration) => cb => setTimeout(cb, duration);

function iterateWithDelay(iterable, delay) {
  return new Promise(resolve => {
    const callback = () => {
      const timestamp = performance.now();
      let done = false;
      while (performance.now() - timestamp < 20 && done === false) {
        done = iterable.next().done;
      }
      return done === false ? delay(callback) : resolve();
    };
    callback();
  })
}

const CLS_SOLVED = 'solved';
const CLS_SOLVING = 'solving';

let combinationsCount = 0;

function solveWithDelay(data) {
  if (!data) {
    return;
  }
  let {field, solveIter, fieldEl, lastPointer = null} = data;
  return iterateWithDelay(
    map(
      stepResult => {
        combinationsCount++;
        if (!stepResult) {
          return;
        }
        field.highlightPointer(fieldEl, CLS_SOLVED, stepResult);
        if (lastPointer) {
          field.highlightPointer(fieldEl, CLS_SOLVING, lastPointer);
          field.updateSlice(fieldEl, lastPointer);
        }
        lastPointer = stepResult;
      }
    ) (solveIter),
    timeoutDelay(0)
  )
    .then(() => {
      field.highlightPointer(fieldEl, CLS_SOLVED);
      field.highlightPointer(fieldEl, CLS_SOLVING);
      field.updateSlice(fieldEl, lastPointer);
    });
}

function solveOneStep(data) {
  if (!data) {
    return;
  }
  let {field, solveIter, fieldEl, lastPointer = null} = data;
  let done, stepResult;
  do {
    ({done, value: stepResult} = solveIter.next());
    combinationsCount++;
  }
  while (!done && !stepResult);
  if (stepResult) {
    field.highlightPointer(fieldEl, CLS_SOLVED, stepResult);
    if (lastPointer) {
      field.highlightPointer(fieldEl, CLS_SOLVING, lastPointer);
      field.updateSlice(fieldEl, lastPointer);
    }
    return {field, solveIter, fieldEl, lastPointer: stepResult};
  }
  else {
    field.highlightPointer(fieldEl, CLS_SOLVED);
    field.highlightPointer(fieldEl, CLS_SOLVING);
    field.updateSlice(fieldEl, lastPointer);
    return;
  }
}

const numbersCache = new Map();
function loadNumbers(url) {
  if (numbersCache.has(url)) {
    numbersCache.get(url);
  }
  return fetch(url)
    .then(response => response.text())
    .then(text => {
      const cols = [];
      const rows = [];
      let current = null;
    });