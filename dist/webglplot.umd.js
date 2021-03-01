(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.WebGLPlotBundle = {}));
}(this, (function (exports) { 'use strict';

    class ColorRGBA {
        constructor(r, g, b, a) {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
        }
    }

    /**
     * Baseline class
     */
    class WebglBaseLine {
        /**
         * @internal
         */
        constructor() {
            this.scaleX = 1;
            this.scaleY = 1;
            this.offsetX = 0;
            this.offsetY = 0;
            this.loop = false;
            this._vbuffer = 0;
            this._coord = 0;
            this.visible = true;
            this.intensity = 1;
            this.xy = new Float32Array([]);
            this.numPoints = 0;
            this.color = new ColorRGBA(0, 0, 0, 1);
            this.webglNumPoints = 0;
        }
    }

    /**
     * The standard Line class
     */
    class WebglLine extends WebglBaseLine {
        /**
         * Create a new line
         * @param c - the color of the line
         * @param numPoints - number of data pints
         * @example
         * ```typescript
         * x= [0,1]
         * y= [1,2]
         * line = new WebglLine( new ColorRGBA(0.1,0.1,0.1,1), 2);
         * ```
         */
        constructor(c, numPoints) {
            super();
            this.webglNumPoints = numPoints;
            this.numPoints = numPoints;
            this.color = c;
            this.xy = new Float32Array(2 * this.webglNumPoints);
        }
        /**
         * Set the X value at a specific index
         * @param index - the index of the data point
         * @param x - the horizontal value of the data point
         */
        setX(index, x) {
            this.xy[index * 2] = x;
        }
        /**
         * Set the Y value at a specific index
         * @param index : the index of the data point
         * @param y : the vertical value of the data point
         */
        setY(index, y) {
            this.xy[index * 2 + 1] = y;
        }
        /**
         * Get an X value at a specific index
         * @param index - the index of X
         */
        getX(index) {
            return this.xy[index * 2];
        }
        /**
         * Get an Y value at a specific index
         * @param index - the index of Y
         */
        getY(index) {
            return this.xy[index * 2 + 1];
        }
        /**
         * Make an equally spaced array of X points
         * @param start  - the start of the series
         * @param stepSize - step size between each data point
         *
         * @example
         * ```typescript
         * //x = [-1, -0.8, -0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8]
         * const numX = 10;
         * line.lineSpaceX(-1, 2 / numX);
         * ```
         */
        insertXValues(data) {
            for (let i = 0; i < this.numPoints; i++) {
                this.setX(i, data[i]);
            }
        }
        /**
         * Set a constant value for all Y values in the line
         * @param c - constant value
         */
        constY(c) {
            for (let i = 0; i < this.numPoints; i++) {
                // set x to -num/2:1:+num/2
                this.setY(i, c);
            }
        }
        /**
         * Add  Y values current array
         * @param data - the Y array
         *
         * @example
         * ```typescript
         * yArray = new Float32Array([3, 4, 5]);
         * line.shiftAdd(yArray);
         * ```
         */
        insertYValues(data) {
            for (let i = 0; i < this.numPoints; i++) {
                this.setY(i, data[i]);
            }
        }
    }

    /**
     * The step based line plot
     */
    class WebglStep extends WebglBaseLine {
        /**
         * Create a new step line
         * @param c - the color of the line
         * @param numPoints - number of data pints
         * @example
         * ```typescript
         * x= [0,1]
         * y= [1,2]
         * line = new WebglStep( new ColorRGBA(0.1,0.1,0.1,1), 2);
         * ```
         */
        constructor(c, num) {
            super();
            this.webglNumPoints = num * 2;
            this.numPoints = num;
            this.color = c;
            this.xy = new Float32Array(2 * this.webglNumPoints);
        }
        /**
         * Set the Y value at a specific index
         * @param index - the index of the data point
         * @param y - the vertical value of the data point
         */
        setY(index, y) {
            this.xy[index * 4 + 1] = y;
            this.xy[index * 4 + 3] = y;
        }
        getX(index) {
            return this.xy[index * 4];
        }
        /**
         * Get an X value at a specific index
         * @param index - the index of X
         */
        getY(index) {
            return this.xy[index * 4 + 1];
        }
        /**
         * Make an equally spaced array of X points
         * @param start  - the start of the series
         * @param stepSize - step size between each data point
         *
         * @example
         * ```typescript
         * //x = [-1, -0.8, -0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8]
         * const numX = 10;
         * line.lineSpaceX(-1, 2 / numX);
         * ```
         */
        lineSpaceX(start, stepsize) {
            for (let i = 0; i < this.numPoints; i++) {
                // set x to -num/2:1:+num/2
                this.xy[i * 4] = start + i * stepsize;
                this.xy[i * 4 + 2] = start + (i * stepsize + stepsize);
            }
        }
        /**
         * Set a constant value for all Y values in the line
         * @param c - constant value
         */
        constY(c) {
            for (let i = 0; i < this.numPoints; i++) {
                // set x to -num/2:1:+num/2
                this.setY(i, c);
            }
        }
        /**
         * Add a new Y values to the end of current array and shift it, so that the total number of the pair remains the same
         * @param data - the Y array
         *
         * @example
         * ```typescript
         * yArray = new Float32Array([3, 4, 5]);
         * line.shiftAdd(yArray);
         * ```
         */
        shiftAdd(data) {
            const shiftSize = data.length;
            for (let i = 0; i < this.numPoints - shiftSize; i++) {
                this.setY(i, this.getY(i + shiftSize));
            }
            for (let i = 0; i < shiftSize; i++) {
                this.setY(i + this.numPoints - shiftSize, data[i]);
            }
        }
    }

    class WebglPolar extends WebglBaseLine {
        constructor(c, numPoints) {
            super();
            this.webglNumPoints = numPoints;
            this.numPoints = numPoints;
            this.color = c;
            this.intenisty = 1;
            this.xy = new Float32Array(2 * this.webglNumPoints);
            this._vbuffer = 0;
            this._coord = 0;
            this.visible = true;
            this.offsetTheta = 0;
        }
        /**
         * @param index: index of the line
         * @param theta : angle in deg
         * @param r : radius
         */
        setRtheta(index, theta, r) {
            //const rA = Math.abs(r);
            //const thetaA = theta % 360;
            const x = r * Math.cos((2 * Math.PI * (theta + this.offsetTheta)) / 360);
            const y = r * Math.sin((2 * Math.PI * (theta + this.offsetTheta)) / 360);
            //const index = Math.round( ((theta % 360)/360) * this.numPoints );
            this.setX(index, x);
            this.setY(index, y);
        }
        getTheta(index) {
            //return Math.tan
            return 0;
        }
        getR(index) {
            //return Math.tan
            return Math.sqrt(Math.pow(this.getX(index), 2) + Math.pow(this.getY(index), 2));
        }
        setX(index, x) {
            this.xy[index * 2] = x;
        }
        setY(index, y) {
            this.xy[index * 2 + 1] = y;
        }
        getX(index) {
            return this.xy[index * 2];
        }
        getY(index) {
            return this.xy[index * 2 + 1];
        }
    }

    /**
     * Author Danial Chitnis 2019-20
     *
     * inspired by:
     * https://codepen.io/AzazelN28
     * https://www.tutorialspoint.com/webgl/webgl_modes_of_drawing.htm
     */
    /**
     * The main class for the webgl-plot library
     */
    class WebGLPlot {
        /**
         * Create a webgl-plot instance
         * @param canvas - the canvas in which the plot appears
         * @param debug - (Optional) log debug messages to console
         *
         * @example
         *
         * For HTMLCanvas
         * ```typescript
         * const canvas = document.getElementbyId("canvas");
         *
         * const devicePixelRatio = window.devicePixelRatio || 1;
         * canvas.width = canvas.clientWidth * devicePixelRatio;
         * canvas.height = canvas.clientHeight * devicePixelRatio;
         *
         * const webglp = new WebGLplot(canvas);
         * ...
         * ```
         * @example
         *
         * For OffScreenCanvas
         * ```typescript
         * const offscreen = htmlCanvas.transferControlToOffscreen();
         *
         * offscreen.width = htmlCanvas.clientWidth * window.devicePixelRatio;
         * offscreen.height = htmlCanvas.clientHeight * window.devicePixelRatio;
         *
         * const worker = new Worker("offScreenCanvas.js", { type: "module" });
         * worker.postMessage({ canvas: offscreen }, [offscreen]);
         * ```
         * Then in offScreenCanvas.js
         * ```typescript
         * onmessage = function (evt) {
         * const wglp = new WebGLplot(evt.data.canvas);
         * ...
         * }
         * ```
         */
        constructor(canvas, options) {
            /**
             * log debug output
             */
            this.debug = false;
            this.addLine = this.addDataLine;
            if (options == undefined) {
                this.webgl = canvas.getContext("webgl", {
                    antialias: true,
                    transparent: false,
                });
            }
            else {
                this.webgl = canvas.getContext("webgl", {
                    antialias: options.antialias,
                    transparent: options.transparent,
                    desynchronized: options.deSync,
                    powerPerformance: options.powerPerformance,
                    preserveDrawing: options.preserveDrawing,
                });
                this.debug = options.debug == undefined ? false : options.debug;
            }
            this.log("canvas type is: " + canvas.constructor.name);
            this.log(`[webgl-plot]:width=${canvas.width}, height=${canvas.height}`);
            this._linesData = [];
            this._linesAux = [];
            //this.webgl = webgl;
            this.gScaleX = 1;
            this.gScaleY = 1;
            this.gXYratio = 1;
            this.gOffsetX = 0;
            this.gOffsetY = 0;
            this.gLog10X = false;
            this.gLog10Y = false;
            // Clear the color
            this.webgl.clear(this.webgl.COLOR_BUFFER_BIT);
            // Set the view port
            this.webgl.viewport(0, 0, canvas.width, canvas.height);
            this.progThinLine = this.webgl.createProgram();
            this.initThinLineProgram();
        }
        get linesData() {
            return this._linesData;
        }
        get linesAux() {
            return this._linesAux;
        }
        /**
         * updates and redraws the content of the plot
         */
        updateLines(lines) {
            const webgl = this.webgl;
            lines.forEach((line) => {
                if (line.visible) {
                    webgl.useProgram(this.progThinLine);
                    const uscale = webgl.getUniformLocation(this.progThinLine, "uscale");
                    webgl.uniformMatrix2fv(uscale, false, new Float32Array([
                        line.scaleX * this.gScaleX * (this.gLog10X ? 1 / Math.log(10) : 1),
                        0,
                        0,
                        line.scaleY * this.gScaleY * this.gXYratio * (this.gLog10Y ? 1 / Math.log(10) : 1),
                    ]));
                    const uoffset = webgl.getUniformLocation(this.progThinLine, "uoffset");
                    webgl.uniform2fv(uoffset, new Float32Array([line.offsetX + this.gOffsetX, line.offsetY + this.gOffsetY]));
                    const isLog = webgl.getUniformLocation(this.progThinLine, "is_log");
                    webgl.uniform2iv(isLog, new Int32Array([this.gLog10X ? 1 : 0, this.gLog10Y ? 1 : 0]));
                    const uColor = webgl.getUniformLocation(this.progThinLine, "uColor");
                    webgl.uniform4fv(uColor, [line.color.r, line.color.g, line.color.b, line.color.a]);
                    webgl.bufferData(webgl.ARRAY_BUFFER, line.xy, webgl.STREAM_DRAW);
                    webgl.drawArrays(line.loop ? webgl.LINE_LOOP : webgl.LINE_STRIP, 0, line.webglNumPoints);
                }
            });
        }
        update() {
            this.updateLines(this.linesData);
            this.updateLines(this.linesAux);
        }
        clear() {
            // Clear the canvas  //??????????????????
            //this.webgl.clearColor(0.1, 0.1, 0.1, 1.0);
            this.webgl.clear(this.webgl.COLOR_BUFFER_BIT);
        }
        /**
         * adds a line to the plot
         * @param line - this could be any of line, linestep, histogram, or polar
         *
         * @example
         * ```typescript
         * const line = new line(color, numPoints);
         * wglp.addLine(line);
         * ```
         */
        _addLine(line) {
            //line.initProgram(this.webgl);
            line._vbuffer = this.webgl.createBuffer();
            this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, line._vbuffer);
            this.webgl.bufferData(this.webgl.ARRAY_BUFFER, line.xy, this.webgl.STREAM_DRAW);
            this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, line._vbuffer);
            line._coord = this.webgl.getAttribLocation(this.progThinLine, "coordinates");
            this.webgl.vertexAttribPointer(line._coord, 2, this.webgl.FLOAT, false, 0, 0);
            this.webgl.enableVertexAttribArray(line._coord);
        }
        addDataLine(line) {
            this._addLine(line);
            this.linesData.push(line);
        }
        addAuxLine(line) {
            this._addLine(line);
            this.linesAux.push(line);
        }
        initThinLineProgram() {
            const vertCode = `
      attribute vec2 coordinates;
      uniform mat2 uscale;
      uniform vec2 uoffset;
      uniform ivec2 is_log;

      void main(void) {
         float x = (is_log[0]==1) ? log(coordinates.x) : coordinates.x;
         float y = (is_log[1]==1) ? log(coordinates.y) : coordinates.y;
         vec2 line = vec2(x, y);
         gl_Position = vec4(uscale*line + uoffset, 0.0, 1.0);
      }`;
            // Create a vertex shader object
            const vertShader = this.webgl.createShader(this.webgl.VERTEX_SHADER);
            // Attach vertex shader source code
            this.webgl.shaderSource(vertShader, vertCode);
            // Compile the vertex shader
            this.webgl.compileShader(vertShader);
            // Fragment shader source code
            const fragCode = `
         precision mediump float;
         uniform highp vec4 uColor;
         void main(void) {
            gl_FragColor =  uColor;
         }`;
            const fragShader = this.webgl.createShader(this.webgl.FRAGMENT_SHADER);
            this.webgl.shaderSource(fragShader, fragCode);
            this.webgl.compileShader(fragShader);
            this.progThinLine = this.webgl.createProgram();
            this.webgl.attachShader(this.progThinLine, vertShader);
            this.webgl.attachShader(this.progThinLine, fragShader);
            this.webgl.linkProgram(this.progThinLine);
        }
        /**
         * remove the last data line
         */
        popDataLine() {
            this.linesData.pop();
        }
        /**
         * remove all the lines
         */
        removeAllLines() {
            this._linesData = [];
            this._linesAux = [];
        }
        /**
         * remove all data lines
         */
        removeDataLines() {
            this._linesData = [];
        }
        /**
         * remove all auxiliary lines
         */
        removeAuxLines() {
            this._linesAux = [];
        }
        /**
         * Change the WbGL viewport
         * @param a
         * @param b
         * @param c
         * @param d
         */
        viewport(a, b, c, d) {
            this.webgl.viewport(a, b, c, d);
        }
        log(str) {
            if (this.debug) {
                console.log("[majko-plot]:" + str);
            }
        }
    }

    exports.ColorRGBA = ColorRGBA;
    exports.WebglLine = WebglLine;
    exports.WebglPolar = WebglPolar;
    exports.WebglStep = WebglStep;
    exports.default = WebGLPlot;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
