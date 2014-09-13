/***************************************************

	CUSTOM CROP MARK CREATOR v0.1

	For use with: Adobe Illustrator CS6
	Written by: Ken Sugiura
	Apr 2014

***************************************************/

var W = {};

var SETTINGS = (function(){

	var DOC = app.activeDocument;

	var S_DATA = {
		dX : new UnitValue(DOC.width + " pt"),
		dY : new UnitValue(DOC.height + " pt"),
		cX : new UnitValue("0 in"),
		cY : new UnitValue("0 in"),
		bX : new UnitValue("0.125 in"),
		bY : new UnitValue("0.125 in"),
		sW : new UnitValue("0.25 pt"),
		sL : new UnitValue("0.25 in"),
		sO : new UnitValue("0.25 in")
	};

	var DEFAULT_UNIT_TYPE = getDocUnits();

	var setVal = function(tag,val) {
		if( parseFloat(val).toString() == val.toString() ) val += " " + DEFAULT_UNIT_TYPE;
		S_DATA[tag] = new UnitValue(val);
	};

	var getVal = function(tag) {
		return S_DATA[tag].as(DEFAULT_UNIT_TYPE);
	};

	var getTrue = function(tag) {
		return S_DATA[tag].as("pt");
	};

	return {
		defaultUnits  : DEFAULT_UNIT_TYPE,
		whiteOutlines : true,
		drawGuides    : false,
		debuggerOn    : false,
		setVal  : setVal,
		getVal  : getVal,
		getTrue : getTrue
	};

})();

function main() {

	if(!app.activeDocument) return 1;

	W.MAIN = initWindowMain();

	W.MAIN.show();

}

