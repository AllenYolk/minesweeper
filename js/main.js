"use strict"

const difficultyConfigure = {
    easy: {
        mines: 10,
        height: 9, width: 9, n: 81
    },
    normal: {
        mines: 40,
        height: 16, width: 16, n: 16*16
    },
    hard: {
        mines: 99,
        height: 16, width: 30, n: 30*16
    }
};
Object.freeze(difficultyConfigure);
let difficulty = difficultyConfigure.easy;
let field, mask, timer;
let firstClickYet = false, fieldLock = false;
const mine = -1;

const newGame_btn = document.querySelector("#new-game");
const difficulty_select = document.querySelector("#difficulty");
const difficultyStyle_link = document.querySelector("#difficulty-style");
const stateInfo_p = document.querySelector("#state-info");
let cells = document.querySelectorAll(".cell");
cells = Array.from(cells);
let field_div = document.querySelector("#game-field");
let bg_div = document.querySelector("#bg");

const digitApp = Vue.createApp({
    data() {
        return {
            remainingMines: 0,
            usedTime: 0
        }
    }
});
const digitVM = digitApp.mount("#gameheader");

let i2xy = (i) => {
    let w = difficulty.width, h = difficulty.height;
    return {
        x: Math.floor(i/w),
        y: Math.floor(i%w)
    }
}
let xy2i = (x, y) => difficulty.width*x+y;

function setMines(clickPlace) {
    let index = cells.indexOf(clickPlace);
    let xx = i2xy(index).x, yy = i2xy(index).y;
    let x = difficulty.height, y = difficulty.width;
    let cnt = 0;
    while(cnt < difficulty.mines) {
        let xi = Math.floor(Math.random()*x),
            yi = Math.floor(Math.random()*y);

        if(Math.abs(xx-xi)<=1.1 && Math.abs(yy-yi)<=1.1)
            continue;
        if(field[xi][yi] === mine)
            continue;
        
        field[xi][yi] = mine;
        cnt = cnt+1;
    }
    
    
    for(let xi=0; xi<x; ++xi) {
        for(let yi=0; yi<y; ++yi) {
            if(field[xi][yi] !== mine) {
                let v = 0;
                if(xi>0 && yi>0 && field[xi-1][yi-1]===mine)
                    v++;
                if(xi>=0 && yi>0 && field[xi][yi-1]===mine)
                    v++;
                if(xi<x-1 && yi>0 && field[xi+1][yi-1]===mine)
                    v++;
                if(xi>0 && yi>=0 && field[xi-1][yi]===mine)
                    v++;
                if(xi<x-1 && yi>=0 && field[xi+1][yi]===mine)
                    v++;
                if(xi>0 && yi<y-1 && field[xi-1][yi+1]===mine)
                    v++;
                if(xi>=0 && yi<y-1 && field[xi][yi+1]===mine)
                    v++;
                if(xi<x-1 && yi<y-1 && field[xi+1][yi+1]===mine)
                    v++;
                field[xi][yi] = v;
            }
        }
    }

    timer = setInterval(() => {
        digitVM.usedTime++;
    }, 1000);
}

function disclose(clickPlace) {
    let index = cells.indexOf(clickPlace);
    let {x, y} = i2xy(index);
    console.log("click at ", x, y);
    if(field[x][y] === mine) {
        if(mask[x][y] === 1)
            lose(x, y);
        return;
    }
    if(mask[x][y] === 1) {
        dfs(x, y);
        return;
    }
    if(mask[x][y] === 0) {
        check(x, y);
        return;
    }
}

function markMine(clickPlace) {
    let index = cells.indexOf(clickPlace);
    let xi = i2xy(index).x, yi = i2xy(index).y;
    console.log("markMine", xi, yi);
    if(mask[xi][yi] === 1) {
        mask[xi][yi] = -1;
        digitVM.remainingMines--;
    } else if(mask[xi][yi] === -1) {
        mask[xi][yi] = 1;
        digitVM.remainingMines++;
    }
}

