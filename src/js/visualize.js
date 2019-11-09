const audio     = document.getElementById('vis-audio');
const container = document.getElementById('vis-container');
const canvas    = document.getElementById('vis-canvas');
const file      = document.getElementById('vis-file');
const name      = document.getElementById('vis-name');

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
        const ctxAudio = new AudioContext();

        // use file as audio source
        let src = ctxAudio.createMediaElementSource(audio);
        const analyser = ctxAudio.createAnalyser();

        // sample frequency data using analyser
        src.connect(analyser);
        analyser.connect(ctxAudio.destination);
        analyser.fftSize = 16384;

        // the actual data, numbers where larger indicates louder, over frequency bands
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        audio.play();
        record();

        function renderFrame()
        {
            // always re-size in case client window changes
            canvas.width = canvas.getBoundingClientRect().width;
            canvas.height = canvas.getBoundingClientRect().height;

            // set width of frequency bar to ratio multiplied by size
            const barWidth = (canvas.width / dataArray.length) * canvas.height;
            // keep track of most recent bar x-axis
            let x = 0;

            // bar height varies by strength of frequency read from buffer
            let barHeight;
            analyser.getByteFrequencyData(dataArray);

            ctx.fillStyle = '#1d1d1d';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            let bars = 64;
            let r, g, b;
            let max = Math.max.apply(Math, dataArray);

            for (let i = 0; i < bars; ++i)
            {
                barHeight = (dataArray[i] / max) * 125;

                r = 128;
                g = 0;
                b = 255;

                if (dataArray[i] > 120)
                {
                    const min = dataArray[i] * 0.95;
                    const max = dataArray[i] * 1.05;

                    r = Math.floor(Math.random() * (max - min) + min);

                    if (dataArray[i] > 220)
                    {
                        g = 0.50 * Math.floor(Math.random() * (max - min) + min);
                    }
                    else if (dataArray[i] > 180)
                    {
                        g = 0.05 * Math.floor(Math.random() * (max - min) + min);
                    }
                }

                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(x, (canvas.height - barHeight), barWidth, barHeight);

                x += barWidth + 1;
            }

            // https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
            requestAnimationFrame(renderFrame);
        }

        requestAnimationFrame(renderFrame);
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
