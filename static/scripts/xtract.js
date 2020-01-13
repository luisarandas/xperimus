
/*
//document.addEventListener('DOMContentLoaded', () => {
//    document.getElementById("startAudioCtx").addEventListener("click", () => {
console.log("testing listener on button;"); 
const audioContext = new AudioContext();
//Now we need to have the audio context take control of your HTML Audio Element.
// Select the Audio Element from the DOM
const htmlAudioElement = document.getElementById("audio");
// Create an "Audio Node" from the Audio Element
const source = audioContext.createMediaElementSource(htmlAudioElement);
// Connect the Audio Node to your speakers. Now that the audio lives in the
// Audio Context, you have to explicitly connect it to the speakers in order to
// hear it
source.connect(audioContext.destination);
console.log("ctx done");
//});    
//});

const levelRangeElement = document.getElementById("levelRange");

let mfcc_feature = [];

const chroma1 = document.getElementById("chroma1");
const chroma2 = document.getElementById("chroma2");
const chroma3 = document.getElementById("chroma3");
const chroma4 = document.getElementById("chroma4");
const chroma5 = document.getElementById("chroma5");
const chroma6 = document.getElementById("chroma6");
const chroma7 = document.getElementById("chroma7");
const chroma8 = document.getElementById("chroma8");
const chroma9 = document.getElementById("chroma9");
const chroma10 = document.getElementById("chroma10");
const chroma11 = document.getElementById("chroma11");
const chroma12 = document.getElementById("chroma12");

if (typeof Meyda === "undefined"){
    console.log("Meyda could not be found! Have you included it?");
} else {
    console.log(Meyda);
    // O callback do analyser esta ligado a source do actx
    const analyzer = Meyda.createMeydaAnalyzer({
        "audioContext": audioContext,
        "source": source,
        "bufferSize": 512,
        "featureExtractors": ["rms", "energy", "amplitudeSpectrum", "chroma"],
        "callback": features => {
            //console.log("RMS " + features.rms);
            //console.log("Energy " + features.energy);
            levelRangeElement.value = features.rms;
            chroma1.value = features.chroma[0];
            chroma2.value = features.chroma[1];
            chroma3.value = features.chroma[2];
            chroma4.value = features.chroma[3];
            chroma5.value = features.chroma[4];
            chroma6.value = features.chroma[5];
            chroma7.value = features.chroma[6];
            chroma8.value = features.chroma[7];
            chroma9.value = features.chroma[8];
            chroma10.value = features.chroma[9];
            chroma11.value = features.chroma[10];
            chroma12.value = features.chroma[11];
        }
    });
    analyzer.start();
}
*/

/* Test MMLL */

// It would be good to encode the tempo - test with two simple wav files
// Agora correlacionar o RMS e o Onset Detection com a nota - 
// Codificar uma progressão harmónica algoritmicamente - TEST WITH MOBILE



"use strict";

var i;
var audioblocksize = 256;
var chorddetector;
var onsetdetector;

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

var setup = function SetUp(sampleRate){
    console.log("Setting Up!");
    onsetdetector = new MMLLOnsetDetector(sampleRate);
    chorddetector = new MMLLChordDetector(sampleRate,2,0.5);
};