function dfs(xi, yi) {
    if(field[xi][yi] != mine && mask[xi][yi] == 1) {
        mask[xi][yi] = 0;
    } else {
        return;
    }
    let x = difficulty.height, y = difficulty.width;
    if(field[xi][yi] === 0) {
        if(xi>0 && yi>0)
            dfs(xi-1, yi-1);
        if(xi>=0 && yi>0)
            dfs(xi, yi-1);
        if(xi<x-1 && yi>0)
            dfs(xi+1, yi-1);
        if(xi>0 && yi>=0)
            dfs(xi-1, yi);
        if(xi<x-1 && yi>=0)
            dfs(xi+1, yi);
        if(xi>0 && yi<y-1)
            dfs(xi-1, yi+1);
        if(xi>=0 && yi<y-1)
            dfs(xi, yi+1);
        if(xi<x-1 && yi<y-1)
            dfs(xi+1, yi+1);
    }
}

function check(xi, yi) {
    let v = 0, v_marked = 0,x = difficulty.height, y = difficulty.width;
    let wrongPlace = [];
    if(xi>0 && yi>0) {
        if(field[xi-1][yi-1]===mine && mask[xi-1][yi-1]==mine) 
            v++;
        else
            wrongPlace.push([-1, -1]);
    }
    if(xi>=0 && yi>0){
        if(field[xi][yi-1]===mine && mask[xi][yi-1]==mine)
            v++;
        else
            wrongPlace.push([0, -1]);
    }
    if(xi<x-1 && yi>0){
        if(field[xi+1][yi-1]===mine && mask[xi+1][yi-1]==mine)
            v++;
        else
            wrongPlace.push([1, -1]);
    }
    if(xi>0 && yi>=0){
        if(field[xi-1][yi]===mine && mask[xi-1][yi]==mine)
            v++;
        else
            wrongPlace.push([-1, 0]);
    }
    if(xi<x-1 && yi>=0){
        if(field[xi+1][yi]===mine && mask[xi+1][yi]==mine)
            v++;
        else
            wrongPlace.push([1, 0]);
    }
    if(xi>0 && yi<y-1){
        if(field[xi-1][yi+1]===mine && mask[xi-1][yi+1]==mine)
            v++;
        else
            wrongPlace.push([-1, 1]);
    }
    if(xi>=0 && yi<y-1){
        if(field[xi][yi+1]===mine && mask[xi][yi+1]==mine)
            v++;
        else
            wrongPlace.push([0, 1]);
    }
    if(xi<x-1 && yi<y-1){
        if(field[xi+1][yi+1]===mine && mask[xi+1][yi+1]==mine)
            v++;
        else
            wrongPlace.push([1, 1]);
    }
    
    if(xi>0 && yi>0 && mask[xi-1][yi-1]==mine) 
        v_marked++;
    if(xi>=0 && yi>0 && mask[xi][yi-1]==mine)
        v_marked++;
    if(xi<x-1 && yi>0 && mask[xi+1][yi-1]==mine)
        v_marked++;
    if(xi>0 && yi>=0 && mask[xi-1][yi]==mine)
        v_marked++;
    if(xi<x-1 && yi>=0 && mask[xi+1][yi]==mine)
        v_marked++;
    if(xi>0 && yi<y-1 && mask[xi-1][yi+1]==mine)
        v_marked++;
    if(xi>=0 && yi<y-1 && mask[xi][yi+1]==mine)
        v_marked++;
    if(xi<x-1 && yi<y-1 && mask[xi+1][yi+1]==mine)
        v_marked++;

    if(v_marked === field[xi][yi]) {
        if(v !== field[xi][yi]) {
            lose(...wrongPlace[0]);
        }
        if(xi>0 && yi>0)
            dfs(xi-1, yi-1);
        if(xi>=0 && yi>0)
            dfs(xi, yi-1);
        if(xi<x-1 && yi>0)
            dfs(xi+1, yi-1);
        if(xi>0 && yi>=0)
            dfs(xi-1, yi);
        if(xi<x-1 && yi>=0)
            dfs(xi+1, yi);
        if(xi>0 && yi<y-1)
            dfs(xi-1, yi+1);
        if(xi>=0 && yi<y-1)
            dfs(xi, yi+1);
        if(xi<x-1 && yi<y-1)
            dfs(xi+1, yi+1);
    }
}

