let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let canvasSize;
let matrix;
let ROW;
let COL;
let d = [];

function createCanvas(){
    canvas.innerHTML = "";
    canvasSize = parseInt(document.getElementById('size').value);
    if (canvasSize > 20) {
        alert("The size of the canvas should be minimal 20");
        return;
      }
    ROW = canvasSize;
    COL = canvasSize;
    canvas.width = canvasSize * 50;
    canvas.height = canvasSize * 50;

    ctx.beginPath();
    for(let i = 0; i <= canvas.width; i += 50){
        ctx.moveTo(i,0);
        ctx.lineTo(i,canvas.height);
    }
    for (let i = 0; i <= canvas.width; i += 50) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
    }
    for (let i = 0; i <= canvas.height; i += 50) {
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
    }
    canvas.style.backgroundColor = 'black';
    ctx.strokeStyle = "#ccc";
    ctx.stroke();    

  start = null;
  end = null;

  walls.clear();
}

let start = null;
let end = null;
let walls = new Set();
let heuristic;
canvas.addEventListener('mousedown', handleClick);

function handleClick(event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    let row = Math.floor(y / 50);
    let col = Math.floor(x / 50);

    if (start !== null && start.row === row && start.col === col) {        
        } else {
            if (end !== null && end.row === row && end.col === col) {
            } else {
                if (start === null) {
                    start = {row: row, col: col};
                    drawCell(row, col, '#0f0');
                    ctx.strokeStyle = "#ccc";
                    ctx.stroke();
                } else {
                    if (end === null) {
                        end = {row: row, col: col};
                        drawCell(row, col, '#f00');
                        ctx.strokeStyle = "#ccc";
                        ctx.stroke();
                    } else {
                        walls.add(`${row},${col}`);
                        drawCell(row, col, '#FFFFFF');
                        ctx.strokeStyle = "#ccc";
                        ctx.stroke();
                        matrix = createMatrix();
                    }
                }
            }
        } 
        
}

function drawCell(row, col, color) {
    ctx.fillStyle = color;
    ctx.fillRect(col * 50, row * 50, 50, 50);
}

function createMatrix() {
    
    let matrix = [];
    
    for (let row = 0; row < canvasSize; row++) {
      let currentRow = [];
      for (let col = 0; col < canvasSize; col++) {
        if (walls.has(`${row},${col}`)) {
          currentRow.push(0);
        } else {
          currentRow.push(1);
        }
      }
      matrix.push(currentRow);
    }
  
    return matrix;
  }
function findPath(){
    if (!start || !end || walls.size === 0) {
        alert("Make sure you select start, end, and walls.");
        return;
    }
    if(d.length>0){
        for(let i=0; i <d.length; i++){
            drawCell(d[i][0],d[i][1],'#000000');
            ctx.strokeStyle = "#ccc";
            ctx.stroke();
        }
        d=[];
    }
    let src = [start.row,start.col];
    let dest = [end.row, end.col];
    let selectedHeuristic = document.getElementById('heuristic-select');
    let heuristicType = selectedHeuristic.value;
    
    aStarSearch(matrix, src, dest,heuristicType);
}
class cell {
    constructor(){
        this.parent_i = 0;
        this.parent_j = 0;
        this.f = 0;
        this.g = 0;
        this.h = 0;
    }
}
 
function isValid(row, col)
{
    return (row >= 0) && (row < ROW) && (col >= 0) && (col < COL);
}

function isUnBlocked(grid, row, col)
{
    if (grid[row][col] == 1)
        return (true);
    else
        return (false);
}

function isDestination(row, col, dest)
{
    if (row == dest[0] && col == dest[1])
        return (true);
    else
        return (false);
}

function tracePath(cellDetails, dest) {
    let row = dest[0];
    let col = dest[1];
    
    let path = [];
    
    while (!(cellDetails[row][col].parent_i == row && cellDetails[row][col].parent_j == col)) {
        path.push([row, col]);
        let temp_row = cellDetails[row][col].parent_i;
        let temp_col = cellDetails[row][col].parent_j;
        row = temp_row;
        col = temp_col;
    }
    
    while (path.length > 0) {
        let p = path[0];
        path.shift();        
        drawCell(p[0], p[1], '#00f');
        ctx.strokeStyle = "#ccc";
        ctx.stroke();
        d.push([p[0],p[1]]);
    }
    return
}
function manhattanDistance(row, col, dest) {
    return Math.abs(row - dest[0]) + Math.abs(col - dest[1]);
}

