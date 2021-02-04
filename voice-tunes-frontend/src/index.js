class User {

    static usersUrl = "http://localhost:3000/users";
    static usernameFormContainer = document.querySelector("#usernameFormContainer");
    static dropdownDiv = document.querySelector("#usernameDropdownContainer");
    static dropdownMenu = document.createElement("select");
    
    constructor (name) {
        this.name = name;
    }

    static displayDropdownMenu () {
        fetch (User.usersUrl)
        .then(resp => resp.json())
        .then(json => {

            const label = document.createElement("label");
            const orDiv = document.createElement('div');
            
            label.innerHTML = "select a user";
            label.htmlFor = "usernameDropdownMenu";
            User.dropdownMenu.name = "usernameDropdownMenu";
            User.dropdownMenu.id = "usernameDropdownMenu";
            orDiv.id = 'orDiv';
            orDiv.innerText = 'or';

            // Add options to dropdown menu
            for (const user of json)
                User.createDropdownOption(user);            
            
            // Sort dropdown menu options in alphabetical order
            sortSelectOptions(User.dropdownMenu);

            // Attach elements to DOM
            User.dropdownDiv.appendChild(label);
            User.dropdownDiv.appendChild(User.dropdownMenu);
            User.dropdownDiv.insertAdjacentElement('afterend', orDiv);
                
            // Add additional User features
            User.createDeleteBtn();
            User.displayUsernameForm();

            User.dropdownMenu.addEventListener('change', (e) => {
                const optionValue = e.target.value;

                // Reset display
                document.getElementById("inputUsername").value = "";
                // noRecordingsMessage.hidden = true;
                // historyContainer.insertAdjacentElement('beforebegin', noRecordingsMessage);

                if (optionValue === "") {
                    mainView();
                } else {
                    recordingError.hidden = true;
                    reviewSection.hidden = true;
                    recordingSection.hidden = false;
                    usernameDeleteBtn.hidden = false;
                    recordingBroken = false;
                    updateRecordBtn('record');

                    historySection.hidden = true; // Hide history section to prevent user from seeing below operations
                    hideVisualizerHistory(); // Must go before removeAllChildNodes
                    removeAllChildNodes(historyContainer);
                    loadHistoryContainer();
                    setTimeout(function() {historySection.hidden = false;}, 500);

                    sortSelectOptions(User.dropdownMenu, optionValue);
                    resetUIState(); // necessary?
                }
            })
        })
        .catch(error => {
            serverError(error);
        });
    }

    static createDropdownOption(userData) {
        const option = document.createElement("option");

        option.value = userData.name;
        option.text = userData.name;
        option.id = userData.id;
        User.dropdownMenu.appendChild(option);    
    }

    static createDeleteBtn () {
        const deleteBtn = document.createElement("input");

        setAttributes(deleteBtn, {
            "id": "usernameDeleteBtn",
            "type": "image",
            "src": "subtract-icon-bw.png",
            "alt": "Delete",
            "title": "Remove user",
        });

        // Hide element before appending to DOM
        deleteBtn.hidden = true;
        User.dropdownDiv.appendChild(deleteBtn);
        
        deleteBtn.addEventListener('click', e => {
            const result = confirm('Are you sure you want to delete this user?')

            if (result) {
                const user = new User (User.dropdownMenu.value);
                user.remove();
            }
        })
    }

    static displayUsernameForm () {
        const formDiv = document.querySelector("#usernameFormContainer");
        const label = document.createElement("label");
        const form = document.createElement("form");
        const input = document.createElement("input");
        const submit = document.createElement("input");
        
        form.id = "usernameForm";
        label.innerHTML = "add a user";
        label.htmlFor = "inputUsername";
        
        setAttributes(input, {
            "type": "text",
            "name": "username",
            "value": "",
            "placeholder": "Enter a username",
            "id": "inputUsername"
        });
        
        setAttributes(submit, {
            "type": "image",
            "name": "submit",
            "alt": "Submit",
            "src": "add-icon-bw.png",
            "id": "submitUsernameBtn",
            "title": "Add user"
        });
        
        formDiv.appendChild(form);
        form.appendChild(label);
        form.appendChild(input);
        form.appendChild(submit);
        
        form.addEventListener('submit', (e) => {
            const user = new User(e.target.username.value);
            
            e.preventDefault();
            user.post();
        })
    }
    
    remove() {
        const userOption = User.dropdownMenu.selectedOptions[0];
        const url = `${User.usersUrl}/${userOption.id}`;
        const configObj = {
            method: 'DELETE',
            headers: {
                'Content-type': 'application/json; charset=UTF-8'
            }
        };

        fetch(url, configObj);
        userOption.remove();
        mainView();
    }

    post() {
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

            inputUsername.value = "";

            if (json.messages) {
                alert(json.messages.join("\n"));
            } else {

                // After submitting username, adjust app display
                // User.dropdownDiv.style.display = "block"; // necessary?
                // usernameDeleteBtn.style.display = "inline" // necessary?
                usernameDeleteBtn.hidden = false;
                
                reviewSection.hidden = true;
                recordingSection.hidden = false;
                historySection.hidden = false;

                recordingBroken = false;
                recordingError.hidden = true;
                updateRecordBtn('record');
                
                // Add new username in menu
                User.createDropdownOption(json);
                
                removeAllChildNodes(historyContainer);
                
                // Must occur after createDropdownOption
                sortSelectOptions(User.dropdownMenu, json.name);

                // Must occur after sortSelectOptions and removeAllChildNodes
                loadHistoryContainer();
                
                resetUIState(); // necessary?
            }
        })
        .catch(error => {
            serverError(error)
        })
    }
}

