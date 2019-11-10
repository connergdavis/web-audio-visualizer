const audio     = document.getElementById('vis-audio');
const container = document.getElementById('vis-container');
const canvas    = document.getElementById('vis-canvas');
const file      = document.getElementById('vis-file');
const name      = document.getElementById('vis-name');

const drawType = document.getElementById('vis-drawtype');

function freqColor( x )
{
    let r, g, b;
    
    r = 128;
    g = 0;
    b = 255;

    if (x > 100)
        r = x;

    if (x > 200)
        g = x * 0.50;
    else if (x > 150)
        g = x * 0.05;
    
    return `rgb(${r},${g},${b})`;
}

function drawFreqWave( ctx, freqs, WIDTH, HEIGHT )
{
    const max = Math.max.apply(Math, freqs);
    let y = HEIGHT;

    ctx.lineWidth = 2;
    for (let x = 0; x < WIDTH; ++x)
    {
        ctx.strokeStyle = freqColor(freqs[x]);
        ctx.beginPath();

        ctx.moveTo(x, y);
        y = HEIGHT - freqs[x] * (HEIGHT / 256.0);
        ctx.lineTo(x, y);

        ctx.stroke();
    }
}

function drawFreqBars( ctx, freqs, WIDTH, HEIGHT )
{
    const max = Math.max.apply(Math, freqs);
    let barHeight;

    for (let x = 0; x < WIDTH; x += 10)
    {
        barHeight = freqs[x] * (HEIGHT / 256.0);

        ctx.fillStyle = freqColor(freqs[x]);
        ctx.fillRect(x, HEIGHT - barHeight, 10, barHeight);
    }
}

function drawTimeOsc( ctx, time, WIDTH, HEIGHT )
{
    let risingEdge = 0;
    let edgeThreshold = 5;

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgb(128,0,255)';
    ctx.beginPath();

    while (time[risingEdge++] - 128 > 0 && risingEdge <= WIDTH);
    if (risingEdge >= WIDTH) risingEdge = 0;

    while (time[risingEdge++] - 128 < edgeThreshold && risingEdge <= WIDTH);
    if (risingEdge >= WIDTH) risingEdge = 0;

    for (let x = risingEdge; x < time.length && x - risingEdge < WIDTH; ++x)
    {
        ctx.lineTo(x - risingEdge, HEIGHT - time[x] * (HEIGHT / 256.0));
    }
    ctx.stroke();
}

function visualize()
{
    file.addEventListener('change', function ()
    {
        // get file uploaded by user
        let files = this.files;
        audio.src = URL.createObjectURL(files[0]);

        // set file name heading
        name.textContent = `Playing => ${files[0].name}`;

        const ctx = canvas.getContext('2d');
        const ctxAudio = new (window.AudioContext || window.webkitAudioContext)();

        // use file as audio source
        let src = ctxAudio.createMediaElementSource(audio);
        const analyser = ctxAudio.createAnalyser();
        analyser.fftSize = 2048;

        // sample frequency data using analyser
        src.connect(analyser);
        analyser.connect(ctxAudio.destination);

        function renderFrame()
        {
            const WIDTH = canvas.width = canvas.getBoundingClientRect().width;
            const HEIGHT = canvas.height = canvas.getBoundingClientRect().height;

            ctx.fillStyle = 'rgb(22, 22, 22)';
            ctx.fillRect(0, 0, WIDTH, HEIGHT);

            const draw = drawType.options[drawType.selectedIndex].text;
            if (draw === 'Oscilloscope')
            {
                const time = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteTimeDomainData(time);

                drawTimeOsc(ctx, time, WIDTH, HEIGHT);
            }
            else
            {
                const freqs = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(freqs);

                if (draw === 'Bar')
                    drawFreqBars(ctx, freqs, WIDTH, HEIGHT);
                else if (draw === 'Wave')
                    drawFreqWave(ctx, freqs, WIDTH, HEIGHT);
            }

            requestAnimationFrame(renderFrame);
        }

        renderFrame();
        audio.play();
        record();
    });
}

function record()
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

        document.getElementById('vis-recording').textContent = 'Recording';
        document.getElementById('vis-recording').classList.add('recording');
    }

    function stopRecording() {
        mediaRecorder.stop();
        console.log('Recorded Blobs: ', recordedBlobs);
        video.controls = true;

        document.getElementById('vis-recording').textContent = 'Not Recording..';
        document.getElementById('vis-recording').classList.remove('recording');
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

document.addEventListener('DOMContentLoaded', function () {
    visualize();
});
