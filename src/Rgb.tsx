export default class Rgb {

    constructor(
        public r: number,
        public g: number,
        public b: number
    ) {}

    static fromHex( hex: string ): Rgb {
        const num = parseInt(hex, 16);

        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;

        return new Rgb(r, g, b);
    }

    shade( diff: number, factor: number ) {
        if (factor < 0 || factor > 1.00) {
            throw new Error('AudioVisualizer#shadeRgb(): Illegal argument');
        }

        this.r += (255 - diff) * factor;
        this.g += (255 - diff) * factor;
        this.b += (255 - diff) * factor;
    }

    toString(): string {
        return `rgb(${this.r},${this.g},${this.b})`
    }

}