class Recording {

    constructor (json) {
        this.id = json.id;
        this.name = json.name;
        this.user_id = json.user_id
    }

    get recordingUrl() {
        return `${User.usersUrl}/${this.user_id}/recordings/${this.id}`
    }
        
    play(e) {

        fetch (this.recordingUrl)
        .then(resp => resp.json())
        .then(json => {

            if (json.messages) {
                alert(json.messages.join("\n"));
            } else {
                // midi_data is a Data URL, which can be converted to a blob
                convertDataURLToBlob(json.midi_data)
                .then(blob => {

                    // Actions before play button event
                    const nameElement = e.target.parentElement.firstChild
                    nameElement.insertAdjacentElement('beforebegin', transcribingMessageHistory)
                    nameElement.hidden = true;
                    transcribingMessageHistory.hidden = false;

                    btnRecord.disabled = true;
                    enableAllBtns(false);

                    // transcribeFromFile includes all actions after transcription
                    transcribeFromFile(blob, true, e);
                })
            }
        })
        .catch(error => {
            serverError(error);
        })
    }

    remove(e) {
        const configObj = {
            method: 'DELETE',
            headers: {
                'Content-type': 'application/json; charset=UTF-8'
            }
        };
        
        fetch(this.recordingUrl, configObj);

        // If remove is called from a playback click event (i.e. not from renaming recording)
        if (e) {
            const recordingDiv = e.target.parentElement.parentElement
            
            if (recordingDiv.contains(visualizerContainerHistory))
                hideVisualizerHistory();

            recordingDiv.remove();
            
            if (historyContainerIsEmpty())
                noRecordingsMessage.hidden = false; 
            
        }
    }

