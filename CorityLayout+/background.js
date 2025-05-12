function get_option_defaults() {
    return {
        form_autorun: { value: false, type: "checkbox", text: "Run automatically on page load" },
    };
}

function mergeDeep(...objects) {
    /**
     * Performs a deep merge of objects and returns new object. Does not modify
     * objects (immutable) and merges arrays via concatenation.
     * First objects take precendence in case of duplicate object keys
     * https://stackoverflow.com/a/48218209
     *
     * @param {...object} objects - Objects to merge
     * @returns {object} New object with merged key/values
     */

    const isObject = (obj) => obj && typeof obj === "object";

    return objects.reduce((prev, obj) => {
        Object.keys(obj).forEach((key) => {
            const pVal = prev[key];
            const oVal = obj[key];

            if (Array.isArray(pVal) && Array.isArray(oVal)) {
                prev[key] = pVal.concat(...oVal);
            } else if (isObject(pVal) && isObject(oVal)) {
                prev[key] = mergeDeep(pVal, oVal);
            } else {
                prev[key] = oVal;
            }
        });

        return prev;
    }, {});
}

// Listen for messages
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log("Got request", request);

    if (request.type == "updateIcon") {
        updateIcon();
    } else if (request.type == "getDefaultOptions") {
        sendResponse(get_option_defaults());
    } else {
        console.log("Unknown message type", { request });
    }
});

// Update icon based on autorun options
function updateIcon() {
    const iconmap = {
        "true,true": (e) => chrome.action.setIcon({ path: "icon128lf.png" }),
        "true,false": (e) => chrome.action.setIcon({ path: "icon128l.png" }),
        "false,true": (e) => chrome.action.setIcon({ path: "icon128f.png" }),
        "false,false": (e) => chrome.action.setIcon({ path: "icon128.png" }),
    };
    chrome.storage.sync.get("options").then((response) => {
        const form_autorun = response.options.form_autorun.value || false;
        const option_status = String([false, form_autorun]);
        iconmap[option_status]();
    });
}

// Activate when user clicks icon
chrome.action.onClicked.addListener(function (tab) {
    console.log("[CorityLayout+] Clicked icon", { tab });
    injectScriptOnTab(tab);
});

function injectScriptOnTab(tab) {
    console.log("[CorityLayout+] Injecting script.js on tab", tab);
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["script.js"],
    });
}

// Get default options and override with saved values
chrome.storage.sync.get("options").then((response) => {
    const options = response.options || {};
    const defaults = get_option_defaults();
    const combined = mergeDeep(defaults, options);
    chrome.storage.sync.set({ options: combined });
    updateIcon();
});
