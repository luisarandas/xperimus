// It would be good to encode the tempo - test with two simple wav files
// Codificar uma progressão harmónica algoritmicamente - TEST WITH MOBILE
// Add Dynamic Mapping of Mic Stream && secure login
// Nome

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
    matchChordDatabase = function () {
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
var mmllloudness;
var sensorydissonance;
var dissonance = 0;
var qitch, sr;
var freq=440, midipitch=69;

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
    var chord = chorddetector.next(input.monoinput);
    dissonance = sensorydissonance.next(input.monoinput);

    freq = qitch.next(input.monoinput);
    
    midipitch = qitch.m_midipitch;

    var k = freq;
    var l = midipitch;
    var m = sones;
    console.log("chord", chord, "sones", m.toFixed(0), "dissonance ", dissonance[0], "freq", k.toFixed(0), "midipitch", l.toFixed(0));
    document.getElementById('chordText').innerHTML = "Detected " + chord;

    var detection = onsetdetector.next(input.monoinput);
    if (detection) {
        console.log("Onset now! ---------------------------");
        var randomcolor = "rgb(" +(Math.floor(Math.random()*255.9999))+ "," +(Math.floor(Math.random()*255.9999))+ "," +(Math.floor(Math.random()*255.9999))+ ")";
        context.fillStyle = randomcolor;
        context.fillRect(0,0,canvas.width,canvas.height);
    }

    matcher._chords = chord;
    matcher._sones = sones;
    matcher._onsets = detection;
    //console.log("RT Description ", chord, sones, detection, dissonance[0]);

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
    //Array.prototype.diff 

}

/* Transfer Learning Example */

/*
let recognizer;

function predictWord() {
 // Array of words that the recognizer is trained to recognize.
 const words = recognizer.wordLabels();
 recognizer.listen(({scores}) => {
   // Turn scores into a list of (score,word) pairs.
   scores = Array.from(scores).map((s, i) => ({score: s, word: words[i]}));
   // Find the most probable word.
   scores.sort((s1, s2) => s2.score - s1.score);
   document.querySelector('#console').textContent = scores[0].word;
 }, {probabilityThreshold: 0.75});
}

async function app() { 
 recognizer = speechCommands.create('BROWSER_FFT');
 await recognizer.ensureModelLoaded();
 predictWord();
}

app();*/