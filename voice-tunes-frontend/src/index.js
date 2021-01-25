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

                // Reset display
                document.getElementById("inputUsername").value = "";
                recordingContainer.append(transcribingMessage)
                recordingContainer.append(visualizerContainer)
                recordingContainer.append(downloadingMessage)
                transcribingMessage.hidden = true
                visualizerContainer.hidden = true
                downloadingMessage.hidden = true

                if (optionValue === "") {
                    mainView();
                } else {
                    about.hidden = true;
                    modelReady.hidden = false;
                    recordingBroken = false;
                    recordingError.hidden = true;
                    hideVisualizer();
                    userDeleteBtn.hidden = false;
                    saveContainer.hidden = true;
                    updateRecordBtn('Record');

                    removeAllChildNodes(historyContainer);
                    loadHistoryContainer();

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

    remove() {
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
            inputUsername.value = "";

            if (json.messages) {
                alert(json.messages.join("\n"));
            } else {
                // After submitting username, adjust app display
                User.dropdownDiv.style.display = "block";
                document.querySelector("#userDeleteBtn").style.display = "inline"

                recordingContainer.append(visualizerContainer)
                recordingContainer.append(transcribingMessage)
                recordingContainer.append(downloadingMessage)
    
                visualizerContainer.hidden = true;
                transcribingMessage.hidden = true;
                downloadingMessage.hidden = true;

                removeAllChildNodes(historyContainer);

                about.hidden = true;
                modelReady.hidden = false;
                recordingBroken = false;
                recordingError.hidden = true;
                updateRecordBtn('Record');
                hideVisualizer();
                saveContainer.hidden = true;
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
            console.log("log B")

            isRecording = true;
            updateRecordBtn();
            hideCloseBtns();
            hideVisualizer(); // Keep here. Event needs to occur before transcribeFromFile().
            modelReady.appendChild(transcribingMessage)
            modelReady.appendChild(visualizerContainer)

            historyContainer.hidden = true;
            saveContainer.hidden = true;
            enableAllBtns(false);
            inputRecordingName.value = "";

            // The MediaRecorder API enables you to record audio and video
            recorder = new window.MediaRecorder(stream);
            // The dataavailable event is fired when the MediaRecorder delivers media data to your application for its use. The data is provided in a Blob object that contains the data
            recorder.addEventListener('dataavailable', (e) => {
                // Store blob to be used later (e.g., saving blob to App)
                console.log("log E")
                console.log('e', e)
                console.log('e.target', e.target)
                console.log('e.target.value', e.target.value)
                console.log('e.currentTarget', )
                streamingBlob = e.data;
                updateWorkingState(btnRecord);
                requestAnimationFrame(() => requestAnimationFrame(() => transcribeFromFile(e.data, false)));
                console.log("log F")
            });

            console.log("log C")
            recorder.start(); // Remove? Unsure this is doing anything
        }, () => {
            recordingBroken = true;
            btnRecord.disabled = true;
            recordingError.hidden = false;
            hideVisualizer();
            saveContainer.hidden = true;
        });
    }
    console.log("log A, log D")
});

visualizerContainer.addEventListener('click', () => {
    if (player.isPlaying()) {
        stopPlayer();
    } else {
        startPlayer();
    }
});

async function transcribeFromFile(blob, isOriginPlayBtn, playBtnEvent) {
    
    enableAllBtns(false);
    transcribingMessage.hidden = false;
    console.log('hiding')
    console.log('log 6')
    console.log("log G")

    model.transcribeFromAudioFile(blob).then((ns) => {
        PLAYERS.soundfont.loadSamples(ns).then(() => {
        visualizer = new mm.Visualizer(ns, canvas, {
            noteRGB: '255, 255, 255', 
            activeNoteRGB: '232, 69, 164', 
            pixelsPerTimeStep: window.innerWidth < 500 ? null: 80,
        });

        console.log('visualizer', visualizer)
        console.log('visualizer.noteSequence', visualizer.noteSequence)
        console.log('ns', ns)

        console.log("log H")
        console.log('log 7')
        resetUIState();
        showVisualizer();
        
        if (isOriginPlayBtn) {
            const closeBtn = playBtnEvent.target.parentElement.lastChild

            saveContainer.hidden = true;
            closeBtn.hidden = false;

            //  visualizerName.hidden = false;
        } else {
            saveContainer.hidden = false
        }
        
        startPlayer();
        });
    });
}

