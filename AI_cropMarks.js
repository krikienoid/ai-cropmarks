/***************************************************

    CUSTOM CROP MARK CREATOR v0.1

    For use with: Adobe Illustrator CS6
    Written by: Ken Sugiura
    copyright(c) Sept 2014

***************************************************/

var W,
    SETTINGS,
    BLACK,
    WHITE;

// Initialization

function main() {

    if (!app.activeDocument) return 1;

    if (app.activeDocument.documentColorSpace == DocumentColorSpace.CMYK) {
        BLACK = colorCMYK(40,40,40,100);
        WHITE = colorCMYK(0,0,0,0);
    }
    else {
        BLACK = colorRGB(0,0,0);
        WHITE = colorRGB(255,255,255);
    }

    W = {};
    initSettings();
    initWindowMain();

}

function initSettings() {
    var DOC      = app.activeDocument,
        DOC_UNIT = getDocUnit();

    var _sData = {
        dX : new UnitValue(DOC.width,  "pt"),
        dY : new UnitValue(DOC.height, "pt"),
        cX : new UnitValue(0,     "in"),
        cY : new UnitValue(0,     "in"),
        bX : new UnitValue(0.125, "in"),
        bY : new UnitValue(0.125, "in"),
        sW : new UnitValue(0.25,  "pt"),
        sL : new UnitValue(0.25,  "in"),
        sO : new UnitValue(0.25,  "in")
    };

    var setVal = function (tag, val) {
            // EXPECTS: String tag, Number val
            // RETURNS: void
            _sData[tag] = new UnitValue(val, DOC_UNIT);
        },
        getVal = function (tag) {
            // EXPECTS: String tag
            // RETURNS: Number value
            return _sData[tag].as(DOC_UNIT);
        },
        getPts = function (tag) {
            // EXPECTS: String tag
            // RETURNS: Number value
            return _sData[tag].as("pt");
        };

    SETTINGS = {
        docUnit       : DOC_UNIT,
        whiteOutlines : true,
        drawGuides    : false,
        debuggerOn    : false,
        setVal        : setVal,
        getVal        : getVal,
        getPts        : getPts
    };

}

