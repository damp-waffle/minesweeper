class Cell{
    constructor(x, y){
        this.mine = false;
        this.adjacent = 0;
        this.uncovered = false;
        this.flagged = false;
        this.div = document.createElement("div");
        this.x = x;
        this.y = y;
        this.id = String(x) + "-" + String(y);
        this.div.setAttribute("id", this.id);
        this.div.setAttribute("class", "covered");
    }
    uncover(){
        this.uncovered = true;
        this.flagged = false;
        return(this.mine);
    }
    setNum(a){
        if(a > 0){
            this.adjacent = a;
            this.div.innerHTML = String(this.adjacent);
            this.div.style.color = numColorSet[a - 1];
        }
        this.div.classList.remove("covered");
        this.div.style.backgroundImage = "none";
        this.div.style.backgroundColor = "#C0C0C0";
        this.div.style.border = "1px #808080 solid"
    }
    blow(b=true){
        if(this.mine && b){
            this.div.style.backgroundImage = "url(sprites.png)";
            this.div.style.backgroundPosition = "0 0";
        }
        this.div.classList.remove("covered");
    }
    flag(){
        this.flagged = !(this.flagged);
        if(this.flagged){
            this.div.classList.remove("covered");
            this.div.setAttribute("class", "flagged");
        }
        else{
            this.div.classList.remove("flagged");
            this.div.setAttribute("class", "covered");
        }
    }
}
document.getElementById("easy").addEventListener("click", select);
document.getElementById("medium").addEventListener("click", select);
document.getElementById("hard").addEventListener("click", select);
document.getElementById("custom").addEventListener("click", select);
document.getElementById("start").addEventListener("click", start)
document.getElementById("width").addEventListener("change", numInput);
document.getElementById("height").addEventListener("change", numInput);
document.getElementById("again").addEventListener("click", restart);
document.getElementById("new").addEventListener("click", menu);
document.getElementById("toggle").addEventListener("click", clickToggle);
document.getElementById("slider").addEventListener("click", function(){clickToggle("Space")});
document.documentElement.addEventListener("keydown", function(e){clickToggle(e.code)})
var cells;
var gameStart=false;
var alive=true;
var col;
var rows;
var mines;
var seconds;
var interval;
var uncoveredTiles;
var clickMine = true;
const numColorSet=["blue", "green", "red", "purple", "maroon", "turquoise","black","gray"];

function start(){
    document.getElementById("menu").style.display = "none";
    alive=true;
    if(gameStart == false){
        if(document.getElementById("easy").checked){
            col = 9;
            rows = 9;
            mines = 10;
            document.getElementById("difficulty").innerHTML = "Easy";
        }
        else if(document.getElementById("medium").checked){
            col = 16;
            rows = 16;
            mines = 40;
            document.getElementById("difficulty").innerHTML = "Medium";
        }
        else if(document.getElementById("hard").checked){
            col = 24;
            rows = 20;
            mines = 99;
            document.getElementById("difficulty").innerHTML = "Hard";
        }
        else if(document.getElementById("custom").checked){
            col = document.getElementById("width").value;
            rows = document.getElementById("height").value;
            mines = document.getElementById("mines").value;
            document.getElementById("difficulty").innerHTML = "Custom Game";
        }
        document.getElementById("m").innerHTML = "Mines: " + String(mines);
        document.getElementById("map-size").innerHTML = String(col) + " &#215; " + String(rows) + " (" + String(col * rows) + " tiles)";
        document.getElementsByTagName("main")[0].style.display = "block";
        document.getElementById("top").style.display="flex";
        var st1="";
        for(i=0; i<col; i++){
            st1 += "auto ";
        }
        document.getElementById("game-frame").style.gridTemplateColumns = st1;
        st1="";
        for(i=0; i<rows; i++){
            st1 += "auto ";
        }
        document.getElementById("game-frame").style.gridTemplateRows = st1;
    }
    cells = [];
    for(i=0; i<rows; i++){
        cells.push([]);
        for(j=0; j<col; j++){
            c = new Cell(i, j);
            cells[i].push(c);
            document.getElementById("game-frame").appendChild(cells[i][j].div);
        }
    }
    uncoveredTiles = 0;
    console.log(cells);

    for(i=0; i<rows; i++){
        for(j=0; j<col; j++){
            let x = cells[i][j].x;
            let y = cells[i][j].y;
            document.getElementById(cells[i][j].id).addEventListener("click", function(){trigger(x, y, clickMine)});
            document.getElementById(cells[i][j].id).addEventListener("contextmenu", function(e){e.preventDefault();trigger(x, y, !clickMine)});
        }
    }
}

