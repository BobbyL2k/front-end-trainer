/* jshint browser: true, esversion: 6 */

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var brushPreview = document.getElementById("brush-preview");
var brushPreviewContext = brushPreview.getContext("2d");

// Class system
    var objectClasses = [
        {
            name: "<b>R</b>ed Buoy",
            color: "#F44336",
            key: 82 // R-key
        },
        {
            name: "<b>G</b>reen Buoy",
            color: "#4CAF50",
            key: 71 // G-key
        },
        {
            name: "<b>Y</b>ellow Buoy",
            color: "#FFEB3B",
            key: 89 // Y-key
        },
        {
            name: "Ga<b>T</b>e",
            color: "#FF9800",
            key: 84 // T-key
        },
        {
            name: "Na<b>V</b>igate",
            color: "#795548",
            key: 86 // V-key
        },
        {
            name: "<b>P</b>ath",
            color: "#CDDC39",
            key: 80 // P-key
        },
        {
            name: "<b>S</b>et Course",
            color: "#E91E63",
            key: 83 // S-key
        },
        {
            name: "<b>B</b>in",
            color: "#8BC34A",
            key: 66 // B-key
        },
        {
            name: "<b>C</b>oin",
            color: "#00BCD4",
            key: 67 // B-key
        },
        {
            name: "<b>E</b>raser",
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
            callSubmit();
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
        $canvas.bind("mousedown touchstart", function(e){
            e.preventDefault();
            var mouseX;
            var mouseY;
            if(e.originalEvent.touches) {
                mouseX = e.originalEvent.touches[0].pageX - this.offsetLeft;
                mouseY = e.originalEvent.touches[0].pageY - this.offsetTop;
            } else {
                mouseX = e.pageX - this.offsetLeft;
                mouseY = e.pageY - this.offsetTop;
            }

            paint = true;
            addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
            redraw();
        });

        $canvas.bind("mousemove touchmove", function(e){
            if(paint){
                var mouseX;
                var mouseY;
                if(e.originalEvent.touches) {
                    mouseX = e.originalEvent.touches[0].pageX - this.offsetLeft;
                    mouseY = e.originalEvent.touches[0].pageY - this.offsetTop;
                } else {
                    mouseX = e.pageX - this.offsetLeft;
                    mouseY = e.pageY - this.offsetTop;
                }
                addClick(mouseX, mouseY, true);
                redraw();
            }
        });

        $canvas.bind("mouseup touchend", function(e) {
            paint = false;
        });

        $canvas.mouseleave(function(e) {
            paint = false;
        });
    }
    {// Keyboard
        $(document.body).keydown(function(event){
            var keyCode = event.keyCode;
            console.log(keyCode);
            // Check in Class
            for(var c=0; c < objectClasses.length; c++){
                if( objectClasses[c].key == keyCode ){
                    setCurrentClassIndex(c);
                    return;
                }
            }
            if(keyCode == 189){ // --Key
                setBrushSize(getBrushSize() - 2);
                return;
            }
            if(keyCode == 187){ // +-Key
                setBrushSize(getBrushSize() + 2);
                return;
            }
            if(keyCode == 90){ // Z-Key
                callUndo();
                return;
            }
            if(keyCode == 13){ // Z-Key
                callSubmit();
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

    function callSubmit(){
        if(confirm("Submit Confirm")){
            var imageDataURL = canvas.toDataURL();
            var data = {
                id : frame_id,
                img : imageDataURL
            };
            console.log(data);
            $.post("/submit", data, function (params) {
                if(params == "OK"){
                    window.location.reload();
                }else{
                    window.alert("ERROR");
                }
            });
        }
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
