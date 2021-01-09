class User {

    static usersUrl = "http://localhost:3000/users";
    static usernameFormContainer = document.querySelector("#username-form-container");
    static dropdownDiv = document.querySelector("#username-dropdown-container")
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
            label.htmlFor = "username-dropdown-menu";

            User.dropdownMenu.name = "username-dropdown-menu";
            User.dropdownMenu.id = "username-dropdown-menu";

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
                const optionValue = e.target.value
                const deleteBtn = document.querySelector("#user-delete-btn")

                sortSelectOptions(User.dropdownMenu, optionValue);
                User.dropdownMenu.value === "" ? deleteBtn.style.display = "none" : deleteBtn.style.display = "inline"

                // User.removeDefaultDropdownOption();
                // User.usernameFormContainer.style.display = "none";
            })
        })
        .catch(error => {
            alert("Oops! There was problem with the server. Please try again.")
            console.log(error.message);
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
        const usernameDefault = document.querySelector("#username-default")

        if (usernameDefault)
            usernameDefault.remove();
    }

    static createDeleteBtn () {
        const deleteBtn = document.createElement("button");
        deleteBtn.id = "user-delete-btn"
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
            document.querySelector('#user-delete-btn').style.display = "none"
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
    }

    static displayUsernameForm () {
        const formDiv = document.querySelector("#username-form-container");
        const form = document.createElement("form");
        const input = document.createElement("input");
        const submit = document.createElement("input");
        
        form.id = "username-form"
        
        setAttributes(input, {
            "type": "text",
            "name": "username",
            "value": "",
            "placeholder": "Enter a username",
            "id": "input-username"
        })
        
        setAttributes(submit, {
            "type": "submit",
            "name": "submit",
            "value": "Submit",
            "placeholder": "Enter a username",
            "id": "submit-username-btn"
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

            if (json.messages) {
                const inputUsername = document.querySelector("#input-username");
                
                alert(json.messages.join("\n"));
                inputUsername.value = "";

            } else {
                // After submitting username, adjust app display
                User.dropdownDiv.style.display = "block";
                document.querySelector("#user-delete-btn").style.display = "inline"
                // User.usernameFormContainer.style.display = "none";  

                // Add new username in menu
                User.createDropdownOption(json);

                // Remove "Existing Users" default option in dropdown menu
                // User.removeDefaultDropdownOption();

                sortSelectOptions(User.dropdownMenu, json.name);
            }
        })
        .catch(error => {
            alert("Oops! There was problem with the server. Please try again.")
            console.log(error.message);
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

let recordingBroken = false;

const model = initModel();

function initModel () {
    // Magenta model to convert raw piano recordings into MIDI
    const model = new mm.OnsetsAndFrames('https://storage.googleapis.com/magentadata/js/checkpoints/transcription/onsets_frames_uni');

    model.initialize().then(() => {
        resetUIState();
        modelLoading.hidden = true;
        modelReady.hidden = false;
        User.displayDropdownMenu();
      });
}

function resetUIState() {
    btnRecord.classList.remove('working'); // Revisit ... make sure this is used
    if (!recordingBroken) {
      btnRecord.removeAttribute('disabled');
    }
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
        firstOption.id = "username-default";
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