function stopPlayer() {
    btnRecord.disabled = false;
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
    // transcribingMessage.hidden = false;
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
    visualizerContainer.hidden = true;
}

function showVisualizer() {
    visualizerContainer.hidden = false;
    btnRecord.hidden = false;
    transcribingMessage.hidden = true;
    about.hidden = true;
    enableAllBtns(true);
  }

function saveMidi (event) {
    let name = inputRecordingName.value;
    event.stopImmediatePropagation();
    inputUsername.value = "";

    if (validateRecordingName(name)) {
        // const file = new File([mm.sequenceProtoToMidi(visualizer.noteSequence)], `${name}.midi`);
        const file = new File([mm.sequenceProtoToMidi(visualizer.noteSequence)], `${name}.midi`, {
            type: "audio/midi",
        });
        console.log('mm.sequenceProtoToMidi(visualizer.noteSequence)', mm.sequenceProtoToMidi(visualizer.noteSequence))
        console.log(visualizer.noteSequence)
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
    const user_id = usernameDropdownMenu.selectedOptions[0].id
    const url = `${User.usersUrl}/${user_id}/recordings`
    
    const formData = new FormData();
    formData.append('recording[name]', recordingName)
    formData.append('recording[user_id]', user_id)
    formData.append('recording[midi_data]', streamingBlob) 
    
    console.log(streamingBlob)

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

            //// Load history container          
            // removeAllChildNodes(historyContainer);
            // loadHistoryContainer();
        
            //// MOVE BELOW CODE TO CORRECT FUNCTION
            //// midi_data is a Data URL, which can be converted to a blob
            // convertDataURLToBlob(json.midi_data)
            // .then(blob => transcribeFromFile(blob))
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
            console.log(json)
            if (json.messages) {
                alert(json.messages.join("\n"));
            } else {
                console.log('log 3')

                // midi_data is a Data URL, which can be converted to a blob
                convertDataURLToBlob(json.midi_data)
                .then(blob => {
                    console.log('log 5')
                    hideVisualizer();
                    hideCloseBtns();
                    btnRecord.disabled = true;

                    // Move visualizerContainer
                    const visualizerDiv = e.target.parentElement.parentElement.querySelector('.visualizerDiv')
                    visualizerDiv.appendChild(transcribingMessage)
                    visualizerDiv.appendChild(visualizerContainer)

                    transcribeFromFile(blob, true, e);
                })
                console.log('log 4')
            }
        })
        .catch(error => {
            serverError(error);
        })

        console.log('log 1')
        enableAllBtns(true);
        saveContainer.hidden = true;
        btnRecord.disabled = false;

        test();
    }

    remove(e) {

        // const userOption = User.dropdownMenu.selectedOptions[0]
        // const url = `${User.usersUrl}/${userOption.id}`
        // const configObj = {
        //     method: 'DELETE',
        //     headers: {
        //         'Content-type': 'application/json; charset=UTF-8'
        //     }
        // }

        // fetch(url, configObj);
        // userOption.remove();
        // mainView();

        const configObj = {
            method: 'DELETE',
            headers: {
                'Content-type': 'application/json; charset=UTF-8'    
            }
        }

        fetch(this.recordingUrl, configObj);

        const recordingDiv = e.target.parentElement.parentElement
        
        console.log('recording div incl visualizer', recordingDiv.contains(visualizerContainer))
        if (recordingDiv.contains(visualizerContainer)) {
            recordingContainer.append(visualizerContainer)
            recordingContainer.append(transcribingMessage)
            recordingContainer.append(downloadingMessage)

            visualizerContainer.hidden = true;
            transcribingMessage.hidden = true;
            downloadingMessage.hidden = true;
        }

        recordingDiv.remove();
    }

    download(e) {

        fetch (this.recordingUrl)
        .then(resp => resp.json())
        .then(json => {
            if (json.messages) {
                alert(json.messages.join("\n"));
            } else {    
                // midi_data is a Data URL, which can be converted to a blob
                // convertDataURLToBlob(json.midi_data)
                // .then(blob => {
                // const file = new File([mm.sequenceProtoToMidi(visualizer.noteSequence)], `${this.name}.midi`, {
                //     type: "audio/midi",
                // });

                const recordingDiv = e.target.parentElement.parentElement;
                console.log(recordingDiv)
                let recoverVisualizer = false;

                recordingDiv.prepend(downloadingMessage);
                enableAllBtns(false);
                btnRecord.disabled = true;
                downloadingMessage.hidden = false;

                if (recordingDiv.contains(visualizerContainer) && visualizerContainer.hidden === false){
                        console.log('recordingDiv.contains(visualizerContainer)', recordingDiv.contains(visualizerContainer))
                        console.log('visualizerContainer.hidden === false', visualizerContainer.hidden === false)
                        visualizerContainer.hidden = true;
                        recoverVisualizer = true;
                } else {
                    console.log('visualizerContainer not hidden')
                }

                convertDataURLToBlob(json.midi_data)
                .then(blob => {
                    model.transcribeFromAudioFile(blob).then((ns) => {
                        PLAYERS.soundfont.loadSamples(ns).then(() => {
                        const tempVisualizer = new mm.Visualizer(ns, canvas, {
                            noteRGB: '255, 255, 255', 
                            activeNoteRGB: '232, 69, 164', 
                            pixelsPerTimeStep: window.innerWidth < 500 ? null: 80,
                        })
                        
                        const file = new File([mm.sequenceProtoToMidi(tempVisualizer.noteSequence)], `${this.name}.midi`, {
                            type: "audio/midi",
                        })

                        saveMidiToComputer(file)
                        enableAllBtns(true);
                        btnRecord.disabled = false;
                        downloadingMessage.hidden = true;

                        if (recoverVisualizer) {
                            visualizerContainer.hidden = false
                        }

                        })
                    })
                })
            }
        })
        .catch(error => {
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


        // Append elements
        for (const element of allRecordingBtns) {
            btnsDiv.appendChild(element);
        }

        recordingDiv.append(visualizerDiv)
        recordingDiv.append(btnsDiv)       
        if (options) {
            options.referenceElement.insertAdjacentElement('beforebegin', recordingDiv)            
        } else {   
            historyContainer.prepend(recordingDiv)
        }
        
        // Remove close btn
        closeBtn.hidden = true;
        // historyContainer.prepend(btnsDiv)



        // Edit recording name (jQuery)
        const recordingUrl = this.recordingUrl
        const outgoingRecording = this
        // const recordingsUrl = this.recordingsUrl

        $(name).on("dblclick", function(e){
            const currentValue = $(this).text();
            $(name).html('<textarea class="form-control" id="newName" row="0">'+currentValue+'</textarea>');
            $("#newName").focus();
            $("#newName").focus(function() {
                console.log('in');
            }).blur(function() {

            const newName = $("#newName").val();

            // INSERT CODE ON WHAT TO DO AFTER CLICKING OUTSIDE OF RECORDING NAME BOX
            // Fetch midi data (similar to play method)
            fetch (recordingUrl)
            .then(resp => resp.json())
            .then(json => {
                console.log('successfully exited show action', json)
                if (json.messages) {
                    alert(json.messages.join("\n"));
                } else {
                    convertDataURLToBlob(json.midi_data)
                    .then(blob => {
                        // Create new recording (similar to saveMidiToApp method)
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
                            console.log('successfully exited create action', json)
                            if (json.messages) {
                                alert(json.messages.join("\n"));
                            } else {
                                // Append to historyContainer
                                const recording = new Recording(json);
                                recording.addToContainer({
                                    referenceElement: recordingDiv
                                });

                                // Delete old item in db, GCS, and DOM
                                outgoingRecording.remove();
                                recordingDiv.remove();
                                // TODO: Move new item to correct spot
                                // TODO: Delete old item

                            }
                        })
                        .catch(error => {
                            serverError(error);
                        });
                    })
                } // end of if stmt
            }) // end of fetch

                    // Create new recording using midi data
                    // function saveMidiToApp (recordingName) {
                    //     const user_id = usernameDropdownMenu.selectedOptions[0].id
                    //     const url = `${User.usersUrl}/${user_id}/recordings`
                        
                    //     const formData = new FormData();
                    //     formData.append('recording[name]', recordingName)
                    //     formData.append('recording[user_id]', user_id)
                    //     formData.append('recording[midi_data]', streamingBlob) 
                        
                    //     console.log(streamingBlob)
                    
                        // fetch (url, {
                        //     method: 'POST',
                        //     body: formData
                        // })
                        // .then(resp => resp.json())
                        // .then(json => {
                        //     if (json.messages) {
                        //         alert(json.messages.join("\n"));
                        //     } else {
                        //         // Append to historyContainer
                        //         const recording = new Recording(json);
                        //         recording.addToContainer();
                        //     }
                        // })
                        // .catch(error => {
                        //     serverError(error);
                        // });


            // Delete old recording - recordingDiv.remove();

        //         const newName = $("#newName").val();
        //         fetch (url, {
        //             method: "PATCH",
        //             headers: {
        //                 "Content-Type": "application/json",
        //                 "Accept": "application/json",
        //               },
        //               body: JSON.stringify({
        //                 "recording": {
        //                     "name": newName,
        //                 }
        //               })
        //         })
        //         .then(res => res.json())
        //         .then((json => {
        //             if (json.messages) {
        //                 alert(json.messages.join("\n"));
        //             } else {
        //                 // $(name).text(json.name);
        //                 // name.innerText = json.name;
                        
        //                 // Create recording item
        //                 const recording = new Recording(json);
        //                 recording.addToContainer();
        //                 console.log(recording)
        //                 const incomingDiv = document.querySelector(`[data-recording-id-${recording.id}]`).parentElement
        //                 recordingDiv.insertAdjacentElement('beforebegin', incomingDiv)

        //                 recordingDiv.remove();
        //                 // Delete current recording item
        //             }
        //         }))
        //         .catch(error => {
        //             serverError(error);
        //         })
                
            })
        })

        
    }
}

function test(){
    console.log('log 2')
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
        
        if (json.length > 0) {
            historyContainer.hidden = false;
        }    

        for (const r_element of json) {

            // Create object
            const recording = new Recording(r_element);
            recording.addToContainer();
        }
    })

    // Add buttons
    // historyContainer.appendChild(btn)
    // btn.addEventListener('click', e => {
    //     console.log('play')

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
    // })
}

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
    userDeleteBtn.disabled = !state;
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
      stop: () => {
            visualizerContainer.classList.remove('playing')
            enableAllBtns(true);
            btnRecord.disabled = false;
        }
    };

    return PLAYERS.soundfont;
}

function mainView () {
    about.hidden = false;
    userDeleteBtn.hidden = true;
    modelReady.hidden = true;
    historyContainer.hidden = true;
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
        
    // Remove options in dropdown
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

// Remove children
function removeAllChildNodes(parent) {
    while (parent.lastElementChild) {
        parent.removeChild(parent.lastElementChild);
    }
}

// jQuery

