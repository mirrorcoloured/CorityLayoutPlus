// Set up default storage parameters
let persistent_storage = {
	options: {
		layout_autorun: false,
		layout_colorFields: true,
		form_autorun: false,
	}
}

// Load persistent storage from storage asynchronously
// chrome.storage.sync.get(console.log)
// chrome.storage.sync.clear()
chrome.storage.sync.get(function (response) {
	console.log("Got storage:", response);
	for (let key of Object.keys(persistent_storage)) {
		console.log("Checking for parameter", key);
		if (response[key]) {
			persistent_storage[key] = response[key];
			console.log("Set parameter", key, "to", persistent_storage[key]);
			if (key == "options") {
				updateIcon();
			}
		}
	}
})

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

function updateIcon() {
	const iconmap = {
		"true,true": e => chrome.browserAction.setIcon({ path: 'icon128lf.png' }),
		"true,false": e => chrome.browserAction.setIcon({ path: 'icon128l.png' }),
		"false,true": e => chrome.browserAction.setIcon({ path: 'icon128f.png' }),
		"false,false": e => chrome.browserAction.setIcon({ path: 'icon128.png' }),
	}
	const option_status = String([persistent_storage.options.layout_autorun, persistent_storage.options.form_autorun]);
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