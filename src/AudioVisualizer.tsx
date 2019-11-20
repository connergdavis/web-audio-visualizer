import React, { Component } from 'react';

type AudioVisualizerProps = {

    data: Uint8Array

}

type AudioVisualizerState = {

};

export default class AudioVisualizer extends Component<AudioVisualizerProps, AudioVisualizerState> {

    readonly canvas: React.RefObject<HTMLCanvasElement>;

    constructor( props: AudioVisualizerProps ) {
        super(props);
        this.canvas = React.createRef();
    }

    draw() {
        const canvas = this.canvas.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.getBoundingClientRect().width;
        const height = canvas.height = canvas.getBoundingClientRect().height;
        const data = this.props.data;

        let barHeight;

        for (let i = 0; i < data.length; ++i)
        {
            barHeight = data[i] * (height / 256.0);

            ctx.fillStyle = this.uint8ToRgb(data[i]);
            ctx.fillRect(i * 15, height - barHeight, 15, barHeight);
        }
    }

    componentDidUpdate(): void {
        this.draw();
    }

    render() {
        return (
            <canvas ref={ this.canvas } />
        )
    }

    hexToRgb() {
        const num = parseInt('f0f0f0', 16);

        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;

        return {
            r: r,
            g: g,
            b: b
        };
    }

    uint8ToRgb( x: number ) {
        // base color: "primary" purple
        let rgb = this.hexToRgb();

        // if signal is strong enough, vary color to be lighter
        if (x > 156) {
            rgb.r = rgb.r + (255 - x) * 0.50;
            rgb.g = rgb.g + (255 - x) * 0.50;
            rgb.b = rgb.b + (255 - x) * 0.50;
        } else if (x > 128) {
            rgb.r = rgb.r + (255 - x) * 0.33;
            rgb.g = rgb.g + (255 - x) * 0.33;
            rgb.b = rgb.b + (255 - x) * 0.33;
        } else if (x > 96) {
            rgb.r = rgb.r + (255 - x) * 0.25;
            rgb.g = rgb.g + (255 - x) * 0.25;
            rgb.b = rgb.b + (255 - x) * 0.25;
        }

        return `rgb(${rgb.r},${rgb.g},${rgb.b})`;
    }

}
