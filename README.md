# CorityLayoutPlus
Makes the Cority layout editor easier to use by adding CSS styling and detecting metadata

On the chrome web store as CorityLayout+ (https://chrome.google.com/webstore/detail/coritylayout%20/cahocmmpljojjnbddkgflandcdbomgob)

# Workflows
A. User installs extension and has browser running
    1. `background.js` is loaded and merges `chrome.storage` with default values
B. User right clicks on extension and views options
    1. `options.html` is opened as a new tab
    2. `options.html` loads `options.js`
    3. `options.js` loads `chrome.storage` into global `option_data` and creates `<input>` elements for each option, sets them to current values, and attaches a listener to each one
C. User changes an option on the options page
    1. `options.js` detects the input then updates and saves the current `option_data` to `chrome.storage`
D. User resets to default colors
    1. `options.js` sends a `getDefaultOptions` message to `background.js`
    2. `background.js` retrieves default values from `get_option_defaults` and returns them
    3. `options.js` updates `option_data` and the DOM elements to match the default values, then sets `chrome.storage` to these values
E. User resets all memory
    1. `options.js` clears `chrome.storage` memory
F. User clicks extension button
    1. `background.js` detects `chrome.action.onClicked` and runs `script.js`
    2. Apply formatting to the frontend
G. User browses to url matching path in `manifest.json`:`content_scripts`:`matches`
    1. `content.js` checks if the `form_autorun` option is true. If it is, then we proceed with formatting the frontend
