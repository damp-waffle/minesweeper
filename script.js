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
            /*this.div.style.color = numColorSet[a - 1];*/
        }
        this.div.classList.remove("covered");
        this.div.setAttribute("class","uncovered");
        this.edge();
        
        /*this.div.style.backgroundImage = "none";
        this.div.style.backgroundColor = "#C0C0C0";
        this.div.style.border = "1px #808080 solid"*/
    }
    blow(b=true){
        if(this.mine && b){
            this.div.style.backgroundImage = "url(sprites.png)";
            this.div.style.backgroundPosition = "0 0";
            this.div.setAttribute("class","uncovered");
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
        return this.flagged;
    }
    stripBorder(side, bb){
        var s;
        if(bb){
            switch(side){
                case "left":
                    this.div.style.borderRight="none";
                    break;
                case "up":
                    this.div.style.borderBottom="none";
                    break;
                case "down":
                    this.div.style.borderTop="none";
                    break;
                case "right":
                    this.div.style.borderLeft="none";
                    break;
            }
        }
        else{
            this.div.style.border="";
        }
        this.edge();
    }
    edge(){
        if(this.x == 0){
            this.div.style.borderTop="none";
        }
        else if(this.x == col - 1){
            this.div.style.borderBottom="none";
        }
        if(this.y == 0){
            this.div.style.borderLeft="none";
        }
        if(this.y == rows - 1){
            this.div.style.borderRight="none";
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
document.getElementById("click-toggle").addEventListener("click", function(){clickToggle("Space")});
document.getElementsByTagName("main")[0].addEventListener("mouseout", function(){currentCell=""})
document.documentElement.addEventListener("keydown", function(e){clickToggle(e.code)})
document.getElementById("simple-light").addEventListener("click", themeSelect);
document.getElementById("simple-dark").addEventListener("click", themeSelect);
document.getElementsByClassName("hover")[0].addEventListener("click", help);
/*document.getElementsByClassName("hover")[1].addEventListener("click", settings);*/
document.getElementById("close-h").addEventListener("click", closeHelp);
document.getElementById("color-select").addEventListener("input", function(e){changeColor(e.target.value)});
document.getElementsByClassName("control-thing")[0].addEventListener("click", function(){rebind(1)});
document.getElementsByClassName("control-thing")[1].addEventListener("click", function(){rebind(2)});
document.documentElement.addEventListener("contextmenu", function(e){e.preventDefault()});
var cells;
var gameStart=false;
var alive=true;
var col;
var rows;
var mines;
var seconds;
var interval;
var uncoveredTiles;
var currentCell = "";
var clickMine = true;
var mineKey = "KeyQ";
var flagKey = "KeyE";
const numColorSet=["blue", "green", "red", "purple", "maroon", "turquoise","black","gray"];

function start(){
    document.getElementById("menu").style.display = "none";
    document.getElementById("themes").style.display="none";
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

    for(i=0; i<rows; i++){
        for(j=0; j<col; j++){
            let x = cells[i][j].x;
            let y = cells[i][j].y;
            let d = cells[i][j].div;
            document.getElementById(cells[i][j].id).addEventListener("click", function(){trigger(x, y, clickMine)});
            document.getElementById(cells[i][j].id).addEventListener("contextmenu", function(e){e.preventDefault();trigger(x, y, !clickMine)});
            document.getElementById(cells[i][j].id).addEventListener("mouseover", function(){currentCell=d});
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
                            setTimeout(function(){
                                try{trigger(x - 1, y - 1, true);}catch(err){}
                                try{trigger(x - 1, y, true);}catch(err){}
                                try{trigger(x - 1, y + 1, true);}catch(err){}
                                try{trigger(x, y - 1, true);}catch(err){}
                                try{trigger(x, y + 1, true);}catch(err){}
                                try{trigger(x + 1, y - 1, true);}catch(err){}
                                try{trigger(x + 1, y, true);}catch(err){}
                                try{trigger(x + 1, y + 1, true);}catch(err){}}, 50)
                        }
                        uncoveredTiles++;
                        if(uncoveredTiles == (rows*col) - mines){
                            gameOver(false);
                        }
                    }
                }
                else{
                    bb = cells[i][j].flag();
                    
                    try{cells[i - 1][j].stripBorder("up", bb)}catch(err){}
                    try{cells[i][j - 1].stripBorder("left", bb)}catch(err){}
                    try{cells[i][j + 1].stripBorder("right", bb)}catch(err){}
                    try{cells[i + 1][j].stripBorder("down", bb)}catch(err){}
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
    start();
    gameStart = false;
}
function menu(){
    document.getElementsByTagName("main")[0].style.display = "none";
    document.getElementById("top").style.display = "none";
    document.getElementById("game-over").style.display = "none";
    document.getElementById("new-game").style.display = "block";
    document.getElementById("themes").style.display="block";
    clear();
    gameStart = false;
}
function clear(){
    document.getElementById("time").innerHTML = "--";
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
function clickToggle(e){
    if(e == "Space"){
        document.getElementById("toggle").click();
        if(document.getElementById("toggle").checked){
            clickMine = false;
        }
        else{
            clickMine = true;
        }
    }
    else if(e==mineKey){
        if(clickMine){
            currentCell.click();
        }
        else{
            currentCell.dispatchEvent(new Event("contextmenu"));
        }
    }
    else if(e==flagKey){
        if(clickMine){
            currentCell.dispatchEvent(new Event("contextmenu"));
        }
        else{
            currentCell.click();
        }
    }
}
function themeSelect(){
    var r = document.querySelector(':root');
    if(document.getElementById("simple-light").checked){
        
        
    }
    else if(document.getElementById("simple-dark").checked){
     
    }
}
function help(){
    document.getElementById("h").style.visibility = "visible";
    document.getElementById("h").style.opacity = "100%";
}
function closeHelp(){
    document.getElementById("h").removeAttribute("style");
}
function changeColor(color){
    if(document.getElementById("simple-light").checked || document.getElementById("simple-dark").checked){
        var root = document.querySelector(':root');
        root.style.setProperty("--main-color", color);
        var r = parseInt(color.substring(1, 3), 16);
        var g = parseInt(color.substring(3, 5), 16);
        var b = parseInt(color.substring(5, 7), 16);
        var r2 = Math.floor(r * 0.48);
        var g2 = Math.floor(g * 0.48);
        var b2 = Math.floor(b * 0.48);
        color2 = "#" + Number(r2).toString(16) + Number(g2).toString(16) + Number(b2).toString(16);
        root.style.setProperty("--dark-2", color2);
        color2 = "#" + Number(r - r2).toString(16) + Number(g - g2).toString(16) + Number(b - b2).toString(16);
        root.style.setProperty("--dark-1", color2);
        color2 = "#" + Number(r - r2).toString(16) + Number(g - g2).toString(16) + Number(b - b2).toString(16);
        root.style.setProperty("--dark-1", color2);
        var rnorm = 0;
        var gnorm = 0;
        var bnorm = 0;
        if(!(r == g == b)){
            switch(Math.max(r, g, b)){
            case r:
                g2 = Math.floor(g2 * 0.7);
                b2 = Math.floor(b2 * 0.7);
                rnorm = 7;
                break;
            case g:
                r2 = Math.floor(r2 * 0.7);
                b2 = Math.floor(b2 * 0.7);
                gnorm = 7;
                break;
            case b:
                r2 = Math.floor(r2 * 0.8);
                g2 = Math.floor(g2 * 0.8);
                bnorm = 7;
                break;
            }
        }
        color2 = "#" + Number(r - r2).toString(16) + Number(g - g2).toString(16) + Number(b - b2).toString(16);
        root.style.setProperty("--dark-1-sat", color2);
        r2 = Math.floor(r * (((255-r)/255)+1) - rnorm);
        g2 = Math.floor(g * (((255-g)/255)+1) - gnorm);
        b2 = Math.floor(b * (((255-b)/255)+1) - bnorm);
        color2 = "#" + Number(r2).toString(16) + Number(g2).toString(16) + Number(b2).toString(16);
        root.style.setProperty("--light-2", color2);
        color2 = "#" + Number(r2 - (r2 - r)).toString(16) + Number(g2 - (g2 - g)).toString(16) + Number(b2 - (b2 - b)).toString(16);
        root.style.setProperty("--light-1", color2);
        r2 = Math.floor(r2 - (r2 - r) * ((r/255) * 0.6));
        g2 = Math.floor(g2 - (g2 - g) * ((g/255) * 0.6));
        b2 = Math.floor(b2 - (b2 - b) * ((b/255) * 0.6));
        color2 = "#" + Number(r2 - rnorm).toString(16) + Number(g2 - gnorm).toString(16) + Number(b2 - bnorm).toString(16);
        root.style.setProperty("--light-3", color2);
    }
}
/*function settings(){
    var s = document.getElementById("s-menu");
    if(s.style.visibility="hidden"){
        s.style.visibility="visible";
        s.style.opacity="100%";
    }
    else{
        s.style.visibility="hidden";
        s.style.opacity="0%";
    }
}*/
function rebind(type){
    var newKey = "";
    switch(type){
        case 1:
            document.getElementById("mine-key").innerHTML = "Press new key"
            document.documentElement.addEventListener("keydown", function(e){
                newKey=e.code;
                mineKey=newKey;
                document.getElementsByTagName("body")[0].disabled=false;
                document.getElementById("mine-key").innerHTML = "(click to rebind)";
                shortKey = newKey.charAt(newKey.length - 1);
                document.getElementById("cm-key").innerHTML = shortKey;
                document.getElementsByClassName("key")[0].children[0].innerHTML = shortKey;
                document.documentElement.removeEventListener("keydown", arguments.callee);
            })
            document.getElementsByTagName("body")[0].disabled=true;
            /*need to disable other elements while rebinding*/
            break;
        case 2:
            document.getElementById("flag-key").innerHTML = "Press new key"
            document.documentElement.addEventListener("keydown", function(e){
                newKey=e.code;
                flagKey=newKey;
                document.getElementsByTagName("body")[0].disabled=false;
                document.getElementById("flag-key").innerHTML = "(click to rebind)";
                shortKey = newKey.charAt(newKey.length - 1);
                document.getElementById("cf-key").innerHTML = shortKey;
                document.getElementsByClassName("key")[1].children[0].innerHTML = shortKey;
                document.documentElement.removeEventListener("keydown", arguments.callee);
            })
            document.getElementsByTagName("body")[0].disabled=true;
            break;
        case 3:
            break;
    }
}