class User {

    static usersUrl = "http://localhost:3000/users";
    static usernameFormContainer = document.querySelector("#usernameFormContainer");
    static dropdownDiv = document.querySelector("#usernameDropdownContainer")
    static dropdownMenu = document.createElement("select");
    
    constructor (name) {
        this.name = name;
    }

    static displayDropdownMenu () {
        fetch (User.usersUrl)
        .then(resp => resp.json())
        .then(json => {

            const label = document.createElement("label");
            
            label.innerHTML = "Select a user: ";
            label.htmlFor = "usernameDropdownMenu";

            User.dropdownMenu.name = "usernameDropdownMenu";
            User.dropdownMenu.id = "usernameDropdownMenu";

            // Add options to dropdown menu
            for (const user of json)
                User.createDropdownOption(user);            
            
            // Sort dropdown menu options in alphabetical order
            sortSelectOptions(User.dropdownMenu);

            // Attach dropdown to div
            User.dropdownDiv.appendChild(label).appendChild(User.dropdownMenu);
            
            // Hide dropdown menu if no usernames in db
            if (json.length === 0)
                User.dropdownDiv.style.display = "none"
                
            // Add additional User features
            User.createDeleteBtn();
            User.displayUsernameForm();

            User.dropdownMenu.addEventListener('change', (e) => {
                // let firstTime = true
                const optionValue = e.target.value;
                const deleteBtn = document.querySelector("#userDeleteBtn");

                // if (User.loadModel) {
                    // User.loadModel = false;
                    // usernameContainer.hidden  = true;
                    // modelLoading.hidden = false;
                    // model = initModel();
                // }

                document.getElementById("inputUsername").value = "";

                if (optionValue === "") {
                    mainView();
                } else {
                    about.hidden = true;
                    modelReady.hidden = false;
                    recordingBroken = false;
                    recordingError.hidden = true;
                    hideVisualizer();
                    updateRecordBtn('Record');

                    sortSelectOptions(User.dropdownMenu, optionValue);
                    User.dropdownMenu.value === "" ? deleteBtn.style.display = "none" : deleteBtn.style.display = "inline"

                    resetUIState();
                    // User.removeDefaultDropdownOption();
                    // User.usernameFormContainer.style.display = "none";
                }
            })
        })
        .catch(error => {
            serverError(error)
        });
        
    }

    static createDropdownOption(userData) {
        const option = document.createElement("option");

        option.value = userData.name;
        option.text = userData.name;
        option.id = userData.id;
        User.dropdownMenu.appendChild(option);    
    }

    static removeDefaultDropdownOption () {
        const usernameDefault = document.querySelector("#usernameDefault")

        if (usernameDefault)
            usernameDefault.remove();
    }

    static createDeleteBtn () {
        const deleteBtn = document.createElement("button");
        deleteBtn.id = "userDeleteBtn"
        deleteBtn.innerHTML = "Remove"
        User.dropdownDiv.appendChild(deleteBtn)

        // Hide delete btn if dropdown selection is "Existing User"
        User.validateDropdownSelection();
        
        deleteBtn.addEventListener('click', e => {
            const user = new User (User.dropdownMenu.value)
            user.remove();
            User.validateDropdownSelection();
        })
    }

    static validateDropdownSelection () {
        if (User.dropdownMenu.value === "")
            document.querySelector('#userDeleteBtn').style.display = "none"
    }

    remove () {
        const userOption = User.dropdownMenu.selectedOptions[0]
        const url = `${User.usersUrl}/${userOption.id}`
        const configObj = {
            method: 'DELETE',
            headers: {
                'Content-type': 'application/json; charset=UTF-8'
            }
        }

        fetch(url, configObj);
        userOption.remove();
        mainView();
    }

    static displayUsernameForm () {
        const formDiv = document.querySelector("#usernameFormContainer");
        const form = document.createElement("form");
        const input = document.createElement("input");
        const submit = document.createElement("input");
        
        form.id = "usernameForm"
        
        setAttributes(input, {
            "type": "text",
            "name": "username",
            "value": "",
            "placeholder": "Enter a username",
            "id": "inputUsername"
        })
        
        setAttributes(submit, {
            "type": "submit",
            "name": "submit",
            "value": "Submit",
            "placeholder": "Enter a username",
            "id": "submitUsernameBtn"
        })
        
        formDiv.appendChild(form);
        form.appendChild(input);
        form.appendChild(submit);
        
        form.addEventListener('submit', (e) => {
            const user = new User(e.target.username.value);
            
            e.preventDefault();
            user.post();
        })
    }
    