    download(e) {
        fetch (this.recordingUrl)
        .then(resp => resp.json())
        .then(json => {

            if (json.messages) {
                alert(json.messages.join("\n"));
            } else {    

                const recordingDiv = e.target.parentElement.parentElement;
                let recoverVisualizer = false;

                // Actions before transcribing file
                recordingDiv.prepend(downloadingMessageHistory);
                enableAllBtns(false);
                btnRecord.disabled = true;
                showDisabledRecordingImage();
                downloadingMessageHistory.hidden = false;

                // Remember visualizer if being used by a recordingDiv
                if (recordingDiv.contains(visualizerContainerHistory) && visualizerContainerHistory.hidden === false){
                        visualizerContainerHistory.hidden = true;
                        recoverVisualizer = true;
                }

                // Trancribe file then send to user to download
                convertDataURLToBlob(json.midi_data)
                .then(blob => {
                    model.transcribeFromAudioFile(blob).then((ns) => {
                        PLAYERS.soundfont.loadSamples(ns).then(() => {

                        const tempVisualizer = new mm.Visualizer(ns, canvas, {
                            noteRGB: '255, 255, 255', 
                            activeNoteRGB: '232, 69, 164', 
                            pixelsPerTimeStep: window.innerWidth < 500 ? null: 80,
                        });
                        const file = new File([mm.sequenceProtoToMidi(tempVisualizer.noteSequence)], `${this.name}.midi`, {
                            type: "audio/midi",
                        });

                        // Actions after transcription
                        saveMidiToComputer(file)
                        enableAllBtns(true);
                        recordingBroken ? brokenSettings() : btnRecord.disabled = false;
                            
                        downloadingMessageHistory.hidden = true;
                        visualizerContainerHistory.appendChild(downloadingMessageHistory);

                        // Place back visualizer back in same position before transcription process
                        if (recoverVisualizer)
                            visualizerContainerHistory.hidden = false

                        })
                    })
                })
            }
        })
        .catch(error => {
            console.log(error)
            serverError(error);
        })
    }

    // 'Options' is used when renaming a recording. It requires the following:
    // referenceElement --> The div before which the recording will be added
    // addVisualizer --> true/false
    // addHr --> true/false
    // 'addHrOnly' used when adding a single recording to the history container. It requires a boolean.
    // If 'addHrOnly' is true, 'options' will be ignored

    addToContainer(options, addHrOnly) {
        const recordingDiv = document.createElement('div');
        const visualizerDiv = document.createElement('div');
        const recordingGrid = document.createElement('div');
        const name = document.createElement('p')
        const playBtn = document.createElement('input');
        const deleteBtn = document.createElement('input');
        const downloadBtn = document.createElement('input');
        const allRecordingBtns = [name, playBtn, downloadBtn, deleteBtn] // remove unnecessary buttons
    
        // Set ids, class names, and text
        recordingGrid.className = 'recordingGrid';
        recordingGrid.id = this.name;
        recordingGrid.dataset.recordingId = this.id;
        name.innerText = this.name

        setAttributes(playBtn, {
            "type": "image",
            "src": "play-w.png",
            "alt": "Play recording",
            "class": "playBtn",
            "title": "Play",
        });

        setAttributes(deleteBtn, {
            "type": "image",
            "src": "delete-w.png",
            "alt": "Delete recording",
            "class": "deleteBtn" ,
            "title": "Remove recording",
        });

        setAttributes(downloadBtn, {
            "type": "image",
            "src": "save-comp-1.png",
            "alt": "Save recording to computer",
            "class": "downloadBtn",
            "title": "Save MIDI to computer",
        });

        recordingDiv.className = "recordingDiv"
        visualizerDiv.className = "visualizerDiv"

        // Add event listeners
        playBtn.addEventListener('click', e => this.play(e))
        deleteBtn.addEventListener('click', e => this.remove(e))
        downloadBtn.addEventListener('click', e => this.download(e))

        // Add/remove elements
        for (const element of allRecordingBtns) {
            recordingGrid.appendChild(element);
        }

        // recordingDiv.append(closeVisualizerHistoryBtn)
        recordingDiv.append(recordingGrid)       
        recordingDiv.append(visualizerDiv)

        if (addHrOnly) {
            const hr = document.createElement('hr')
            hr.className = "hrRecordingAfter"
            recordingDiv.append(hr)   
            historyContainer.prepend(recordingDiv)

        } else if (options) {

            if (options.addHr) {
                const hr = document.createElement('hr')
                hr.className = "hrRecordingAfter"
                recordingDiv.append(hr)    
            }
            
            options.referenceElement.insertAdjacentElement('beforebegin', recordingDiv)

            if (options.addVisualizer) {
                visualizerDiv.appendChild(transcribingMessageHistory)
                visualizerDiv.appendChild(visualizerContainerHistory)
                showVisualizerHistory();
            }

        } else {

            historyContainer.prepend(recordingDiv)
        }
        
        // Edit recording name - jQuery

        const recordingUrl = this.recordingUrl
        const outgoingRecording = this
        
        $(name).on("dblclick", function(e){
            
            // Actions before clicking outside edit box
            const currentValue = $(this).text();
            enableAllBtns(false);
            btnRecord.disabled = true;
            showDisabledRecordingImage();

            if (player.isPlaying())
                player.stop();

            $(name).html(`<input class="inputRename" id="newName" value="${currentValue}">`);
            $("#newName").focus();
            $("#newName").focus(function() {
                console.log('in'); // Remove?
            }).blur(function() {
                const newName = $("#newName").val();
                
                // Actions after clicking outside edit box
                fetch (recordingUrl)
                .then(resp => resp.json())
                .then(json => {

                    if (json.messages) {
                        alert(json.messages.join("\n"));
                    } else {

                        convertDataURLToBlob(json.midi_data)
                        .then(blob => {

                            // Create new recording
                            const formData = new FormData();
                            formData.append('recording[name]', newName)
                            formData.append('recording[user_id]', json.user_id)
                            formData.append('recording[outgoing_id]', json.id)
                            formData.append('recording[midi_data]', blob)

                            fetch (`${User.usersUrl}/${json.user_id}/recordings`, {
                                    method: 'POST',
                                    body: formData
                            })
                            .then(resp => resp.json())
                            .then(json => {

                                if (json.messages) {
                                    alert(json.messages.join("\n"));
                                } else {

                                    // Append to historyContainer
                                    const recording = new Recording(json);
                                    let addVisualizer;
                                    let addHr;
                                    
                                    recordingDiv.contains(visualizerContainerHistory) ? addVisualizer = true : addVisualizer = false;
                                    recordingDiv.querySelector('.hrRecordingAfter') ? addHr = true : addHr = false;

                                    recording.addToContainer({
                                        referenceElement: recordingDiv,
                                        addVisualizer: addVisualizer,
                                        addHr: addHr,
                                    });

                                    // Delete old recording in db, GCS, and DOM
                                    outgoingRecording.remove();
                                    recordingDiv.remove();

                                    // Restore buttons
                                    enableAllBtns(true);
                                    btnRecord.disabled = false;
                                    showStartRecordingImage();
                                }
                            })
                            .catch(error => {
                                serverError(error);
                            })
                        })
                    }
                })
            })
        })
    }
}

