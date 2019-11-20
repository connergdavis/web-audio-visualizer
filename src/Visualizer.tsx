import React, { Component, Fragment } from 'react';
import AudioAnalyser from './AudioAnalyser';

type VisualizerProps = {

    source: string | MediaStream

};

type VisualizerState = {

    color: string,
    style: string,
    rainbow: boolean

}

export default class Visualizer extends Component<VisualizerProps, VisualizerState> {

    constructor( props: VisualizerProps ) {
        super(props);
        this.state = {
            color: '8000ff',
            style: 'bar',
            rainbow: false
        };
    }

    render() {
        return (
            <Fragment>
                <div className="d-flex align-items-center">
                    <label htmlFor="style">Visualizer Style</label>
                    <select name="style" className="mx-4">
                        <option>Bar</option>
                        <option>Wave</option>
                        <option>Filled Wave</option>
                        <option>Oscilloscope</option>
                    </select>
                    <label htmlFor="color">Color</label>
                    <input name="color" type="color" className="mx-4" value={ `#${this.state.color}` } />
                    <label htmlFor="rainbow">Rainbow</label>
                    <input name="rainbow" type="checkbox" className="mx-4" checked={ this.state.rainbow } />
                </div>
                { <AudioAnalyser source={ this.props.source } /> }
            </Fragment>
        );
    }

}
