let chkbox = document.querySelector("#chk_enable");
let toast = document.querySelector("#toast");

chrome.extension.sendMessage({ cmd: "get_IsEnabled", }, function (response) {
    if (response == true) {
        chkbox.checked = true;
    } else {
        chkbox.checked = false;
    }
});

chkbox.addEventListener("input", function () {
    chrome.extension.sendMessage({
        cmd: "set_IsEnabled",
        data: {
            value: chkbox.checked
        },
    });

    if (!chkbox.checked) {
        toast.classList.remove("hidden");
    }

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (chkbox.checked) {
            let activeTab = tabs[0];
            // if (activeTab.url.indexOf("layout.rails") > -1) {
            //     chrome.tabs.executeScript(activeTab.id, {
            //         file: "contentscript.js",
            //     });
            // }
            if (activeTab.url.indexOf("layout.rails") > -1) {
                chrome.tabs.executeScript(activeTab.id, {
                    file: "layoutscript.js",
                });
            } else {
                chrome.tabs.executeScript(activeTab.id, {
                    file: "formscript.js",
                });
            }
        }
    });

    // window.close();
})

