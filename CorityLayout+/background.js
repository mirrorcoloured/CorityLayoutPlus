// Set up default storage parameters
let persistent_storage = {
	options: {},
	defaults: {},
}

function get_option_defaults() {
	return {
		layout_autorun: { value: false, type: "checkbox", text: "Run automatically on page load" },
		form_autorun: { value: false, type: "checkbox", text: "Run automatically on page load" },
		layout_color_Required: { value: "#ff600a", type: "color", text: "Color - Required" },
		layout_color_Disabled: { value: "#9e9e9e", type: "color", text: "Color - Disabled" },
		layout_color_PlaceHolder: { value: "#ffffff", type: "color", text: "Color - PlaceHolder" },
		layout_color_Metadata: { value: "#ffffff", type: "color", text: "Color - Metadata" },
		layout_color_Checkbox: { value: "#e6e384", type: "color", text: "Color - Checkbox" },
		layout_color_Date: { value: "#b6b6dd", type: "color", text: "Color - Date" },
		layout_color_Time: { value: "#cecef2", type: "color", text: "Color - Time" },
		layout_color_Integer: { value: "#87c3e8", type: "color", text: "Color - Integer" },
		layout_color_Number: { value: "#94d3fa", type: "color", text: "Color - Number" },
		layout_color_Lookup: { value: "#9be49b", type: "color", text: "Color - Lookup" },
		layout_color_TreePicker: { value: "#23d520", type: "color", text: "Color - TreePicker" },
		layout_color_Select: { value: "#bad9af", type: "color", text: "Color - Select" },
		layout_color_RadioButton: { value: "#96a970", type: "color", text: "Color - RadioButton" },
		layout_color_String: { value: "#dc8989", type: "color", text: "Color - String" },
		layout_color_Text: { value: "#ffb3b3", type: "color", text: "Color - Text" },
		layout_color_TextArea: { value: "#ff6b6b", type: "color", text: "Color - TextArea" },
		layout_color_AttachDocument: { value: "#d0bea4", type: "color", text: "Color - AttachDocument" },
		layout_color_LinkedLabel: { value: "#e6f5d6", type: "color", text: "Color - LinkedLabel" },
		layout_color_Calculated: { value: "#f0c7ff", type: "color", text: "Color - Calculated" },
		layout_color_CircularIndicator: { value: "#ffebff", type: "color", text: "Color - CircularIndicator" },
	}
}
for (let [key, value] of Object.entries(get_option_defaults())) {
	persistent_storage.options[key] = value;
	persistent_storage.defaults[key] = value;
}

// Load persistent storage from storage asynchronously
// chrome.storage.sync.get(console.log)
// chrome.storage.sync.clear()
chrome.storage.sync.get(function (response) {
	console.log("Got storage:", response);
	console.log("Merging with default values", persistent_storage);
	persistent_storage = mergeDeep(persistent_storage, response);
	console.log("Local storage object is", persistent_storage);
	updateIcon();
})

/**
* Performs a deep merge of objects and returns new object. Does not modify
* objects (immutable) and merges arrays via concatenation.
* First objects take precendence in case of duplicate object keys
* https://stackoverflow.com/a/48218209
*
* @param {...object} objects - Objects to merge
* @returns {object} New object with merged key/values
*/
function mergeDeep(...objects) {
	const isObject = obj => obj && typeof obj === 'object';

	return objects.reduce((prev, obj) => {
		Object.keys(obj).forEach(key => {
			const pVal = prev[key];
			const oVal = obj[key];

			if (Array.isArray(pVal) && Array.isArray(oVal)) {
				prev[key] = pVal.concat(...oVal);
			}
			else if (isObject(pVal) && isObject(oVal)) {
				prev[key] = mergeDeep(pVal, oVal);
			}
			else {
				prev[key] = oVal;
			}
		});

		return prev;
	}, {});
}

// Listen for messages
chrome.extension.onMessage.addListener(
	function (request, sender, sendResponse) {

		console.log('Got request', request);

		if (request.verb == "set") {
			console.log("Setting", request.noun, "to:", request.data);
			persistent_storage[request.noun] = request.data;
			chrome.storage.sync.set({ [request.noun]: persistent_storage[request.noun] });
			updateIcon()
		} else if (request.verb == "get") {
			if (!Array.isArray(request.noun)) {
				request.noun = [request.noun];
			}
			let scope = persistent_storage;
			for (let [index, nounpath] of request.noun.entries()) {
				if (nounpath in scope) {
					if (index < request.noun.length - 1) {
						scope = scope[nounpath];
					} else {
						console.log("Returning value:", scope[nounpath]);
						sendResponse(scope[nounpath]);
					}
				} else {
					console.log("Unknown variable", nounpath, 'in', request.noun);
					sendResponse(null);
				}
			}
		}
	}
);

// Update icon based on autorun options
function updateIcon() {
	const iconmap = {
		"true,true": e => chrome.browserAction.setIcon({ path: 'icon128lf.png' }),
		"true,false": e => chrome.browserAction.setIcon({ path: 'icon128l.png' }),
		"false,true": e => chrome.browserAction.setIcon({ path: 'icon128f.png' }),
		"false,false": e => chrome.browserAction.setIcon({ path: 'icon128.png' }),
	}
	const option_status = String([persistent_storage.options.layout_autorun.value, persistent_storage.options.form_autorun.value]);
	iconmap[option_status]();
}

// Activate when user clicks icon
chrome.browserAction.onClicked.addListener(function (tab) {
	chrome.tabs.executeScript(tab.id, {
		code: 'const clicked_icon = true;' // inject code to flag that button was clicked
	}, function () {
		if (tab.url.indexOf("layout.rails") > -1) {
			chrome.tabs.executeScript(tab.id, { file: 'layoutscript.js' });
		} else {
			chrome.tabs.executeScript(tab.id, { file: 'formscript.js' });
		}
	});
});