    post () {
        fetch (User.usersUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                name: this.name
            })
        })
        .then(resp => resp.json())
        .then(json => {

            const inputUsername = document.querySelector("#inputUsername");

            if (json.messages) {
                
                alert(json.messages.join("\n"));
                inputUsername.value = "";

            } else {
                // After submitting username, adjust app display
                User.dropdownDiv.style.display = "block";
                document.querySelector("#userDeleteBtn").style.display = "inline"
                inputUsername.value = "";

                about.hidden = true;
                modelReady.hidden = false;
                recordingBroken = false;
                recordingError.hidden = true;
                updateRecordBtn('Record');
                hideVisualizer();
                resetUIState();
                // User.usernameFormContainer.style.display = "none";  
                
                // Add new username in menu
                User.createDropdownOption(json);

                // Remove "Existing Users" default option in dropdown menu
                // User.removeDefaultDropdownOption();

                sortSelectOptions(User.dropdownMenu, json.name);
            }
        })
        .catch(error => {
            serverError(error)
        })
    }
}

class Recording {

    constructor (name) {
        this.name = name;
    }
}

//////////////////////////////////////////////////////////////////////
// Adapted code from Piano Scribe (https://piano-scribe.glitch.me/) //
//////////////////////////////////////////////////////////////////////

let visualizer;
let recorder;
let streamingBlob;
let isRecording = false;
let recordingBroken = false;
const PLAYERS = {};

let model = initModel();
let player = initPlayers();

// nextBtn.addEventListener('click', () => {
//     about.hidden = true;
//     modelReady.hidden = false;
//     User.displayDropdownMenu();
// })

btnRecord.addEventListener('click', () => {
    
    inputUsername.value = "";

    // Things are broken on old ios
    // navigator.media devices provides access to connected media input devices like cameras and microphones
    if (!navigator.mediaDevices) {
      recordingBroken = true;
      recordingError.hidden = false;
      btnRecord.hidden = true;
      return;
    }

    if (isRecording) {
        isRecording = false;
        updateRecordBtn();
        recorder.stop();
    } else {
        // Request permissions to record audio. This sometimes fails on Linux.
        navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {
            isRecording = true;
            updateRecordBtn();
            hideVisualizer();
            enableUsernameBtns(false);
            inputRecordingName.value = "";
            // The MediaRecorder API enables you to record audio and video
            recorder = new window.MediaRecorder(stream);
            // The dataavailable event is fired when the MediaRecorder delivers media data to your application for its use. The data is provided in a Blob object that contains the data
            recorder.addEventListener('dataavailable', (e) => {

                // Store blob to be used later (e.g., saving blob to App)
                streamingBlob = e.data;

                updateWorkingState(btnRecord);
                requestAnimationFrame(() => requestAnimationFrame(() => transcribeFromFile(e.data)));
            });
            recorder.start();
        }, () => {
            recordingBroken = true;
            btnRecord.disabled = true;
            recordingError.hidden = false;
            hideVisualizer();
        });
    }
});

visualizerContainer.addEventListener('click', () => {
    if (player.isPlaying()) {
      stopPlayer();
    } else {
      startPlayer();
    }
});

async function transcribeFromFile(blob) {
    hideVisualizer();

    model.transcribeFromAudioFile(blob).then((ns) => {
        PLAYERS.soundfont.loadSamples(ns).then(() => {
        visualizer = new mm.Visualizer(ns, canvas, {
            noteRGB: '255, 255, 255', 
            activeNoteRGB: '232, 69, 164', 
            pixelsPerTimeStep: window.innerWidth < 500 ? null: 80,
        });

        resetUIState();
        enableUsernameBtns(true);
        showVisualizer();
        });
    });
}

function stopPlayer() {
    player.stop();
    visualizerContainer.classList.remove('playing');
  }
  
