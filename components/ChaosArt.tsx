// ChaosArt.ts

// Type definitions for better type safety
type Float32ArrayLike = number[];
type EquationUpdateCallback = (equation: string) => void;

class ChaosArt {
    // Singleton instance
    static instance: ChaosArt;
    
    // Flag to control animation pause state
    private isPaused: boolean = false;

    // Parameters for the chaos equations
    public params: Float32Array;
    
    // Configuration for point generation and history
    private numPoints: number = 100; // number of points to generate lines from 
    private iterationsPerFrame: number = 200; // length of history for lines
    private pointsHistory: Array<[number, number]> = [];
    private maxAge: number = 200;
    private fadeStep: number = 1.0 / this.maxAge;
    
    // Time-related variables for animation control
    private t: number = -3.0;
    private t_end: number = 3.0;
    private t_increment_base: number = 0.003;
    private t_increment_max: number = this.t_increment_base * 7;
    private t_increment_min: number = this.t_increment_base / 15;
    private rolling_delta: number = this.t_increment_base;
    private timestepAdjustment: number = this.rolling_delta / this.iterationsPerFrame;
    
    // Scaling factors for point coordinates
    private maxX: number = 1000000000;
    private maxY: number = 1000000000;
    
    // Variables to track the current range of points
    private current_min: number = 0;
    private current_max: number = 0;

    // Array to store color information for points
    public pointColors: Float32Array;
    
    // Current time in the animation
    public currentTime: number = this.t;
    
    // Array to store equation update listeners
    private listeners: EquationUpdateCallback[] = [];

    // Singleton getInstance method
    static getInstance() {
        if (!ChaosArt.instance) {
            ChaosArt.instance = new ChaosArt();   
        }
        return ChaosArt.instance;
    }

    // Method to toggle pause state
    public togglePause(): void {
        this.isPaused = !this.isPaused;
    }

    // Method to register equation update listeners
    public registerListener(callback: EquationUpdateCallback): void {
        this.listeners.push(callback);
    }

    // Method to remove equation update listeners
    public removeListener(callback: EquationUpdateCallback): void {
        this.listeners = this.listeners.filter(listener => listener !== callback);
    }

    // Method to notify all registered listeners with new equation
    private notifyListeners(equation: string): void {
        this.listeners.forEach(callback => callback(equation));
    }

    // Private constructor for singleton pattern
    private constructor() {
        this.params = new Float32Array(18);
        this.pointColors = new Float32Array(this.numPoints * this.maxAge);
        this.initChaosArt();
    }

    // Method to initialize or reset the chaos art
    public initChaosArt() {
        this.pointsHistory = [];
        this.t = -3.0;
        this.randParams();
        this.randColors();
        this.updateEquationString()
    }

    // Method to generate random parameters for chaos equations
    private randParams() {
        for (let i = 0; i < this.params.length; i++) {
            this.params[i] = Math.floor(Math.random() * 3) - 1;
        }
    }

    // Method to generate random colors for points
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

    // Main method to compute next set of points for animation
    public computeNextPoints(): Array<[number, number]> {
        let allPoints: Array<[number, number]> = [];
        this.currentTime = this.t;

        if (this.isPaused) {
            return this.pointsHistory;
        }

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

        this.updateMinMax(allPoints);
        this.adjustTime(allPoints.length);
        this.t += this.rolling_delta;
        this.timestepAdjustment = this.rolling_delta / this.iterationsPerFrame;
        this.updatePointsHistory(allPoints);

        // Reset at end of time range
        if (this.t > this.t_end) {
            this.initChaosArt();
        }

        return this.pointsHistory;
    }

    // Method to apply chaos equations to a point
    private applyChaosEquations(x: number, y: number, tempT: number) {
        let xx = x * x, yy = y * y, tt = tempT * tempT;
        let xy = x * y, xt = x * tempT, yt = y * tempT;
        return {
            x: xx * this.params[0] + yy * this.params[1] + tt * this.params[2] + xy * this.params[3] + xt * this.params[4] + yt * this.params[5] + x * this.params[6] + y * this.params[7] + tempT * this.params[8],
            y: xx * this.params[9] + yy * this.params[10] + tt * this.params[11] + xy * this.params[12] + xt * this.params[13] + yt * this.params[14] + x * this.params[15] + y * this.params[16] + tempT * this.params[17]
        };
    }