function trigger(i, j, mb, adj = 0){
    if(alive){
        if(gameStart){
            if(cells[i][j].uncovered === false){
                if(mb){
                    if(cells[i][j].uncover()){
                        /*console.log(cells[i][j].id + " BOOM");*/
                        gameOver();
                    }
                    else{
                        /*console.log(cells[i][j].id + " is safe");*/
                        let x = cells[i][j].x;
                        let y = cells[i][j].y;
                        let z = [];
                        try{if(cells[x - 1][y - 1].mine){adj++;}}catch(err){} /*up left*/
                        try{if(cells[x - 1][y].mine){adj++;}}catch(err){} /*left*/
                        try{if(cells[x - 1][y + 1].mine){adj++;}}catch(err){} /*down left*/
                        try{if(cells[x][y - 1].mine){adj++;}}catch(err){} /*up*/
                        try{if(cells[x][y + 1].mine){adj++;}}catch(err){} /*down*/
                        try{if(cells[x + 1][y - 1].mine){adj++;}}catch(err){} /*up right*/
                        try{if(cells[x + 1][y].mine){adj++;}}catch(err){} /*right*/
                        try{if(cells[x + 1][y + 1].mine){adj++;}}catch(err){} /*down right*/
                        cells[i][j].setNum(adj);
                        if(adj == 0){
                            try{trigger(x - 1, y - 1, true);}catch(err){}
                            try{trigger(x - 1, y, true);}catch(err){}
                            try{trigger(x - 1, y + 1, true);}catch(err){}
                            try{trigger(x, y - 1, true);}catch(err){}
                            try{trigger(x, y + 1, true);}catch(err){}
                            try{trigger(x + 1, y - 1, true);}catch(err){}
                            try{trigger(x + 1, y, true);}catch(err){}
                            try{trigger(x + 1, y + 1, true);}catch(err){}
                        }
                        uncoveredTiles++;
                        if(uncoveredTiles == (rows*col) - mines){
                            gameOver(false);
                        }
                    }
                }
                else{
                    cells[i][j].flag();
                }
            }
            
        }
        else{
            generateMines(i, j);
        }
    }
}
function generateMines(x, y){
    /*minMines=Math.floor((rows*col)/6);*/
    minMines=mines;
    mineCount=0;
    while(mineCount<minMines){
            var r1 = Math.floor(Math.random()*rows);
            var r2 = Math.floor(Math.random()*col);
            if(zeroAdj(r1, r2, x, y) && !(cells[r1][r2].mine)){
                cells[r1][r2].mine = true;
                /*console.log(String(r1) + " " + String(r2));*/
                mineCount++;
            }
        }
    gameStart = true;
    trigger(x, y, true);
    seconds=0;
    document.getElementById("time").innerHTML = timeDisplay(seconds);
    interval = setInterval(tick, 1000);
}
function zeroAdj(x1, y1, x2, y2){
    if(x1 == (x2 - 1) && y1 == (y2 - 1)){
        return false;
    }
    if(x1 == (x2 - 1) && y1 == (y2)){
        return false;
    }
    if(x1 == (x2 - 1) && y1 == (y2 + 1)){
        return false;
    }
    if(x1 == (x2) && y1 == (y2 - 1)){
        return false;
    }
    if(x1 == (x2) && y1 == (y2 + 1)){
        return false;
    }
    if(x1 == (x2 + 1) && y1 == (y2 - 1)){
        return false;
    }
    if(x1 == (x2 + 1) && y1 == (y2)){
        return false;
    }
    if(x1 == (x2 + 1) && y1 == (y2 + 1)){
        return false;
    }
    if(x1 == x2 && y1 == y2){
        return false;
    }
    return true;
}
function gameOver(b=true){
    alive=false;
    clearInterval(interval);
    for(i=0; i<rows; i++){
        for(j=0; j<col; j++){
            cells[i][j].blow(b);
        }
    }
    document.getElementById("menu").style.display ="block";
    document.getElementById("new-game").style.display="none";
    document.getElementById("game-over").style.display="block";
    if(b){
        document.getElementById("result").firstElementChild.innerHTML = "Game Over!";
    }
    else{
        document.getElementById("result").firstElementChild.innerHTML = "You win!";
    }
}
function select(){
    document.getElementById("start").disabled = false;
    if(document.getElementById("custom").checked){
        document.getElementById("width").disabled = false;
        document.getElementById("height").disabled = false;
        document.getElementById("mines").disabled = false;
    }
    else{
        document.getElementById("width").disabled = true;
        document.getElementById("height").disabled = true;
        document.getElementById("mines").disabled = true;
    }
}
function numInput(){
    if(document.getElementById("width").value > document.getElementById("width").getAttribute("max")){
        document.getElementById("width").value = document.getElementById("width").getAttribute("max");
    }
    if(document.getElementById("height").value > document.getElementById("height").getAttribute("max")){
        document.getElementById("height").value = document.getElementById("height").getAttribute("max");
    }
    var w = document.getElementById("width").value;
    var h = document.getElementById("height").value;
    var area = w * h;
    document.getElementById("size").innerHTML = String(area) + " tiles";
    document.getElementById("mines").setAttribute("max", String(area - 2));
    if(document.getElementById("mines").value >= area - 2){
        document.getElementById("mines").setAttribute("value", String(area - 2));
    }
}
function restart(){
    clear();
    document.getElementById("time").innerHTML = "--";
    start();
    gameStart = false;
}
function menu(){
    document.getElementsByTagName("main")[0].style.display = "none";
    document.getElementById("top").style.display = "none";
    document.getElementById("game-over").style.display = "none";
    document.getElementById("new-game").style.display = "block";
    clear();
    gameStart = false;
}
function clear(){
    b = document.getElementById("game-frame");
    while(b.firstChild){
        b.removeChild(b.firstChild);
    }
    console.log(cells);
}
function tick(){
    seconds++;
    document.getElementById("time").innerHTML = timeDisplay(seconds);
}
function timeDisplay(s){
    if(s < 60){
        return(String(s % 60));
    }
    else{
        if(s%60 < 10){
            return(String(Math.floor(s/60)) + ":0" + String(s % 60));
        }
        else{
            return(String(Math.floor(s/60)) + ":" + String(s % 60));
        }
    }
}
function clickToggle(e="reg"){
    if(e == "Space"){
        document.getElementById("toggle").click();
    }
    if(document.getElementById("toggle").checked){
        clickMine = false;
    }
    else{
        clickMine = true;
    }
}