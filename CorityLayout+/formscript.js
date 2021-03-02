chrome.extension.sendMessage({ verb: "get", noun: ["options", "form_autorun"] }, function (response) {
    if (typeof clicked_icon !== "undefined") {
        response = true;
    }
    if (response == true) {

        console.log("[CorityLayout+]", "formscript Running...")

        for (let titlecell of document.getElementsByClassName('titlecell')) {
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

            label.innerHTML =
                `${original_label}
                <br>
                <span style="font-size:12px;">
                <span style="color: red;">[${base_text}]</span>
                <br>
                <span style="color: blue;">[${property_name}]</span>
                </span>
                `
                ;
        }

        function getElementByXpath(path, context = document) {
            return document.evaluate(path, context, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        }

    }
})