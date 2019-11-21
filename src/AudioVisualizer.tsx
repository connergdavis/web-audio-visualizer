import React, { Component } from 'react'

import Rgb from './Rgb'

type AudioVisualizerProps = {

    data: Uint8Array
    color: string
    draw: string
    rainbow: boolean

}

type AudioVisualizerState = {

    ctx: CanvasRenderingContext2D
    height: number
    width: number

}

export default class AudioVisualizer extends Component<AudioVisualizerProps, AudioVisualizerState> {

    private ctx: CanvasRenderingContext2D;
    private height: number;
    private width: number;
    private color: Rgb;

    readonly canvas: React.RefObject<HTMLCanvasElement>;
    readonly scaling: number = 256.0;

    constructor( props: AudioVisualizerProps ) {
        super(props);
        this.canvas = React.createRef();
    }

    drawBars() {
        const ctx = this.ctx;
        const data = this.props.data;
        const height = this.height;
        const scaling = this.scaling;

        let barHeight;

        for (let i = 0; i < data.length; ++i) {
            barHeight = data[i] * (height / scaling);
            ctx.fillStyle = this.dataToRgb(data[i]);
            ctx.fillRect(i * 15, height - barHeight, 15, barHeight);
        }
    }

    drawFilledWave() {
        const ctx = this.ctx;
        const data = this.props.data;
        const height = this.height;
        const scaling = this.scaling;

        let x = 0;
        let y = height;

        ctx.lineWidth = 2;
        for (let i = 0; i < data.length; ++i)
        {
            ctx.strokeStyle = this.dataToRgb(data[i]);
            ctx.beginPath();
            ctx.moveTo(x, y);

            // update y after each stroke in order to finish line
            y = height - data[i] * (height / scaling);
            ctx.lineTo(x + 15, y);
            ctx.stroke();

            ctx.fillStyle = ctx.strokeStyle;
            ctx.lineTo(x + 15, height);
            ctx.lineTo(x, height);
            ctx.fill();

            x += 15;
        }
    }

    drawWave() {
        const ctx = this.ctx;
        const data = this.props.data;
        const height = this.height;
        const scaling = this.scaling;

        let x = 0;
        let y = height;

        ctx.lineWidth = 4;
        for (let i = 0; i < data.length; ++i)
        {
            ctx.strokeStyle = this.dataToRgb(data[i]);
            ctx.beginPath();
            ctx.moveTo(x, y);

            // update y after each stroke in order to finish line
            y = height - data[i] * (height / scaling);
            ctx.lineTo(x + 15, y);
            x += 15;

            ctx.stroke();
        }
    }

    render() {
        return ( <canvas ref={this.canvas} /> )
    }

    componentDidUpdate() {
        const canvas = this.canvas.current;
        this.ctx = canvas.getContext('2d');
        this.height = canvas.height = canvas.getBoundingClientRect().height;
        this.width = canvas.width = canvas.getBoundingClientRect().width;

        if (this.props.rainbow) {
            this.color = Rgb.random(Rgb.fromHex(this.props.color));
        }

        switch (this.props.draw) {
            case 'bars':
                this.drawBars();
                break;

            case 'wave':
                this.drawWave();
                break;

            case 'filled-wave':
                this.drawFilledWave();
        }
    }

    dataToRgb( val: number ): string {
        if (val < 0 || val > 255) {
            throw new Error('AudioVisualizer#uint8ToRgb(): Illegal argument');
        }

        let rgb: Rgb = this.props.rainbow ? this.color : Rgb.fromHex(this.props.color);

        if (val > 156) {
            rgb.shade(val, 0.50);
        } else if (val > 128) {
            rgb.shade(val, 0.33);
        } else if (val > 96) {
            rgb.shade(val, 0.25);
        }

        return rgb.toString();
    }

}