function initWindowMain() {
    var DOC    = app.activeDocument;

    var WINDOW = new Window("dialog { \
        orientation   : 'column',            \
        alignChildren : ['fill', 'top'],     \
        preferredSize : [300, 130],          \
        text          : 'Custom Crop Marks', \
        margins       : 15,                  \
        \
        boxPanel : Panel { \
            orientation   : 'column',        \
            alignChildren : ['fill', 'top'], \
            margins       : 15,              \
            text          : 'Bounding Box',  \
            rows : Group { \
                orientation   : 'column',       \
                alignChildren : ['fill', 'top'] \
            }, \
            hr0 : Panel { \
                preferredSize : [undefined, 2] \
            }, \
            bleeds : Group { \
                orientation   : 'column',        \
                alignChildren : ['fill', 'top'], \
                st0  : StaticText {text:'Bleeds'}, \
                row0 : Group { \
                    orientation   : 'row',  \
                    alignChildren : 'left', \
                    st0 : StaticText {text:'Top:'},    \
                    bT  : EditText {value:0, text:'0', characters:10, justify:'left'}, \
                    st1 : StaticText {text:'Bottom:'}, \
                    bB  : EditText {value:0, text:'0', characters:10, justify:'left'}, \
                    st2 : StaticText {text:'Left:'},   \
                    bL  : EditText {value:0, text:'0', characters:10, justify:'left'}, \
                    st3 : StaticText {text:'Right:'},  \
                    bR  : EditText {value:0, text:'0', characters:10, justify:'left'}  \
                }, \
                row1 : Group { \
                    orientation   : 'row',  \
                    alignChildren : 'left', \
                    bC : Checkbox {text:'Centered', value:true}, \
                    li : Checkbox {text:'Linked',   value:false} \
                } \
            } \
        }, \
        strokePanel : Panel { \
            orientation   : 'column',        \
            alignChildren : ['fill', 'top'], \
            margins       : 15,              \
            text          : 'Stroke',        \
            row0 : Group { \
                orientation   : 'row',  \
                alignChildren : 'left', \
                st0 : StaticText {text:'Thickness:'}, \
                sW  : EditText {minvalue:0, value:0, text:'0', characters:10, justify:'left'}, \
                st1 : StaticText {text:'Length:'}, \
                sL  : EditText {minvalue:0, value:0, text:'0', characters:10, justify:'left'}, \
                st2 : StaticText {text:'Offset:'}, \
                sO  : EditText {minvalue:0, value:0, text:'0', characters:10, justify:'left'}  \
            }, \
            row1 : Group { \
                orientation   : 'row',  \
                alignChildren : 'left', \
                wO : Checkbox {text:'White Outlines', value:false}, \
                dG : Checkbox {text:'Draw Guides',    value:false}  \
            } \
        }, \
        bottomGroup : Group { \
            cancelButton : Button { \
                text       : 'Close',            \
                properties : {name:'cancel'},    \
                size       : [120, 24],          \
                alignment  : ['right', 'center'] \
            }, \
            startButton  : Button { \
                text       : 'Draw Crop Marks',  \
                properties : {name:'ok'},        \
                size       : [120, 24],          \
                alignment  : ['right', 'center'] \
            } \
        } \
    }");

    var C_BOX  = WINDOW.boxPanel.rows,
        BLEEDS = WINDOW.boxPanel.bleeds.row0,
        STROKE = WINDOW.strokePanel;

    function newRolColHeader(parent, label) {
        var newStatic = parent.add("statictext");
        newStatic.preferredSize.width = 80;
        newStatic.text = label;
        return newStatic;
    }

    function newRowColInput(parent, label, isEdit) {
        var newCol,
            newStatic,
            newText;

        newCol = parent.add("group");
        newCol.orientation = "row";
        newCol.preferredSize.width = 80;

        newStatic = newCol.add("statictext");
        newStatic.preferredSize.width = 12;
        newStatic.text = label + ":";

        if (isEdit) {
            newText = newCol.add("edittext");
            newText.minValue   = 0;
            newText.value      = 0;
            newText.text       = "0";
            newText.characters = 10;
            newText.justify    = "left";
        }
        else {
            newText = newCol.add("statictext");
        }

        return newText;

    }

    function newRowColInputGroups() {
        var newRow0 = C_BOX.add("group"),
            newRow1 = C_BOX.add("group"),
            newRow2 = C_BOX.add("group");

        newRow0.orientation   = "row";
        newRow0.alignChildren = ["left","center"];
        newRolColHeader(newRow0, "Document");
        newRolColHeader(newRow0, "Crop Area");

        newRow1.orientation   = "row";
        newRow1.alignChildren = ["left", "center"];
        newRow2.orientation   = "row";
        newRow2.alignChildren = ["left", "center"];

        return [
            [
                newRowColInput(newRow1, "W", false),
                newRowColInput(newRow1, "X", true),
                newRowColInput(newRow1, "W", true)
            ],
            [
                newRowColInput(newRow2, "H", false),
                newRowColInput(newRow2, "Y", true),
                newRowColInput(newRow2, "H", true)
            ]
        ];

    }

    function initDebugPanel() {
        var newPanel = WINDOW.add("panel"),
            newText  = newPanel.add("statictext");
        newPanel.alignChildren = ["fill", "fill"];
        newPanel.margins       = 15;
        newPanel.text          = "Debug Info";
        newPanel.preferredSize.height = 20;
        newText.preferredSize = ["fill", "fill"];
        newText.scrollable    = true;
        return newText;
    }

    if (SETTINGS.debuggerOn) W.DEBUG = initDebugPanel();

    var COL_ROW_INPUTS = newRowColInputGroups();

    // Controls

    var CONTROLS = {
        DW : COL_ROW_INPUTS[0][0],
        DH : COL_ROW_INPUTS[1][0],
        PX : COL_ROW_INPUTS[0][1],
        PY : COL_ROW_INPUTS[1][1],
        CX : COL_ROW_INPUTS[0][2],
        CY : COL_ROW_INPUTS[1][2],
        LI : WINDOW.boxPanel.bleeds.row1.li,
        BC : WINDOW.boxPanel.bleeds.row1.bC,
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

    var setBoxProp = (function () {
        var uT = SETTINGS.docUnit,
            dX = SETTINGS.getVal("dX"),
            dY = SETTINGS.getVal("dY"),
            cX = SETTINGS.getVal("cX"),
            cY = SETTINGS.getVal("cY"),
            bX = SETTINGS.getVal("bX"),
            bY = SETTINGS.getVal("bY");

        // Input and Update functions
        var updateControl = function (control, input, displayUnit) {
                // EXPECTS: Object control, String input, String displayUnit
                // RETURNS: Number value
                var _uV;
                if (typeof displayUnit  == "undefined") displayUnit  = uT;
                if (typeof input == "undefined")        input        = control.text;
                _uV = (isValidNumber(input))?
                    new UnitValue(input, uT) :
                    new UnitValue(input);
                control.value = _uV.as(uT);
                control.text  = trimDec(_uV.as(displayUnit)) + " " + displayUnit;
                return control.value;
            },
            update        = function () {
                // EXPECTS: void
                // RETURNS: void
                updateControl(CONTROLS.PX, bX); updateControl(CONTROLS.PY, bY);
                updateControl(CONTROLS.CX, cX); updateControl(CONTROLS.CY, cY);
                updateControl(CONTROLS.BT, bY); updateControl(CONTROLS.BB, getBB());
                updateControl(CONTROLS.BL, bX); updateControl(CONTROLS.BR, getBR());
            };

        // Helper functions
        var setEvenCX   = function () {cX = dX - (2 * bX);},
            setEvenCY   = function () {cY = dY - (2 * bY);},
            setCenterCX = function () {if (CONTROLS.LI.value) {bX = bY; setEvenCX();}},
            setCenterCY = function () {if (CONTROLS.LI.value) {bY = bX; setEvenCY();}},
            setCenterBX = function () {setEvenCX(); setCenterCY();},
            setCenterBY = function () {setEvenCY(); setCenterCX();},
            getBB       = function () {return dY - (bY + cY);},
            getBR       = function () {return dX - (bX + cX);};

        // Crop area property setters
        var setPX = function (n) {bX = n;},
            setPY = function (n) {bY = n;},
            setCX = function (n) {
                cX = n;
                if (CONTROLS.BC.value) bX = (dX - cX) / 2;
                setCenterCY();
            },
            setCY = function (n) {
                cY = n;
                if (CONTROLS.BC.value) bY = (dY - cY) / 2;
                setCenterCX();
            },
            setBT = function (n) {
                var tmp = bY;
                bY = n;
                if (CONTROLS.BC.value) setCenterBY();
                else                   cY -= n - tmp;
            },
            setBB = function (n) {
                cY += getBB() - n;
                if (CONTROLS.BC.value) {
                    bY = getBB();
                    setCenterBY();
                }
            },
            setBL = function (n) {
                var tmp = bX;
                bX = n;
                if (CONTROLS.BC.value) setCenterBX();
                else                   cX -= n - tmp;
            },
            setBR = function (n) {
                cX += getBR() - n;
                if (CONTROLS.BC.value) {
                    bX = getBR();
                    setCenterBX();
                }
            },
            setBA = function (n) {
                bX = bY = n;
                setEvenCX();
                setEvenCY();
            };

        return function (tag, input, displayUnit) {
            // EXPECTS: String tag, String input, String displayUnit
            // RETURNS: void
            var n = updateControl(CONTROLS[tag], input, displayUnit);
            switch (tag) {
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

    })();

    setBoxProp("DW", SETTINGS.getVal("dX"));
    setBoxProp("DH", SETTINGS.getVal("dY"));

    CONTROLS.CX.onChange = function () {setBoxProp("CX");};
    CONTROLS.CY.onChange = function () {setBoxProp("CY");};
    CONTROLS.PX.onChange = function () {setBoxProp("PX");};
    CONTROLS.PY.onChange = function () {setBoxProp("PY");};

    CONTROLS.LI.onClick  = function () {
        CONTROLS.BC.enabled = !CONTROLS.LI.value;
        if (CONTROLS.LI.value) {
            CONTROLS.BC.value = CONTROLS.LI.value;
            CONTROLS.BC.onClick();
            setBoxProp("BA");
        }
    };
    CONTROLS.BC.onClick  = function () {
        CONTROLS.PX.enabled = CONTROLS.PY.enabled = !CONTROLS.BC.value;
        if (CONTROLS.BC.value) {
            CONTROLS.CX.onChange();
            CONTROLS.CY.onChange();
        }
    };

    CONTROLS.BT.onChange = function () {setBoxProp("BT");};
    CONTROLS.BB.onChange = function () {setBoxProp("BB");};
    CONTROLS.BL.onChange = function () {setBoxProp("BL");};
    CONTROLS.BR.onChange = function () {setBoxProp("BR");};

    CONTROLS.SW.onChange = function () {setBoxProp("SW", undefined, "pt");};
    CONTROLS.SL.onChange = function () {setBoxProp("SL");};
    CONTROLS.SO.onChange = function () {setBoxProp("SO");};

    // Buttons

    WINDOW.bottomGroup.cancelButton.onClick = function () {return WINDOW.close();};
    WINDOW.bottomGroup.startButton.onClick  = function () {

        // save settings
        SETTINGS.setVal("cX", CONTROLS.CX.value);
        SETTINGS.setVal("cY", CONTROLS.CY.value);
        SETTINGS.setVal("bX", CONTROLS.BL.value);
        SETTINGS.setVal("bY", CONTROLS.BT.value);
        SETTINGS.setVal("sW", CONTROLS.SW.value);
        SETTINGS.setVal("sL", CONTROLS.SL.value);
        SETTINGS.setVal("sO", CONTROLS.SO.value);
        SETTINGS.whiteOutlines = CONTROLS.WO.value;
        SETTINGS.drawGuides    = CONTROLS.DG.value;

        // start
        WINDOW.close();
        draw();

    };

    // Init UI

    CONTROLS.BC.onClick();
    CONTROLS.LI.onClick();
    setBoxProp("BT", SETTINGS.getVal("bY"));
    CONTROLS.BT.onChange();
    setBoxProp("BL", SETTINGS.getVal("bX"));
    CONTROLS.BL.onChange();
    setBoxProp("SW", SETTINGS.getVal("sW"), "pt");
    setBoxProp("SL", SETTINGS.getVal("sL"));
    setBoxProp("SO", SETTINGS.getVal("sO"));

    W.MAIN = WINDOW;
    W.MAIN.show();

}

// Draw Functions

function draw() {
    var DOC   = app.activeDocument,
        LAYER = DOC.layers.add(),
        BOX   = LAYER.pathItems.rectangle(
            SETTINGS.getPts("bY") * -1,
            SETTINGS.getPts("bX"),
            SETTINGS.getPts("cX"),
            SETTINGS.getPts("cY")
        );

    LAYER.name = "CROP MARKS";

    drawCropMarks(DOC, LAYER, BOX);

    if (SETTINGS.drawGuides) drawGuideBox(DOC, LAYER, BOX);

    BOX.remove();

}

function drawCropMarks(DOC, LAYER, BOX) {
    var sW = SETTINGS.getPts("sW"),
        sL = SETTINGS.getPts("sL"),
        sO = SETTINGS.getPts("sO");

    function getCorner(i) {
        // EXPECTS: Number i
        // RETURNS: Array anchor
        return BOX.pathPoints[i].anchor.slice(0);
    }

    function drawLine(anchors, thickness, color) {
        // EXPECTS: PathPoints anchors, Number thickness, Color color
        // RETURNS: PathItem line

        // define stroke
        var newLine = LAYER.pathItems.add();
        newLine.stroked      = true;
        newLine.strokeColor  = color;
        newLine.strokeWidth  = thickness;
        newLine.pixelAligned = false;

        // set path
        newLine.setEntirePath(anchors);

        return newLine;

    }

    function drawMark(startPoint, direction, isOutline) {
        // EXPECTS: Array startPoint, Number direction, Boolean isOutline
        // RETURNS: PathItem line
        var endPoint = startPoint.slice(0),
            thickness,
            color;

        // set anchors
        switch (direction) {
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
        if (!isOutline) {
            thickness = sW;
            color     = BLACK;
        }
        else {
            thickness = sW * 3;
            color     = WHITE;
        }

        return drawLine([startPoint, endPoint], thickness, color);

    }

    function drawMarks(isOutline) {
        // EXPECTS: Boolean isOutline
        // RETURNS: void
        drawMark(getCorner(0), 0, isOutline);
        drawMark(getCorner(3), 0, isOutline);
        drawMark(getCorner(3), 1, isOutline);
        drawMark(getCorner(2), 1, isOutline);
        drawMark(getCorner(2), 2, isOutline);
        drawMark(getCorner(1), 2, isOutline);
        drawMark(getCorner(1), 3, isOutline);
        drawMark(getCorner(0), 3, isOutline);
    }

    if (SETTINGS.whiteOutlines) drawMarks(true);

    drawMarks(false);

}

function drawGuideBox(DOC, LAYER, BOX) {

    function drawGuide(shift, isVertical) {
        var newLine    = LAYER.pathItems.add(),
            startPoint = [],
            endPoint   = [];
        newLine.guides = true;
        if (isVertical) {
            startPoint[0] = endPoint[0] = shift;
            startPoint[1] = 0;
            endPoint[1]   = SETTINGS.getPts("dY") * -1;
        }
        else {
            startPoint[1] = endPoint[1] = shift * -1;
            startPoint[0] = 0;
            endPoint[0]   = SETTINGS.getPts("dX");
        }
        newLine.setEntirePath([startPoint, endPoint]);
        return newLine;
    }

    drawGuide(SETTINGS.getPts("bX"),                         true);
    drawGuide(SETTINGS.getPts("bX") + SETTINGS.getPts("cX"), true);
    drawGuide(SETTINGS.getPts("bY"),                         false);
    drawGuide(SETTINGS.getPts("bY") + SETTINGS.getPts("cY"), false);

}

// Utility Functions

function isValidNumber(s) {
    // EXPECTS: String s
    // RETURNS: Boolean
    return parseFloat(s).toString() === s.toString();
}

function trimDec(n) {
    // EXPECTS: Number n
    // RETURNS: String
    if (Math.ceil((n * 100000) % 10) > 0) return n.toFixed(4);
    else                                  return n.toString();
}

function getDocUnit() {
    // EXPECTS: void
    // RETURNS: String unit
    switch (app.activeDocument.rulerUnits) {
        case RulerUnits.Centimeters: return "cm";
        case RulerUnits.Inches:      return "in";
        case RulerUnits.Millimeters: return "mm";
        case RulerUnits.Picas:       return "pc";
        case RulerUnits.Points:      return "pt";
        case RulerUnits.Qs:          return "qs";
        case RulerUnits.Pixels:      return "px";
        case RulerUnits.Unknown:     return "?";
    }
}

function colorRGB(r, g, b) {
    var _color = new RGBColor();
    _color.red   = r;
    _color.green = g;
    _color.blue  = b;
    return _color;
}

function colorCMYK(c, m, y, k) {
    var _color = new CMYKColor();
    _color.cyan    = c;
    _color.magenta = m;
    _color.yellow  = y;
    _color.black   = k;
    return _color;
}

function printToDebug(s) {
    if (SETTINGS.debuggerOn) W.DEBUG.text += s + " ";
}

// Run

main();