function initWindowMain() {

	var DOC = app.activeDocument;

	// Build Window
	
	newWindow = new Window("dialog { \
		orientation:'column', \
		alignChildren:['fill','top'], \
		preferredSize:[300, 130], \
		text:'Custom Crop Marks', \
		margins:15, \
		\
		boxPanel:Panel { \
			orientation:'column', \
			alignChildren:['fill','top'], \
			margins:15, \
			text:'Bounding Box', \
			rows:Group { \
				orientation:'column', \
				alignChildren:['fill','top'] \
			} \
			hr0:Panel { \
				preferredSize:[undefined,2] \
			}, \
			bleeds:Group { \
				orientation:'column', \
				alignChildren:['fill','top'], \
				st0:StaticText {text:'Bleeds'}, \
				row0:Group { \
					orientation:'row', \
					alignChildren:'left', \
					st0:StaticText {text:'Top:'}, \
					bT:EditText {value:0, text:'0', characters:10, justify:'left'}, \
					st1:StaticText {text:'Bottom:'}, \
					bB:EditText {value:0, text:'0', characters:10, justify:'left'}, \
					st2:StaticText {text:'Left:'}, \
					bL:EditText {value:0, text:'0', characters:10, justify:'left'}, \
					st3:StaticText {text:'Right:'}, \
					bR:EditText {value:0, text:'0', characters:10, justify:'left'} \
				}, \
				row1:Group { \
					orientation:'row', \
					alignChildren:'left', \
					bC:Checkbox {text:'Centered', value:true}, \
					li:Checkbox {text:'Linked', value:false} \
				} \
			} \
		}, \
		strokePanel:Panel { \
			orientation:'column', \
			alignChildren:['fill','top'], \
			margins:15, \
			text:'Stroke', \
			row0:Group { \
				orientation:'row', \
				alignChildren:'left', \
				st0:StaticText {text:'Thickness:'}, \
				sW:EditText {minvalue:0, value:0, text:'0', characters:10, justify:'left'}, \
				st1:StaticText {text:'Length:'}, \
				sL:EditText {minvalue:0, value:0, text:'0', characters:10, justify:'left'}, \
				st2:StaticText {text:'Offset:'}, \
				sO:EditText {minvalue:0, value:0, text:'0', characters:10, justify:'left'} \
			}, \
			row1:Group { \
				orientation:'row', \
				alignChildren:'left', \
				wO:Checkbox {text:'White Outlines', value:false}, \
				dG:Checkbox {text:'Draw Guides', value:false} \
			} \
		}, \
		bottomGroup:Group { \
			cancelButton:Button {text:'Close', properties:{name:'cancel'}, size: [120,24], alignment:['right', 'center']}, \
			startButton:Button {text:'Draw Crop Marks', properties:{name:'ok'}, size: [120,24], alignment:['right', 'center']}, \
		} \
	}");

	var C_BOX  = newWindow.boxPanel.rows,
		BLEEDS = newWindow.boxPanel.bleeds.row0,
		STROKE = newWindow.strokePanel;

	function newRowColInputGroups() {

		var newRow0 = C_BOX.add("group");
		newRow0.orientation = "row";
		newRow0.alignChildren = ["left","center"];
		newRolColHeader(newRow0,"Document");
		newRolColHeader(newRow0,"Crop Box");

		var newRow1 = C_BOX.add("group");
		newRow1.orientation = "row";
		newRow1.alignChildren = ["left","center"];

		var newRow2 = C_BOX.add("group");
		newRow2.orientation = "row";
		newRow2.alignChildren = ["left","center"];

		return [
			[
				newRowColInput(newRow1,"W",false),
				newRowColInput(newRow1,"X",true),
				newRowColInput(newRow1,"W",true)
			],
			[
				newRowColInput(newRow2,"H",false),
				newRowColInput(newRow2,"Y",true),
				newRowColInput(newRow2,"H",true)
			]
		];

	}

	function newRolColHeader(row,label) {

		var newStatic = row.add("statictext");
		newStatic.preferredSize.width = 80;
		newStatic.text = label;

		return newStatic;

	}

	function newRowColInput(row,label,isEdit) {

		var newCol = row.add("group");
		newCol.orientation = "row";
		newCol.preferredSize.width = 80;

		var newStatic = newCol.add("statictext");
		newStatic.preferredSize.width = 12;
		newStatic.text = label + ":";

		var newText;

		if(isEdit) {

			newText = newCol.add("edittext");
			newText.minValue   = 0;
			newText.value      = 0;
			newText.text       = "0";
			newText.characters = 10;
			newText.justify    = "left";

		} else {

			newText = newCol.add("statictext");

		}

		return newText;

	}

	function initDebugPanel() {

		var newPanel = newWindow.add("panel");
		newPanel.alignChildren = ["fill","fill"];
		newPanel.margins       = 15;
		newPanel.text          = "Debug Info";
		newPanel.preferredSize.height = 20;

		var newText = newPanel.add("statictext");
		newText.preferredSize = ["fill","fill"];
		newText.scrollable = true;

		return newText;

	}

	if(SETTINGS.debuggerOn) W.DEBUG = initDebugPanel();

	var COL_ROW_INPUTS = newRowColInputGroups();

	// Controls

	var CONTROLS = {
		DW : COL_ROW_INPUTS[0][0],
		DH : COL_ROW_INPUTS[1][0],
		PX : COL_ROW_INPUTS[0][1],
		PY : COL_ROW_INPUTS[1][1],
		CX : COL_ROW_INPUTS[0][2],
		CY : COL_ROW_INPUTS[1][2],
		LI : newWindow.boxPanel.bleeds.row1.li,
		BC : newWindow.boxPanel.bleeds.row1.bC,
		BT : BLEEDS.bT,
		BB : BLEEDS.bB,
		BL : BLEEDS.bL,
		BR : BLEEDS.bR,
		SL : STROKE.row0.sL,
		SW : STROKE.row0.sW,
		SO : STROKE.row0.sO,
		WO : STROKE.row1.wO,
		DG : STROKE.row1.dG
	};

	var BOX = (function(){

		var uT = SETTINGS.defaultUnits,
			dX = SETTINGS.getVal("dX"),
			dY = SETTINGS.getVal("dY"),

			cX = SETTINGS.getVal("cX"),
			cY = SETTINGS.getVal("cY"),
			bX = SETTINGS.getVal("bX"),
			bY = SETTINGS.getVal("bY");

		// input and update
		/* both uV() and setUV() ensure that retVal is in default units */
		var uV     = function(defUnits) {
				if(parseFloat(defUnits).toString() == defUnits.toString())
					defUnits += " " + uT;
				var _uV = new UnitValue(defUnits);
				return _uV.as(uT);
			},
			setUV  = function(control,input,type) {
				if(typeof type  == "undefined") type  = uT;
				if(typeof input == "undefined") input = control.text;
				control.value = uV(input);
				control.text  = trimDec(unitConvert(control.value,type)) + " " + type;
				return control.value;
			},
			update = function() {
				setUV(CONTROLS.PX,bX); setUV(CONTROLS.PY,bY);
				setUV(CONTROLS.CX,cX); setUV(CONTROLS.CY,cY);
				setUV(CONTROLS.BT,bY); setUV(CONTROLS.BB,getBB());
				setUV(CONTROLS.BL,bX); setUV(CONTROLS.BR,getBR());
			};

		// helpers
		var setEvenCX   = function() {cX = dX - (2 * bX);},
			setEvenCY   = function() {cY = dY - (2 * bY);},
			setCenterCX = function() {
				if(CONTROLS.LI.value) {
					bX = bY;
					setEvenCX();
				}
			},
			setCenterCY = function() {
				if(CONTROLS.LI.value) {
					bY = bX;
					setEvenCY();
				}
			},
			setCenterBX = function() {setEvenCX(); setCenterCY();},
			setCenterBY = function() {setEvenCY(); setCenterCX();},

			getBB = function() {return dY - (bY + cY);},
			getBR = function() {return dX - (bX + cX);};

		// crop box modifiers
		var setPX = function(n) {bX = n;},
			setPY = function(n) {bY = n;},
			setCX = function(n) {
				cX = n;
				if(CONTROLS.BC.value) bX = (dX - cX) / 2;
				setCenterCY();
			},
			setCY = function(n) {
				cY = n;
				if(CONTROLS.BC.value) bY = (dY - cY) / 2;
				setCenterCX();
			},

			setBT = function(n) {
				var tmp = bY;
				bY = n;
				if(CONTROLS.BC.value) setCenterBY();
				else cY -= n - tmp;
			},
			setBB = function(n) {
				cY += getBB() - n;
				if(CONTROLS.BC.value) {
					bY = getBB();
					setCenterBY();
				}
			},
			setBL = function(n) {
				var tmp = bX;
				bX = n;
				if(CONTROLS.BC.value) setCenterBX();
				else cX -= n - tmp;
			},
			setBR = function(n) {
				cX += getBR() - n;
				if(CONTROLS.BC.value) {
					bX = getBR();
					setCenterBX();
				}
			},
			setBA = function(n) {
				bX = bY = n;
				setEvenCX();
				setEvenCY();
			};

		var setProp = function(tag,val,ut) {

			var n = setUV(CONTROLS[tag],val,ut);

			switch(tag) {
				case "PX" : setPX(n); break;
				case "PY" : setPY(n); break;
				case "CX" : setCX(n); break;
				case "CY" : setCY(n); break;
				case "BT" : setBT(n); break;
				case "BB" : setBB(n); break;
				case "BL" : setBL(n); break;
				case "BR" : setBR(n); break;
				case "BA" : setBA(n); break;
			}

			update();

		};

		return {
			setProp:setProp
		};

	})();

	// Bounding Box

	BOX.setProp("DW",SETTINGS.getVal("dX"));
	BOX.setProp("DH",SETTINGS.getVal("dY"));

	// Crop Box

	CONTROLS.CX.onChange = function() {BOX.setProp("CX");};
	CONTROLS.CY.onChange = function() {BOX.setProp("CY");};
	CONTROLS.PX.onChange = function() {BOX.setProp("PX");};
	CONTROLS.PY.onChange = function() {BOX.setProp("PY");};

	// Bleeds

	CONTROLS.LI.onClick  = function() {
		CONTROLS.BC.enabled = !CONTROLS.LI.value;
		if(CONTROLS.LI.value) {
			CONTROLS.BC.value = CONTROLS.LI.value;
			CONTROLS.BC.onClick();
			BOX.setProp("BA");
		}
	};
	CONTROLS.BC.onClick  = function() {
		CONTROLS.PX.enabled = CONTROLS.PY.enabled = !CONTROLS.BC.value;
		if(CONTROLS.BC.value) {
			CONTROLS.CX.onChange();
			CONTROLS.CY.onChange();
		}
	};

	CONTROLS.BT.onChange = function() {BOX.setProp("BT");};
	CONTROLS.BB.onChange = function() {BOX.setProp("BB");};
	CONTROLS.BL.onChange = function() {BOX.setProp("BL");};
	CONTROLS.BR.onChange = function() {BOX.setProp("BR");};

	// Stroke

	CONTROLS.SW.onChange = function() {BOX.setProp("SW",undefined,"pt");};
	CONTROLS.SL.onChange = function() {BOX.setProp("SL");};
	CONTROLS.SO.onChange = function() {BOX.setProp("SO");};

	// Buttons

	newWindow.bottomGroup.cancelButton.onClick = function(){return newWindow.close();};
	newWindow.bottomGroup.startButton.onClick  = function(){

		// save settings
		SETTINGS.setVal("cX",CONTROLS.CX.value);
		SETTINGS.setVal("cY",CONTROLS.CY.value);
		SETTINGS.setVal("bX",CONTROLS.BL.value);
		SETTINGS.setVal("bY",CONTROLS.BT.value);

		SETTINGS.setVal("sW",CONTROLS.SW.value);
		SETTINGS.setVal("sL",CONTROLS.SL.value);
		SETTINGS.setVal("sO",CONTROLS.SO.value);

		SETTINGS.whiteOutlines = CONTROLS.WO.value;
		SETTINGS.drawGuides    = CONTROLS.DG.value;

		// start
		newWindow.close();
		draw();

	};

	// Init UI

	CONTROLS.BC.onClick();
	CONTROLS.LI.onClick();
	BOX.setProp("BT",SETTINGS.getVal("bY"));
	CONTROLS.BT.onChange();
	BOX.setProp("BL",SETTINGS.getVal("bX"));
	CONTROLS.BL.onChange();
	BOX.setProp("SW",SETTINGS.getVal("sW"),"pt");
	BOX.setProp("SL",SETTINGS.getVal("sL"));
	BOX.setProp("SO",SETTINGS.getVal("sO"));

	return newWindow;

}

