let chkbox = document.querySelector("#chk_enable");
let toast = document.querySelector("#toast");

chrome.extension.sendMessage({ cmd: "get_IsEnabled", }, function (response) {
    if (response == true) {
        chkbox.checked = true;
    } else {
        chkbox.checked = false;
    }
});

chkbox.addEventListener("input", function() {
    chrome.extension.sendMessage({
        cmd: "set_IsEnabled",
        data: {
            value: chkbox.checked
        },
    });

    if (!chkbox.checked) {
        toast.classList.remove("hidden");
    }

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        let activeTab = tabs[0];
        if (activeTab.url.indexOf("layout.rails") > -1) {
            if (chkbox.checked) {
                chrome.tabs.executeScript(activeTab.id, {
                    file: "contentscript.js",
                });
            }
        }
     });

    // window.close();
})