function startPlayer() {
    visualizerContainer.scrollLeft = 0;
    visualizerContainer.classList.add('playing');
    mm.Player.tone.context.resume();
    player.start(visualizer.noteSequence);
}

function updateWorkingState(btnRecord) {
    about.hidden = true;
    transcribingMessage.hidden = false;
    btnRecord.classList.add('working');
  }

function updateRecordBtn(optionalTxt) {
    const el = btnRecord.firstElementChild;
    if (optionalTxt) {
        el.textContent = optionalTxt
    } else if (isRecording) {
        el.textContent = "Stop"
    } else {
        el.textContent = "Re-record"
        btnRecord.hidden = true;
    }
}

function resetUIState() {
    btnRecord.classList.remove('working');
    if (!recordingBroken) {
      btnRecord.removeAttribute('disabled');
    }
}

function hideVisualizer() {
    saveContainer.hidden = true;
    visualizerContainer.hidden = true;
}

function showVisualizer() {
    visualizerContainer.hidden = false;
    saveContainer.hidden = false;
    btnRecord.hidden = false;
    transcribingMessage.hidden = true;
    about.hidden = true;
  }

function saveMidi (event) {
    let name = inputRecordingName.value;
    event.stopImmediatePropagation();

    if (validateRecordingName(name)) {
        // const file = new File([mm.sequenceProtoToMidi(visualizer.noteSequence)], `${name}.midi`);
        const file = new File([mm.sequenceProtoToMidi(visualizer.noteSequence)], `${name}.midi`, {
            type: "audio/midi",
        });
        
        event.target.id === "saveToComputerBtn" ? saveMidiToComputer(file) : saveMidiToApp(name);
        name = "";
    } else {
        alert("Please enter a name for the recording")
    }
}

function saveMidiToComputer(file) {
    saveAs(file)
}

function saveMidiToApp (recordingName) {
    const user_id = usernameDropdownMenu.selectedOptions[0].id
    const url = `${User.usersUrl}/${user_id}/recordings`
    
    const formData = new FormData();
    formData.append('recording[name]', recordingName)
    formData.append('recording[user_id]', user_id)
    formData.append('recording[midi_data]', streamingBlob) 
    
    fetch (url, {
        method: 'POST',
        body: formData
    })
    .then(resp => resp.json())
    .then(json => {
        if (json.messages) {
            alert(json.messages.join("\n"));
            inputUsername.value = "";
        } else {

            // TODO
            // Update display
            // updateRecordBtn('Record');
            // hideVisualizer();
            // inputUsername.value = "";
            
            // Load history container
            // loadHistoryContainer(myBlob);
            
            // historyContainer.hidden = false;
            
        
            //// MAY NEED TO MOVE BELOW CODE
            // midi_data is a Data URL, which can be converted to a blob
            convertDataURLToBlob(json.midi_data)
            .then(blob => transcribeFromFile(blob))
        }
    })
    .catch(error => {
        serverError(error);
    });
    
    //// ALTERNATIVE CODE: Send json object with Data URL string to backend, which will be used to store code in a file and save to GCS
    // let base64data;
    // const reader = new FileReader;
    //// Convert blob to data: URL
    // reader.readAsDataURL(streamingBlob); 
    // reader.onloadend = function() {
    //// The result attribute contains base64 encoded data string as a "data: URL"
    //// Note: The blob's result cannot be directly decoded as Base64 without first removing the Data-URL declaration preceding the Base64-encoded data. To retrieve only the Base64 encoded string, first remove data:*/*;base64, from the result.
    //     base64data = reader.result;
    //     console.log(base64data)
    //     fetch (url, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             Accept: "application/json"
    //         },
    //         body: JSON.stringify({
    //             "name": recordingName,
    //             "user_id": user_id,
    //             "base64data": base64data,
    //         })
    //     })
    //     .then(resp => resp.json())
    //     .then(data => {
    //         convertToBlob(data.base64data)
    //         .then( blob => transcribeFromFile(blob))           
    //     })
    // }
}

async function convertDataURLToBlob(dataURL) {
    const response = await fetch(dataURL);
    const blob = await response.blob();
    return blob
}

function serverError(error) {
    alert("Sorry! We're experiencing problems with the server. Please refresh or try again later.")
    console.log(error);
}

