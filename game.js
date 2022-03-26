const gameContainer = document.getElementById("game")

let gameState = [
    [2, 0, 0, 2],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
]

const padArrayWithZeros = (arr, atStart) => {
    const zeros = new Array(4 - arr.length).fill(0)
    return atStart ? zeros.concat(arr) : arr.concat(zeros)
}

const getColumn = (x, gameState) => ([
    gameState[0][x],
    gameState[1][x],
    gameState[2][x],
    gameState[3][x],
])

const handlers = {
    ArrowUp: () => {
        gameState.forEach((_, x) => {
            const resolvedColumn = resolveRow(getColumn(x, gameState), false);
            resolvedColumn.forEach((value, y) => gameState[y][x] = value)
        })
    },
    ArrowDown: () => {
        gameState.forEach((_, x) => {
            const resolvedColumn = resolveRow(getColumn(x, gameState), true);
            resolvedColumn.forEach((value, y) => gameState[y][x] = value)
        })
    },
    ArrowRight: () => {
        gameState = gameState.map((xList) => resolveRow(xList, true))
    },
    ArrowLeft: () => {
        gameState = gameState.map((xList) => resolveRow(xList, false))
    },
}

const resolveRow = (row, reverse) => {
    const orderedRow = reverse ? [...row].reverse() : row;

    let lastValue;

    const reducedRow = orderedRow.reduce((newRow, value, x) => {
        if (lastValue && lastValue === value) {
            newRow.push(value * 2)
            lastValue = undefined
        } else if (value && lastValue !== value && x !== 3) {
            if (lastValue) newRow.push(lastValue)
            lastValue = value;
        } else if (x === 3) {
            if (lastValue) newRow.push(lastValue);
            if (value) newRow.push(value);
        }

        return newRow
    }, [])

    if (reverse) return padArrayWithZeros(reducedRow.reverse(), true)

    return padArrayWithZeros(reducedRow)
}

const getEmptyCells = () => {
    const emptyCells = []
    gameState.forEach((xList, y) => {
        xList.forEach((value, x) => {
            if (value === 0) emptyCells.push({ x, y })
        })
    })

    return emptyCells;
}

const createRandomBlock = () => {
    const emptyCells = getEmptyCells()

    if (!emptyCells.length) {
        alert("Game over");
    }

    const { x, y } = emptyCells[Math.round(Math.random() * (emptyCells.length - 1))]
    gameState[y][x] = Math.random() > 0.9 ? 4 : 2
}


const createBlock = (label) => {
    const blockContainer = document.createElement("div")
    blockContainer.classList.add("block-container")

    if (label) {
        const block = document.createElement("div")
        block.classList.add("block", `block--${label}`)

        const blockLabel = document.createElement("span")
        block.classList.add("block__label")
        blockLabel.innerText = label


        block.appendChild(blockLabel)
        blockContainer.appendChild(block)
    }

    gameContainer.appendChild(blockContainer)
}

const paint = () => {
    gameContainer.innerHTML = ""

    gameState.forEach((xList) => {
        xList.forEach((value) => {
            createBlock(value)
        })
    })
}

window.addEventListener("keydown", ({ code }) => {
    const handler = handlers[code]
    if (!handler) return;

    handler()
    createRandomBlock()

    paint()
})

paint()