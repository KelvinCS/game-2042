function htmlToElement(html: string) {
  const template = document.createElement("template")
  template.innerHTML = html.trim()
  return template.content.firstChild;
}

type TGameCell = {
  id?: string;
  value: number
}

type TGameState = Array<TGameCell[]>

type TCellPosition = {
  x: number;
  y: number
}

const padArrayWithZeros = (arr: TGameCell[], atStart?: boolean) => {
  const zeros = new Array(4 - arr.length)
    .fill({ value: 0 })

  return atStart ? zeros.concat(arr) : arr.concat(zeros)
}

class Game2048 {
  constructor(containerId: string) {
    this.gameContainer = document.getElementById(containerId)
    this.createInitialGameState()
  }


  private gameContainer: HTMLElement;
  public gameState: TGameState;
  private chanceToHaveAFour = 0.25;

  private createInitialGameState() {
    this.gameState = [
      [{ value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }],
      [{ value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }],
      [{ value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }],
      [{ value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }],
    ]

    // Create two random blocks
    this.createRandomBlock(2)
    this.createRandomBlock(2)
  }

  private getEmptyCells(): TCellPosition[] {
    return this.gameState.reduce<TCellPosition[]>((empty, xList, y) => {
      xList.forEach(({ value }, x) => {
        if (!value) empty.push({ x, y })
      })

      return empty;
    }, [])
  }

  private resolveGameRow(row: TGameCell[], reverse?: boolean): TGameCell[] {

    const orderedRow = reverse ? [...row].reverse() : row;

    let prevCell: TGameCell;

    const reducedRow = orderedRow.reduce((newRow, cell, x) => {
      const isLastCell = x === 3
      const canMergeWithPrevCell = prevCell?.value === cell.value

      if (canMergeWithPrevCell) {
        newRow.push({ ...cell, value: cell.value * 2 })
        prevCell = undefined

      } else if (cell.value && !isLastCell) {
        if (prevCell?.value) newRow.push(prevCell)
        prevCell = cell;

      } else if (isLastCell) {
        if (prevCell?.value) newRow.push(prevCell);
        if (cell.value) newRow.push(cell);

      }

      return newRow
    }, [])

    return padArrayWithZeros(
      reverse ? reducedRow.reverse() : reducedRow,
      reverse
    )
  }

  private createRandomBlock(value?: number) {
    const emptyCells = this.getEmptyCells()

    if (!emptyCells) return;

    const { x, y } = emptyCells[Math.round(Math.random() * (emptyCells.length - 1))]

    const cell = {
      value: value || (Math.random() <= this.chanceToHaveAFour ? 4 : 2),
      id: Math.random().toString().slice(2)
    }

    this.gameState[y][x] = cell;
    this.createCellNode(cell, { x, y })
  }


  private getColumn(x: number) {
    return [
      this.gameState[0][x],
      this.gameState[1][x],
      this.gameState[2][x],
      this.gameState[3][x],
    ]
  }

  private moveDown() {
    for (const x in this.gameState) {
      const column = this.resolveGameRow(this.getColumn(Number(x)), true)

      column.forEach((cell, y) => {
        this.gameState[y][x] = cell
      })
    }
  }

  private moveUp() {
    for (const x in this.gameState) {
      const column = this.resolveGameRow(this.getColumn(Number(x)), false)

      column.forEach((cell, y) => {
        this.gameState[y][x] = cell
      })
    }
  }

  private moveRight() {
    this.gameState = this.gameState.map((xList) => this.resolveGameRow(xList, true))
  }

  private getCellTransformPosition({ x, y }: TCellPosition) {
    return `translateX(calc(600px * ${x * 0.25})) translateY(calc(600px * ${y * 0.25}))`
  }

  private createCellNode(cell: TGameCell, { x, y }: TCellPosition) {
    const htmlElement = `
    <div 
        class="block-container" id="${cell.id}" 
        style="transform: ${this.getCellTransformPosition({ x, y })}"
    >
        <div class="block block--created block--${cell.value}">
            ${cell.value}
        </div>
    </div>
    `

    const blockNode = htmlToElement(htmlElement)
    this.gameContainer.appendChild(blockNode)
  }

  private removeDeadBlocks() {
    this.gameContainer.childNodes.forEach((node) => {
      const exists = this.gameState.find((xList) =>
        xList.find(({ id }) => id === (node as any).id)
      )

      if (!exists) node.remove()
    })
  }

  private moveLeft() {
    this.gameState = this.gameState.map((xList) => this.resolveGameRow(xList))
  }

  private moveCellNodes() {
    this.gameState.forEach((xList, y) => {
      xList.forEach(({ id, value }, x) => {
        if (!id) return;

        const cellNode = document.getElementById(id);
        cellNode.style.transform = this.getCellTransformPosition({ x, y })
        cellNode.innerHTML = ""
        cellNode.appendChild(htmlToElement(`
          <div class="block block--${value}">
              ${value}
          </div>
        `))
      })
    })
  }

  public start() {
    const handlers: Record<string, () => void> = {
      ArrowUp: () => game.moveUp(),
      ArrowDown: () => game.moveDown(),
      ArrowRight: () => game.moveRight(),
      ArrowLeft: () => game.moveLeft(),
    }

    window.addEventListener("keydown", ({ code }) => {
      if (!handlers[code]) return;

      handlers[code]()
      this.moveCellNodes()
      this.createRandomBlock()
      this.removeDeadBlocks()
    })
  }
}

const game = new Game2048("game")

game.start()

