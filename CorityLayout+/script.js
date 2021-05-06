console.log('[CorityLayout+] Running content script');

// console.log('chrome object', chrome);

function getElementByXpath(path, context = document) {
    return document.evaluate(path, context, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function getTextBetween(text, left, right) {
    const l = text.indexOf(left) + left.length;
    const r = text.indexOf(right, l + 1);
    return text.slice(l, r);
}

chrome.extension.sendMessage({ verb: "get", noun: ["tab", "url"] }, function (response) {
    const url = response;
    chrome.extension.sendMessage({ verb: "get", noun: ["options"] }, function (response) {

        if (url.indexOf("layout.rails") > -1) { // layout script

            if (response.layout_autorun.value == true || typeof clicked_icon !== "undefined") {
                console.log("[CorityLayout+]", "layoutscript Running...")

                let INJECTION_SCRIPT = "";

                let colordict = {};
                for (let [key, obj] of Object.entries(response)) {
                    const pieces = key.split("_");
                    if (pieces[1] == "color") {
                        colordict[pieces[2]] = obj.value;
                    }
                }

                for (let tdcell of document.getElementsByClassName('field_cell')) {
                    if (tdcell.children.length > 0) {
                        const divtile = tdcell.children[0];
                        if (divtile.children.length >= 2) {

                            try {
                                resizeTile(tdcell);
                                modifyName(tdcell);
                                colorCell(tdcell);
                            } catch (e) {
                                console.log("[CorityLayout+]", e)
                            }

                        }
                    }
                }

                inject_global_javascript(INJECTION_SCRIPT);

                function getFieldType(tdcell) {
                    const divtile = tdcell.children[0];
                    if (["Created By", "Modified By", "Locked By", "Created Date", "Modified Date", "Lock Date Time", "Locked Unlocked", "Inactive"].includes(divtile.title)) {
                        return "Metadata";
                    }
                    const scr = divtile.children[2].innerHTML;
                    return scr.slice(scr.indexOf("type:") + 7, scr.indexOf('\"', scr.indexOf("type:") + 7));
                }

                function getFieldLabel(tdcell) {
                    const divtile = tdcell.children[0];
                    const scr = divtile.children[2].innerHTML;
                    let text = scr.slice(scr.indexOf("label:") + 8, scr.indexOf('\"', scr.indexOf("label:") + 8));
                    text = text.replace("\\'", "'");
                    return text;
                }

                function colorCell(tdcell) {
                    // Get relevant elements
                    const divtile = tdcell.children[0];
                    const scr = divtile.children[2].innerHTML;
                    const typename = getFieldType(tdcell);
                    const tilecolor = colordict[typename] || '#dcdcdc';
                    const cellcolor = colordict[typename] || '#d0ecfb';

                    // Set colors
                    tdcell.style.backgroundColor = cellcolor;
                    //   tdcell.style.border = '3px solid purple'// + tilecolor;
                    divtile.style.backgroundColor = tilecolor;
                    // divtile.style.height = "100%";
                    divtile.parentNode.style.border = '1px solid gray';

                    // Modify color by class
                    if (divtile.classList.contains('disabled')) {
                        divtile.style.backgroundColor = colordict["Disabled"];
                        divtile.style.opacity = 0.95;
                        divtile.style.padding = 0;

                        // https://stackoverflow.com/questions/21956790/css-cross-through-an-element
                        divtile.style.textDecoration = "line-through";
                        divtile.style.border = "3px solid black";
                    }
                    if (divtile.classList.contains('required') ||
                        divtile.classList.contains('system')) {
                        divtile.style.backgroundColor = colordict["Required"];

                        divtile.style.border = "3px solid red";
                    }
                }



                function resizeTile(tdcell) {
                    const divtile = tdcell.children[0];
                    // Extend width of grab bar
                    const grabtile = divtile.children[0];
                    grabtile.style.width = "100%";
                    grabtile.style.height = "100%";
                    grabtile.style.zIndex = 2;
                    grabtile.style.opacity = "0.3";
                    grabtile.style.visible = "false";

                    // Make label stand out better on top
                    const label = divtile.children[1];
                    label.style.zIndex = 1;
                    label.style.position = 'relative';
                    label.style.left = "-100%";
                    label.style.fontWeight = "bold";
                    label.style.pointerEvents = "none";

                    // Resize
                    tdcell.style.maxWidth = "126.67px";

                    divtile.style.height = "64px";
                    divtile.style.width = "95%";

                    label.style.display = "inline-block";
                    label.style.width = "100%";
                    label.style.overflow = "hidden";
                }



                function modifyName(tdcell) {
                    const divtile = tdcell.children[0];
                    const label = divtile.children[1];
                    const baseName = divtile.getAttribute('name').replace("A_", "").replace("A-", "");
                    const newName = getFieldLabel(tdcell);
                    const typename = getFieldType(tdcell);
                    const origname = divtile.getAttribute("title");

                    let new_text = `${newName}<br><i>${origname}</i><br><i>${baseName}</i><br>${typename}`;

                    if (typename == "Lookup") {
                        const divtileid = divtile.getAttribute("id");

                        let tableName = baseName;
                        tableName = tableName.replace(/[0-9]/g, "");
                        let parententity = getTextBetween(window.location.href, "com/", "/");
                        tableName = translateEntity(parententity, tableName);

                        new_text += ` (${tableName})`;

                        let injectedJS = `
                document.getElementById('${divtileid}').addEventListener('contextmenu', function(event) {
                    event.preventDefault();
                    openSearch('${tableName}','','','','','','','','','','','','','','','','','${tableName}','','')
                });
                `;
                        INJECTION_SCRIPT += injectedJS + "\n";
                    }

                    label.innerHTML = new_text;
                }

                function translateEntity(parententity, entity) {
                    parententity = parententity.toLowerCase();
                    let lowerentity = entity.toLowerCase();

                    // TODO find better way of getting this info

                    const translations = {
                        "createdby": "User",
                        "modifiedby": "User",
                        "physician": "User",
                        "practitioner": "User",
                        "tobereviewedby": "User",

                        "supervisor": "Employee",

                        "driverlicensestate": "Jurisdiction",
                        "physicianstate": "Jurisdiction",
                        "homecountry": "Country",

                        // safetyincident
                        "accidentcause": "IncidentRootCause",
                        "job": { "safetyincident": "SafetyRASJobList" },
                        "locationtype": "AccidentLocation",
                        "primarycategory": "GeneralIncidentCategory",
                        "supervisorcompleted": "Employee",
                        "manager": "Employee",
                        "genmgr": "Employee",
                        "ehs": "Employee",
                        "responsibleexecutive": "Employee",
                        "reportedto": "Employee",
                        "reportedby": "Employee",
                        // safetyfinding
                        "rejectionreason": "Reason",
                        "actionplan": { "safetyfinding": "SafetyActionPlan" },
                        "category": "AuditCategory",
                        "findingowner": "Employee",
                        "topic": "AuditTopic",
                        "severity": "HazardSeverityRating",
                        // risk
                        "workflow": "WorkflowStatus",
                    }

                    if (Object.keys(translations).includes(lowerentity)) {
                        if (typeof translations[lowerentity] == "string") {
                            return translations[lowerentity];
                        } else {
                            if (Object.keys(translations[lowerentity]).includes(parententity)) {
                                return translations[lowerentity][parententity];
                            }
                        }
                    }
                    return entity;
                }


                function inject_global_javascript(payload) {
                    let script = document.createElement("script");
                    script.innerHTML = payload;
                    document.head.appendChild(script);
                }



                function hsv(h, s, v) {
                    h /= 360;

                    var r, g, b;

                    var i = Math.floor(h * 6);
                    var f = h * 6 - i;
                    var p = v * (1 - s);
                    var q = v * (1 - f * s);
                    var t = v * (1 - (1 - f) * s);

                    switch (i % 6) {
                        case 0: r = v, g = t, b = p; break;
                        case 1: r = q, g = v, b = p; break;
                        case 2: r = p, g = v, b = t; break;
                        case 3: r = p, g = q, b = v; break;
                        case 4: r = t, g = p, b = v; break;
                        case 5: r = v, g = p, b = q; break;
                    }
                    r *= 360;
                    g *= 360;
                    b *= 360;

                    return `rgb(${r}, ${g}, ${b})`;
                }
            }


        } else { // form script

            if (response.form_autorun.value == true || typeof clicked_icon !== "undefined") {
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
            }

        }
    })
});
