import { WebglBaseLine } from "./WebglBaseLine";
/**
 * The standard Line class
 */
export class WebglLine extends WebglBaseLine {
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
    insertValues(dataX, dataY) {
        for (let i = 0; i < this.numPoints; i++) {
            this.setX(i, dataX[i] - dataX[0]);
            this.setY(i, dataY[i]);
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
}
//# sourceMappingURL=WbglLine.js.map