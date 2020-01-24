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

var rapidLib = window.RapidLib();
var descriptorClassifier = new rapidLib.SeriesClassification();

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

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

var setup = function SetUp(sampleRate){
    console.log("Setting Up!");

    onsetdetector = new MMLLOnsetDetector(sampleRate);

    chorddetector = new MMLLChordDetector(sampleRate,2,0.5);

    mmllloudness = new MMLLLoudness(sampleRate);

    sensorydissonance = new MMLLSensoryDissonance(sampleRate); //accept defaults otherwise

    sr = sampleRate;
    qitch = new MMLLQitch(sampleRate,4096); //accept defaults otherwise

};

var callback = function CallBack(input, output, n){

    sones = mmllloudness.next(input.monoinput);
    chord = chorddetector.next(input.monoinput);
    dissonance = sensorydissonance.next(input.monoinput);

    freq = qitch.next(input.monoinput);
    
    midipitch = qitch.m_midipitch;

    document.getElementById('chordText').innerHTML = "Detected " + chord;

    //xperimusDynamicTimeWarping(m.toFixed(0));
    var k = freq;
    var l = midipitch;
    var m = sones;

    var detection = onsetdetector.next(input.monoinput);
    if (detection) {

    rapidlibSoundData(soundState, chord, sones, dissonance, freq, midipitch);

    console.log("chord", chord, "sones", m.toFixed(0), "dissonance ", dissonance[0], "freq", k.toFixed(0), "midipitch", l.toFixed(0));
    console.log("Onset now! ---------------------------");
    var randomcolor = "rgb(" +(Math.floor(Math.random()*255.9999))+ "," +(Math.floor(Math.random()*255.9999))+ "," +(Math.floor(Math.random()*255.9999))+ ")";
    context.fillStyle = randomcolor;
    context.fillRect(0,0,canvas.width,canvas.height);
    }

    matcher._chords = chord;
    matcher._sones = sones;
    matcher._onsets = detection;


    /* Qitch also */ 

    for (i=0; i<n; i++){
        output.outputL[i] = input.inputL[i];
        output.outputR[i] = input.inputR[i];
    }
};

function setThreshold(newValue){
    var threshold = parseFloat(newValue)*0.01;
    onsetdetector.threshold = threshold;
}

var gui = new MMLLBasicGUISetup(callback,setup,audioblocksize,true,true);

function setKeyDecay(newValue) {
    chorddetector.keydecay = parseFloat(newValue)*0.1;
}

function setChromaLeak(newValue) {
    chorddetector.chromaleak = parseFloat(newValue)*0.01;
}

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

console.log("write in the div if 20 come");

// -----------------------------------------------------------------------------
var soundMLTrain = null;
var _match = -1;
var _costs = [-1, -1];

var trainingEx1 = { 
    input: {
        x1: []
        //x3: [],
        //x4: [],
        //x5: []
    }, 
    label: "sound1"
};
var trainingEx2 = { 
    input: {
        x1: []        
        //x3: [],
        //x4: [],
        //x5: []
    }, 
    label: "sound2"
};
var trainingEx3 = { 
    input: {
        x1: []
        //x3: [],
        //x4: [],
        //x5: []
    }, 
    label: "final"
};


function rapidlibSoundData(soundState, chord, m, dissonance, k, l) {
    //console.log("data for training ", chord, m, dissonance[0], k, l);
    var v = parseInt(m);
    switch(soundMLTrain) {
        case 1: 
            trainingEx1.input.x1.push(chord[0], v);
            /*trainingEx1.input.x3.push(dissonance[0]);
            trainingEx1.input.x4.push(k);
            trainingEx1.input.x5.push(l);*/
            console.log("EX 1 ", trainingEx1);
            break;
        case 2:
            console.log("stopped 1");
            break;
        case 3:
            trainingEx2.input.x1.push(chord[0], v);
            /*trainingEx2.input.x3.push(dissonance[0]);
            trainingEx2.input.x4.push(k);
            trainingEx2.input.x5.push(l);*/
            console.log("EX 2 ", trainingEx2);
            break;
        case 4:
            console.log("stopped 2");
            break; 
        case 5:
            trainingEx3.input.x1.push(chord[0], v);
            /*trainingEx3.input.x3.push(dissonance[0]);
            trainingEx3.input.x4.push(k);
            trainingEx3.input.x5.push(l);*/
            console.log("EX 3 ", trainingEx3);
            break;
        case 6:
            console.log("stopped 3");
            break;
        case 7:
            trainAndRunRapid();
            soundMLTrain = null;
            break;
    }
}