//////////////////////////////////////////////////////////////////////
// Adapted code from Piano Scribe (https://piano-scribe.glitch.me/) //
//////////////////////////////////////////////////////////////////////

const PLAYERS = {};
let visualizer;
let visualizerHistory;
let recorder;
let streamingBlob;
let isRecording = false;
let recordingBroken = false;
let model = initModel();
let player = initPlayers();
let playerHistory = initPlayersHistory();


// Remove this later
// modelLoading.hidden = true;
// usernameContainer.hidden = false;
// User.displayDropdownMenu();

btnRecord.addEventListener('click', () => {
    
    inputUsername.value = "";

    // Things are broken on old ios
    // navigator.media devices provides access to connected media input devices like cameras and microphones
    if (!navigator.mediaDevices) {
      recordingBroken = true;
      brokenSettings();
      return;
    }

    if (isRecording) {
        isRecording = false;
        updateRecordBtn('loading');
        btnRecord.disabled = true;
        recorder.stop();

    } else {
        // Request permissions to record audio. This sometimes fails on Linux.
        navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {
            isRecording = true;
            updateRecordBtn('stop');
            reviewSection.hidden = true;
            // hideVisualizer(); // Must occur before transcribeFromFile().
            // saveContainer.hidden = true;
            enableAllBtns(false);
            visualizerContainer.style.pointerEvents = "none";
            visualizerContainerHistory.style.pointerEvents = "none";
            inputRecordingName.value = "";

            // saveContainer.insertAdjacentElement('beforebegin' ,transcribingMessage)
            // saveContainer.insertAdjacentElement('beforebegin', visualizerContainer)

            // The MediaRecorder API enables you to record audio and video
            // The dataavailable event is fired when the MediaRecorder delivers media data to your application for its use. The data is provided in a Blob object that contains the data
            // streamingBlob stores blob to be used later (e.g., saving blob to App)
            recorder = new window.MediaRecorder(stream);
            recorder.addEventListener('dataavailable', (e) => {
                streamingBlob = e.data;
                updateWorkingState(btnRecord); // necessary?
                requestAnimationFrame(() => requestAnimationFrame(() => transcribeFromFile(e.data, false)));
            });

            recorder.start();
        }, () => {

            recordingBroken = true;
            brokenSettings();

            // If rejecting player from review section (not from play button event)
            // if (!saveContainer.hidden) {
            //     reviewHeader.hidden = true;
            //     saveContainer.hidden = true;
            //     historySection.hidden = false;
            //     hideVisualizer();
            // }
        })
    }
});