function draw() {

	var DOC   = app.activeDocument,
		LAYER = DOC.layers.add(),
		BOX   = LAYER.pathItems.rectangle(
			SETTINGS.getTrue("bY") * -1,
			SETTINGS.getTrue("bX"),
			SETTINGS.getTrue("cX"),
			SETTINGS.getTrue("cY")
		);

	LAYER.name = "CROP";

	drawCropMarks(DOC,LAYER,BOX);

	if(SETTINGS.drawGuides) drawGuideBox(DOC,LAYER,BOX);

	BOX.remove();

}

function drawCropMarks(DOC,LAYER,BOX) {

	var sW = SETTINGS.getTrue("sW"),
		sL = SETTINGS.getTrue("sL"),
		sO = SETTINGS.getTrue("sO");

	function getCorner(i) {
		return BOX.pathPoints[i].anchor.slice(0);
	}

	function drawLine(anchors,thickness,color) {

		// define stroke
		var newLine = LAYER.pathItems.add();
		newLine.stroked = true;
		newLine.strokeColor = color;
		newLine.strokeWidth = thickness;

		// set path
		newLine.setEntirePath(anchors);

		return newLine;

	}

	function drawMark(startPoint,direction,isOutline) {

		// set anchors
		var endPoint = startPoint.slice(0);
		switch(direction) {
			case 0: // up
				startPoint[1] -= sO;
				endPoint[1] = startPoint[1] - sL;
				break;
			case 1: // right
				startPoint[0] += sO;
				endPoint[0] = startPoint[0] + sL;
				break;
			case 2: // down
				startPoint[1] += sO;
				endPoint[1] = startPoint[1] + sL;
				break;
			case 3: // left
				startPoint[0] -= sO;
				endPoint[0] = startPoint[0] - sL;
				break;
		}

		// set line properties
		var thickness, color;
		if(!isOutline) {
			thickness = sW;
			color = BLACK;
		} else {
			thickness = sW * 2;
			color = WHITE;
		}

		return drawLine([startPoint,endPoint],thickness,color);

	}

	function drawMarks(isOutline) {
		drawMark(getCorner(0),0,isOutline);
		drawMark(getCorner(3),0,isOutline);
		drawMark(getCorner(3),1,isOutline);
		drawMark(getCorner(2),1,isOutline);
		drawMark(getCorner(2),2,isOutline);
		drawMark(getCorner(1),2,isOutline);
		drawMark(getCorner(1),3,isOutline);
		drawMark(getCorner(0),3,isOutline);
	}

	if(SETTINGS.whiteOutlines) drawMarks(true);

	drawMarks(false);

}

