console.log("[CorityLayout+]","Running...")
for (let tdcell of document.getElementsByClassName('field_cell')) {
    if (tdcell.children.length > 0) {
        const divtile = tdcell.children[0];
        if (divtile.children.length >= 2) {

          try {
            resizeTile(tdcell);
            modifyName(tdcell);
            colorCell(tdcell);
          } catch(e) {
            console.log("[CorityLayout+]",e)
          }

        }
    }
}

function getcolor(t) {
    const typedict = {
        // common
        'Lookup': hsv(120, 0.25, .65), // green
        'String': hsv(0, 0.25, .65), // red
        'Date': hsv(240, 0.25, .65), // purple
        // seldom
        'Time': hsv(240, 0.25, .85), // light purple
        'Select': hsv(120, 0.25, .85), // light green
        'Text': hsv(0, 0.35, .85), // light red
        'TextArea': hsv(0, 0.25, .55), // dark reddish brown
        // rare
        'Checkbox': hsv(0, 0, 1), // white
        'RadioButton': hsv(120, 0.25, .55), // dark green
        'Calculated': hsv(300, 0.25, 0.55), // fuschia
        'AttachDocument': hsv(60, 0.25, 0.65), // pale yellow
        'PlaceHolder': hsv(180, 0.25, 0.65), // teal
        'CircularIndicator': hsv(300, 0.25, 0.65), // light fuschia
        'LinkedLabel': hsv(90, 0.6, 0.9), // lime yellow
    };
    return typedict[t];
}


function getFieldType(tdcell) {
  const divtile = tdcell.children[0];
  const scr = divtile.children[2].innerHTML;
  return scr.slice(scr.indexOf("type:")+7, scr.indexOf('\"', scr.indexOf("type:")+7));
}



function colorCell(tdcell) {
  // Get relevant elements
  const divtile = tdcell.children[0];
  const scr = divtile.children[2].innerHTML;
  const typename = getFieldType(tdcell);
  const tilecolor = getcolor(typename) || '#dcdcdc';
  const cellcolor = getcolor(typename) || '#d0ecfb';

  // Set colors
  tdcell.style.backgroundColor = cellcolor;
//   tdcell.style.border = '3px solid purple'// + tilecolor;
  divtile.style.backgroundColor = tilecolor;
  divtile.parentNode.style.border = '1px solid gray';

  // Modify color by class
  if (divtile.classList.contains('disabled')) {
    divtile.style.backgroundColor = '#7c7c7c';
  }
  if (divtile.classList.contains('required') ||
    divtile.classList.contains('system')) {
    divtile.style.backgroundColor = '#f55';
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
  divtile.style.height = "50px";
  divtile.style.width = "100%";

  label.style.display = "inline-block";
  label.style.width = "100%";
  label.style.overflow = "hidden";
}



function modifyName(tdcell) {
  const divtile = tdcell.children[0];
  // get names
  const label = divtile.children[1];
  let baseName = divtile.getAttribute('name').replace("A_","").replace("A-","");
  if (label.getAttribute('labelname') == null) {
    label.setAttribute('labelname', label.innerHTML)
  }
  let newName = label.getAttribute('labelname');
  const typename = getFieldType(tdcell);

//   if (baseName != newName.replace(" ","")) {
      label.innerHTML = `${newName}<br><i>${baseName}</i><br>${typename}`;
//   }
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


function getCookie(name) {
  var name = name + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
          c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
      }
  }
  return undefined;
}