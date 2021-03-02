// Pull data from background to setup form
let option_data = {};
window.onload = function () {
    chrome.extension.sendMessage({ verb: "get", noun: "options" }, function (response) {
        option_data = response;
        console.log('Got options', option_data);
        for (let [key, value] of Object.entries(option_data)) {
            let element = document.querySelector(`#${key}`);
            if (element) {
                if (element.type == "checkbox") {
                    element.checked = value;
                } else {
                    element.value = value;
                }
            }
        }
    });
}

// Add event listeners to send data to background
for (let element of document.querySelectorAll("input")) {
    element.addEventListener("input", function (event) {
        if (element.type == "checkbox") {
            option_data[element.id] = element.checked;
        } else {
            option_data[element.id] = element.value;
        }
        console.log("Sending options", option_data);
        chrome.extension.sendMessage({
            verb: "set",
            noun: "options",
            data: option_data,
        });
    });
}