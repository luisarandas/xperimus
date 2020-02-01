// It would be good to encode the tempo - test with two simple wav files
// Codificar uma progressão harmónica algoritmicamente - TEST WITH MOBILE
// Add Dynamic Mapping of Mic Stream && secure login
// Nome
// Chrome blocks non secure hosts

// Navigate to chrome://flags/#unsafely-treat-insecure-origin-as-secure
// Find and enable the `Insecure origins treated as secure` section (see below).
// Add any addresses you want to ignore the secure origin policy for. Remember to include the port number too (if required).
// Save and restart Chrome.

// const ; async and await ; http://asmjs.org/ ; https://medium.com/@kelin2025/so-you-wanna-use-es6-modules-714f48b3a953
// https://blog.acolyer.org/2016/05/11/searching-and-mining-trillions-of-time-series-subsequences-under-dynamic-time-warping/
// https://www.audiolabs-erlangen.de/fau/professor/mueller/demos
// https://github.com/0xfe/vexflow
// https://github.com/borismus/spectrogram
// https://codelabs.developers.google.com/codelabs/tensorflowjs-audio-codelab/index.html#5
// https://github.com/miguelmota/spectrogram connect analyser directly
// https://github.com/a-vis/spectrum
// https://github.com/mattdesl/spectrum

// pre build android apps

class xperimusFeatureCollector {

    constructor(blocks, onsets, chords, summedevidence, rchromaenergy, peakamps, dissonance, sones, centroid, rms){
        
        this._blocks = blocks;
        this._onsets = onsets;
        this._chords = chords;
        this.__chords = [];
        this._summedevidence = summedevidence;
        this._rchromaenergy = rchromaenergy;
        this._peakamps = peakamps;
        this._dissonance = dissonance;
        this._sones = sones;
        this._centroid = centroid;
        this._rms = rms;

        this.onsetsArray = [];
        this.chordsArray = [];
        this.summedEvid = [];
        this.chromaEnerg = [];
        this.peaksArray = [];
        this.dissonanceArray = [];
        this.sonesArray = [];
        this.centroidArray = [];
        this.rmsArray = [];
    }
    // static
    addBlocks(v) {
        this.array = new Array();
        this.array.length = v;
        this.array.fill(0);
        this._blocks = this.array;
    }
    addOnsets(v) {
        this.onsetsArray.push(v);
        this._onsets = this.onsetsArray;
    }
    addChords(v) {
        this.chordsArray.push(v);
        this._chords = this.chordsArray;
    }
    addSummedevidence(v) {
        this.summedEvid.push(v);
        this._summedevidence = this.summedEvid;
    }
    addChromaEnergy(v) {
        this.chromaEnerg.push(v);
        this._rchromaenergy = this.chromaEnerg;
    }
    addDissonance(v) {
        this.dissonanceArray.push(v);
        this._dissonance = this.dissonanceArray;
    }
    addPeakAmps(v) {
        this.peaksArray.push(v);
        this._peakamps = this.peaksArray;
    }
    addCentroid(v) {
        this.centroidArray.push(v);
        this._centroid = this.centroidArray;
    }
    addSones(v) {
        this.sonesArray.push(v);
        this._sones = this.sonesArray;
    }
    addRootMeamSquare(v) {
        this.rmsArray.push(v);
        this._rms = this.rmsArray;
    }
    get features() {
        return [this._blocks, '\n', this._onsets, '\n', this._chords, '\n', this._summedevidence, '\n', this._rchromaenergy, '\n', this._peakamps, '\n', this._dissonance, '\n', this._sones, '\n', this._centroid, '\n', this._rms, '\n'];
    }
}

class realTimeFeatureMatcher extends xperimusFeatureCollector {
    constructor(...args) {
        super(...args);
    }
    matchChordDatabase() {
        var relatedArray = [6, 12, 18, 22];
        for (i = 0; i < relatedArray.length; i++) {
            console.log(" Go through matrix");
        }
    }
}

"use strict";

var collector = new xperimusFeatureCollector();
var matcher = new realTimeFeatureMatcher();

var i;
var audioblocksize = 256;
var chorddetector;
var onsetdetector;
var sones = 0;
var chord = -1;
var mmllloudness;
var sensorydissonance;
var dissonance = 0;
var qitch, sr;
var freq=440, midipitch=69;

