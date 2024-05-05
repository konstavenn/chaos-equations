// ChaosArt.ts
type Float32ArrayLike = number[];

class ChaosArt {
    static instance: ChaosArt;

    private params: Float32Array;
    private numPoints: number = 100; // number of points to generate lines from 
    private iterationsPerFrame: number = 200; // length of history for lines
    private pointsHistory: Array<[number, number]> = [];
    private maxAge: number = 200;
    private fadeStep: number = 1.0 / this.maxAge;
    private t: number = -3.0;
    private t_end: number = 3.0;
    private t_increment_base: number = 0.005;
    private t_increment_max: number = this.t_increment_base * 5;
    private t_increment_min: number = this.t_increment_base / 15;
    private rolling_delta: number = this.t_increment_base;
    private timestepAdjustment: number = this.rolling_delta / this.iterationsPerFrame;
    private maxX: number = 1000000000;
    private maxY: number = 1000000000;


    public pointColors: Float32Array;
    public currentTime: number = this.t;

    static getInstance() {
        if (!ChaosArt.instance) {
            ChaosArt.instance = new ChaosArt();
        }
        return ChaosArt.instance;
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
        if (pointCount <= (this.iterationsPerFrame * 6) || pointCount === (this.numPoints * this.iterationsPerFrame * 2)) {
            this.rolling_delta += (this.t_increment_max - this.rolling_delta) * 0.1;
        } else if (pointCount > (this.iterationsPerFrame * 6) && pointCount < (this.iterationsPerFrame * 24)) {
            this.rolling_delta += (this.t_increment_base - this.rolling_delta) * 0.1;
        } else if (pointCount >= (this.iterationsPerFrame * 24) && pointCount < (this.numPoints * this.iterationsPerFrame * 24)) {
            this.rolling_delta -= (this.rolling_delta - this.t_increment_min) * 0.25;
        }
    }

    private updatePointsHistory(newPoints: Array<[number, number]> = []) {
        this.pointsHistory.unshift(...newPoints);
        if (this.pointsHistory.length > this.numPoints * this.maxAge) {
            this.pointsHistory.length = this.numPoints * this.maxAge;
        }
        //console.log("InIn", this.pointsHistory.length, this.numPoints, this.maxAge);
    }
}

export default ChaosArt;