function recordSound(v){
    if (v == 1) {
        soundMLTrain = 1;
    }
    if (v == 2) {
        soundMLTrain = 2;
    }
    if (v == 3) {
        soundMLTrain = 3;
    }
    if (v == 4) {
        soundMLTrain = 4;
    }
    if (v == 5) {
        soundMLTrain = 5;
    }
    if (v == 6) {
        soundMLTrain = 6;
    }
    if (v == 7) {
        soundMLTrain = 7;
    }
}
function trainAndRunRapid(){
    console.log("train and test against");

    descriptorClassifier.reset();

    var seriesSet = [trainingEx1, trainingEx2];

    descriptorClassifier.train(seriesSet);

    _match = descriptorClassifier.run(trainingEx3);
    
    _costs = descriptorClassifier.getCosts();
    
    console.log("testSet ", trainingEx3);
    console.log("match ", _match);
    console.log("costs ", _costs);
}


// -----------------------------------------------------------------------------


var myDTW = new rapidLib.SeriesClassification();
console.log("dtw ", myDTW);
// arrays para hold two training examples and one to test against
var trainingExample1 = { input: [], label: "shape 1"};
var trainingExample2 = { input: [], label: "shape 2"};
var testSeries = [];

var recordState = 0;
var match = -1;
var costs = [-1, -1];

//this pushes the mouse postition into the correct set
//Called from mouse listener
function recorder(mouseID, rapidInput) {
    switch (recordState) {
        case 1:
            if (mouseID == "shape1") {
                trainingExample1.input.push(rapidInput);
            }
            break;
        case 2:
            if (mouseID == "shape2") {
                trainingExample2.input.push(rapidInput);
            }
            break;
        case 3:
            if (mouseID == "shapeTest") {
                console.log("pushTest");
                testSeries.push(rapidInput);
            }
            break;
    }
}

//Train and classify! Called on mouse up in the test set
function rapidLib_train_run() {

    //clear out the model
    myDTW.reset();
    //train it on an array of training examples
    var seriesSet = [trainingExample1, trainingExample2];
    myDTW.train(seriesSet);
    //run on a test series
    match = myDTW.run(testSeries);
    //get the costs of all matches
    costs = myDTW.getCosts();

    console.log("testSet ", testSeries);
    console.log("match ", match);
    console.log("costs ", costs);
}

///////////////////////////////////////////////////////////////////////// INPUT

var mouseX;
var mouseY;
var mouseID;



var shape1 = document.getElementById("shape1");
var context1 = shape1.getContext("2d");
shape1.addEventListener('mousemove', getMouse, false);
shape1.onmousedown = function() {
    trainingExample1.input = [];
    testSeries = [];
    match = -1;
    recordState = 1;
};
shape1.onmouseup = function() {
    recordState = 0;
    console.log("ts1 length: ", trainingExample1.input.length);
};

var shape2 = document.getElementById("shape2");
var context2 = shape2.getContext("2d");
shape2.addEventListener('mousemove', getMouse, false);
shape2.onmousedown = function() {
    trainingExample2.input = [];
    testSeries = [];
    match = -1;
    recordState = 2;
};
shape2.onmouseup = function() {
    recordState = 0;
    console.log("ts2 length: ", trainingExample2.input.length);
};

