chrome.browserAction.onClicked.addListener(function(tab) {
	if (tab.url.indexOf("layout.rails") > -1) {
		chrome.tabs.executeScript(tab.id, {
			file: "contentscript.js",
		});
	}
});