const audio     = document.getElementById('audio');
const canvas    = document.getElementById('canvas');
const file      = document.getElementById('file');
const name      = document.getElementById('name');

const drawType = document.getElementById('draw-type');
const color = document.getElementById('color');

const scaling = 256.0;

function hexToRgb( )
{
    const num = parseInt(color.value.substring(1), 16);

    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;

    return {
        r: r,
        g: g,
        b: b
    };
}

function uint8ToRgb( x )
{
    // base color: "primary" purple
    let rgb = hexToRgb();

    // if signal is strong enough, vary color to be lighter
    if (x > 96)
    {
        rgb.r = rgb.r + (255 - x) * 0.50;
        rgb.g = rgb.g + (255 - x) * 0.50;
        rgb.b = rgb.b + (255 - x) * 0.50;
    }

    return `rgb(${rgb.r},${rgb.g},${rgb.b})`;
}

function drawWave( ctx, freqs, max, width, height )
{
    let y = height;

    ctx.lineWidth = 2;
    
    for (let x = 0; x < width; ++x)
    {
        ctx.strokeStyle = uint8ToRgb(freqs[x]);

        ctx.beginPath();
        ctx.moveTo(x, y);

        // update y after each stroke in order to finish line
        y = height - freqs[x] * (height / scaling);
        ctx.lineTo(x, y);

        ctx.stroke();
    }
}

function drawBars( ctx, freqs, max, width, height )
{
    let barHeight;

    for (let x = 0; x < width; x += 10)
    {
        barHeight = freqs[x] * (height / 180.0);

        ctx.fillStyle = uint8ToRgb(freqs[x]);
        ctx.fillRect(x, height - barHeight, 10, barHeight);
    }
}

function drawOsc( ctx, time, max, width, height )
{
    let risingEdge = 0;
    let edgeThreshold = 5;

    ctx.lineWidth = 2;
    const rgb = hexToRgb(color.value);
    ctx.strokeStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
    ctx.beginPath();

    while (time[risingEdge++] - 128 > 0 && risingEdge <= width);
    if (risingEdge >= width) risingEdge = 0;

    while (time[risingEdge++] - 128 < edgeThreshold && risingEdge <= width);
    if (risingEdge >= width) risingEdge = 0;

    for (let x = risingEdge; x < time.length && x - risingEdge < width; ++x)
    {
        ctx.lineTo(x - risingEdge, height - time[x] * (height / scaling));
    }
    ctx.stroke();
}

function visualize( )
{
    file.addEventListener('change', function ( )
    {
        // get file uploaded by user
        let files = this.files;
        audio.src = URL.createObjectURL(files[0]);

        // create HTML 5 canvas contexts to draw / analyse audio
        const ctx = canvas.getContext('2d');
        const ctxAudio = new (window.AudioContext || window.webkitAudioContext)();

        // use file as audio source
        let src = ctxAudio.createMediaElementSource(audio);
        const analyser = ctxAudio.createAnalyser();
        analyser.fftSize = 2048;

        // sample frequency data using analyser
        src.connect(analyser);
        analyser.connect(ctxAudio.destination);

        // set file name heading
        document.getElementById('now-playing').textContent = 'Now playing';
        name.textContent = `${files[0].name}`;

        function renderFrame()
        {
            const width = canvas.width = canvas.getBoundingClientRect().width;
            const height = canvas.height = canvas.getBoundingClientRect().height;

            ctx.fillStyle = 'rgb(22, 22, 22)';
            ctx.fillRect(0, 0, width, height);

            const type = drawType.options[drawType.selectedIndex].text;
            if (type === 'Oscilloscope')
            {
                const time = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteTimeDomainData(time);

                const max = Math.max.apply(Math, time);
                drawOsc(ctx, time, max, width, height);
            }
            else
            {
                const freqs = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(freqs);

                const max = Math.max.apply(Math, freqs);

                if (type === 'Bar')
                {
                    drawBars(ctx, freqs, max, width, height);
                }
                else if (type === 'Wave')
                {
                    drawWave(ctx, freqs, max, width, height);
                }
            }

            requestAnimationFrame(renderFrame);
        }

        renderFrame();
        audio.play();
        record();
    });
}

function record( )
{
    let mediaRecorder;
    let recordedBlobs;
    let sourceBuffer;

    const video = document.querySelector('video');
    const recordButton = document.querySelector('button#record');
    const playButton = document.querySelector('button#play');
    const downloadButton = document.querySelector('button#download');

    const mediaSource = new MediaSource();
    mediaSource.addEventListener('sourceopen', handleSourceOpen, false);

    recordButton.onclick = toggleRecording;
    playButton.onclick = play;
    downloadButton.onclick = download;

    const stream = canvas.captureStream(); // frames per second
    console.log('Started stream capture from canvas element: ', stream);

    function handleSourceOpen(event) {
        console.log('MediaSource opened');
        sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
        console.log('Source buffer: ', sourceBuffer);
    }

    function handleDataAvailable(event) {
        if (event.data && event.data.size > 0) {
            recordedBlobs.push(event.data);
        }
    }

    function handleStop(event) {
        console.log('Recorder stopped: ', event);
        const superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
        video.src = window.URL.createObjectURL(superBuffer);
    }

    function toggleRecording() {
        if (recordButton.textContent === 'Start Recording') {
            startRecording();
        } else {
            stopRecording();
            recordButton.textContent = 'Start Recording';
            playButton.disabled = false;
            downloadButton.disabled = false;
        }
    }

// The nested try blocks will be simplified when Chrome 47 moves to Stable
    function startRecording() {
        let options = {mimeType: 'video/webm'};
        recordedBlobs = [];
        try {
            mediaRecorder = new MediaRecorder(stream, options);
        } catch (e0) {
            console.log('Unable to create MediaRecorder with options Object: ', e0);
            try {
                options = {mimeType: 'video/webm,codecs=vp9'};
                mediaRecorder = new MediaRecorder(stream, options);
            } catch (e1) {
                console.log('Unable to create MediaRecorder with options Object: ', e1);
                try {
                    options = {
                        mimeType: 'video/mp4',
                    };
                    mediaRecorder = new MediaRecorder(stream, options);
                } catch (e2) {
                    alert('MediaRecorder is not supported by this browser.\n\n' +
                        'Try Firefox 29 or later, or Chrome 47 or later, ' +
                        'with Enable experimental Web Platform features enabled from chrome://flags.');
                    console.error('Exception while creating MediaRecorder:', e2);
                    return;
                }
            }
        }
        console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
        recordButton.textContent = 'Stop Recording';
        playButton.disabled = true;
        downloadButton.disabled = true;
        mediaRecorder.onstop = handleStop;
        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.start(100); // collect 100ms of data
        console.log('MediaRecorder started', mediaRecorder);

        document.getElementById('recording').textContent = 'Recording';
        document.getElementById('recording').classList.add('recording');
    }

    function stopRecording() {
        mediaRecorder.stop();
        console.log('Recorded Blobs: ', recordedBlobs);
        video.controls = true;

        document.getElementById('recording').textContent = 'Not Recording..';
        document.getElementById('recording').classList.remove('recording');
    }

    function play() {
        video.play();
    }

    function download() {
        const blob = new Blob(recordedBlobs, {type: 'video/webm'});
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'test.webm';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    }
}

document.addEventListener('DOMContentLoaded', function ( ) {
    visualize();
});