var shapeTest = document.getElementById("shapeTest");
var contextTest = shapeTest.getContext("2d");
shapeTest.addEventListener('mousemove', getMouse, false);
shapeTest.onmousedown = function() {
    testSeries = [];
    recordState = 3;
};
shapeTest.onmouseup = function() {
    recordState = 0;
    console.log("s1t ", trainingExample1);

    //Machine Learning functions (above)
    rapidLib_train_run();
};

function getMouse(mousePosition) {
    if (mousePosition.offsetX || mousePosition.offsetX === 0) { 
        mouseID = mousePosition.path[0].id;
        mouseX = mousePosition.offsetX; 
        mouseY = mousePosition.offsetY;
    } else if (mousePosition.layerX || mousePosition.layerX === 0) {
        mouseX = mousePosition.layerX;
        mouseY = mousePosition.layerY;
    }
    
    //This records the mouse position into the proper training or test set
    var rapidInput = [mouseX, mouseY];
    recorder(mouseID, rapidInput);
}

/////////////////////////////////////////////////////////////// DRAWING

var fonts = "Lato, sans-serif";
var rapidGreen = "#18db5c";
var rapidOrange = "#FF9D75";

function drawInContext(context, tSet) {
    context.clearRect(0,0, 400, 400);
        
    //mouse coordinates
    context.font = "16px " + fonts;
    context.fillStyle = rapidGreen;
    context.fillText('mouse position: (' + mouseX + ', ' + mouseY + ')' , 20, 390);
    
    context.strokeStyle = rapidGreen;
    context.lineWidth = 2;
    if ((context === context1 && match === "shape 1") || (context === context2 && match === "shape 2")) {
        context.lineWidth=10;
        context.strokeStyle = rapidOrange;
    } 
    var x = 0;
    var y = 0;
    if (tSet[0]) {
        x = tSet[0][0];
        y = tSet[0][1];
        context.beginPath();
        context.moveTo(x, y);
        for (var i = 1; i < tSet.length; ++i) {
            x = tSet[i][0];
            y = tSet[i][1];
            context.lineTo(x,y);
        }
        context.stroke();
        context.closePath();
    }
}

function draw() {
    //Draw the recorded paths
    drawInContext(context1, trainingExample1.input);
    drawInContext(context2, trainingExample2.input);
    drawInContext(contextTest, testSeries);
    
    //Draw the data
    contextTest.font = "16px " + fonts;
    contextTest.fillStyle = rapidOrange;
    var matchText = "no match yet";
    switch (match) {
        case -1:
            matchText = "no match yet";
            break;
        case "shape 1":
            matchText = "matches left shape";
            break;
        case "shape 2":
            matchText = "matches right shape";
            break;
    }
    
    contextTest.fillText(matchText , 20, 20);
    if (costs[0] > 0) {
    contextTest.fillText("match costs:", 20, 40);
    contextTest.fillText("left " + costs[0], 25, 60);
    contextTest.fillText("right " + costs[1], 25, 80);

    }
    window.requestAnimationFrame(draw);
}
window.requestAnimationFrame(draw);


/* Speech Model - need the require walkthrough 
https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/audio
*/

const URL = 'file://model/'

async function createModel() {
    const checkpointURL = URL + 'model.json';
    const metadataURL = URL + 'metadata.json';
    const recognizer = speechCommands.create('BROWSER_FFT', undefined, checkpointURL, metadataURL);

    await recognizer.ensureModelLoaded();

    return recognizer;
}

async function init() {
    const recognizer = await createModel();
    const classLabels = recognizer.wordLabels();
    const labelContainer = document.getElementById('label-container');
    for (let i = 0; i < classLabels.length; i++) {
        labelContainer.appendChild(document.createElement('div'));
    }
    recognizer.listen(result => {
        const scores = result.scores;
        for (let i = 0; i < classLabels.length; i++) {
            const classPrediction = classLabels[i] + ': ' + result.scores[i].toFixed(2);
            labelContainer.childNodes[i].innerHTML = classPrediction;
        }
    }, {
        includeSpectrogram: true,
        probabilityThreshold: 0.75,
        invokeCallbackOnNoiseAndUnknown: true,
        overlapFactor: 0.50
    });
}