closeVisualizerHistoryBtn.addEventListener('click', (e) => {
    if (!e) var e = window.event;
	e.cancelBubble = true;
    // if (e.stopPropagation) e.stopPropagation();

    hideVisualizerHistory();
    enableAllBtns(true);
});

visualizerContainer.addEventListener('click', (e) => {
    player.isPlaying() ? stopPlayer() : startPlayer();
});

// Merge with above?
visualizerContainerHistory.addEventListener('click', () => {
    playerHistory.isPlaying() ? stopPlayerHistory() : startPlayerHistory();
});


async function transcribeFromFile(blob, isOriginHistory, playBtnEvent) {
    
    // Actions before transcription


    // [Consider removing later] Don't think it's necessary to differentiate btwn PLAYERS.soundfont and PLAYERS.soundfontHistory
    // let playersSoundFont;
    // console.log(isOriginHistory)
    // isOriginHistory ? playersSoundFont = PLAYERS.soundfontHistory : playersSoundFont = PLAYERS.soundfont;
    // console.log(playersSoundFont)

    model.transcribeFromAudioFile(blob).then((ns) => {
        PLAYERS.soundfont.loadSamples(ns).then(() => {
        
        const visualizerSettings = {
            noteRGB: '255, 255, 255', 
            // activeNoteRGB: '237, 240, 73',
            activeNoteRGB: '109, 227, 248',
            pixelsPerTimeStep: window.innerWidth < 500 ? null: 80,
        }

        // Actions after transcription (isOriginHistory = user clicks on 'play' from an existing recording)

        if (isOriginHistory) {
            const recordingGrid = playBtnEvent.target.parentElement
            const nameElement = recordingGrid.querySelector('p')
            const visualizerDiv = recordingGrid.parentElement.querySelector('.visualizerDiv')

            transcribingMessageHistory.hidden = true;
            visualizerContainerHistory.prepend(downloadingMessageHistory)
            visualizerContainerHistory.prepend(transcribingMessageHistory)

            nameElement.hidden = false;    

            visualizerHistory = new mm.Visualizer(ns, canvasHistory, visualizerSettings);
            visualizerDiv.appendChild(visualizerContainerHistory)
            visualizerContainerHistory.hidden = false;
            showPlayIconHistory(true);
            playBtnEvent.target.disabled = true;

        } else {
            visualizer = new mm.Visualizer(ns, canvas, visualizerSettings);
            // reviewHeader.hidden = false;
            // saveContainer.hidden = false;
            reviewSection.hidden = false;
            btnRecordText.removeAttribute("class") // Removes 'pulse' class, if exists
            updateRecordBtn('re-record')
            // showVisualizer();
            showPlayIcon(true);
        }
        
        resetUIState(); // Remove?
        btnRecord.disabled = false;
        enableAllBtns(true);
        visualizerContainer.style.pointerEvents = "auto";
        visualizerContainerHistory.style.pointerEvents = "auto";
        });
    });
}

function stopPlayer() {
    recordingBroken ? brokenSettings() : btnRecord.disabled = false;
    enableAllBtns(true);
    showPlayIcon(true);
    player.stop();
    // visualizerContainer.classList.remove('playing');
  }

// Merge with above?
  function stopPlayerHistory() {
    recordingBroken ? brokenSettings() : btnRecord.disabled = false;
    enableAllBtns(true);
    showPlayIconHistory(true);
    playerHistory.stop();
    // visualizerContainerHistory.classList.remove('playing');
  }

