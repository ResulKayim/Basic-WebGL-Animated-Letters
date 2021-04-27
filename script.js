var gl;
var program;
var rotationLoc;
var rotationSpeed = 100;
var isRotatingR = false, isRotatingM = false;

var centerXLoc, centerYLoc;
var rCenterX, rCenterY;
var mCenterX, mCenterY;

var verticesR, verticesM;

var scaleRatioR = 1.0;
var scaleRatioM = 1.0;
var scaleRatioLoc;

var redLoc;
var greenLoc;
var blueLoc;
var rRed = 0.0, rGreen = 0.0, rBlue = 0.0;
var mRed = 0.0, mGreen = 0.0, mBlue = 0.0;

var isForR = false, isForM = false;

var rotationDegreeR = 0, rotationDegreeM = 0;
var isClockWiseR = false, isClockWiseM = false;

var translateXLoc = 0, translateYLoc = 0;

var translateXR = 0, translateYR = 0;
var translateXM = 0, translateYM = 0;

var drawTypeR, drawTypeM;

var scaleSlider;

function setUniformLoc() {
    centerXLoc = gl.getUniformLocation(program, "centerX");
    centerYLoc = gl.getUniformLocation(program, "centerY");

    rCenterX = -.7;
    rCenterY = .1;
    mCenterX = .45;
    mCenterY = .1;
}

