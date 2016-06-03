/* jshint browser: true, esversion: 6 */

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var brushPreview = document.getElementById("brush-preview");
var brushPreviewContext = brushPreview.getContext("2d");

// Class system
    var objectClasses = [
        {
            name: "Red Buoy",
            color: "#df4bFF",
            key: 49 // 1-key
        },
        {
            name: "Green Buoy",
            color: "#dfFF4b",
            key: 50 // 2-key
        },
        {
            name: "Eraser",
            color: "rgb(0, 0, 0)", // DO NOT CHANGE TO #000
            key: 69 // E-key
        }
    ];

    var currentClassIndex = 0;
    setCurrentClassIndex(0);

    function setCurrentClassIndex(index) {
        console.log("Set to class", index, objectClasses[index]);
        currentClassIndex = index;
        redrawPreview();
    }

    function getCurrentColor(){
        return objectClasses[currentClassIndex].color;
    }
// END Class System

// Brush Size System
    var brushSize = 5;
    $myslider = $('#brush-size-slider');
    $myslider.attr({min:1, max:50}).val(brushSize);
    $myslider.on('input change',function(){
        setBrushSize($myslider.val(), true);
    });
    function setBrushSize(value, doNotSet=false) {
        brushSize = parseInt(value);
        if(!doNotSet) {
            $myslider.val(value);
            console.log(":P");
        }
        redrawPreview();
    }
    function getBrushSize() {
        return brushSize;
    }
// END Brush Size System

{// Class Picker button
    var CPButtonDiv = document.getElementById("class-picker-buttons-div");

    genClickHandler = function (index) {
        return function (event) {
            setCurrentClassIndex(index);
        };
    };

    for(var index in objectClasses){
        var newButton = document.createElement('button');
        newButton.setAttribute('type', 'button');
        newButton.innerHTML = objectClasses[index].name;
        CPButtonDiv.appendChild(newButton);
        var clickHandler = genClickHandler(index);
        $(newButton).click(clickHandler);
    }
}// END Class Picker button

{// Events
    {// Forms and Buttons
        $("#undo-button").click(function (event) {
           console.log("clicked undo");
           callUndo();
        });

        $("#small-button").click(function (event) {
           console.log("clicked small");
           setBrushIndex(0);
        });
        $("#medium-button").click(function (event) {
           console.log("clicked medium");
           setBrushIndex(1);
        });
        $("#large-button").click(function (event) {
           console.log("clicked large");
           setBrushIndex(2);
        });

        $("#submit-button").click(function (event) {
            var imageDataURL = canvas.toDataURL();
            var data = {
                id : frame_id,
                img : imageDataURL
            };
            console.log(data);
            $.post("/submit", data, function (params) {
                console.log(params);
            });
        });

        $("#getnew-button").click(function (event) {
            window.location.reload();
        });

        $("#clear-button").click(function (event) {
            console.log("clicked clear");
            clearClick();
            redraw();
        });

    }
    {// Canvas and Mouse state
        var $canvas = $(canvas);
        var paint;
        $canvas.mousedown(function(e){
            var mouseX = e.pageX - this.offsetLeft;
            var mouseY = e.pageY - this.offsetTop;

            paint = true;
            addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
            redraw();
        });

        $canvas.mousemove(function(e){
            if(paint){
                addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
                redraw();
            }
        });

        $canvas.mouseup(function(e) {
            paint = false;
        });

        $canvas.mouseleave(function(e) {
            paint = false;
        });
    }
    {// Keyboard
        $(document.body).keydown(function(event){
            var keyCode = event.keyCode;
            // console.log(keyCode);
            // Check in Class
            for(var c=0; c < objectClasses.length; c++){
                if( objectClasses[c].key == keyCode ){
                    setCurrentClassIndex(c);
                    return;
                }
            }
            if(keyCode == 65){ // A-Key
                setBrushSize(getBrushSize() - 7);
                return;
            }
            if(keyCode == 83){ // S-Key
                setBrushSize(getBrushSize() - 2);
                return;
            }
            if(keyCode == 68){ // D-Key
                setBrushSize(getBrushSize() + 2);
                return;
            }
            if(keyCode == 70){ // F-Key
                setBrushSize(getBrushSize() + 7);
                return;
            }
            if(keyCode == 90){ // Z-Key
                callUndo();
                return;
            }
        });
    }
}// END Events

// Drawing
    var clickX      = [];
    var clickY      = [];
    var clickDrag   = [];
    var clickColor  = [];
    var clickSize   = [];

    function clearClick(params) {
        clickX      = [];
        clickY      = [];
        clickDrag   = [];
        clickColor  = [];
        clickSize   = [];
    }

    function callUndo(){
        removeClick();
        redraw();
    }

    function removeClick() {
        var isDrag = false;
        do {
            clickX.pop();
            clickY.pop();

            clickColor.pop();
            clickSize.pop();

            isDrag = clickDrag.pop();
        } while(isDrag);
    }

    function addClick(x, y, dragging) {
        clickX.push(x);
        clickY.push(y);

        clickColor.push(getCurrentColor());
        clickSize.push(getBrushSize());

        clickDrag.push(dragging);
    }

    function redraw(){// Main window
            context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas

            context.lineJoin = "round";

            for(var index=0; index < clickX.length; index++) {
                if(clickColor[index] == "rgb(0, 0, 0)")
                    context.globalCompositeOperation = 'destination-out';
                context.strokeStyle = clickColor[index];
                context.lineWidth = clickSize[index];
                context.beginPath();
                if(clickDrag[index] && index>0) {
                    context.moveTo(clickX[index-1], clickY[index-1]);
                } else {
                    // Simulate micro move
                    context.moveTo(clickX[index]-1, clickY[index]);
                }
                context.lineTo(clickX[index], clickY[index]);
                context.closePath();
                context.stroke();
                if(clickColor[index] == "rgb(0, 0, 0)")
                    context.globalCompositeOperation = 'source-over';
            }
    }
    function redrawPreview(){// Brush Preview Window
        brushPreviewContext.clearRect(0, 0,
            brushPreviewContext.canvas.width,
            brushPreviewContext.canvas.height); // Clear the canvas

        brushPreviewContext.lineJoin = "round";
        brushPreviewContext.strokeStyle = getCurrentColor();
        brushPreviewContext.lineWidth = getBrushSize();
        brushPreviewContext.beginPath();
        brushPreviewContext.moveTo(brushPreviewContext.canvas.width/2-1,
            brushPreviewContext.canvas.height/2);
        brushPreviewContext.lineTo(brushPreviewContext.canvas.width/2,
            brushPreviewContext.canvas.height/2);
        brushPreviewContext.closePath();
        brushPreviewContext.stroke();
    }
// END Drawing

// Getting Image
    var $canvasdiv = $('#canvas-div');
    $.get('/getframeid',function(data){
        frame_id = data;
        $canvasdiv.css('background','url(img.jpg?id='+frame_id+')');
    });
// END Getting Image