function startPlayer() {
    btnRecord.disabled = true;
    enableAllBtns(false);
    showPlayIcon(false);

    visualizerContainer.scrollLeft = 0;
    // visualizerContainer.classList.add('playing');
    mm.Player.tone.context.resume();
    player.start(visualizer.noteSequence);
}

// Merge with above?

function startPlayerHistory() {
    btnRecord.disabled = true;
    enableAllBtns(false);
    showPlayIconHistory(false);

    visualizerContainerHistory.scrollLeft = 0;
    // visualizerContainerHistory.classList.add('playing');
    mm.Player.tone.context.resume();
    playerHistory.start(visualizerHistory.noteSequence);
}

function showPlayIcon(state) {
    playIcon.hidden = !state;
    stopIcon.hidden = state;
}

// Merge with above?
function showPlayIconHistory(state) {
    playIconHistory.hidden = !state;
    stopIconHistory.hidden = state;
}

function updateWorkingState(btnRecord) {
    about.hidden = true;
    btnRecord.classList.add('working');
  }

function updateRecordBtn(state) {
    const el = btnRecordText;
    
    switch (state) {

        case 'record':
            el.textContent = "start recording";
            showStartRecordingImage();
            btnRecordText.hidden = false;
            console.log('start')
            break;

        case 'stop':
            el.textContent = "stop recording"
            showStopRecordingImage();
            btnRecordText.hidden = false;
            console.log('stop')            
            break;

        case 're-record':
            el.textContent = "re-record"
            showStartRecordingImage();
            btnRecordText.hidden = false;
            console.log('re-record')
            break;

        // case 'playing': // is this used?
        //     // el.textContent = "playing"
        //     el.classList = "pulse"
        //     showDisabledRecordingImage();
        //     btnRecordText.hidden = false;
        //     console.log('disabled')
        //     break;

        case 'loading':
            el.textContent = "loading"
            el.classList = "pulse"
            showDisabledRecordingImage();
            btnRecordText.hidden = false;
            console.log('loading')
            break;

        // default:
        //     break;
    }
  
}

function showStartRecordingImage() {
    setAttributes(btnRecord, {
        "type": "image",
        "src": "record-on-b.png",
        "alt": "Start recording",
    });
}

function showStopRecordingImage() {
    setAttributes(btnRecord, {
        "type": "image",
        "src": "record-off-b.png",
        "alt": "Stop recording",
    });
}

function showDisabledRecordingImage() {
    setAttributes(btnRecord, {
        "type": "image",
        "src": "record-disabled-b.png",
        "alt": "Disable recording",
    });
}

function resetUIState() {
    btnRecord.classList.remove('working');
    if (!recordingBroken) {
      btnRecord.removeAttribute('disabled');
    }
}

// function hideVisualizer() {
    // recordingSection.insertAdjacentElement('afterend', transcribingMessage)
    // downloadingMessage.insertAdjacentElement('afterend', visualizerContainer)
    // saveContainer.insertAdjacentElement('beforebegin', downloadingMessage) // necessary?
    // transcribingMessage.hidden = true;
    // downloadingMessage.hidden = true;
    // visualizerContainer.hidden = true;
// }

function hideVisualizerHistory() {
    historyHeader.insertAdjacentElement('afterend', visualizerContainerHistory)
    visualizerContainerHistory.insertAdjacentElement('afterend', transcribingMessageHistory) // necessary?
    transcribingMessageHistory.insertAdjacentElement('afterend', downloadingMessageHistory) // necessary?
    visualizerContainerHistory.hidden = true;
    transcribingMessageHistory.hidden = true; // necessary?
    downloadingMessageHistory.hidden = true; // necessary?
}

function showVisualizer() {
    visualizerContainer.hidden = false;
    playIcon.hidden = false;
    btnRecord.hidden = false;
    transcribingMessage.hidden = true;
    about.hidden = true;
  }

function showVisualizerHistory() {
    visualizerContainerHistory.hidden = false;
    playIconHistory.hidden = false;
    btnRecord.hidden = false;
    transcribingMessageHistory.hidden = true;
    about.hidden = true;
}