window.onload = function main() {
    const canvas = document.querySelector("#glcanvas");

    // Initialize the GL context
    gl = canvas.getContext("webgl");

    // Only continue if WebGL is available and working
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    setColorDividers();
    setRotationDividers();
    setScaleDividers();
    setSelectionDividers();
    setUniformLoc();

    //******************************************** Selection For Shape *****************************************
    drawTypeR = drawTypeM = gl.LINES;
    verticesR = getLineVerticesR();
    verticesM = getLineVerticesM();

    document.getElementById("line").addEventListener("change", function () {
        if (this.checked) {
            if (isForR) {
                verticesR = getLineVerticesR();
                drawTypeR = gl.LINES;
            } else if (isForM) {
                verticesM = getLineVerticesM();
                drawTypeM = gl.LINES;
            } else {
                verticesR = getLineVerticesR();
                verticesM = getLineVerticesM();
                drawTypeR = gl.LINES;
                drawTypeM = gl.LINES;
            }
        }
    });
    document.getElementById("triangle").addEventListener("change", function () {
        if (this.checked) {
            if (isForR) {
                verticesR = getTrianglesVerticesR();
                drawTypeR = gl.TRIANGLE_STRIP;
            } else if (isForM) {
                verticesM = getTrianglesVerticesM();
                drawTypeM = gl.TRIANGLE_STRIP;
            } else {
                verticesR = getTrianglesVerticesR();
                verticesM = getTrianglesVerticesM();
                drawTypeR = gl.TRIANGLE_STRIP;
                drawTypeM = gl.TRIANGLE_STRIP;
            }
        }
    });

    gl.clearColor(.7, .7, .7, 1.0);

    // ********************************************* Changing Color **********************************************
    redLoc = gl.getUniformLocation(program, "r");
    greenLoc = gl.getUniformLocation(program, "g");
    blueLoc = gl.getUniformLocation(program, "b");

    var red = document.getElementById("rSlide");
    var green = document.getElementById("gSlide");
    var blue = document.getElementById("bSlide");


    var changeColor = document.getElementById("changeColor");
    changeColor.addEventListener("click", function () {
        if (isForR) {
            rRed = red.value / 255;
            rGreen = green.value / 255;
            rBlue = blue.value / 255;
        } else if (isForM) {
            mRed = red.value / 255;
            mGreen = green.value / 255;
            mBlue = blue.value / 255;
        } else {
            rRed = red.value / 255;
            rGreen = green.value / 255;
            rBlue = blue.value / 255;
            mRed = red.value / 255;
            mGreen = green.value / 255;
            mBlue = blue.value / 255;
        }
    })

    // ****************************************** Rotating Letters **********************************************
    rotationLoc = gl.getUniformLocation(program, "rotDegree");

    var startStop = document.getElementById("startStop");
    startStop.addEventListener("click", function (event) {
        if (isForR) {

            isRotatingR = !isRotatingR;
            if (isRotatingR)
                startStop.innerHTML = "Stop Rotation"
            else
                startStop.innerHTML = "Start Rotation"

        } else if (isForM) {
            isRotatingM = !isRotatingM;
            if (isRotatingM)
                startStop.innerHTML = "Stop Rotation"
            else
                startStop.innerHTML = "Start Rotation"
        } else {
            isRotatingR = isRotatingM;
            isRotatingR = !isRotatingR;
            isRotatingM = !isRotatingM;

            if (isRotatingR)
                startStop.innerHTML = "Stop Rotation"
            else
                startStop.innerHTML = "Start Rotation"

        }

    })

    var clockWise = document.getElementById("clockwise");
    clockWise.addEventListener("click", function (event) {

        if (isForR) {
            isClockWiseR = !isClockWiseR;
            if (isClockWiseR)
                clockWise.innerHTML = "Rotate Counter Clockwise"
            else
                clockWise.innerHTML = "Rotate Clockwise"

        } else if (isForM) {
            isClockWiseM = !isClockWiseM;
            if (isClockWiseM)
                clockWise.innerHTML = "Rotate Counter Clockwise"
            else
                clockWise.innerHTML = "Rotate Clockwise"
        } else {
            isClockWiseR = isClockWiseM;
            isClockWiseR = !isClockWiseR;
            isClockWiseM = !isClockWiseM;

            if (isClockWiseR)
                clockWise.innerHTML = "Rotate Counter Clockwise"
            else
                clockWise.innerHTML = "Return Clockwise"
        }
    })

    document.getElementById("speedSlider").onchange = function () {
        rotationSpeed = 100 - this.value;
    };

    // With Mouse
    var isClick = false;
    var xDown, yDown;

    canvas.addEventListener("mouseup", function (event) {
        isClick = false;
    })

    canvas.addEventListener("mousedown", function (event) {
        isClick = true;
        xDown = event.offsetX;
        yDown = event.offsetY;
    })

    canvas.addEventListener("mousemove", function (event) {
        if (isClick) {
            var isClockWise = true;
            if (xDown < event.offsetX)
                isClockWise = true;
            else
                isClockWise = false;

            if (isForR) {
                rotationDegreeR += (isClockWise ? -0.02 : 0.02);
            } else if (isForM) {
                rotationDegreeM += (isClockWise ? -0.02 : 0.02);
            } else {
                rotationDegreeR += (isClockWise ? -0.02 : 0.02);
                rotationDegreeM += (isClockWise ? -0.02 : 0.02);
            }
            xDown = event.offsetX;
            yDown = event.offsetY;
        }
    })

    // **************************************** Scale Letters *************************************************
    scaleRatioLoc = gl.getUniformLocation(program, "scaleRatio");
    scaleSlider = document.getElementById("scaleSlider");
    scaleSlider.onchange = function () {
        if (isForR) {
            scaleRatioR = this.value / 100;
        } else if (isForM) {
            scaleRatioM = this.value / 100;
        } else {
            scaleRatioR = this.value / 100;
            scaleRatioM = this.value / 100;
        }

    };

    window.addEventListener("wheel", function (event) {
        if (event.deltaY < 0) {
            if (isForR && scaleRatioR <= 1.1) {
                scaleRatioR += 0.1;
                scaleSlider.value = (scaleRatioR * 100).toString();
            } else if (isForM && scaleRatioM <= 1.1) {
                scaleRatioM += 0.1;
                scaleSlider.value = (scaleRatioM * 100).toString();
            } else {
                if (scaleRatioR <= 1.1) {
                    scaleRatioR += 0.1;
                    scaleRatioM += 0.1;
                    scaleSlider.value = (scaleRatioR * 100).toString();
                }
            }

        } else if (event.deltaY > 0) {
            if (isForR && scaleRatioR > 0.1) {
                scaleRatioR -= 0.1;
                scaleSlider.value = (scaleRatioR * 100).toString();
            } else if (isForM && scaleRatioM > 0.1) {
                scaleRatioM -= 0.1;
                scaleSlider.value = (scaleRatioM * 100).toString();
            } else {
                if (scaleRatioR > 0.1) {
                    scaleRatioR -= 0.1;
                    scaleRatioM -= 0.1;
                    scaleSlider.value = (scaleRatioR * 100).toString();
                }
            }
        }
    })

    // ************************************** Selection For Letters *****************************************
    document.getElementById("first").addEventListener("change", function () {
        if (this.checked) {
            isForR = this.checked;
            isForM = false;

        }
    });
    document.getElementById("second").addEventListener("change", function () {
        if (this.checked) {
            isForM = this.checked;
            isForR = false;
        }
    });
    document.getElementById("both").addEventListener("change", function () {
        if (this.checked) {
            isForM = false;
            isForR = false;
        }
    });

    //************************************** Translate Letters ****************************************
    translateXLoc = gl.getUniformLocation(program, "translateX")
    translateYLoc = gl.getUniformLocation(program, "translateY")


    requestAnimFrame(renderForAnim);
};


