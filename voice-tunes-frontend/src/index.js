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
            const usernames = json.map(users => users.name);
            
            label.innerHTML = "Select a user: ";
            label.htmlFor = "username-dropdown-menu";

            User.dropdownMenu.name = "username-dropdown-menu";
            User.dropdownMenu.id = "username-dropdown-menu";

            for (const username of usernames) {
                const option = document.createElement("option");
                option.value = username;
                option.text = username;
                User.dropdownMenu.appendChild(option);
            }
            
            // Sort dropdown menu options in alphabetical order
            sortSelectOptions(User.dropdownMenu);

            // Set menu to "Existing User" option
            User.dropdownMenu.selectedIndex = 0;

            // Attach dropdown to div
            User.dropdownDiv.appendChild(label).appendChild(User.dropdownMenu);
            
            // Hide dropdown menu if no usernames in db
            if (usernames.length === 0) {
                User.dropdownDiv.style.display = "none"
            }

            // After user selects from dropdown menu, remove "Existing Users" option and hide username form
            User.dropdownMenu.addEventListener('change', (e) => {
                User.includeDefaultUsername = false;
                sortSelectOptions(User.dropdownMenu);
                User.usernameFormContainer.style.display = "none";
            })

            // Ensure user input field is placed after dropdown menu
            User.displayUsernameForm();
        })
        .catch(error => {
            alert("Oops! There was problem with the server. Please try again.")
            console.log(error.message);
        });
        
    }

    static removeDefaultDropdownOption () {
        const defaultOption = document.querySelector("#username-default");
        if (defaultOption) {
            defaultOption.remove();
        }
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
                User.usernameFormContainer.style.display = "none";  
                
                User.dropdownDiv.style.display = 'block';
                User.dropdownMenu.options[User.dropdownMenu.options.length] = new Option(json.name, json.name); // Include new username in menu

                document.querySelector("#username-default").remove();
                User.defaultOption = false;
                console.log('Did I change?', User.defaultOption)
                sortSelectOptions(User.dropdownMenu);
                User.dropdownMenu.value = json.name

                // loadUser(this.name)
            }
        })
        .catch(error => {
            alert("Oops! There was problem with the server. Please try again.")
            console.log(error.message);
        })
    }
    
    // static resetDropdownMenu (newUsername) {
    //     sortSelectOptions(User.dropdownMenu);
    //     User.dropdownMenu.value = newUsername
    // }

}

class Recording {
    constructor (name) {
        this.name = name;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    
    User.displayDropdownMenu();
    
})

// Helper functions

function setAttributes(el, options) {
    for (const attr of Object.keys(options)) {
      el.setAttribute(attr, options[attr]);
    }
 }

 function sortSelectOptions(selectElement) {

     
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
        return aText < bText ? -1 : aText > bText ? 1 : 0;
    });
    
    // Remove options
    for (let i = 0; i < ary.length; i++) {
        selectElement.remove(ary[i]);
    }
    
    console.log(User.includeDefaultUsername)
    // Add "Existing Users" as first option
    if (User.includeDefaultUsername) {
        console.log('I am here')
        const firstOption = document.createElement("option");
        firstOption.text = "Existing Users";
        firstOption.id = "username-default";
        firstOption.value = "";
        selectElement.add(firstOption);
    }

    // Add all ordered options
    for (let i = 0; i < ary.length; i++) {
        selectElement.add(ary[i]);
    }

}