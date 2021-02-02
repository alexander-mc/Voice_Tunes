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
            // const orText = document.createElement('p');
            // const orLine = document.createElement('hr');
            
            label.innerHTML = "select a user";
            label.htmlFor = "usernameDropdownMenu";
            User.dropdownMenu.name = "usernameDropdownMenu";
            User.dropdownMenu.id = "usernameDropdownMenu";
            orDiv.id = 'orDiv';
            orDiv.innerText = 'or';
            // orText.innerText = 'OR';

            // Add options to dropdown menu
            for (const user of json)
                User.createDropdownOption(user);            
            
            // Sort dropdown menu options in alphabetical order
            sortSelectOptions(User.dropdownMenu);

            // Attach elements to DOM
            User.dropdownDiv.appendChild(label);
            User.dropdownDiv.appendChild(User.dropdownMenu);
            User.dropdownDiv.insertAdjacentElement('afterend', orDiv);
            // orDiv.appendChild(orLine);
            // orDiv.appendChild(orText);

            // Hide dropdown menu and orDiv if no usernames in db
            // if (json.length === 0)
            //     User.dropdownDiv.style.display = "none";
            //     orDiv.hidden = true;
                
            // Add additional User features
            User.createDeleteBtn();
            User.displayUsernameForm();

            User.dropdownMenu.addEventListener('change', (e) => {
                const optionValue = e.target.value;
                const deleteBtn = document.querySelector("#usernameDeleteBtn");

                // Reset display
                document.getElementById("inputUsername").value = "";

                if (optionValue === "") {
                    mainView();
                } else {
                    about.hidden = true;
                    visualizerHeader.hidden = true;
                    saveContainer.hidden = true;
                    recordingError.hidden = true;
                    modelReady.hidden = false;
                    usernameDeleteBtn.hidden = false;
                    recordingBroken = false;
                    updateRecordBtn('record');
                    // hideBackground();
                    hideVisualizer(); // Must go before removeAllChildNodes
                    removeAllChildNodes(historyContainer);
                    loadHistoryContainer();

                    sortSelectOptions(User.dropdownMenu, optionValue);
                    User.dropdownMenu.value === "" ? deleteBtn.style.display = "none" : deleteBtn.style.display = "inline";

                    resetUIState();
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

    static removeDefaultDropdownOption () {
        const usernameDefault = document.querySelector("#usernameDefault");

        if (usernameDefault)
            usernameDefault.remove();
    }

    static createDeleteBtn () {
        const deleteBtn = document.createElement("input");
        // const deleteImg = document.createElement("image");
        
        // setAttributes(deleteImg, {
        //     "id": "userDeleteImg",
        //     "type": "image",
        //     "src": "subtract-icon-bw.png",
        //     "alt": "Delete",
        // });

        setAttributes(deleteBtn, {
            "id": "usernameDeleteBtn",
            "type": "image",
            "src": "subtract-icon-bw.png",
            "alt": "Delete",
            "title": "Remove user",
        });

        // deleteBtn.appendChild(deleteImg)
        User.dropdownDiv.appendChild(deleteBtn);

        // Hide delete btn if dropdown selection is "Existing User"
        User.validateDropdownSelection();
        
        deleteBtn.addEventListener('click', e => {
            const result = confirm('Are you sure you want to delete this user?')

            if (result) {
                const user = new User (User.dropdownMenu.value);
                user.remove();
                User.validateDropdownSelection();
            }
        })
    }

    static validateDropdownSelection () {
        if (User.dropdownMenu.value === "")
            document.querySelector('#usernameDeleteBtn').style.display = "none";
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
            // "value": "✓",
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
                User.dropdownDiv.style.display = "block";
                usernameDeleteBtn.style.display = "inline"
                usernameDeleteBtn.hidden = false;
                hideVisualizer(); // Must come before removingAllChildNodes
                removeAllChildNodes(historyContainer);
                about.hidden = true;
                modelReady.hidden = false;
                recordingBroken = false;
                recordingError.hidden = true;
                updateRecordBtn('record');
                visualizerHeader.hidden = true;
                saveContainer.hidden = true;

                // hideBackground();

                resetUIState();
                
                // Add new username in menu
                User.createDropdownOption(json);

                // Remove "Existing User" default option in dropdown menu
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
                    hideCloseBtns();
                    btnRecord.disabled = true;
                    // showDisabledRecordingImage();

                    // TODO: Show visualizerHistory, show loading message - history,
                    // Move visualizerContainer
                    // const visualizerDiv = e.target.parentElement.parentElement.querySelector('.visualizerDiv')
                    // visualizerDiv.appendChild(transcribingMessage)
                    // visualizerDiv.appendChild(visualizerContainer)

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

        // If remove is called from click event (not from renaming recording)
        if (e) {
            const recordingDiv = e.target.parentElement.parentElement
            
            if (recordingDiv.contains(visualizerContainer))
                hideVisualizer();

            recordingDiv.remove();
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
                recordingDiv.prepend(downloadingMessage);
                enableAllBtns(false);
                btnRecord.disabled = true;
                showDisabledRecordingImage();
                downloadingMessage.hidden = false;

                // Remember visualizer if being used by a recordingDiv
                if (recordingDiv.contains(visualizerContainer) && visualizerContainer.hidden === false){
                        visualizerContainer.hidden = true;
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
                        if (recordingBroken) {
                            brokenSettings()
                        } else {
                            btnRecord.disabled = false;
                            showStartRecordingImage();
                        }
                            
                        downloadingMessage.hidden = true;
                        recordingContainer.appendChild(downloadingMessage);

                        // Place back visualizer back in same position before transcription process
                        if (recoverVisualizer)
                            visualizerContainer.hidden = false

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

    addToContainer(options) {
        const recordingDiv = document.createElement('div');
        const visualizerDiv = document.createElement('div');
        const btnsDiv = document.createElement('div');
        const name = document.createElement('p')
        const playBtn = document.createElement('input');
        const deleteBtn = document.createElement('input');
        const downloadBtn = document.createElement('input');
        const closeBtn = document.createElement('input');
        const allRecordingBtns = [name, playBtn, downloadBtn, deleteBtn, closeBtn] // remove unnecessary buttons
        let showCloseBtn;
    
        // Set ids, class names, and text
        btnsDiv.className = 'recordingGrid';
        btnsDiv.id = this.name;
        btnsDiv.dataset.recordingId = this.id;
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
            "title": "Delete",
        });

        setAttributes(downloadBtn, {
            "type": "image",
            "src": "save-comp-1.png",
            "alt": "Save recording to computer",
            "class": "downloadBtn",
            "title": "Save to Computer",
        });

        setAttributes(closeBtn, {
            "type": "image",
            "src": "close-1.png",
            "alt": "Close recording",
            "class": "closeBtn",
            "title": "Close",
        });

        // playBtn.className = "playBtn" 
        // deleteBtn.className = "deleteBtn" 
        // downloadBtn.className = "downloadBtn" 
        // closeBtn.className = "closeBtn" 

        // playBtn.src = "Play" // Replace with image
        // deleteBtn.src = "Delete" // Replace with image
        // downloadBtn.src = "Download" // Replace with image
        // closeBtn.src = "Close"

        recordingDiv.className = "recordingDiv"
        visualizerDiv.className = "visualizerDiv"

        // Add event listeners
        playBtn.addEventListener('click', e => this.play(e))
        deleteBtn.addEventListener('click', e => this.remove(e))
        downloadBtn.addEventListener('click', e => this.download(e))
        closeBtn.addEventListener('click', e => {
            hideVisualizer(e);
            closeBtn.hidden = true;
        })

        // Add/remove elements
        for (const element of allRecordingBtns) {
            btnsDiv.appendChild(element);
        }
        recordingDiv.append(visualizerDiv)
        recordingDiv.append(btnsDiv)       

        // [For renaming a recording] 'Options' allows developer to specify where to append a renamed recording
        if (options) {
            if (options.addHr) {
                const hr = document.createElement('hr')
                hr.className = "hrRecordingAfter"
                recordingDiv.append(hr)    
            }
            
            options.referenceElement.insertAdjacentElement('beforebegin', recordingDiv)

            if (options.addVisualizer) {
                visualizerDiv.appendChild(transcribingMessage)
                visualizerDiv.appendChild(visualizerContainer)
                showVisualizer();
                showCloseBtn = true;
            }
        } else {   
            historyContainer.prepend(recordingDiv)
        }

        showCloseBtn ? closeBtn.hidden = false : closeBtn.hidden = true;

        
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

            // $(name).html('<textarea class="form-control" id="newName">'+currentValue+'</textarea>');
            $(name).html(`<input class="inputRename" id="newName" value="${currentValue}">`);
            // $("#newName").height($(this).height());
            // $("#newName").width($(this).width());
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
                                    
                                    recordingDiv.contains(visualizerContainer) ? addVisualizer = true : addVisualizer = false;
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
      recordingError.hidden = false;
      btnRecord.hidden = true;
      return;
    }

    if (isRecording) {
        isRecording = false;
        updateRecordBtn('loading');
        recorder.stop();

    } else {
        // Request permissions to record audio. This sometimes fails on Linux.
        navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {
            isRecording = true;
            updateRecordBtn('stop');
            hideCloseBtns();
            // historySection.hidden = true;
            visualizerHeader.hidden = true;
            hideVisualizer(); // Must occur before transcribeFromFile().
            saveContainer.hidden = true;
            enableAllBtns(false);
            inputRecordingName.value = "";

            saveContainer.insertAdjacentElement('beforebegin' ,transcribingMessage)
            saveContainer.insertAdjacentElement('beforebegin', visualizerContainer)

            // The MediaRecorder API enables you to record audio and video
            // The dataavailable event is fired when the MediaRecorder delivers media data to your application for its use. The data is provided in a Blob object that contains the data
            // streamingBlob stores blob to be used later (e.g., saving blob to App)
            recorder = new window.MediaRecorder(stream);
            recorder.addEventListener('dataavailable', (e) => {
                streamingBlob = e.data;
                updateWorkingState(btnRecord);
                requestAnimationFrame(() => requestAnimationFrame(() => transcribeFromFile(e.data, false)));
            });

            recorder.start();
        }, () => {
            recordingBroken = true;
            brokenSettings();

            // If rejecting player from recording view (not from play button event)
            if (!saveContainer.hidden) {
                visualizerHeader.hidden = true;
                saveContainer.hidden = true;
                historySection.hidden = false;
                hideVisualizer();
            }
        })
    }
});

visualizerContainer.addEventListener('click', () => {
    player.isPlaying() ? stopPlayer() : startPlayer();
});


// Merge with above?
visualizerContainerHistory.addEventListener('click', () => {
    playerHistory.isPlaying() ? stopPlayerHistory() : startPlayerHistory();
});


async function transcribeFromFile(blob, isOriginHistory, playBtnEvent) {
    
    // Actions before transcription
    enableAllBtns(false);
    // updateRecordBtn('loading');
    // transcribingMessage.hidden = false;

    // Don't think it's necessary to differentiate btwn PLAYERS.soundfont and PLAYERS.soundfontHistory
    // let playersSoundFont;
    // console.log(isOriginHistory)
    // isOriginHistory ? playersSoundFont = PLAYERS.soundfontHistory : playersSoundFont = PLAYERS.soundfont;
    // console.log(playersSoundFont)

    model.transcribeFromAudioFile(blob).then((ns) => {
        PLAYERS.soundfont.loadSamples(ns).then(() => {
        
        const visualizerSettings = {
            noteRGB: '255, 255, 255', 
            activeNoteRGB: '232, 69, 164', 
            pixelsPerTimeStep: window.innerWidth < 500 ? null: 80,
        }

        // Actions after transcription (isOriginHistory = user clicks on 'play' from an existing recording)
        if (isOriginHistory) {
            const closeBtn = playBtnEvent.target.parentElement.lastChild

            visualizerHistory = new mm.Visualizer(ns, canvasHistory, visualizerSettings);
            
            closeBtn.hidden = false;
            showVisualizerHistory();
            showPlayIconHistory(true);
            // visualizerHeader.hidden = true;
            // saveContainer.hidden = true;
        } else {
            visualizer = new mm.Visualizer(ns, canvas, visualizerSettings);

            visualizerHeader.hidden = false;
            saveContainer.hidden = false;
            
            btnRecordText.removeAttribute("class") // Removes 'pulse' class, if exists
            updateRecordBtn('re-record')
            showVisualizer();
            showPlayIcon(true);
        }
        
        resetUIState(); // Remove?
        btnRecord.disabled = false;
        enableAllBtns(true);

        });
    });
}

function stopPlayer() {
    if (recordingBroken) {
        brokenSettings()
    } else {
        btnRecord.disabled = false;
        showStartRecordingImage();
    }
    enableAllBtns(true);
    showPlayIcon(true);
    player.stop();
    visualizerContainer.classList.remove('playing');
  }

// Merge with above?
  function stopPlayerHistory() {
    enableAllBtns(true);
    btnRecord.disabled = false;
    showPlayIconHistory(true);
    playerHistory.stop();
    visualizerContainerHistory.classList.remove('playing');
  }

function startPlayer() {
    btnRecord.disabled = true;
    enableAllBtns(false);
    showPlayIcon(false);

    visualizerContainer.scrollLeft = 0;
    visualizerContainer.classList.add('playing');
    mm.Player.tone.context.resume();
    player.start(visualizer.noteSequence);
}

// Merge with above?

function startPlayerHistory() {
    btnRecord.disabled = true;
    enableAllBtns(false);
    showPlayIconHistory(false);

    visualizerContainerHistory.scrollLeft = 0;
    visualizerContainerHistory.classList.add('playing');
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

        case 'playing':
            el.textContent = "playing"
            el.classList = "pulse"
            showDisabledRecordingImage();
            btnRecordText.hidden = false;
            console.log('disabled')
            break;

        case 'loading':
            // el.hidden = true;
            // btnRecord.insertAdjacentElement('afterend', transcribingMessage)
            // transcribingMessage.hidden = false;

            el.textContent = "loading"
            el.classList = "pulse"
            showDisabledRecordingImage();
            btnRecordText.hidden = false;
            console.log('loading')
            break;

        // default:
        //     break;
    }

    // if (state == "record") {
    //     el.textContent = "start recording";
    //     showStartRecordingImage();
    //     console.log('start')
    // } else if (state == 'stop') {
    //     el.textContent = "stop recording"
    //     showStopRecordingImage();
    //     console.log('stop')
    // } else if (state == "re-record") {
    //     el.textContent = "re-record"
    //     showStartRecordingImage();
    //     btnRecord.hidden = true;
    //     console.log('disabled')
  
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

function hideVisualizer() {
    modelReady.insertAdjacentElement('afterend', transcribingMessage)
    transcribingMessage.insertAdjacentElement('afterend', downloadingMessage)
    downloadingMessage.insertAdjacentElement('afterend', visualizerContainer)
    visualizerContainer.hidden = true;
    transcribingMessage.hidden = true;
    downloadingMessage.hidden = true;
    hideCloseBtns();
}

function showVisualizer() {
    visualizerContainer.hidden = false;
    playIcon.hidden = false;
    btnRecord.hidden = false;
    transcribingMessage.hidden = true;
    about.hidden = true;
  }

  // Merge with above?
  function showVisualizerHistory() {
    visualizerContainerHistory.hidden = false;
    playIconHistory.hidden = false;
    transcribingMessageHistory.hidden = true;
    about.hidden = true;
  }

function saveMidi (event) {
    let name = inputRecordingName.value;

    event.stopImmediatePropagation();
    inputUsername.value = "";

    if (validateRecordingName(name)) {
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
            recording.addToContainer();

            // OPTIONAL: Update display
            updateRecordBtn('record');
            inputRecordingName.value = "";
            hideVisualizer();
            historySection.hidden = false;
            visualizerHeader.hidden = true;
            saveContainer.hidden = true;

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

function hideCloseBtns () {
    for (btn of document.querySelectorAll('.closeBtn')) {
        btn.hidden = true;
    }
}

function loadHistoryContainer() {
    const user_id = usernameDropdownMenu.selectedOptions[0].id
    const url = `${User.usersUrl}/${user_id}/recordings`
    
    fetch (url)
    .then(resp => resp.json())
    .then(json => {
        
        if (json.length > 0)
            historySection.hidden = false;
            
        // for (const r_element of json) {
        //     const recording = new Recording(r_element);
        //     recording.addToContainer();
        // }

        // Add a hr after each recording div except for first recording
        for (let i=0; i < json.length; i++) {
            const recording = new Recording(json[i]);
            recording.addToContainer();

            if (i !== 0) {
                const recordingDiv = document.querySelector(`.recordingGrid#${recording.name}`).parentElement
                const hr = document.createElement("hr")

                hr.className = "hrRecordingAfter"
                recordingDiv.append(hr)
            }
        }
    })
}

// This is also the 'go back' feature after a recording session
function cancelMidi(event) {
    hideVisualizer();
    visualizerHeader.hidden = true;
    saveContainer.hidden = true;
    inputUsername.value = "";
    inputRecordingName.value = "";
    updateRecordBtn('record');
    historySection.hidden = false;
    recordingBroken = false;
    recordingError.hidden = true;
    resetUIState();
}

function enableAllBtns(state) {
    const recordingBtnClasses = [".playBtn", ".deleteBtn", ".downloadBtn", ".closeBtn"]

    usernameDropdownMenu.disabled = !state;
    usernameDeleteBtn.disabled = !state;
    inputUsername.disabled = !state;
    submitUsernameBtn.disabled = !state;
    inputRecordingName.disabled = !state;
    saveToComputerBtn.disabled = !state;
    saveToAppBtn.disabled = !state;
    cancelBtn.disabled = !state;

    for (const btnClass of recordingBtnClasses) {
        for (const btn of document.querySelectorAll(btnClass)) {
            btn.disabled = !state;
        }
    }
}

function initModel () {
    // Magenta model to convert raw piano recordings into MIDI
    const model = new mm.OnsetsAndFrames('https://storage.googleapis.com/magentadata/js/checkpoints/transcription/onsets_frames_uni');

    model.initialize().then(() => {
        resetUIState();
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
            visualizerContainer.classList.remove('playing')
            showPlayIcon(true);
            enableAllBtns(true);
            // btnRecordText.removeAttribute("class") // Removes 'pulse' class, if exists
            // updateRecordBtn('re-record')
            if (recordingBroken) {
                brokenSettings()
            } else {
                btnRecord.disabled = false;
                showStartRecordingImage();
            }
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
            visualizerContainerHistory.classList.remove('playing')
            showPlayIconHistory(true);
            enableAllBtns(true);
        }
    };

    return PLAYERS.soundfont;
}




function mainView () {
    usernameDeleteBtn.hidden = true;
    modelReady.hidden = true;
    historySection.hidden = true;
    // about.hidden = false;

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
    while (parent.lastElementChild) {
        parent.removeChild(parent.lastElementChild);
    }
}

function brokenSettings() {
    btnRecordText.hidden = true;
    btnRecord.disabled = true;
    showDisabledRecordingImage();
    recordingError.hidden = false;
}

// function stretchBackgroundImage(minWidth) {
//     if (minWidth.matches) {
//         background.style.backgroundSize = "615px 300px";
//     } else {
//         background.style.backgroundSize = "100vw 300px";
//     }
// }

// const minWidth = window.matchMedia("(max-width: 615px)")
// stretchBackgroundImage(minWidth) // Call listener function at run time
// minWidth.addListener(stretchBackgroundImage) // Attach listener function on state changes
// background.style.backgroundImage = "url('sound-wave.png')";
// background.style.backgroundSize = "615px 300px";
// background.style.backgroundPosition = "50% 30px";
// background.style.backgroundRepeat = "no-repeat";
// background.style.width = "98vw";
// background.style.zIndex = "0";
// background.style.position = "absolute";