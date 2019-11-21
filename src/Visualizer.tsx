import React, { ChangeEvent, Component, Fragment } from 'react';
import AudioAnalyser from './AudioAnalyser';

type VisualizerProps = {

    source: string | MediaStream

};

type VisualizerState = {

    color: string,
    draw: string,
    rainbow: boolean

}

export default class Visualizer extends Component<VisualizerProps, VisualizerState> {

    constructor( props: VisualizerProps ) {
        super(props);
        this.state = {
            color: '8000ff',
            draw: 'bars',
            rainbow: false
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange( e: ChangeEvent ) {
        let it: Element = e.target;
        const name: string = it.getAttribute('name');

        switch (name) {
            case 'draw':
                const elem: HTMLSelectElement = it as HTMLSelectElement;
                let text: string = elem.options[elem.selectedIndex].text;
                text = text.replace(' ', '-').toLowerCase();
                this.setState({ draw: text });
        }
    }

    render() {
        console.log(this.state);
        return (
            <Fragment>
                <div className="d-flex align-items-center">
                    <label htmlFor="style">Visualizer Style</label>
                    <select onChange={this.handleChange} name="draw" className="mx-4">
                        <option>Bars</option>
                        <option>Wave</option>
                        <option>Filled Wave</option>
                        <option>Oscilloscope</option>
                    </select>
                    <label htmlFor="color">Color</label>
                    <input
                        name="color"
                        type="color"
                        className="mx-4"
                        onChange={this.handleChange}
                        value={`#${this.state.color}`}
                    />
                    <label htmlFor="rainbow">Rainbow</label>
                    <input
                        name="rainbow"
                        type="checkbox"
                        className="mx-4"
                        onChange={this.handleChange}
                        checked={this.state.rainbow}
                    />
                </div>
                {<AudioAnalyser
                    source={this.props.source}
                    color={this.state.color}
                    draw={this.state.draw}
                    rainbow={this.state.rainbow}
                />}
            </Fragment>
        );
    }

}
