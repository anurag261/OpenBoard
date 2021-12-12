let canvas = document.querySelector("canvas");
// fill full page with canvas element 
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

let pencilColor = document.querySelectorAll(".pencil-color");
let pencilWidthElem = document.querySelector(".pencil-width");
let eraserWidthElem = document.querySelector(".eraser-width");
let download = document.querySelector(".download");
let redo = document.querySelector(".redo");
let undo = document.querySelector(".undo");

let penColor = "red";
let eraserColor = "whitesmoke";
let penWidth = pencilWidthElem.value;
let eraserWidth = pencilWidthElem.value;

//for undo and redo actions 
let undoRedoTracker = []; // data
let track = 0; // represent which action from tracker array

let mouseDown = false;

//API
let tool = canvas.getContext("2d");

tool.strokeStyle = penColor;
tool.lineWidth = penWidth;

canvas.addEventListener("mousemove", (e) => {
    if(mouseDown){
        let data = {
            x : e.clientX,
            y : e.clientY,
            color : eraserFlag ? eraserColor : penColor,
            width : eraserFlag ? eraserWidth : penWidth
        }
        socket.emit("drawStroke", data)
    }   
})

//mousedown to start new Path , mouse move -> fill graphics
canvas.addEventListener("mousedown", (e) => {
    mouseDown = true;
    let data = {
        x : e.clientX,
        y : e.clientY
    }
    socket.emit("beginPath", data);
})


canvas.addEventListener("mouseup" , (e) => {
    mouseDown = false;

    let url = canvas.toDataURL();
    undoRedoTracker.push(url);
    track = undoRedoTracker.length-1;
})

// undo functionality
undo.addEventListener("click", (e) => {
    if(track > 0) track--;
    // track action 
    let data = {
        trackValue: track,
        undoRedoTracker
    }
    // undoRedoCanvas(trackObj);
    socket.emit("redoUndo", data);
})

//redo functionality
redo.addEventListener("click", (e) => {
    if(track < undoRedoTracker.length-1) track++;
    //track action
    let data = {
        trackValue: track,
        undoRedoTracker
    }
    socket.emit("redoUndo", data);
})

function undoRedoCanvas(trackObj){
    track = trackObj.trackValue;
    undoRedoTracker = trackObj.undoRedoTracker;

    let url = undoRedoTracker[track];
    let img = new Image(); // reference of an image created
    img.src = url;
    img.onload = (e) => {
        tool.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
}

function beginPath(strokeObj) {
    tool.beginPath();
    tool.moveTo(strokeObj.x , strokeObj.y);
}

function drawStroke(strokeObj) {
    tool.strokeStyle = strokeObj.color;
    tool.lineWidth = strokeObj.width;
    tool.lineTo(strokeObj.x, strokeObj.y);
    tool.stroke();
}

pencilColor.forEach((colorElem) => {
    colorElem.addEventListener("click", (e) => {
        let color = colorElem.classList[0];
        penColor = color;
        tool.strokeStyle = penColor;
    });
})

pencilWidthElem.addEventListener("change" , (e) =>{
    penWidth = pencilWidthElem.value;
    tool.lineWidth = penWidth;
})

eraserWidthElem.addEventListener("change" , (e) =>{
    eraserWidth = eraserWidthElem.value;
    tool.lineWidth = eraserWidth;
})

eraser.addEventListener("click" ,(e) =>{
    if(eraserFlag){
        tool.strokeStyle = eraserColor;
        tool.lineWidth = eraserWidth;
    }else{
        tool.strokeStyle = penColor;
        tool.lineWidth = penWidth;
    }
})

download.addEventListener("click", (e) => {
    let url = canvas.toDataURL(); 
    let a = document.createElement("a");
    a.href = url;
    a.download = "board.jpg";
    a.click();
})

socket.on("beginPath", (data) => {
    // data from server
    beginPath(data);
})

socket.on("drawStroke", (data) => {
    drawStroke(data);
})

socket.on("redoUndo", (data) => {
    undoRedoCanvas(data);
})