# CorityLayoutPlus
Makes the Cority layout editor easier to use by adding CSS styling and detecting metadata

On the chrome web store as CorityLayout+ (https://chrome.google.com/webstore/detail/coritylayout%20/cahocmmpljojjnbddkgflandcdbomgob)

# Workflows
1. User installs extension and has browser running
    1. `background.js` is loaded and merges `chrome.storage` with default values to populate global variable `persistent_storage`
2. User right clicks on extension and views options
    1. `options.html` is opened as a new tab
    2. `options.html` loads `options.js`
    3. `options.js` sends a `get/options` message to the background
    4. `background.js` receives request and returns options data from `persistent_storage`
    5. `options.js` stores the data in global `option_data` and creates `<input>` elements for each option, sets them to current values, and attaches a listener to each one
3. User changes an option on the options page
    1. `options.js` detects the input then updates and sends the current `option_data` in a `set/options` message to `background.js`
    2. `background.js` sets `chrome.storage` for the options
4. User resets to default colors
    1. `options.js` sends a `get/defaults` message to `background.js`
    2. `background.js` retrieves default values from `persistent_storage` and returns them
    3. `options.js` updates `option_data` and the DOM elements to match the default values, then sends `option_data` in a `set/options` back to `background.js`
5. User resets all memory
    1. `options.js` clears `chrome.storage` memory
6. User clicks extension button
    1. `background.js` detects `chrome.action.onClicked`, sets global variable `clicked_icon`, and calls `script.js`
    2. Jump to workflow 7.i.
7. User browses to url matching path in `manifest.json`:`content_scripts`:`matches`
    1. `script.js` sends a `get/tab,url` to `background.js`
    2. `background.js` returns the current url of the active tab
    3. `script.js` sends a `get/options` to `background.js`
    4. `background.js` returns the current values in `persistent_storage`
    5. `script.js` checks if `layout.rails` is in the url
        a. If it is, then the backend part of the script is run
            1. If the `layout_autorun` option is true or global `clicked_icon` exists, then we proceed with formatting the backend
        b. If it is not, then the frontend part of the script is run
            1. If the `form_autorun` option is true or global `clicked_icon` exists, then we proceed with formatting the frontend