var soundState = "rec1";

var setup = function SetUp(sampleRate){
    console.log("Setting Up!");

    onsetdetector = new MMLLOnsetDetector(sampleRate);

    chorddetector = new MMLLChordDetector(sampleRate,2,0.5);

    mmllloudness = new MMLLLoudness(sampleRate);

    sensorydissonance = new MMLLSensoryDissonance(sampleRate); //accept defaults otherwise

    qitch = new MMLLQitch(sampleRate,4096); //accept defaults otherwise

};

var callback = function CallBack(input, output, n){

    sones = mmllloudness.next(input.monoinput);
    chord = chorddetector.next(input.monoinput);
    dissonance = sensorydissonance.next(input.monoinput);

    freq = qitch.next(input.monoinput);

    midipitch = qitch.m_midipitch;

    var k = freq;
    var l = midipitch;
    var m = sones;

    var detection = onsetdetector.next(input.monoinput);
    if (detection) {

    //rapidlibSoundData(soundState, chord, sones, dissonance, freq, midipitch);
    //console.log("chord", chord, "sones", m.toFixed(0), "dissonance ", dissonance[0], "freq", k.toFixed(0), "midipitch", l.toFixed(0));
    }

    matcher._chords = chord;
    matcher._sones = sones;
    matcher._onsets = detection;

    for (i=0; i<n; i++){
        output.outputL[i] = input.inputL[i];
        output.outputR[i] = input.inputR[i];
    }
};

var gui = new MMLLBasicGUISetup(callback,setup,audioblocksize,true,true);


//---------------------------------

var inputfile = document.getElementById('file-input'); //document.createElement('input');
        //inputfile.type = "file";
        //inputfile.style = "display: none;";
        
        inputfile.addEventListener("change",function uploadFile()
                                        {
                                   
                                   //arguments: array of features to extract, block size in samples, sampling rate
                                   //assumes that sampling rate is same for audio files to be loaded
                                   //assumes that no feature extractor has a window hop less than block size
                                        
                                        /* Melhor forma de fazer isto */ 
                                        collector._blocks = [];
                                        collector._onsets = [];
                                        collector._chords = [];
                                        collector.__chords = [];
                                        collector._summedevidence = [];
                                        collector._rchromaenergy = [];
                                        collector._peakamps = [];
                                        collector._dissonance = [];
                                        collector._sones = [];
                                        collector._centroid = [];
                                        collector._rms = [];
                                        collector.onsetsArray = [];
                                        collector.dissonanceArray = [];
                                        collector.chordsArray = [];
                                        collector.summedEvid = [];
                                        collector.chromaEnerg = [];
                                        collector.peaksArray = [];
                                        collector.array = [];
                                        collector.sonesArray = [];
                                        collector.centroidArray = [];
                                        collector.rmsArray = [];

                                        var extractor = new MMLLFeatureExtractor(["MMLLOnsetDetector", "MMLLChordDetector", "MMLLSensoryDissonance", "MMLLSpectralCentroid", "MMLLLoudness", "MMLLRMS"]);
                                        
                                        // Blocksize tends to be == as Buffersize = delay in samples from 0 to 1;
                                        // var numblocks = Math.ceil(self.sampleplayer.lengthinsampleframes/self.audioblocksize);
                                        // Isto vem dividido em blocs pois cada array vem junta
                                        // User o sensory dissonance e ver os chromas

                                        var updateFunction = function(blocknow,numblocks) {
                                            /* Array.prototype.set0 = function(v) {
                                                var i, n = this.length;
                                                for (i, 0; i < n; i++) {
                                                    this[i] = v;
                                                }
                                            } 
                                            
                                            xperimus1.set0(numblocks); */
                                            collector.addBlocks(numblocks);

                                            //console.log("Which block " + blocknow + "Number of blocks " + numblocks);
                                            //if (blocknow%200==0) console.log(blocknow/numblocks)

                                            };

                                   
                                   //returns a Promise
                                   extractor.analyseAudioFile(inputfile.files[0],updateFunction).then((results) => {
                                    for (var i = 0; i < results.length; i++){
                                        
                                        collector.addOnsets(results[i][0]);
                                        collector.addChords(results[i][1][0]);
                                        collector.addSummedevidence(results[i][1][1]); // self.m_key Summed Evidence Per 24 Options
                                        collector.addChromaEnergy(results[i][1][2]); // self.chroma Raw (leaky fft frame by frame) per chroma energy
                                        collector.addDissonance(results[i][2][0]);
                                        collector.addPeakAmps(results[i][2][1]);
                                        collector.addCentroid(results[i][3]);
                                        collector.addSones(results[i][4]);
                                        collector.addRootMeamSquare(results[i][5]);
                                        
                                        /*
                                        collector.addCentroid(results[i][3][0]);
                                        console.log("Xperimus Collector \n \n" + collector.features);    
                                        */    
                                    }
                                       
                                    });
                                 
                                        }, false);