var callback = function CallBack(input, output, n){
    var chord = chorddetector.next(input.monoinput);
    console.log("chord", chord);
    document.getElementById('chordText').innerHTML = "Detected " + chord;

    var detection = onsetdetector.next(input.monoinput);
    if (detection) {
        console.log("Onset now!");
        var randomcolor = "rgb(" +(Math.floor(Math.random()*255.9999))+ "," +(Math.floor(Math.random()*255.9999))+ "," +(Math.floor(Math.random()*255.9999))+ ")";
        context.fillStyle = randomcolor;
        context.fillRect(0,0,canvas.width,canvas.height);
    }

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

//------

// Isto 

class xperimusFeatureCollector {
    constructor(blocks, onsets, chords, summedevidence, rchromaenergy){
        this._blocks = blocks;
        this._onsets = onsets;
        this._chords = chords;
        this._summedevidence = summedevidence;
        this._rchromaenergy = rchromaenergy;

        var yes = [];
    }
    addBlocks(v) {
        this.array = new Array();
        this.array.length = v;
        this.array.fill(0);
        this._blocks = this.array;
    }
    addOnsets(v) {
        //this._onsets.array.push(v);
    }
    addChords(x) {
        this._chords = x;
    }
    addSummedevidence(x) {
        this._summedevidence = x;
    }
    addChromaEnergy(x) {
        this._rchromaenergy = x;
    }
    get features() {
        return [this._blocks, '\n\n'];
    }
    /*set features(x) {
        this._blocks = new Array();
    }*/
}

var collector = new xperimusFeatureCollector();
 
function pressedStopButton(){
    console.log("jst prsd;");
}

// class xperimusFingerprinting
var classArray = new Array();

var xperimus1 = new Array();
var xperimus2 = new Array();
var xperimus3 = new Array();
var xperimus4 = new Array();
var xperimus5 = new Array();
var xperimus6 = new Array();
var xperimus7 = new Array();

var inputfile = document.getElementById('file-input'); //document.createElement('input');
        //inputfile.type = "file";
        //inputfile.style = "display: none;";
        
        inputfile.addEventListener("change",function uploadFile()
                                        {
                                   
                                   //arguments: array of features to extract, block size in samples, sampling rate
                                   //assumes that sampling rate is same for audio files to be loaded
                                   //assumes that no feature extractor has a window hop less than block size
                                   // VER DE QUE É O TAMANHO DA ARRAY MAS WORKS GOOD ON CHORD DETECTION

                                        var extractor = new MMLLFeatureExtractor(["MMLLOnsetDetector", "MMLLChordDetector", "MMLLSensoryDissonance"]);
                                        
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
                                            
                                            xperimus1.length = numblocks;
                                            xperimus1.fill(0);

                                            console.log("Which block " + blocknow + "Number of blocks " + numblocks);
                                            if(blocknow%200==0) console.log(blocknow/numblocks)
                                            };

                                   
                                   //returns a Promise
                                   extractor.analyseAudioFile(inputfile.files[0],updateFunction).then((results) => {
                                    for (var i = 0; i < results.length; i++){
                                        
                                        collector.addOnsets(results[i][0]);
                                        console.log("Xperimus Collector \n \n" + collector.features);    
                                        
                                        // NumSamples
                                        console.log("1 " + xperimus1);
                                        
                                        // Num Onsets Per Sample
                                        xperimus2.push(results[i][0]);
                                        console.log("2 " + xperimus2);

                                        // Num Chords Per Sample 
                                        xperimus3.push(results[i][1][0]);
                                        console.log("3 " + xperimus3);

                                        // Summed Evidence per 24 Options

                                        xperimus4.push(results[i][1][1]);
                                        console.log("4 " + xperimus4);

                                        // Raw (Leaky FFT) per chroma energy

                                        xperimus5.push(results[i][1][2]);
                                        console.log("5 " + xperimus5);

                                        // ~~ Dissonance 

                                        // xperimus5.push(results[i][2][0]); No need for dissonance
                                        // console.log("5 " + xperimus5);

                                        // Num Peaks Per Sample 

                                        //xperimus6.push(results[i][2][1]);
                                        //console.log("6 " + xperimus6);
                                        xperimus6.push(results[i][2][1]);
                                        console.log("6 " + xperimus6);

                                        searchFeaturesClass();
    
                                    }
                                       
                                       
                                    });
                                 
                                        }, false);


function searchFeaturesClass() {
}
/*audioContext = new window.AudioContext()
analyser = audioContext.createAnalyser();
const constraints = { audio: true, video: false };
navigator.mediaDevices.getUserMedia(constraints).then((str) => {
  const stream = str;
  source = this.audioContext.createMediaStreamSource(stream);
  source.connect(analyser);
});*/ 

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