document.oncontextmenu = function(event) {
    event.preventDefault();
}

field_div.onmousedown = (event) => {
    if(fieldLock)
        return;

    if(event.button === 0 && !firstClickYet) {
        setMines(event.target);
        disclose(event.target);
        firstClickYet = true;
        stateInfo_p.textContent = "Game in Progress...";
    } else if(event.button === 0 && firstClickYet) {
        disclose(event.target);
    } else if(event.button === 1 || event.button === 2) {
        markMine(event.target);
    }

    renderField();
    testWin();
}

function newGame(){
    stateInfo_p.textContent = "Click to Start!";
    fieldLock = false;
    difficulty = difficultyConfigure[difficulty_select.value];
    field = Array.from({length: difficulty.height}, () => Array.from({length: difficulty.width}, () => 0));
    mask = Array.from({length: difficulty.height}, () => Array.from({length: difficulty.width}, () => 1));
    field_div.style.gridTemplateColumns = `repeat(${difficulty.width}, 1fr)`;
    field_div.style.gridTemplateRows = `repeat(${difficulty.height}, 1fr)`;
    field_div.style.width = `${25*difficulty.width}px`;
    parseDOM();
    digitVM.remainingMines = difficulty.mines;
    clearInterval(timer);
    bg_div.style.backgroundImage = `url('./img/sevenga1.jpg')`;
    digitVM.usedTime = 0;
    cells = document.querySelectorAll(".cell");
    cells = Array.from(cells);
    difficultyStyle_link.href = `./css/${difficulty_select.value}.css`;
    firstClickYet = false;
}

function lose(deathX, deathY) {
    stateInfo_p.textContent = "You lose!";
    let x = difficulty.height, y = difficulty.width;
    for(let xi=0; xi<x; ++xi) {
        for(let yi=0; yi<y; ++yi) {
            if(field[xi][yi] === mine) {
                if(mask[xi][yi] === -1) {
                    mask[xi][yi] = -3;
                } else {
                    mask[xi][yi] = -2;
                }
            }
        }
    }
    mask[deathX][deathY] = -5;
    fieldLock = true;
    clearInterval(timer);
    bg_div.style.backgroundImage = `url("./img/sevenga4.jpg")`;
    
}

function testWin() {
    if(!firstClickYet)
        return false;

    let x = difficulty.height, y = difficulty.width;
    for(let xi=0; xi<x; ++xi) {
        for(let yi=0; yi<y; ++yi) {
            if(field[xi][yi] === mine && mask[xi][yi] !== mine) {
                return false;
            }
        }
    }
    
    // you win
    fieldLock = true;
    clearInterval(timer);
    stateInfo_p.textContent = "You win! Congratulations!";
    return true;
}

function renderField() {
    let x = difficulty.height, y = difficulty.width;
    for(let xi=0; xi<x; ++xi) {
        for(let yi=0; yi<y; ++yi) {
            let i = xy2i(xi, yi);
            switch(mask[xi][yi]) {
                case 0:
                    cells[i].className = `cell-${field[xi][yi]}`;
                    if(field[xi][yi] > 0)
                        cells[i].textContent = field[xi][yi];
                    break;
                case mine:
                    cells[i].className = `cell-masked-mine`;
                    cells[i].textContent = "!";
                    break;
                case -2:
                    cells[i].className = `cell-mine-wrong`;
                    cells[i].textContent = "X";
                    break;
                case -3:
                    cells[i].className = `cell-mine-correct`;
                    cells[i].textContent = "O";
                    break;
                case -5:
                    cells[i].className = `cell-explode`; 
                    cells[i].textContent = "X";
                    break;
                case 1:
                    cells[i].className = 'cell';
                    cells[i].textContent = "";
                    break;
            }
        }
    }
}

function parseDOM() {
    let child = field_div.firstElementChild;
    while(child) {
        child.remove();
        child = field_div.firstElementChild;
    }
    for(let i=0; i<difficulty.n; ++i) {
        let new_element = document.createElement("div");
        new_element.setAttribute("class", "cell");
        field_div.appendChild(new_element);
    }
}

newGame_btn.onclick = newGame;
newGame();