function searchFeaturesClass() {

    console.log(collector);

    const indexOfAll = (arr, val) => arr.reduce((acc, el, i) => (el === val ? [...acc, i] : acc), []);
    console.log(indexOfAll(collector._onsets, 1), "Onsets");

    var onsetIndexes = indexOfAll(collector._onsets, 1);

    var newCorrelatedChords = [];
    collector._chords.forEach(function(key, value) {
        for (i = 0; i < onsetIndexes.length; i++) {
            if (value == onsetIndexes[i]) {
                newCorrelatedChords.push(key);
                if (newCorrelatedChords.length == onsetIndexes.length) {
                    console.log(newCorrelatedChords, "Chords in Onsets")
                }
            }
        }
    });

    var summedEvidenceArray = collector._summedevidence[0];
    summedEvidenceArray = summedEvidenceArray.map(function(v){
        return Number(v.toFixed(1));
    });
    var chromaEnergyArray = collector._rchromaenergy[0];
    chromaEnergyArray = chromaEnergyArray.map(function(v) {
        return Number(v.toFixed(1));
    });
    var ndissonanceArray = collector._dissonance;
    ndissonanceArray = ndissonanceArray.map(function(v) {
        return Number(v.toFixed(7));
    });
    var npeakampsArray = collector._peakamps[0];
    npeakampsArray = npeakampsArray.map(function(v) {
        return Number(v.toFixed(2));
    });
    var nsonesArray = collector._sones;
    nsonesArray = nsonesArray.map(function(v) {
        return Number(v.toFixed(0));
    });

    collector.__chords = [...collector._chords];
    var checker = collector.__chords;
    for (i = 0; i < checker.length; i++) {
        if (checker[i] == 0) { checker[i] = "C+"; }
        if (checker[i] == 1) { checker[i] = "C#+"; }
        if (checker[i] == 2) { checker[i] = "D+"; }
        if (checker[i] == 3) { checker[i] = "D#+"; }
        if (checker[i] == 4) { checker[i] = "E+"; }
        if (checker[i] == 5) { checker[i] = "F+"; }
        if (checker[i] == 6) { checker[i] = "F#+"; }
        if (checker[i] == 7) { checker[i] = "G+"; }
        if (checker[i] == 8) { checker[i] = "G#+"; }
        if (checker[i] == 9) { checker[i] = "A+"; }
        if (checker[i] == 10) { checker[i] = "A#+"; }
        if (checker[i] == 11) { checker[i] = "B+"; }
        if (checker[i] == 12) { checker[i] = "C-"; }
        if (checker[i] == 13) { checker[i] = "C#-"; }
        if (checker[i] == 14) { checker[i] = "D-"; }
        if (checker[i] == 15) { checker[i] = "D#-"; }
        if (checker[i] == 16) { checker[i] = "E-"; }
        if (checker[i] == 17) { checker[i] = "F-"; }
        if (checker[i] == 18) { checker[i] = "F#-"; }
        if (checker[i] == 19) { checker[i] = "G-"; }
        if (checker[i] == 20) { checker[i] = "G#-"; }
        if (checker[i] == 21) { checker[i] = "A-"; }
        if (checker[i] == 22) { checker[i] = "A#-"; }
        if (checker[i] == 23) { checker[i] = "C-"; }
    }

    var ncentroidArray = collector._centroid;
    ncentroidArray = ncentroidArray.map(function(v) {
        return Number(v.toFixed(6));
    });
    var nrmsArray = collector._rms;
    nrmsArray = nrmsArray.map(function(v) {
        return Number(v.toFixed(4));
    });

    collector._summedevidence = summedEvidenceArray;
    collector._rchromaenergy = chromaEnergyArray;
    collector._dissonance = ndissonanceArray;
    collector._peakamps = npeakampsArray;
    collector._sones = nsonesArray;
    collector._centroid = ncentroidArray;
    collector._rms = nrmsArray;

    var newCorrelatedSones = [];
    var _newCorrelatedSones = Array.from(collector._sones);

    collector._sones.forEach(function(key, value) {
        for (i = 0; i < onsetIndexes.length; i++) {
            if (value == onsetIndexes[i]) {
                newCorrelatedSones.push(key);
                if (newCorrelatedSones.length == onsetIndexes.length) {
                    console.log(newCorrelatedSones, "Sones in Onsets")
                }
            }
        }
    });
    _newCorrelatedSones = _newCorrelatedSones.sort((a, b) => a - b);
    var e = _newCorrelatedSones.slice(Math.max(_newCorrelatedSones.length - 5, 1));
    // Go through the value
    // const found = newCorrelatedSones.some(r => _newCorrelatedSones.indexOf(r) >= 0);
    console.log(e, "Highest Sones in Sample");

}

