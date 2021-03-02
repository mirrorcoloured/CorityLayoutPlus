let IsEnabled = true;

chrome.storage.sync.get("CorityLayout+IsEnabled", function(items) {
	if (items["CorityLayout+IsEnabled"]) {
		IsEnabled = true;
	} else {
		IsEnabled = false;
	}
	updateIcon()
});

chrome.extension.onMessage.addListener(
	function (request, sender, sendResponse) {
		if (request.cmd == "set_IsEnabled") {
			IsEnabled = request.data.value;
			updateIcon();
			chrome.storage.sync.set({"CorityLayout+IsEnabled": IsEnabled});
		}

		if (request.cmd == "get_IsEnabled") {
			sendResponse(IsEnabled);
		}
	}
);

function updateIcon() {
	if (IsEnabled) {
		chrome.browserAction.setIcon({ path: 'icon.png' });
	} else {
		chrome.browserAction.setIcon({ path: 'disabledicon.png' });
	}
}