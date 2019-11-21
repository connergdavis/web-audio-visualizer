import React from 'react'
import { Component, Fragment } from 'react'

import './scss/index.scss'
import Visualizer from './Visualizer'

/*
    "Steps" are just the content currently being rendered. For example, on page load, AUDIO_SOURCE gives the user the
    option of choosing direct input or sound file. Once one is selected, we move to that step.
 */
enum AppStep {

    AudioSource,
    DirectInput,
    SoundFile,
    Visualizer

}

type AppProps = {

};

type AppState = {

    /*
        Defined after selecting direct input and choosing input device in browser popup.
        Passed to Visualizer component. Streams data from the input device.
     */
    directInputStream: MediaStream,
    /*
        Defined after selecting sound file and choosing a file. Added directly to
        <audio> to play sound while visualizer runs.
     */
    soundFileStream: string,
    /*
        True if a sound file or direct input stream has been accepted.
     */
    nowPlaying: string,
    step: AppStep

}

const NOW_PLAYING_NONE = 'No source selected';
const NOW_PLAYING_DIRECT = 'Streaming direct input';

export default class App extends Component<{}, AppState> {

    constructor( props: AppProps ) {
        super(props);
        this.state = {
            directInputStream: null,
            soundFileStream: null,
            nowPlaying: NOW_PLAYING_NONE,
            step: AppStep.AudioSource
        };
    }

    handleAudioSource( e: React.MouseEvent ) {
        const target: string = e.currentTarget.lastChild.textContent.toLowerCase();
        const step: AppStep = target.includes('direct') ? AppStep.DirectInput : AppStep.SoundFile;

        this.setState({ step: step });
        if (target === 'direct-input') {
            this.toggleDirectInput();
        }
    }

    handleSoundFile( e: React.ChangeEvent<HTMLInputElement> ) {
        this.setState({
            soundFileStream: URL.createObjectURL(e.target.files[0]),
            nowPlaying: e.target.files[0].name,
            step: AppStep.Visualizer
        });
    }

    handleSwitch( e: React.MouseEvent ) {
        const step = this.isStep(AppStep.DirectInput) ? AppStep.SoundFile : AppStep.DirectInput;

        this.setState({ step: step });
    }

    async getDirectInput() {
        try {
            const audio: MediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

            this.setState({
                directInputStream: audio,
                nowPlaying: NOW_PLAYING_DIRECT,
                step: AppStep.Visualizer
            });
        } catch ( err ) {
            console.log(err);
        }
    }

    stopDirectInput() {
        this.state.directInputStream.getTracks().forEach(track => track.stop());
        this.setState({ directInputStream: null });
    }

    toggleDirectInput() {
        if (this.state.directInputStream) {
            this.stopDirectInput();
        } else {
            this.getDirectInput().then().catch(err => console.log(err));
        }
    }

    renderHeader() {
        return (
            <div className="bg-primary">
                <div className="container py-4">
                    <div className="row align-items-center">
                        <div className="col-12 col-md-2">
                            <h5 className="m-0 p-4 bg-white text-dark">
                                <i className={ `fas fa-${ this.isNowPlaying() ? 'play' : 'pause' } mr-md-4` }> </i>
                                { this.isNowPlaying() ? 'Playing' : 'Paused' }
                            </h5>
                        </div>
                        <div className="col-12 col-md-10">
                            <h4 className="m-0 p-4 bg-dark text-white">{ this.state.nowPlaying }</h4>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    renderAudioSource() {
        return (
            <Fragment>
                <h1>First, select an audio source.</h1>
                <div className="center-center">
                    <div
                        className="center-center flex-column bg-white text-dark mx-3 p-4"
                        onClick={ (e) => this.handleAudioSource(e) }
                    >
                        <i className="fas fa-microphone mb-4"> </i>
                        <h4>Direct Input</h4>
                    </div>
                    <div
                        className="center-center flex-column bg-white text-dark mx-3 p-4"
                        onClick={ (e) => this.handleAudioSource(e) }
                    >
                        <i className="fas fa-file-audio mb-4"> </i>
                        <h4>Sound File</h4>
                    </div>
                </div>
            </Fragment>
        )
    }

    renderDirectInput() {
        return (
            <Fragment>
                <h6
                    className="d-flex align-items-center p-3 border border-danger text-danger"
                    onClick={ (e) => this.handleSwitch(e) }
                >
                    <i className="fas fa-undo mr-3"> </i>
                    Actually, I want to switch to sound file.
                </h6>
                <h1>Next, allow microphone access and choose a device.</h1>
            </Fragment>
        )
    }

    renderSoundFile() {
        return (
            <Fragment>
                <h6
                    className="d-flex align-items-center p-3 border border-danger text-danger"
                    onClick={ (e) => this.handleSwitch(e) }
                >
                    <i className="fas fa-undo mr-3"> </i>
                    Actually, I want to switch to direct input.
                </h6>
                <h1>Next, upload a sound file.</h1>
                <input type="file" accept="audio/*" className="mb-4" onChange={ (e) => this.handleSoundFile(e) } />
            </Fragment>
        )
    }

    renderVisualizer() {
        return (
            <Fragment>
                <Visualizer
                    source={ this.isDirectInput() ? this.state.directInputStream : this.state.soundFileStream }
                />
            </Fragment>
        )
    }

    renderBody() {
        return (
            <div className="container">
                <div className="py-4">
                    { this.isStep(AppStep.AudioSource) && this.renderAudioSource() }
                    { this.isStep(AppStep.DirectInput) && this.renderDirectInput() }
                    { this.isStep(AppStep.SoundFile) && this.renderSoundFile() }
                    { this.isStep(AppStep.Visualizer) && this.renderVisualizer() }
                </div>
            </div>
        )
    }

    render() {
        return (
            <Fragment>
                { this.renderHeader() }
                { this.renderBody() }
            </Fragment>
        )
    }

    isDirectInput(): boolean {
        return this.state.directInputStream !== null;
    }

    isNowPlaying(): boolean {
        return this.state.nowPlaying !== NOW_PLAYING_NONE;
    }

    isStep( it: AppStep ): boolean {
        return this.state.step === it;
    }

}