//Array.prototype.diff = function()
var new_scale = []; // new
var static_arr = [5, 10, 20]; // old

function xperimusDynamicTimeWarping(v) {
    
    var searchMatrix = function() {
        /* if (search !== undefined) {
            return search;
        } */
    }
    this.searchMatrix = searchMatrix;
}




// -----------------------------------------------------------------------------
/* also -> Speech Model - need the require walkthrough 
https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/audio
*/
/*Plotly.plot('myDiv',[{
    y:[getData()],
    type:'line'
}]);
var cnt = 0;*/


let recognizer;
let transferWords;
let transferDurationMultiplier; 
let transferModelNameInput;

const XFER_MODEL_NAME = 'xfer-model';
const MIN_EXAMPLES_PER_CLASS = 8;

const downloadAsFileButton = document.getElementById('download-dataset');
const enterLearnWordsButton = document.getElementById('enter-learn-words');

async function app() {

 recognizer = speechCommands.create('BROWSER_FFT');
 //await recognizer.populateSavedTransferModelsSelect();

 await recognizer.ensureModelLoaded().then(() => {
    transferModelNameInput = `model-${getDateString()}`;
    console.log(transferModelNameInput);

    const transferRecognizer = recognizer.createTransfer('colors');
 }).catch(err => {});
 buildModel();
}

const BACKGROUND_NOISE_TAG = speechCommands.BACKGROUND_NOISE_TAG;

app();

// 1F = ~23ms of audio we use 5 for 100ms
const NUM_FRAMES = 3; 
let examples = [];
var a = [];

var cdetect = new MMLLChordDetector(44100,2,0.5);
var new_node = 0;

const normalizeBetweenTwoRanges = (val, minVal, maxVal, newMin, newMax) => {
    return newMin + (val - minVal) * (newMax - newMin) / (maxVal - minVal);
};

let collecWordButtons = {};
let datasetViz;

var spectro = Spectrogram(document.getElementById('canvas'), {
    audio: {
      enable: false
    },
    colors: function(steps) {
        var baseColors = [[0,0,255,1], [0,255,255,1], [0,255,0,1], [255,255,0,1], [ 255,0,0,1]];
        var positions = [0, 0.15, 0.30, 0.50, 0.75];
    
        var scale = new chroma.scale(baseColors, positions)
        .domain([0, steps]);
    
        var colors = [];
    
        for (var i = 0; i < steps; ++i) {
          var color = scale(i);
          colors.push(color.hex());
        }
    
        return colors;
    }
});

