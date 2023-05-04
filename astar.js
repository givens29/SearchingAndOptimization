let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let canvasSize = 10;

function createCanvas(){
    canvasSize = parseInt(document.getElementById('size').value);
    if (canvasSize > 20) {
        canvasSize = 20;
      }

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
    ctx.strokeStyle = "#ccc";
    ctx.stroke();
    
}

let start = null;
let end = null;
let walls = new Set();
let heuristic;
canvas.addEventListener('click', handleClick);

function handleClick(event) {
    let x = event.clientX - canvas.offsetLeft;
    let y = event.clientY - canvas.offsetTop;

    let row = Math.floor(y / 50);
    let col = Math.floor(x / 50);

    if (walls.has(`${row},${col}`)) {
        walls.delete(`${row},${col}`);
        drawCell(row, col, '#fff');
    } else {
        if (start !== null && start.row === row && start.col === col) {
            start = null;
            drawCell(row, col, '#fff');
        } else {
            if (end !== null && end.row === row && end.col === col) {
                end = null;
            } else {
                if (start === null) {
                    start = {row: row, col: col};
                    drawCell(row, col, '#0f0');
                } else {
                    if (end === null) {
                        end = {row: row, col: col};
                        drawCell(row, col, '#f00');
                    } else {
                        walls.add(`${row},${col}`);
                        drawCell(row, col, '#000');
                    }
                }
            }
        }
    }
}

function drawCell(row, col, color) {
    ctx.fillStyle = color;
    ctx.fillRect(col * 50, row * 50, 50, 50);
}
   
 