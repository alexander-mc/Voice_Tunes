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
                    saveContainer.hidden = true;
                    recordingError.hidden = true;
                    modelReady.hidden = false;
                    usernameDeleteBtn.hidden = false;
                    recordingBroken = false;
                    updateRecordBtn('Record');
                    hideBackground();
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
        const deleteBtn = document.createElement("button");
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
        label.innerHTML = "create a user";
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
            "id": "submitUsernameBtn"
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
                updateRecordBtn('Record');
                saveContainer.hidden = true;

                hideBackground();

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
                    hideVisualizer();
                    hideCloseBtns();
                    btnRecord.disabled = true;

                    // Move visualizerContainer
                    const visualizerDiv = e.target.parentElement.parentElement.querySelector('.visualizerDiv')
                    visualizerDiv.appendChild(transcribingMessage)
                    visualizerDiv.appendChild(visualizerContainer)

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
                        recordingBroken ? brokenSettings() : btnRecord.disabled = false;
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
        const playBtn = document.createElement('button');
        const deleteBtn = document.createElement('button');
        const downloadBtn = document.createElement('button');
        const closeBtn = document.createElement('button');
        const allRecordingBtns = [name, playBtn, deleteBtn, downloadBtn, closeBtn] // remove unnecessary buttons
        let showCloseBtn;
    
        // Set ids, class names, and text
        btnsDiv.id = this.name;
        btnsDiv.dataset.recordingId = this.id;
        name.innerText = this.name
        playBtn.innerText = "Play" // Replace with image
        deleteBtn.innerText = "Delete" // Replace with image
        downloadBtn.innerText = "Download" // Replace with image
        closeBtn.innerText = "Close"
        recordingDiv.className = "recordingDiv"
        visualizerDiv.className = "visualizerDiv"
        playBtn.className = "playBtn" 
        deleteBtn.className = "deleteBtn" 
        downloadBtn.className = "downloadBtn" 
        closeBtn.className = "closeBtn" 

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

        // 'Options' allows developer to specify wjere to append a renamed recording
        if (options) {
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
            if (player.isPlaying())
                player.stop();

            $(name).html('<textarea class="form-control" id="newName" row="0">'+currentValue+'</textarea>');
            $("#newName").focus();
            $("#newName").focus(function() {
                console.log('in');
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

                                    recordingDiv.contains(visualizerContainer) ? addVisualizer = true : addVisualizer = false;

                                    recording.addToContainer({
                                        referenceElement: recordingDiv,
                                        addVisualizer: addVisualizer,
                                    });

                                    // Delete old recording in db, GCS, and DOM
                                    outgoingRecording.remove();
                                    recordingDiv.remove();

                                    // Restore buttons
                                    enableAllBtns(true);
                                    btnRecord.disabled = false;
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
let recorder;
let streamingBlob;
let isRecording = false;
let recordingBroken = false;
// let model = initModel();
let player = initPlayers();

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
            hideCloseBtns();
            hideVisualizer(); // Must occur before transcribeFromFile().
            historyContainer.hidden = true;
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
                saveContainer.hidden = true;
                historyContainer.hidden = false;
                hideVisualizer();
            }
        })
    }
});

visualizerContainer.addEventListener('click', () => {
    player.isPlaying() ? stopPlayer() : startPlayer();
});

async function transcribeFromFile(blob, isOriginPlayBtn, playBtnEvent) {
    
    // Actions before transcription
    enableAllBtns(false);
    transcribingMessage.hidden = false;

    model.transcribeFromAudioFile(blob).then((ns) => {
        PLAYERS.soundfont.loadSamples(ns).then(() => {
        visualizer = new mm.Visualizer(ns, canvas, {
            noteRGB: '255, 255, 255', 
            activeNoteRGB: '232, 69, 164', 
            pixelsPerTimeStep: window.innerWidth < 500 ? null: 80,
        });

        // Actions after transcription
        if (isOriginPlayBtn) {
            const closeBtn = playBtnEvent.target.parentElement.lastChild
            
            saveContainer.hidden = true;
            closeBtn.hidden = false;
        } else {
            saveContainer.hidden = false
        }
        
        resetUIState();
        showVisualizer();
        startPlayer();
        });
    });
}

function stopPlayer() {
    recordingBroken ? brokenSettings() : btnRecord.disabled = false;
    enableAllBtns(true);
    player.stop();
    visualizerContainer.classList.remove('playing');
  }
  
function startPlayer() {
    btnRecord.disabled = true;
    enableAllBtns(false);
    visualizerContainer.scrollLeft = 0;
    visualizerContainer.classList.add('playing');
    mm.Player.tone.context.resume();
    player.start(visualizer.noteSequence);
}

function updateWorkingState(btnRecord) {
    about.hidden = true;
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
    recordingContainer.append(visualizerContainer)
    recordingContainer.append(transcribingMessage)
    recordingContainer.append(downloadingMessage)
    visualizerContainer.hidden = true;
    transcribingMessage.hidden = true;
    downloadingMessage.hidden = true;
    hideCloseBtns();
}

function showVisualizer() {
    visualizerContainer.hidden = false;
    btnRecord.hidden = false;
    transcribingMessage.hidden = true;
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
            updateRecordBtn('Record');
            inputRecordingName.value = "";
            hideVisualizer();
            historyContainer.hidden = false;
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
            historyContainer.hidden = false;
            
        for (const r_element of json) {
            const recording = new Recording(r_element);
            recording.addToContainer();
        }
    })
}

// This is also the 'go back' feature after a recording session
function cancelMidi(event) {
    hideVisualizer();
    saveContainer.hidden = true;
    inputUsername.value = "";
    inputRecordingName.value = "";
    updateRecordBtn('Record');
    historyContainer.hidden = false;
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

// Remove later
User.displayDropdownMenu();

function initModel () {
    // Magenta model to convert raw piano recordings into MIDI
    const model = new mm.OnsetsAndFrames('https://storage.googleapis.com/magentadata/js/checkpoints/transcription/onsets_frames_uni');

    model.initialize().then(() => {
        resetUIState();
        modelLoading.hidden = true;
        about.hidden = true;
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
  
        // See if we need to scroll the container.
        const containerWidth = visualizerContainer.getBoundingClientRect().width;
        if (currentNotePosition > (visualizerContainer.scrollLeft + containerWidth)) {
            visualizerContainer.scrollLeft = currentNotePosition - 20;
        }

      },
      stop: () => {
            visualizerContainer.classList.remove('playing')
            enableAllBtns(true);
            recordingBroken ? brokenSettings() : btnRecord.disabled = false;
        }
    };

    return PLAYERS.soundfont;
}

function mainView () {
    usernameDeleteBtn.hidden = true;
    modelReady.hidden = true;
    historyContainer.hidden = true;
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
    updateRecordBtn("Record");
    btnRecord.disabled = true;
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