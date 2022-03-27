const gameContainer = document.getElementById("game")

const generateRandomId = () => Math.random().toString().slice(2)

let gameState = [
    [{value:0}, {value:0}, {value:0}, {value:0}],
    [{value:0}, {value:0}, {value:0}, {value:0}],
    [{value:0}, {value:0}, {value:0}, {value:0}],
    [{value:0}, {value:0}, {value:0}, {value:0}],
]


const padArrayWithZeros = (arr, atStart) => {
    const zeros = new Array(4 - arr.filter(({ value }) => value).length).fill({value: 0})
    return atStart ? zeros.concat(arr) : arr.concat(zeros)
}


const getColumn = (x, gameState) => ([
    gameState[0][x],
    gameState[1][x],
    gameState[2][x],
    gameState[3][x],
])

const getCellTransition = (x, y) => {
    return `translateX(calc(600px * ${x * 0.25})) translateY(calc(600px * ${y * 0.25}))`
}

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

    let lastCell;

    const reducedRow = orderedRow.reduce((newRow, cell, x) => {
        const lastValue = lastCell && lastCell.value;

        if (lastValue && lastValue === cell.value) {
            newRow.push({ ...cell, value: cell.value * 2 })
            lastCell = undefined
        } else if (cell.value && lastValue !== cell.value && x !== 3) {
            if (lastValue) newRow.push(lastCell)
            lastCell = cell;
        } else if (x === 3) {
            if (lastValue) newRow.push(lastCell);
            if (cell.value) newRow.push(cell);
        }

        return newRow
    }, [])

    if (reverse) return padArrayWithZeros(reducedRow.reverse(), true)

    return padArrayWithZeros(reducedRow)
}

const getEmptyCells = () => {
    const emptyCells = []
    gameState.forEach((xList, y) => {
        xList.forEach(({value}, x) => {
            if (value === 0) emptyCells.push({ x, y })
        })
    })

    return emptyCells;
}

const createRandomBlock = () => {
    const emptyCells = getEmptyCells()

    if (!emptyCells.length) {
        // alert("Game over");
    }

    // console.log(emptyCells)

    const {x, y} = emptyCells[Math.round(Math.random() * (emptyCells.length - 1))]
    gameState[y][x] = {
        value: Math.random() > 0.9 ? 4 : 2,
        id: generateRandomId()
    }

    createBlock(gameState[y][x].value, gameState[y][x].id, x, y)

}


const createBlock = (label, id, x, y) => {

    if (label) {
        const blockContainer = document.createElement("div")
        blockContainer.classList.add("block-container")
        blockContainer.style.transform = getCellTransition(x, y)
        blockContainer.setAttribute("id", id)

        const block = document.createElement("div")
        block.classList.add("block", `block--${label}`)

        const blockLabel = document.createElement("span")
        block.classList.add("block__label")
        blockLabel.innerText = label


        block.appendChild(blockLabel)
        blockContainer.appendChild(block)
        gameContainer.appendChild(blockContainer)
    }

}

const cleanBoard = () => {
    const nodes = gameContainer.childNodes

    setTimeout(() => {
        nodes.forEach((node) => {
            if (!gameState.some((xList) => xList.some(({ id }) => node.id === id))) {
                node.remove()
            }
        })
    }, 100)

}

const paint = () => {
    // gameContainer.innerHTML = ""

    gameState.forEach((xList, y) => {
        xList.forEach(({ value, id }, x) => {
            if (value) {
                const element = document.getElementById(id)
                element.style.transform = getCellTransition(x, y)
                element.innerHTML = ""

                const block = document.createElement("div")
                block.classList.add("block", `block--${value}`)

                const blockLabel = document.createElement("span")
                block.classList.add("block__label")
                blockLabel.innerText = value

                block.appendChild(blockLabel)
                element.appendChild(block)


            }
            // createBlock(value, id)
        })
    })

    cleanBoard()
}

window.addEventListener("keydown", ({ code }) => {
    const handler = handlers[code]
    if (!handler) return;

    handler()
    console.log(gameState)
    createRandomBlock()

    paint()
})

createRandomBlock()
createRandomBlock()
paint()