function drawGuideBox(DOC,LAYER,BOX) {

	function drawGuide(shift,isVertical) {
		var newLine = LAYER.pathItems.add(),
			startPoint=[], endPoint=[];
		newLine.guides = true;
		if(isVertical) {
			startPoint[0] = endPoint[0] = shift;
			startPoint[1] = 0;
			endPoint[1]   = SETTINGS.getTrue("dY") * -1;
		} else {
			startPoint[1] = endPoint[1] = shift * -1;
			startPoint[0] = 0;
			endPoint[0]   = SETTINGS.getTrue("dX");
		}
		newLine.setEntirePath([startPoint,endPoint]);
		return newLine;
	}

	drawGuide(SETTINGS.getTrue("bX"), true);
	drawGuide(SETTINGS.getTrue("bX") + SETTINGS.getTrue("cX"), true);
	drawGuide(SETTINGS.getTrue("bY"), false);
	drawGuide(SETTINGS.getTrue("bY") + SETTINGS.getTrue("cY"), false);

}

function unitConvert(input,uType) {

	if(parseFloat(input).toString() == input.toString()) input += " " + SETTINGS.defaultUnits;
	var uVal = new UnitValue(input);

	switch(uType) {
		case "in":
		case "inch": uType = "in";
		case "inches": uType = "in";
		case "cm":
		case "mm":
		case "pt":
		case "px":
		case "qs":
		case "pica":
		case "cicero":
			return uVal.as(uType);
		default:
			return uVal.as(SETTINGS.defaultUnits);
	}

}