function renderForAnim() {
    setTimeout(function () {
        requestAnimFrame(renderForAnim);

        gl.clear(gl.COLOR_BUFFER_BIT);

        // R
        initBuffers(verticesR);
        gl.uniform1f(centerXLoc, rCenterX);
        gl.uniform1f(centerYLoc, rCenterY);
        gl.uniform1f(scaleRatioLoc, scaleRatioR);

        gl.uniform1f(redLoc, rRed);
        gl.uniform1f(greenLoc, rGreen);
        gl.uniform1f(blueLoc, rBlue);

        gl.uniform1f(rotationLoc, rotationDegreeR);

        gl.uniform1f(translateXLoc, translateXR);
        gl.uniform1f(translateYLoc, translateYR);

        gl.drawArrays(drawTypeR, 0, verticesR.length);

        // M
        initBuffers(verticesM);
        gl.uniform1f(centerXLoc, mCenterX);
        gl.uniform1f(centerYLoc, mCenterY);
        gl.uniform1f(scaleRatioLoc, scaleRatioM);

        gl.uniform1f(redLoc, mRed);
        gl.uniform1f(greenLoc, mGreen);
        gl.uniform1f(blueLoc, mBlue);

        gl.uniform1f(rotationLoc, rotationDegreeM);


        gl.uniform1f(translateXLoc, translateXM);
        gl.uniform1f(translateYLoc, translateYM);

        gl.drawArrays(drawTypeM, 0, verticesM.length);

        if (isRotatingR) {
            rotationDegreeR += (isClockWiseR ? -0.08 : 0.08);
        }
        if (isRotatingM) {
            rotationDegreeM += (isClockWiseM ? -0.08 : 0.08);
        }

    }, rotationSpeed);
}

function initBuffers(vertices) {
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    var aPosition = gl.getAttribLocation(program, 'vPosition');
    if (aPosition < 0) {
        console.log('Failed to get the storage location of vPosition');
        return -1;
    }

    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

}

window.addEventListener("keydown", function () {
    switch (event.keyCode) {
        case 37: // Arrow Left
            if (isForR) {
                translateXR -= 0.02;
            } else if (isForM) {
                translateXM -= 0.02
            } else {
                translateXR -= 0.02;
                translateXM -= 0.02
            }

            break;
        case 38: // Arrow Up
            if (isForR) {
                translateYR += 0.02;
            } else if (isForM) {
                translateYM += 0.02;
            } else {
                translateYR += 0.02;
                translateYM += 0.02;
            }

            break;
        case 39: // Arrow Right
            if (isForR) {
                translateXR += 0.02;
            } else if (isForM) {
                translateXM += 0.02;
            } else {
                translateXR += 0.02;
                translateXM += 0.02;
            }

            break;
        case 40: // Arrow Down
            if (isForR) {
                translateYR -= 0.02;
            } else if (isForM) {
                translateYM -= 0.02
            } else {
                translateYR -= 0.02;
                translateYM -= 0.02
            }

            break;
        case 32: // Space Button
            document.getElementById("startStop").click();

    }
});
