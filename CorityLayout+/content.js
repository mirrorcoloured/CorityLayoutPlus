console.log("[CorityLayout+] Running content script");

chrome.storage.sync.get((response) => {
    const options = response.options;
    const url = window.location.href;
    if (url.indexOf("layout.rails") > -1) {
        // layout script
        if (options.layout_autorun.value == true) {
            console.log("[CorityLayout+]", "layoutscript Running...");
            alert("Layout editor formatting has been deprecated. Please contact author if functionality is needed.");
        }
    } else if (url.indexOf("display.rails") > -1) {
        // form script
        if (options.form_autorun.value == true) {
            console.log("[CorityLayout+]", "formscript Running...");
            addFormattingToForm();
        }
    }
});

function getElementByXpath(path, context = document) {
    // Convenience function to find elements by Xpath
    return document.evaluate(path, context, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function addFormattingToForm() {
    //**
    // Displays default label names and property names below current label names
    // on frontend forms.
    //  */

    for (let titlecell of document.getElementsByClassName("titlecell")) {
        if (titlecell.children.length > 0) {
            addPropertyName(titlecell);
        }
    }

    function addPropertyName(titlecell) {
        const label = getElementByXpath(".//label", titlecell);

        let original_label = label.innerHTML;
        if (label.getAttribute("CL-original")) {
            original_label = label.getAttribute("CL-original");
        } else {
            label.setAttribute("CL-original", original_label);
        }
        const base_text = label.getAttribute("basetext");
        const property_name = label.getAttribute("for");

        label.innerHTML = `${original_label}
        <br>
        <span style="font-size:12px;">
        <span style="color: red;">[${base_text}]</span>
        <br>
        <span style="color: blue;">[${property_name}]</span>
        </span>
        `;
    }
}