function euclideanDistance(row, col, dest){
    return (Math.sqrt((row - dest[0]) * (row - dest[0]) + (col - dest[1]) * (col - dest[1])));
}

function aStarSearch(grid, src, dest, heuristicType)
{
    const FLT_MAX = Number.MAX_VALUE;

    if (isValid(src[0], src[1]) == false) {
        alert("Source is invalid\n");
        return;
    }
 
    if (isValid(dest[0], dest[1]) == false) {
        alert("Destination is invalid\n");
        return;
    }

    if (isUnBlocked(grid, src[0], src[1]) == false
        || isUnBlocked(grid, dest[0], dest[1])
               == false) {
        alert("Source or the destination is blocked\n");
        return;
    }
 
    if (isDestination(src[0], src[1], dest)
        == true) {
        alert("We are already at the destination\n");
        return;
    }
 
    let closedList = new Array(ROW);
    for(let i = 0; i < ROW; i++){
        closedList[i] = new Array(COL).fill(false);
    }

    let cellDetails = new Array(ROW);
    for(let i = 0; i < ROW; i++){
        cellDetails[i] = new Array(COL);
    }
 
    let i, j;
 
    for (i = 0; i < ROW; i++) {
        for (j = 0; j < COL; j++) {
            cellDetails[i][j] = new cell();
            cellDetails[i][j].f = 2147483647;
            cellDetails[i][j].g = 2147483647;
            cellDetails[i][j].h = 2147483647;
            cellDetails[i][j].parent_i = -1;
            cellDetails[i][j].parent_j = -1;
        }
    }

    i = src[0], j = src[1];
    cellDetails[i][j].f = 0;
    cellDetails[i][j].g = 0;
    cellDetails[i][j].h = 0;
    cellDetails[i][j].parent_i = i;
    cellDetails[i][j].parent_j = j;
 
    let openList = new Map();

    openList.set(0, [i, j]);

    let foundDest = false;
 
    while (openList.size > 0) {
        let p = openList.entries().next().value

        openList.delete(p[0]);

        i = p[1][0];
        j = p[1][1];
        closedList[i][j] = true;
 
        let gNew, hNew, fNew;
 
        if (isValid(i - 1, j) == true) {
            if (isDestination(i - 1, j, dest) == true) {
                cellDetails[i - 1][j].parent_i = i;
                cellDetails[i - 1][j].parent_j = j;
                tracePath(cellDetails, dest);
                foundDest = true;
                return;
            }
            else if (closedList[i - 1][j] == false
                     && isUnBlocked(grid, i - 1, j)
                            == true) {
                gNew = cellDetails[i][j].g + 1;
                if(heuristicType == 'euclidean'){
                    hNew = euclideanDistance(i-j,j,dest);
                }
                else{
                    hNew = manhattanDistance(i-j,j,dest);
                }
                fNew = gNew + hNew;

                if (cellDetails[i - 1][j].f == 2147483647
                    || cellDetails[i - 1][j].f > fNew) {
                    openList.set(fNew, [i - 1, j]);

                    cellDetails[i - 1][j].f = fNew;
                    cellDetails[i - 1][j].g = gNew;
                    cellDetails[i - 1][j].h = hNew;
                    cellDetails[i - 1][j].parent_i = i;
                    cellDetails[i - 1][j].parent_j = j;
                }
            }
        }
 
        if (isValid(i + 1, j) == true) {
            if (isDestination(i + 1, j, dest) == true) {
                cellDetails[i + 1][j].parent_i = i;
                cellDetails[i + 1][j].parent_j = j;
                tracePath(cellDetails, dest);
                foundDest = true;
                return;
            }

            else if (closedList[i + 1][j] == false
                     && isUnBlocked(grid, i + 1, j)
                            == true) {
                gNew = cellDetails[i][j].g + 1;
                if(heuristicType == 'euclidean'){
                    hNew = euclideanDistance(i+j,j,dest);
                }
                else{
                    hNew = manhattanDistance(i+j,j,dest);
                }
                fNew = gNew + hNew;
 
                if (cellDetails[i + 1][j].f == 2147483647
                    || cellDetails[i + 1][j].f > fNew) {
                    openList.set(fNew, [i + 1, j]);
                    cellDetails[i + 1][j].f = fNew;
                    cellDetails[i + 1][j].g = gNew;
                    cellDetails[i + 1][j].h = hNew;
                    cellDetails[i + 1][j].parent_i = i;
                    cellDetails[i + 1][j].parent_j = j;
                }
            }
        }
 
        if (isValid(i, j + 1) == true) {
            if (isDestination(i, j + 1, dest) == true) {
                cellDetails[i][j + 1].parent_i = i;
                cellDetails[i][j + 1].parent_j = j;
                tracePath(cellDetails, dest);
                foundDest = true;
                return;
            }

            else if (closedList[i][j + 1] == false
                     && isUnBlocked(grid, i, j + 1)
                            == true) {
                gNew = cellDetails[i][j].g + 1;
                if(heuristicType == 'euclidean'){
                    hNew = euclideanDistance(i,j+1,dest);
                }
                else{
                    hNew = manhattanDistance(i,j+1,dest);
                }
                fNew = gNew + hNew;
 
                if (cellDetails[i][j + 1].f == 2147483647
                    || cellDetails[i][j + 1].f > fNew) {
                    openList.set(fNew, [i, j + 1]);

                    cellDetails[i][j + 1].f = fNew;
                    cellDetails[i][j + 1].g = gNew;
                    cellDetails[i][j + 1].h = hNew;
                    cellDetails[i][j + 1].parent_i = i;
                    cellDetails[i][j + 1].parent_j = j;
                }
            }
        }
 
        if (isValid(i, j - 1) == true) {
            if (isDestination(i, j - 1, dest) == true) {
                cellDetails[i][j - 1].parent_i = i;
                cellDetails[i][j - 1].parent_j = j;
                tracePath(cellDetails, dest);
                foundDest = true;
                return;
            }
 
            else if (closedList[i][j - 1] == false
                     && isUnBlocked(grid, i, j - 1)
                            == true) {
                gNew = cellDetails[i][j].g + 1;
                if(heuristicType == 'euclidean'){
                    hNew = euclideanDistance(i,j-1,dest);
                }
                else{
                    hNew = manhattanDistance(i,j-1,dest);
                }
                fNew = gNew + hNew;

                if (cellDetails[i][j - 1].f == 2147483647
                    || cellDetails[i][j - 1].f > fNew) {
                    openList.set(fNew, [i, j - 1]);

                    cellDetails[i][j - 1].f = fNew;
                    cellDetails[i][j - 1].g = gNew;
                    cellDetails[i][j - 1].h = hNew;
                    cellDetails[i][j - 1].parent_i = i;
                    cellDetails[i][j - 1].parent_j = j;
                }
            }
        }
 
        if (isValid(i - 1, j + 1) == true) {
            if (isDestination(i - 1, j + 1, dest) == true) {
                cellDetails[i - 1][j + 1].parent_i = i;
                cellDetails[i - 1][j + 1].parent_j = j;
                tracePath(cellDetails, dest);
                foundDest = true;
                return;
            }
            else if (closedList[i - 1][j + 1] == false
                     && isUnBlocked(grid, i - 1, j + 1)
                            == true) {
                gNew = cellDetails[i][j].g + 1.414;
                if(heuristicType == 'euclidean'){
                    hNew = euclideanDistance(i-1,j+1,dest);
                }
                else{
                    hNew = manhattanDistance(i-1,j+1,dest);
                }
                fNew = gNew + hNew;

                if (cellDetails[i - 1][j + 1].f == 2147483647
                    || cellDetails[i - 1][j + 1].f > fNew) {
                    openList.set(fNew, [i - 1, j + 1]);

                    cellDetails[i - 1][j + 1].f = fNew;
                    cellDetails[i - 1][j + 1].g = gNew;
                    cellDetails[i - 1][j + 1].h = hNew;
                    cellDetails[i - 1][j + 1].parent_i = i;
                    cellDetails[i - 1][j + 1].parent_j = j;
                }
            }
        }

        if (isValid(i - 1, j - 1) == true) {
            if (isDestination(i - 1, j - 1, dest) == true) {
                cellDetails[i - 1][j - 1].parent_i = i;
                cellDetails[i - 1][j - 1].parent_j = j;
                tracePath(cellDetails, dest);
                foundDest = true;
                return;
            }
            else if (closedList[i - 1][j - 1] == false
                     && isUnBlocked(grid, i - 1, j - 1)
                            == true) {
                gNew = cellDetails[i][j].g + 1.414;
                if(heuristicType == 'euclidean'){
                    hNew = euclideanDistance(i-1,j-1,dest);
                }
                else{
                    hNew = manhattanDistance(i-1,j-1,dest);
                }
                fNew = gNew + hNew;

                if (cellDetails[i - 1][j - 1].f == 2147483647
                    || cellDetails[i - 1][j - 1].f > fNew) {
                    openList.set(fNew, [i - 1, j - 1]);
                    cellDetails[i - 1][j - 1].f = fNew;
                    cellDetails[i - 1][j - 1].g = gNew;
                    cellDetails[i - 1][j - 1].h = hNew;
                    cellDetails[i - 1][j - 1].parent_i = i;
                    cellDetails[i - 1][j - 1].parent_j = j;
                }
            }
        }

        if (isValid(i + 1, j + 1) == true) {

            if (isDestination(i + 1, j + 1, dest) == true) {
                cellDetails[i + 1][j + 1].parent_i = i;
                cellDetails[i + 1][j + 1].parent_j = j;
                tracePath(cellDetails, dest);
                foundDest = true;
                return;
            }

            else if (closedList[i + 1][j + 1] == false
                     && isUnBlocked(grid, i + 1, j + 1)
                            == true) {
                gNew = cellDetails[i][j].g + 1.414;
                if(heuristicType == 'euclidean'){
                    hNew = euclideanDistance(i+1,j+1,dest);
                }
                else{
                    hNew = manhattanDistance(i+1,j+1,dest);
                }
                fNew = gNew + hNew;

                if (cellDetails[i + 1][j + 1].f == 2147483647
                    || cellDetails[i + 1][j + 1].f > fNew) {
                    openList.set(fNew, [i + 1, j + 1]);
 
                    cellDetails[i + 1][j + 1].f = fNew;
                    cellDetails[i + 1][j + 1].g = gNew;
                    cellDetails[i + 1][j + 1].h = hNew;
                    cellDetails[i + 1][j + 1].parent_i = i;
                    cellDetails[i + 1][j + 1].parent_j = j;
                }
            }
        }
 
        if (isValid(i + 1, j - 1) == true) {

            if (isDestination(i + 1, j - 1, dest) == true) {
                cellDetails[i + 1][j - 1].parent_i = i;
                cellDetails[i + 1][j - 1].parent_j = j;
                tracePath(cellDetails, dest);
                foundDest = true;
                return;
            }
 
            else if (closedList[i + 1][j - 1] == false
                     && isUnBlocked(grid, i + 1, j - 1)
                            == true) {
                gNew = cellDetails[i][j].g + 1.414;
                if(heuristicType == 'euclidean'){
                    hNew = euclideanDistance(i+1,j-1,dest);
                }
                else{
                    hNew = manhattanDistance(i+1,j-1,dest);
                }
                fNew = gNew + hNew;
 
                if (cellDetails[i + 1][j - 1].f == FLT_MAX
                    || cellDetails[i + 1][j - 1].f > fNew) {
                    openList.set(fNew, [i + 1, j - 1]);

                    cellDetails[i + 1][j - 1].f = fNew;
                    cellDetails[i + 1][j - 1].g = gNew;
                    cellDetails[i + 1][j - 1].h = hNew;
                    cellDetails[i + 1][j - 1].parent_i = i;
                    cellDetails[i + 1][j - 1].parent_j = j;
                }
            }
        }
    }

    if (foundDest == false) {
        alert("Can't find the Destination Cell");
        return;
      }     
}