function trimDec(n) {
	if(Math.ceil( (n*100000)%10 ) > 0) return n.toFixed(4);
	else return n;
}

function getDocUnits() {
	switch(app.activeDocument.rulerUnits) {
		case RulerUnits.Centimeters: return "cm";
		case RulerUnits.Inches:      return "in";
		case RulerUnits.Millimeters: return "mm";
		case RulerUnits.Picas:       return "pc";
		case RulerUnits.Points:      return "pt";
		case RulerUnits.Qs:          return "qs";
		case RulerUnits.Pixels:      return "px";
		case RulerUnits.Unknown:     return undefined;
	}
}

function colorRGB(r,g,b) {
	var _color = new RGBColor();
	_color.red   = r;
	_color.green = g;
	_color.blue  = b;
	return _color;
}

function colorCMYK(c,m,y,k) {
	var _color = new CMYKColor();
	_color.cyan    = c;
	_color.magenta = m;
	_color.yellow  = y;
	_color.black   = k;
	return _color;
}

function printToDebug(s) {
	if(SETTINGS.debuggerOn) W.DEBUG.text += s + " ";
}

var BLACK = (function(){
	if(app.activeDocument.documentColorSpace == DocumentColorSpace.CMYK) {
		return colorCMYK(40,40,40,100);
	} else {
		return colorRGB(0,0,0);
	}
})();

var WHITE = (function(){
	if(app.activeDocument.documentColorSpace == DocumentColorSpace.CMYK) {
		return colorCMYK(0,0,0,0);
	} else {
		return colorRGB(100,100,100);
	}
})();

main();