function collect(label) {
    if (recognizer.isListening()) {
        return recognizer.stopListening();
    }
    if (label == null) {
        return;
    }
    if (label == 0) {
        console.log("add labels");
        // https://github.com/tensorflow/tfjs-models/blob/master/speech-commands/README.md
    }
        // await transferRecognizer.collectExample('red');
    
    recognizer.listen(async ({spectrogram: {frameSize, data}}) => {
        // Since we want to use short sounds instead of words to control the slider, we are taking into consideration only the last 3 frames (~70ms):
                
        let vals = normalize(data.subarray(-frameSize * NUM_FRAMES));
        examples.push({vals, label});

        /*array = new Uint8Array(recognizer.audioDataExtractor.analyser.frequencyBinCount);
        recognizer.audioDataExtractor.analyser.getByteFrequencyData(array);
        
        var newFFTSize = recognizer;
        newFFTSize.audioDataExtractor.analyser.fftSize = 512;
        _array = new Float32Array(newFFTSize.audioDataExtractor.analyser.frequencyBinCount);  
        recognizer.audioDataExtractor.analyser.getFloatTimeDomainData(_array); 
            
        for (var i = 0; i < _array.length; ++i) {
                _x = _array[i];
                if(_x>1.0) _x = 1.0;
                if(_x<-1.0) _x = -1.0;
                absx = Math.abs(_x);
                _array[i] = (absx > 1e-15 && absx < 1e15) ? _x : 0.;
        }*/
        
        /*new_node = recognizer.audioDataExtractor.audioContext.createScriptProcessor(256, 1, 1);
        new_node.onaudioprocess = function(audioProcessingEvent) {
            var inputBuffer = audioProcessingEvent.inputBuffer;
            var outputBuffer = audioProcessingEvent.outputBuffer;
            for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
                var inputData = inputBuffer.getChannelData(channel);
                var outputData = inputBuffer.getChannelData(channel);

                for (var sample = 0; sample < inputBuffer.length; sample++) {
                    
                }
            }
        }
        new_node.connect(recognizer.audioDataExtractor.audioContext.destination);*/

        /*var spectAnalyser = recognizer;
        spectAnalyser.audioDataExtractor.analyser.smoothingTimeConstant = 0;
        spectAnalyser.audioDataExtractor.analyser.fftSize = 2048;
        spectro.connectSource(spectAnalyser.audioDataExtractor.analyser, recognizer.audioDataExtractor.audioContext)
        spectro.start();*/


        /*array1 = new Uint8Array(recognizer.audioDataExtractor.analyser.frequencyBinCount);
        recognizer.audioDataExtractor.analyser.getByteTimeDomainData(array1);*/
               
        document.querySelector('#console').textContent =
            `${examples.length} examples collected`;
    }, {
        overlapFactor: 0.999,
        includeSpectrogram: true,
        //overlapFactor - 0-1 => each soectrogram is 1000ms this is 0.25 
        //prediction will happen every 250ms
        invokeCallbackOnNoiseAndUnknown: true,
        probabilityThreshold: 0.75
        //include embedding - internal activation from the model
    });
}

function normalize(x) {
    const mean = -100;
    const std = 10;
    return x.map(x => (x - mean) / std);
}

const INPUT_SHAPE = [NUM_FRAMES, 232, 1]; 
// where each frame is 23ms of audio containing 232 numbers (buckets to capture human voice -> frequencies -> change for piano)
let model;

async function train() {
    toggleButtons(false);
    const ys = tf.oneHot(examples.map(e => e.label), 3);
    const xsShape = [examples.length, ...INPUT_SHAPE];
    const xs = tf.tensor(flatten(examples.map(e => e.vals)), xsShape);

    await model.fit(xs, ys, {
        batchSize: 16,
        epochs: 10,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                document.querySelector('#console').textContent = 
                `Accuracy: ${(logs.acc * 100).toFixed(1)}% Epoch: ${epoch +1}`;
            }
        }
    });
    tf.dispose([xs, ys]);
    toggleButtons(true);
}
//o modelo tem 4 layers: uma Conv para processar audio data como espectrograma, uma max pool layer, uma flatten layer, e uma dense layer that maps to the 3 actions:
function buildModel() {
    model = tf.sequential();
    model.add(tf.layers.depthwiseConv2d({
        depthMultiplier: 8,
        kernelSize: [NUM_FRAMES, 3],
        activation: 'relu',
        inputShape: INPUT_SHAPE
    }));
    model.add(tf.layers.maxPooling2d({poolSize: [1, 2], strides: [2, 2]}));
    model.add(tf.layers.flatten());
    model.add(tf.layers.dense({units: 3, activation: 'softmax'}));

    const optimizer = tf.train.adam(0.01);
    model.compile({
        optimizer,
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
    });
}
function toggleButtons(enable) {
    document.querySelectorAll('button').forEach(b => b.disabled = !enable);
}

