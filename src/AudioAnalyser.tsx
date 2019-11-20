import React, { Component, Fragment } from 'react';
import AudioVisualizer from './AudioVisualizer';

type AudioAnalyserProps = {

    source: string | MediaStream

}

type AudioAnalyserState = {

    analyser: AnalyserNode,
    ctx: AudioContext,
    data: Uint8Array

};

export default class AudioAnalyser extends Component<AudioAnalyserProps, AudioAnalyserState> {

    readonly audio: React.RefObject<HTMLAudioElement>;

    constructor( props: AudioAnalyserProps ) {
        super(props);
        this.audio = React.createRef();
        this.state = {
            analyser: null,
            ctx: null,
            data: null
        };
        this.tick = this.tick.bind(this);
    }

    tick() {
        let data = new Uint8Array(this.state.analyser.frequencyBinCount);
        this.state.analyser.getByteFrequencyData(data);
        this.setState({ data: data });
        requestAnimationFrame(this.tick);
    }

    render() {
        return (
            <Fragment>
                { this.state.data &&
                    <AudioVisualizer data={ this.state.data } />
                }
                {
                    !(this.props.source instanceof MediaStream) &&
                    <audio ref={ this.audio } src={ this.props.source } controls autoPlay />
                }
            </Fragment>
        )
    }

    componentDidMount(): void {
        const ctx: AudioContext = new window.AudioContext();

        let src;
        if (this.props.source instanceof MediaStream) {
            src = ctx.createMediaStreamSource(this.props.source);
        } else {
            src = ctx.createMediaElementSource(this.audio.current);
        }

        const analyser: AnalyserNode = ctx.createAnalyser();
        analyser.fftSize = 2048;

        src.connect(analyser);
        analyser.connect(ctx.destination);

        this.setState({ analyser: analyser, ctx: ctx });
        requestAnimationFrame(this.tick);
    }

}
