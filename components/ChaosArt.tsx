// ChaosArt.ts
type Float32ArrayLike = number[];
type EquationUpdateCallback = (equation: string) => void;

class ChaosArt {
    static instance: ChaosArt;

    public params: Float32Array;
    private numPoints: number = 100; // number of points to generate lines from 
    private iterationsPerFrame: number = 200; // length of history for lines
    private pointsHistory: Array<[number, number]> = [];
    private maxAge: number = 200;
    private fadeStep: number = 1.0 / this.maxAge;
    private t: number = -3.0;
    private t_end: number = 3.0;
    private t_increment_base: number = 0.003;
    private t_increment_max: number = this.t_increment_base * 7;
    private t_increment_min: number = this.t_increment_base / 15;
    private rolling_delta: number = this.t_increment_base;
    private timestepAdjustment: number = this.rolling_delta / this.iterationsPerFrame;
    private maxX: number = 1000000000;
    private maxY: number = 1000000000;
    private current_min: number=0;
    private current_max: number=0;


    public pointColors: Float32Array;
    public currentTime: number = this.t;
    private listeners: EquationUpdateCallback[] = [];

    static getInstance() {
        if (!ChaosArt.instance) {
            ChaosArt.instance = new ChaosArt();   
        }
        
        return ChaosArt.instance;
    }

    // Method to register listeners
    public registerListener(callback: EquationUpdateCallback): void {
        this.listeners.push(callback);
    }

    // Method to remove a listener
    public removeListener(callback: EquationUpdateCallback): void {
        this.listeners = this.listeners.filter(listener => listener !== callback);
    }

    // Notify all registered listeners
    private notifyListeners(equation: string): void {
        this.listeners.forEach(callback => callback(equation));
    }

    constructor() {
        if (ChaosArt.instance) {
            throw new Error("Error: Instantiation failed: Use getInstance() instead of new.");
        }
        this.params = new Float32Array(18);
        this.pointColors = new Float32Array(this.numPoints * this.maxAge);
        this.initChaosArt();
    }

    public initChaosArt() {
        this.pointsHistory = [];
        this.t = -3.0;
        this.randParams();
        this.randColors();
        this.updateEquationString()
    }

    private randParams() {
        for (let i = 0; i < this.params.length; i++) {
            this.params[i] = Math.floor(Math.random() * 3) - 1;
        }
    }

    private randColors() {
        let baseColors = Array.from({ length: this.numPoints }, () => [
            Math.random(), Math.random(), Math.random(), 1.0
        ]);

        let extendedColors: number[] = [];
        for (let age = 0; age < this.maxAge; age++) {
            let alpha = 1.0 - age * this.fadeStep;
            baseColors.forEach(color => {
                extendedColors.push(...color.slice(0, 3), alpha);
            });
        }
        this.pointColors = new Float32Array(extendedColors);
    }

    public computeNextPoints(): Array<[number, number]> {
        let allPoints: Array<[number, number]> = [];
        this.currentTime = this.t;

        for (let iteration = 0; iteration < this.iterationsPerFrame; iteration++) {
            let chaosPoints: Array<[number, number]> = [];

            let x = this.scalePoint(this.currentTime);
            let y = this.scalePoint(this.currentTime);

            for (let iter = 0; iter < this.numPoints; iter++) {
                let { x: newX, y: newY } = this.applyChaosEquations(x, y, this.currentTime);
                x = newX;
                y = newY;

                let scaledX = x / 10;
                let scaledY = y / 10;
                if (this.isPointInView(scaledX, scaledY)) {
                    chaosPoints.push([scaledX, scaledY]);
                }

                if (isNaN(x) || isNaN(y)) break;
            }

            this.currentTime += this.timestepAdjustment;
            allPoints.push(...chaosPoints);
        }
        //console.log("Allpoints", allPoints.length);

        this.updateMinMax(allPoints);

        this.adjustTime(allPoints.length);
        this.t += this.rolling_delta;
        this.timestepAdjustment = this.rolling_delta / this.iterationsPerFrame;
        this.updatePointsHistory(allPoints);

        //console.log("pointsHistory", this.pointsHistory.length);
        // Reset at end
        if (this.t > this.t_end) {
            this.initChaosArt();
        }

        return this.pointsHistory;
    }

    private applyChaosEquations(x: number, y: number, tempT: number) {
        let xx = x * x, yy = y * y, tt = tempT * tempT;
        let xy = x * y, xt = x * tempT, yt = y * tempT;
        return {
            x: xx * this.params[0] + yy * this.params[1] + tt * this.params[2] + xy * this.params[3] + xt * this.params[4] + yt * this.params[5] + x * this.params[6] + y * this.params[7] + tempT * this.params[8],
            y: xx * this.params[9] + yy * this.params[10] + tt * this.params[11] + xy * this.params[12] + xt * this.params[13] + yt * this.params[14] + x * this.params[15] + y * this.params[16] + tempT * this.params[17]
        };
    }