function saveMidi(e) {
    let name = inputRecordingName.value;

    e.stopImmediatePropagation(); // necessary?
    inputUsername.value = "";

    if (validateRecordingName(name)) {
        const file = new File([mm.sequenceProtoToMidi(visualizer.noteSequence)], `${name}.midi`, {
            type: "audio/midi",
        });

        e.target.id === "saveToComputerBtn" ? saveMidiToComputer(file) : saveMidiToApp(name);
        name = "";
    } else {
        alert("Please enter a name for the recording")
    }
}

function saveMidiToComputer(file) {
    saveAs(file);
}

function saveMidiToApp (recordingName) {
    const user_id = usernameDropdownMenu.selectedOptions[0].id;
    const url = `${User.usersUrl}/${user_id}/recordings`;
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

        } else {
            // Append to historyContainer
            const recording = new Recording(json);
            
            // If historyContainer is empty do not add hr
            historyContainerIsEmpty() ? recording.addToContainer() : recording.addToContainer({}, true);
            
            noRecordingsMessage.hidden = true;
            closeVisualizer();

            // OPTIONAL: Update display
            // updateRecordBtn('record');
            // inputRecordingName.value = "";
            // hideVisualizer();
            // historySection.hidden = false;
            // reviewHeader.hidden = true;
            // saveContainer.hidden = true;

            // OPTIONAL: Show alert (to be used if above code is commented)
            // alert("Saved!")

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
    })
    .catch(error => {
        serverError(error);
    });
}

async function convertDataURLToBlob(dataURL) {
    const response = await fetch(dataURL);
    const blob = await response.blob();
    return blob
}

function serverError(error) {
    alert("Sorry! We're experiencing problems with the server. Please refresh or try again later.")
}

function validateRecordingName(name) {
    return name.match(/^\s*$/) ? false : true;
}

function loadHistoryContainer() {

    const user_id = usernameDropdownMenu.selectedOptions[0].id
    const url = `${User.usersUrl}/${user_id}/recordings`
    
    fetch (url)
    .then(resp => resp.json())
    .then(json => {
        
        if (json.length > 0) {
            // Add a hr after each recording div except for first recording
            for (let i=0; i < json.length; i++) {
                const recording = new Recording(json[i]);
                recording.addToContainer();

                if (i !== 0) {
                    const recordingDiv = document.querySelector(`[data-recording-id='${recording.id}']`).parentElement
                    // const recordingDiv = document.querySelector(`.recordingGrid#${recording.name}`).parentElement
                    const hr = document.createElement("hr")

                    hr.className = "hrRecordingAfter"
                    recordingDiv.append(hr)
                }
            }
            noRecordingsMessage.hidden = true;
        } else {
            noRecordingsMessage.hidden = false;
        }
    })
}

// This is also the 'close' feature after a recording session
function closeVisualizer(e) {

    // If function is triggered by clicking closeVisualizerBtn, do not fire visualizerContainer click event
    if (e) {
        if (!e) var e = window.event;
        e.cancelBubble = true;
        // if (e.stopPropagation) e.stopPropagation();
    }

    // const result = confirm('Are you sure you want to close this recording? Any unsaved recordings cannot be recovered.')

    // if (result) {
        reviewSection.hidden = true;
        inputUsername.value = "";
        inputRecordingName.value = "";
        updateRecordBtn('record');
        recordingBroken = false;
        recordingError.hidden = true;
        resetUIState(); // necessary?
    // }

}

