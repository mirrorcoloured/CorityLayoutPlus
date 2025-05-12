let lastUpdate = new Date();
const minUpdateWait = 100;

// Pull data from background to setup form
let option_data = {};
window.onload = function () {
    chrome.storage.sync.get("options").then(function (response) {
        option_data = response.options;
        console.log("Got options", option_data);

        const optionstablelayout = document.querySelector("#optionstablelayout");
        const optionstableform = document.querySelector("#optionstableform");

        // create HTML elements for each option
        for (let [key, obj] of Object.entries(option_data)) {
            const pieces = key.split("_");
            let tbl = pieces[0] == "form" ? optionstableform : optionstablelayout;
            let trow = document.createElement("tr");
            let tdkey = document.createElement("td");
            let tdval = document.createElement("td");
            let tdinp = document.createElement("input");

            tdkey.innerHTML = obj.text;
            tdinp.id = key;
            tdinp.type = obj.type;
            if (tdinp.type == "checkbox") {
                tdinp.checked = obj.value;
            } else {
                tdinp.value = obj.value;
            }

            tdinp.addEventListener("input", function (event) {
                if (tdinp.type == "checkbox") {
                    option_data[key].value = tdinp.checked;
                } else {
                    option_data[key].value = tdinp.value;
                }
                if (new Date() - lastUpdate > minUpdateWait) {
                    lastUpdate = new Date();
                    setTimeout(sendOptions, minUpdateWait);
                }
            });

            tdval.appendChild(tdinp);
            trow.appendChild(tdkey);
            trow.appendChild(tdval);
            tbl.appendChild(trow);
        }
    });
};

function sendOptions() {
    console.log("Sending options", option_data);
    chrome.storage.sync.set({ options: option_data });
    chrome.runtime.sendMessage({ type: "updateIcon" });
}

document.querySelector("#resetcolors").addEventListener("click", function (e) {
    if (confirm("Are you sure you want to reset to default colors?")) {
        chrome.runtime.sendMessage({ type: "getDefaultOptions" }, function (response) {
            for (let [key, obj] of Object.entries(response)) {
                const pieces = key.split("_");
                let element = document.querySelector(`#${key}`);
                if (element && pieces[1] == "color") {
                    if (element.type == "checkbox") {
                        element.checked = obj.value;
                        option_data[element.id].value = element.checked;
                    } else {
                        element.value = obj.value;
                        option_data[element.id].value = element.value;
                    }
                }
            }
            sendOptions();
        });
    }
});

document.querySelector("#resetmemory").addEventListener("click", function (e) {
    if (confirm("Are you sure you want to clear the memory for this extension?")) {
        chrome.storage.sync.clear();
        chrome.storage.local.clear();
    }
});