    private isPointInView(x: number, y: number): boolean {
        return x >= -1 && x <= 1 && y >= -1 && y <= 1;
    }

    private scalePoint(val: number): number {
        return val / this.maxX;
    }

    private adjustTime(pointCount: number) {
        // If all points centered around zero, it is low activity
        if (this.current_min > -0.05 || this.current_min < 0.05) {
            //console.log("Low activity.");
            
            
            if (this.rolling_delta < this.t_increment_max) {
                this.rolling_delta += (this.t_increment_max - this.rolling_delta) * 0.1;
            }
        }
                
        // Low activity: Increase rolling_delta towards t_increment_max
        if (pointCount <= (this.iterationsPerFrame * 6) || pointCount === (this.numPoints * this.iterationsPerFrame * 2)) {
            //console.log("Low activity.");
            if (this.rolling_delta < this.t_increment_max) {
                this.rolling_delta += (this.t_increment_max - this.rolling_delta) * 0.1;
            }

        // Medium activity: Move rolling_delta towards t_increment_base 
        } else if (pointCount > (this.iterationsPerFrame * 6) && pointCount < (this.iterationsPerFrame * 24)) {
            //console.log("Medium activity.");
            if (this.rolling_delta > this.t_increment_base) {
                this.rolling_delta -= (this.rolling_delta - this.t_increment_base) * 0.25; // Smoothly decrease
            }
            if (this.rolling_delta < this.t_increment_base) {
                this.rolling_delta += (this.t_increment_base - this.rolling_delta) * 0.1; // Smoothly increase
            }

        // High activity: Decrease rolling_delta towards t_increment_min
        } else if (pointCount >= (this.iterationsPerFrame * 24) && pointCount < (this.numPoints * this.iterationsPerFrame * 24)) {
            

            
            //console.log("High activity.");
            if (this.rolling_delta > this.t_increment_min) {
                this.rolling_delta -= (this.rolling_delta - this.t_increment_min) * 0.25; // Smoothly decrease
            }
        }
    }

    private updateMinMax(allPoints: Array<[number, number]>) {
        // Initialize to extreme values
        this.current_min = Infinity;
        this.current_max = -Infinity;
    
        // Iterate through all points to find the min/max
        allPoints.forEach(point => {
            const [x, y] = point;
            // Update current_min and current_max
            if (x < this.current_min) this.current_min = x;
            if (y < this.current_min) this.current_min = y;
            if (x > this.current_max) this.current_max = x;
            if (y > this.current_max) this.current_max = y;
        });
    
        // Optional: Log the updated values for debugging
        //console.log(`Updated min: ${this.current_min}, max: ${this.current_max}`);
    }
    

    private updatePointsHistory(newPoints: Array<[number, number]> = []) {
        this.pointsHistory.unshift(...newPoints);
        if (this.pointsHistory.length > this.numPoints * this.maxAge) {
            this.pointsHistory.length = this.numPoints * this.maxAge;
        }
        //console.log("InIn", this.pointsHistory.length, this.numPoints, this.maxAge);
    }

    public updateEquationString() {
        // Define the terms in the order they appear in the params array
        const terms = ['x²', 'y²', 't²', 'xy', 'xt', 'yt', 'x', 'y', 't'];
        
        // Initialize parts of the equation as empty strings
        let xEquation = 'x\' = ';
        let yEquation = 'y\' = ';
    
        // Iterate through the first half of the params for the x equation
        terms.forEach((term, index) => {
            if (this.params[index] !== 0) {
                // Append the term with its coefficient to the equation string
                xEquation += (this.params[index] > 0 ? (index !== 0 ? ' + ' : '') : ' - ') + (Math.abs(this.params[index]) === 1 ? '' : Math.abs(this.params[index])) + term;
            }
        });
    
        // Iterate through the second half of the params for the y equation
        terms.forEach((term, index) => {
            if (this.params[index + terms.length] !== 0) { // Adjust index for the y equation parameters
                // Append the term with its coefficient to the equation string
                yEquation += (this.params[index + terms.length] > 0 ? (index !== 0 ? ' + ' : '') : ' - ') + (Math.abs(this.params[index + terms.length]) === 1 ? '' : Math.abs(this.params[index + terms.length])) + term;
            }
        });
        
        yEquation = yEquation.startsWith("y' =  +") ? yEquation.replace("y' =  +", "y' =  ") : yEquation;
        xEquation = xEquation.startsWith("x' =  +") ? xEquation.replace("x' =  +", "x' =  ") : xEquation;

        this.notifyListeners(xEquation + '\n' + yEquation);
    }
}

export default ChaosArt;