function enableAllBtns(state) {
    const recordingBtnClasses = [".playBtn", ".deleteBtn", ".downloadBtn", ".closeVisualizerHistoryBtn"] // not sure if .closeVisualizerHistoryBtn is necessary (disabling double click event on container should have already disabled element)

    // Intro section - username form
    usernameDropdownMenu.disabled = !state;
    usernameDeleteBtn.disabled = !state;
    inputUsername.disabled = !state;
    submitUsernameBtn.disabled = !state;

    // Review section
    closeVisualizerBtn.disabled = !state; // not sure this is necessary (above code should have already disabled element)
    inputRecordingName.disabled = !state;
    saveToComputerBtn.disabled = !state;
    saveToAppBtn.disabled = !state;

    // History section
    for (const btnClass of recordingBtnClasses) {
        for (const btn of document.querySelectorAll(btnClass)) {

            const recordingGrid = btn.parentElement
            const recordingDiv = recordingGrid.parentElement

            if (state) {

                // Enable btn except if there is a visualizerHistory
                if (btnClass !== ".playBtn" || !recordingDiv.querySelector("#visualizerContainerHistory")) {
                    btn.disabled = !state;
                }

                // Enable doubleclick to rename recording
                if (btnClass === ".playBtn")
                    recordingGrid.querySelector('p').style.pointerEvents = "auto";
            
            } else {

                btn.disabled = !state

                if (btnClass === ".playBtn")
                    recordingGrid.querySelector('p').style.pointerEvents = "none";
            }
        }
    }
}

function initModel () {
    // Magenta model to convert raw piano recordings into MIDI
    const model = new mm.OnsetsAndFrames('https://storage.googleapis.com/magentadata/js/checkpoints/transcription/onsets_frames_uni');

    model.initialize().then(() => {
        resetUIState(); // necessary?
        modelLoading.hidden = true;
        hrLoadingAfter.hidden = true;
        createdBy.hidden = true;    
        about.hidden = true;
        usernameContainer.hidden = false;
        User.displayDropdownMenu();
    });

    // Things are slow on Safari.
    if (window.webkitOfflineAudioContext)
        safariWarning.hidden = false;
    
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
  
        // Scroll container
        const containerWidth = visualizerContainer.getBoundingClientRect().width;
        if (currentNotePosition > (visualizerContainer.scrollLeft + containerWidth)) {
            visualizerContainer.scrollLeft = currentNotePosition - 20;
        }

      },
      stop: () => {
            // visualizerContainer.classList.remove('playing')
            showPlayIcon(true);
            enableAllBtns(true);

            recordingBroken ? brokenSettings() : btnRecord.disabled = false;
        }
    };

    return PLAYERS.soundfont;
}

// Merge with above?

function initPlayersHistory() {
    PLAYERS.soundfont = new mm.SoundFontPlayer('https://storage.googleapis.com/magentadata/js/soundfonts/salamander');
    
    PLAYERS.soundfont.callbackObject = {
      run: (note) => {
        const currentNotePosition = visualizerHistory.redraw(note);
  
        // Scroll container
        const containerWidth = visualizerContainerHistory.getBoundingClientRect().width;
        if (currentNotePosition > (visualizerContainerHistory.scrollLeft + containerWidth)) {
            visualizerContainerHistory.scrollLeft = currentNotePosition - 20;
        }

      },
      stop: () => {
            // visualizerContainerHistory.classList.remove('playing')
            showPlayIconHistory(true);
            enableAllBtns(true);
        }
    };

    return PLAYERS.soundfont;
}

function mainView () {
    usernameDeleteBtn.hidden = true;
    recordingSection.hidden = true;
    historySection.hidden = true;
    reviewSection.hidden = true;

    background.hidden = false;
    appTitle.style.marginTop = "-37px"
}

function hideBackground() {
    background.hidden = true;
    appTitle.style.marginTop = '25px';
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

        // If "Existing User" option exists, place at top of list
        if (a.value === "") {
            return -1
        } else if (b.value === "") {
            return 1
        } else {
            return aText < bText ? -1 : aText > bText ? 1 : 0;
        }
    });
        
    // Remove options in dropdown
    for (let i = 0; i < ary.length; i++) {
        selectElement.remove(ary[i].index);
    }
    
    // Add "Existing User" as first option
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

function removeAllChildNodes(parent) {
    // while (parent.lastElementChild) {
    //         parent.removeChild(parent.lastElementChild);
    // };
    while (parent.children.length > 1) {
        if (parent.children[0].id !== "noRecordingsMessage") {
            parent.children[0].remove();
        }
    }
}

function brokenSettings() {
    showDisabledRecordingImage();
    btnRecord.disabled = true;
    btnRecordText.hidden = true;
    recordingError.hidden = false;
}

function historyContainerIsEmpty() {
    return historyContainer.querySelector(".recordingDiv") ? false : true;
}