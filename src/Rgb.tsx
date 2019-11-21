export default class Rgb {

    constructor(
        public r: number,
        public g: number,
        public b: number
    ) {}

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

    static fromHex( hex: string ): Rgb {
        const num = parseInt(hex, 16);

        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;

        return new Rgb(r, g, b);
    }

    static random( before: Rgb ): Rgb {
        if (before.r > 0 && before.b == 0) {
            before.r -= 1;
            before.g += 1;
        }

        if (before.g > 0 && before.r == 0) {
            before.g -= 1;
            before.b += 1;
        }

        if (before.b > 0 && before.g == 0) {
            before.r += 1;
            before.b -= 1;
        }

        return before;
    }

}