function flatten(tensors) {
    const size = tensors[0].length;
    const result = new Float32Array(tensors.length * size);
    tensors.forEach((arr, i) => result.set(arr, i * size));
    return result;
}

async function moveSlider(labelTensor) {
    const label = (await labelTensor.data())[0];
    document.getElementById('console').textContent = label;
    if (label == 2) {
      return;
    }
    let delta = 0.1;
    const prevValue = +document.getElementById('output').value;
    document.getElementById('output').value =
        prevValue + (label === 0 ? -delta : delta);
}

function getData() {
    return Math.random();
}
function listen() {
    if (recognizer.isListening()) {
      recognizer.stopListening();
      toggleButtons(true);
      document.getElementById('listen').textContent = 'Listen';
      return;
    }
    toggleButtons(false);
    document.getElementById('listen').textContent = 'Stop';
    document.getElementById('listen').disabled = false;
   
    recognizer.listen(async ({spectrogram: {frameSize, data}}) => {
      const vals = normalize(data.subarray(-frameSize * NUM_FRAMES));
      const input = tf.tensor(vals, [1, ...INPUT_SHAPE]);
      const probs = model.predict(input);

      probs.array().then(array => {
        var _v = array[0][0];
        var __v = array[0][1];
        var ___v = array[0][2];
        console.log("1 ", _v.toFixed(2)/1 *100 + "%");
        console.log("2 ", __v.toFixed(2)/1 * 100 + "%");
        console.log("3 ", ___v.toFixed(2)/1 * 100 + "%");
        console.log("1 ", _v.toFixed(2) + "%");
        console.log("2 ", __v.toFixed(2) + "%");
        console.log("3 ", ___v.toFixed(2) + "%");

        addData(myChart, _v, __v, ___v);

        /*Plotly.extendTraces('myDiv', { y: [[_v]] }, [0]);
        cnt++;
        if (cnt > 500) {
            Plotly.relayout('chart',{
                xaxis: {
                    range: [cnt-500,cnt]
                }
            });
        }*/
        
      }); 
    
      //console.log(probs.print());

      const predLabel = probs.argMax(1);
      await moveSlider(predLabel);
      tf.dispose([input, probs, predLabel]);

    }, {
      overlapFactor: 0.999,
      includeSpectrogram: true,
      invokeCallbackOnNoiseAndUnknown: true,
      probabilityThreshold: 0.75
    });
}

function getDateString() {
    const d = new Date();
    const year = `${d.getFullYear()}`;
    let month = `${d.getMonth() + 1}`;
    let day = `${d.getDate()}`;
    if (month.length < 2) {
      month = `0${month}`;
    }
    if (day.length < 2) {
      day = `0${day}`;
    }
    let hour = `${d.getHours()}`;
    if (hour.length < 2) {
      hour = `0${hour}`;
    }
    let minute = `${d.getMinutes()}`;
    if (minute.length < 2) {
      minute = `0${minute}`;
    }
    let second = `${d.getSeconds()}`;
    if (second.length < 2) {
      second = `0${second}`;
    }
    return `${year}-${month}-${day}T${hour}.${minute}.${second}`;
}

downloadAsFileButton.addEventListener('click', () => {
    const basename = getDateString();
    const artifacts = recognizer.serializeExamples();
  
    // Trigger downloading of the data .bin file.
    const anchor = document.createElement('a');
    anchor.download = `${basename}.bin`;
    anchor.href = window.URL.createObjectURL(
        new Blob([artifacts], {type: 'application/octet-stream'}));
    anchor.click();
});

// -------------------------------------------------------------------------

var ctx = document.getElementById('myChart').getContext('2d');
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Red', 'Blue', 'Yellow'],
        datasets: [{
            label: 'prediction',
            data: [55, 25, 92],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});

function addData(chart, v1, v2, v3) {
    chart.data.datasets[0].data[0] = v1;
    chart.data.datasets[0].data[1] = v2;
    chart.data.datasets[0].data[2] = v3;
    chart.update(0);
}


