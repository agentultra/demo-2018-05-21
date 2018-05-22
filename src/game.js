const canvas = document.getElementById('stage')
, stage = canvas.getContext('2d')
, stageW = 800
, stageH = 400
, tileW = 16
, tiles = {
    FLOOR: 0,
    WALL: 1,
    BOX: 2,
    GOAL: 3,
    DONE: 4
}
, state = {}

canvas.width = stageW
canvas.height = stageH

const always = v => () => v

const range = (n, def=0) => Array.from({length: n}, always(def))

const clr = () => {
    stage.fillStyle = 'black'
    stage.fillRect(0, 0, stageW, stageH)
}

const TileMap = (w, h, x=0, y=0, def=tiles.FLOOR) => ({
    w, h, x, y, tiles: range(w * h, def)
})

const getTile = (x, y, tileMap) => {
    const {w, tiles} = tileMap
    return tiles[y * w + x]
}

const setTile = (x, y, v, tileMap) => {
    const {w, tiles} = tileMap
    tiles[y * w + x] = v
}

const genTileMap = () => {
    const m = TileMap(12, 12, 100, 100)
    setTile(6, 6, tiles.WALL, m)
    setTile(10, 10, tiles.BOX, m)
    setTile(2, 2, tiles.GOAL, m)
    return m
}

const init = () => Object.assign(state, {
    level: {
        player: {
            x: 0, y: 0, dx: 0, dy: 0
        },
        tileMap: genTileMap()
    }
})

const update = dt => {}

const drawTileMap = tileMap => {
    const {w, h, x, y} = tileMap
    for (let j = 0; j < h; j++) {
        for (let i = 0; i < w; i++) {
            const t = getTile(i, j, tileMap)
            if (t === tiles.FLOOR) {
                stage.fillStyle = 'darkgrey'
            } else if (t === tiles.WALL) {
                stage.fillStyle = 'grey'
            } else if (t === tiles.BOX) {
                stage.fillStyle = 'skyblue'
            } else if (t === tiles.GOAL) {
                stage.fillStyle = 'lightgreen'
            } else if (t === tiles.DONE) {
                stage.fillStyle = 'green'
            } else {
                stage.fillStyle = 'black'
            }
            stage.fillRect(x + (i * tileW), y + (j * tileW), tileW, tileW)
        }
    }
}

const drawPlayer = (player, tileMap) => {
    const {x: offsetX, y: offsetY} = tileMap
    , {x: px, y: py} = player
    stage.fillStyle = 'yellow'
    stage.fillRect(offsetX + (px * tileW),
                   offsetY + (py * tileW),
                   tileW, tileW)
}

const drawLevel = level => {
    const {player, tileMap} = level
    drawTileMap(level.tileMap)
    drawPlayer(player, tileMap)
}

const render = () => {
    const {level, player} = state
    clr()
    drawLevel(level)
}

const loop = dt => {
    update(dt)
    render()
    window.requestAnimationFrame(loop)
}

init()
window.requestAnimationFrame(loop)

document.addEventListener('keydown', ev => {
    const {level} = state
    , {player, tileMap} = level
    if (ev.key === 'w') {
        player.dy--
    } else if (ev.key === 's') {
        player.dy++
    } else if (ev.key === 'a') {
        player.dx--
    } else if (ev.key === 'd') {
        player.dx++
    }
    const newX =
          player.x + player.dx < 0
          ? tileMap.w - 1
          : player.x + player.dx >= tileMap.w
          ? 0
          : player.x + player.dx
    const newY =
          player.y + player.dy < 0
          ? tileMap.w - 1
          : player.y + player.dy >= tileMap.w
          ? 0
          : player.y + player.dy
    const t = getTile(newX, newY, tileMap)
    switch (true) {
    case t === tiles.FLOOR || t === tiles.GOAL:
        player.x = newX
        player.y = newY
        break;
    case t === tiles.BOX || t === tiles.DONE:
        let newBoxY, newBoxX
        const oldTile = t === tiles.BOX ? tiles.FLOOR : tiles.GOAL
        switch(ev.key) {
        case 'w':
            newBoxY = newY - 1 < 0 ? tileMap.h - 1 : newY - 1
            if (getTile(newX, newBoxY, tileMap) === tiles.FLOOR) {
                setTile(newX, newBoxY, tiles.BOX, tileMap)
                setTile(newX, newY, oldTile, tileMap)
                player.x = newX, player.y = newY
            } else if (getTile(newX, newBoxY, tileMap) === tiles.GOAL) {
                setTile(newX, newBoxY, tiles.DONE, tileMap)
                setTile(newX, newY, oldTile, tileMap)
                player.x = newX, player.y = newY
            }
            break;
        case 's':
            newBoxY = newY + 1 >= tileMap.h ? 0 : newY + 1
            if (getTile(newX, newBoxY, tileMap) === tiles.FLOOR) {
                setTile(newX, newBoxY, tiles.BOX, tileMap)
                setTile(newX, newY, oldTile, tileMap)
                player.x = newX, player.y = newY
            } else if (getTile(newX, newBoxY, tileMap) === tiles.GOAL) {
                setTile(newX, newBoxY, tiles.DONE, tileMap)
                setTile(newX, newY, oldTile, tileMap)
                player.x = newX, player.y = newY
            }
            break;
        case 'a':
            newBoxX = newX - 1 < 0 ? tileMap.w - 1 : newX - 1
            if (getTile(newBoxX, newY, tileMap) === tiles.FLOOR) {
                setTile(newBoxX, newY, tiles.BOX, tileMap)
                setTile(newX, newY, oldTile, tileMap)
                player.x = newX, player.y = newY
            } else if (getTile(newBoxX, newY, tileMap) === tiles.GOAL) {
                setTile(newBoxX, newY, tiles.DONE, tileMap)
                setTile(newX, newY, oldTile, tileMap)
                player.x = newX, player.y = newY
            }
            break;
        case 'd':
            newBoxX = newX + 1 >= tileMap.w ? 0 : newX + 1
            if (getTile(newBoxX, newY, tileMap) === tiles.FLOOR) {
                setTile(newBoxX, newY, tiles.BOX, tileMap)
                setTile(newX, newY, oldTile, tileMap)
                player.x = newX, player.y = newY
            } else if (getTile(newBoxX, newY, tileMap) === tiles.GOAL) {
                setTile(newBoxX, newY, tiles.DONE, tileMap)
                setTile(newX, newY, oldTile, tileMap)
                player.x = newX, player.y = newY
            }
            break;
        default:
            break;
        }
    default:
        break;
    }
    player.dx = 0
    player.dy = 0
})
