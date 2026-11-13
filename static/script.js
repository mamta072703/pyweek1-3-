
const gridElement = document.getElementById("mazeGrid");
const statusElement = document.getElementById("status");

const solveBtn = document.getElementById("solveBtn");
const clearBtn = document.getElementById("clearBtn");
const resetBtn = document.getElementById("resetBtn");

const rowsInput = document.getElementById("rows");
const colsInput = document.getElementById("cols");
const speedInput = document.getElementById("speed");

let rows = 20;
let cols = 20;

let start = [0, 0];
let goal = [19, 19];

let walls = new Set();
let currentTool = "wall";
let mouseDown = false;
let isSolving = false;

function cellKey(row, col) {
    return `${row},${col}`;
}

function parseKey(key) {
    return key.split(",").map(Number);
}

function updateStatistics(pathLength = 0, explored = 0, time = 0) {
    document.getElementById("pathLength").textContent = pathLength;
    document.getElementById("exploredNodes").textContent = explored;
    document.getElementById("wallCount").textContent = walls.size;
    document.getElementById("executionTime").textContent = `${time} ms`;
}

function setStatus(message, type = "") {
    statusElement.textContent = message;
    statusElement.className = "status";

    if (type) {
        statusElement.classList.add(type);
    }
}

function isSpecialCell(row, col) {
    return (
        (row === start[0] && col === start[1]) ||
        (row === goal[0] && col === goal[1])
    );
}

function renderGrid() {
    gridElement.innerHTML = "";

    gridElement.style.gridTemplateColumns =
        `repeat(${cols}, 25px)`;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {

            const cell = document.createElement("div");

            cell.classList.add("cell");
            cell.dataset.row = row;
            cell.dataset.col = col;

            if (row === start[0] && col === start[1]) {
                cell.classList.add("start");
            }

            else if (row === goal[0] && col === goal[1]) {
                cell.classList.add("goal");
            }

            else if (walls.has(cellKey(row, col))) {
                cell.classList.add("wall");
            }

            cell.addEventListener("pointerdown", (event) => {
    mouseDown = true;
    event.preventDefault();
    handleCellClick(row, col);
});

cell.addEventListener("pointerenter", () => {
    if (mouseDown) {
        handleCellClick(row, col);
    }
});

            gridElement.appendChild(cell);
        }
    }

    updateStatistics();
}

function clearVisualization() {
    document.querySelectorAll(".cell").forEach(cell => {
        cell.classList.remove("explored", "path");
    });

    updateStatistics();
}

function handleCellClick(row, col) {
    if (isSolving || isSpecialCell(row, col)) {
        return;
    }

    const key = cellKey(row, col);

    if (currentTool === "wall") {

        if (walls.has(key)) {
            walls.delete(key);
        } else {
            walls.add(key);
        }

    } else if (currentTool === "start") {

        start = [row, col];
        walls.delete(key);

    } else if (currentTool === "goal") {

        goal = [row, col];
        walls.delete(key);
    }

    clearVisualization();
    renderGrid();

    setStatus("Maze updated. Click Find Shortest Path to solve.");
}

document.addEventListener("pointerup", () => {
    mouseDown = false;
});

document.addEventListener("mouseleave", () => {
    mouseDown = false;
});

// Tool selection
document.querySelectorAll(".tool").forEach(button => {

    button.addEventListener("click", () => {

        if (isSolving) return;

        document.querySelectorAll(".tool").forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");
        currentTool = button.dataset.tool;
    });
});

function delay(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function animateCells(cells, className, speed) {

    for (const position of cells) {

        if (!isSolving) return;

        const [row, col] = position;

        if (isSpecialCell(row, col)) continue;

        const cell = document.querySelector(
            `.cell[data-row="${row}"][data-col="${col}"]`
        );

        if (cell) {
            cell.classList.add(className);
        }

        await delay(speed);
    }
}

function setControlsDisabled(disabled) {
    solveBtn.disabled = disabled;
    clearBtn.disabled = disabled;
    resetBtn.disabled = disabled;
    rowsInput.disabled = disabled;
    colsInput.disabled = disabled;
    speedInput.disabled = disabled;

    document.querySelectorAll(".tool").forEach(button => {
        button.disabled = disabled;
    });
}

async function solveMaze() {

    if (isSolving) return;

    if (start[0] === goal[0] && start[1] === goal[1]) {
        setStatus("Start and goal cannot be the same cell.", "error");
        return;
    }

    clearVisualization();

    isSolving = true;
    setControlsDisabled(true);

    setStatus("A* is searching for the shortest path...");

    const startedAt = performance.now();

    try {

        const response = await fetch("/solve", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                rows: rows,
                cols: cols,
                start: start,
                goal: goal,
                walls: Array.from(walls).map(parseKey)
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Unable to solve maze.");
        }

        const speed = Number(speedInput.value);

        // Animate explored cells
        await animateCells(
            result.explored,
            "explored",
            speed
        );

        if (result.found) {

            // Animate the shortest path
            await animateCells(
                result.path,
                "path",
                speed
            );

            setStatus(
                `Shortest path found! Total moves: ${result.cost}`,
                "success"
            );

            updateStatistics(
                result.cost,
                result.explored_count,
                (performance.now() - startedAt).toFixed(2)
            );

        } else {

            setStatus(
                "No path exists between the start and goal!",
                "error"
            );

            updateStatistics(
                0,
                result.explored_count,
                (performance.now() - startedAt).toFixed(2)
            );
        }

    } catch (error) {

        setStatus(error.message, "error");

    } finally {

        isSolving = false;
        setControlsDisabled(false);
    }
}

solveBtn.addEventListener("click", solveMaze);

// Clear all obstacles
clearBtn.addEventListener("click", () => {

    if (isSolving) return;

    walls.clear();

    clearVisualization();
    renderGrid();

    setStatus("All walls have been cleared.");
});

// Reset complete maze
resetBtn.addEventListener("click", () => {

    if (isSolving) return;

    rows = 20;
    cols = 20;

    rowsInput.value = rows;
    colsInput.value = cols;

    start = [0, 0];
    goal = [19, 19];

    walls.clear();

    renderGrid();

    setStatus("Maze has been reset.");
});

// Change grid dimensions
function resizeGrid() {

    if (isSolving) return;

    const newRows = Number(rowsInput.value);
    const newCols = Number(colsInput.value);

    if (
        !Number.isInteger(newRows) ||
        !Number.isInteger(newCols) ||
        newRows < 5 || newRows > 50 ||
        newCols < 5 || newCols > 50
    ) {
        setStatus("Grid dimensions must be between 5 and 50.", "error");
        return;
    }

    rows = newRows;
    cols = newCols;

    start = [0, 0];
    goal = [rows - 1, cols - 1];

    walls.clear();

    renderGrid();

    setStatus("New maze grid created.");
}

rowsInput.addEventListener("change", resizeGrid);
colsInput.addEventListener("change", resizeGrid);

// Initial grid
renderGrid();