function validateRecordingName(name) {
    return name.match(/^\s*$/) ? false : true
}

function loadHistoryContainer(data) {
    let btn = document.createElement('button');
    btn.innerHTML = "Play";
    historyContainer.appendChild(btn)
    btn.addEventListener('click', e => {
        console.log('play')

        // Get visualizer.noteSequence from file... (open/read midi file with js?)
        // let ns = 

        // visualizer = new mm.Visualizer(ns, canvas, {
        //     noteRGB: '255, 255, 255', 
        //     activeNoteRGB: '232, 69, 164', 
        //     pixelsPerTimeStep: window.innerWidth < 500 ? null: 80,
        // });

        // saveContainer.hidden = true;
        // showVisualizer();

        // Play song
    })
}

function cancelMidi(event) {
    hideVisualizer();
    updateRecordBtn('Record');

    recordingBroken = false;
    recordingError.hidden = true;
    resetUIState();
}

function enableUsernameBtns(state) {
    usernameDropdownMenu.disabled = !state;
    userDeleteBtn.disabled = !state;
    inputUsername.disabled = !state;
    submitUsernameBtn.disabled = !state;
}

function initModel () {
    // Magenta model to convert raw piano recordings into MIDI
    const model = new mm.OnsetsAndFrames('https://storage.googleapis.com/magentadata/js/checkpoints/transcription/onsets_frames_uni');

    model.initialize().then(() => {
        resetUIState();
        modelLoading.hidden = true;
        about.hidden = false;
        User.displayDropdownMenu();
        // modelReady.hidden = false;
    });

    // Things are slow on Safari.
    if (window.webkitOfflineAudioContext) {
        safariWarning.hidden = false;
    }
    
    // Things are very broken on ios12.
    if (navigator.userAgent.indexOf('iPhone OS 12_0') >= 0) {
        iosError.hidden = false;
        btnRecord.hidden = true;
    }
    return model;
}

function initPlayers() {
    PLAYERS.soundfont = new mm.SoundFontPlayer('https://storage.googleapis.com/magentadata/js/soundfonts/salamander');

    PLAYERS.soundfont.callbackObject = {
      run: (note) => {
        const currentNotePosition = visualizer.redraw(note);
  
        // See if we need to scroll the container.
        const containerWidth = visualizerContainer.getBoundingClientRect().width;
        if (currentNotePosition > (visualizerContainer.scrollLeft + containerWidth)) {
            visualizerContainer.scrollLeft = currentNotePosition - 20;
        }
      },
      stop: () => {visualizerContainer.classList.remove('playing')}
    };

    return PLAYERS.soundfont;
}

function mainView () {
    about.hidden = false;
    modelReady.hidden = true;
}

// Helper functions

function setAttributes(el, options) {

    for (const attr of Object.keys(options))
      el.setAttribute(attr, options[attr]);
 }

 function sortSelectOptions(selectElement, selectOption) {

     // Create array of options from select element
     const ary = (function(nl) {
        const a = [];
        for (let i = 0; i < nl.length; i++) {
            a.push(nl.item(i));
        }
        return a;
        })(selectElement.options);
        
    // Sort array (case insensitive)
    ary.sort(function(a,b){
        
        const aText = a.text.toLowerCase();
        const bText = b.text.toLowerCase();

        // If "Existing Users" option exists, place at top of list
        if (a.value === "") {
            return -1
        } else if (b.value === "") {
            return 1
        } else {
            return aText < bText ? -1 : aText > bText ? 1 : 0;
        }

    });
        
    // Remove options
    for (let i = 0; i < ary.length; i++) {
        selectElement.remove(ary[i].index);
    }
    
    // Add "Existing Users" as first option
    if (!selectOption && selectOption !== "") {
        const firstOption = document.createElement("option");
        firstOption.text = "Existing Users";
        firstOption.id = "usernameDefault";
        firstOption.value = "";
        selectElement.add(firstOption);
    }
    
    // Add all ordered options
    for (let i = 0; i < ary.length; i++) {
        selectElement.add(ary[i], null);
    }

    // Set dropdown menu value
    selectOption ? selectElement.value = selectOption : selectElement.selectedIndex = 0;
}