    // Method to check if a point is within the visible range
    private isPointInView(x: number, y: number): boolean {
        return x >= -1 && x <= 1 && y >= -1 && y <= 1;
    }

    // Method to scale a point
    private scalePoint(val: number): number {
        return val / this.maxX;
    }

    // Method to adjust time increment based on point activity
    private adjustTime(pointCount: number) {
        // Adjust for low activity (points centered around zero)
        if (this.current_min > -0.05 || this.current_min < 0.05) {
            if (this.rolling_delta < this.t_increment_max) {
                this.rolling_delta += (this.t_increment_max - this.rolling_delta) * 0.1;
            }
        }
        
        // Adjust for low point count
        if (pointCount <= (this.iterationsPerFrame * 6) || pointCount === (this.numPoints * this.iterationsPerFrame * 2)) {
            if (this.rolling_delta < this.t_increment_max) {
                this.rolling_delta += (this.t_increment_max - this.rolling_delta) * 0.1;
            }
        } 
        // Adjust for medium point count
        else if (pointCount > (this.iterationsPerFrame * 6) && pointCount < (this.iterationsPerFrame * 24)) {
            if (this.rolling_delta > this.t_increment_base) {
                this.rolling_delta -= (this.rolling_delta - this.t_increment_base) * 0.25; // Smoothly decrease
            }
            if (this.rolling_delta < this.t_increment_base) {
                this.rolling_delta += (this.t_increment_base - this.rolling_delta) * 0.1; // Smoothly increase
            }
        } 
        // Adjust for high point count
        else if (pointCount >= (this.iterationsPerFrame * 24) && pointCount < (this.numPoints * this.iterationsPerFrame * 24)) {
            if (this.rolling_delta > this.t_increment_min) {
                this.rolling_delta -= (this.rolling_delta - this.t_increment_min) * 0.25; // Smoothly decrease
            }
        }
    }

    // Method to update the current min and max values of points
    private updateMinMax(allPoints: Array<[number, number]>) {
        this.current_min = Infinity;
        this.current_max = -Infinity;
    
        allPoints.forEach(point => {
            const [x, y] = point;
            if (x < this.current_min) this.current_min = x;
            if (y < this.current_min) this.current_min = y;
            if (x > this.current_max) this.current_max = x;
            if (y > this.current_max) this.current_max = y;
        });
    }

    // Method to update the points history
    private updatePointsHistory(newPoints: Array<[number, number]> = []) {
        this.pointsHistory.unshift(...newPoints);
        if (this.pointsHistory.length > this.numPoints * this.maxAge) {
            this.pointsHistory.length = this.numPoints * this.maxAge;
        }
    }

    // Method to update and notify listeners of new equation string
    public updateEquationString() {
        const terms = ['x²', 'y²', 't²', 'xy', 'xt', 'yt', 'x', 'y', 't'];
        
        let xEquation = 'x\' = ';
        let yEquation = 'y\' = ';
    
        // Generate x equation string
        terms.forEach((term, index) => {
            if (this.params[index] !== 0) {
                xEquation += (this.params[index] > 0 ? (index !== 0 ? ' + ' : '') : ' - ') + (Math.abs(this.params[index]) === 1 ? '' : Math.abs(this.params[index])) + term;
            }
        });
    
        // Generate y equation string
        terms.forEach((term, index) => {
            if (this.params[index + terms.length] !== 0) {
                yEquation += (this.params[index + terms.length] > 0 ? (index !== 0 ? ' + ' : '') : ' - ') + (Math.abs(this.params[index + terms.length]) === 1 ? '' : Math.abs(this.params[index + terms.length])) + term;
            }
        });
        
        // Clean up equation strings
        yEquation = yEquation.startsWith("y' =  +") ? yEquation.replace("y' =  +", "y' =  ") : yEquation;
        xEquation = xEquation.startsWith("x' =  +") ? xEquation.replace("x' =  +", "x' =  ") : xEquation;

        // Notify listeners of new equation
        this.notifyListeners(xEquation + '\n' + yEquation);
    }
}

export default ChaosArt;