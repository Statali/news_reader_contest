"use strict";
var stack_layout_1 = require("ui/layouts/stack-layout");
var label_1 = require("ui/label");
var enums = require("ui/enums");
var span_1 = require("text/span");
var image_1 = require("ui/image");
var color_1 = require("color");
var formatted_string_1 = require("text/formatted-string");
var xml = require("xml");
var ParseHelper = (function () {
    function ParseHelper() {
    }
    ParseHelper._getImageSourceFromRelations = function (id) {
        var src = "";
        for (var loop = 0; loop < ParseHelper.relations.length; loop++) {
            var currentItem = ParseHelper.relations[loop];
            if (currentItem.primaryType === "bbc.mobile.news.image"
                && currentItem.content.id === id) {
                return currentItem.content.href;
            }
        }
    };
    ParseHelper._handleStartElement = function (elementName, attr) {
        switch (elementName) {
            case "body":
                var body = new stack_layout_1.StackLayout();
                body.orientation = enums.Orientation.vertical;
                ParseHelper.structure.push(body);
                break;
            case "paragraph":
                var paragraph = new label_1.Label();
                paragraph.textWrap = true;
                if (attr && attr.role === "introduction") {
                    paragraph.cssClass = "Header";
                }
                else {
                    paragraph.cssClass = "Paragraph";
                }
                paragraph.formattedText = new formatted_string_1.FormattedString();
                ParseHelper.structure.push(paragraph);
                break;
            case "crosshead":
                var crosshead = new label_1.Label();
                crosshead.textWrap = true;
                crosshead.cssClass = "Crosshead";
                crosshead.formattedText = new formatted_string_1.FormattedString();
                ParseHelper.structure.push(crosshead);
                break;
            case "italic":
                var si = void 0;
                if (ParseHelper.structure[ParseHelper.structure.length - 1] instanceof span_1.Span) {
                    si = ParseHelper.structure[ParseHelper.structure.length - 1];
                }
                else {
                    si = new span_1.Span();
                    ParseHelper.structure.push(si);
                }
                si.fontAttributes = si.fontAttributes | enums.FontAttributes.Italic;
                break;
            case "bold":
                var sb = void 0;
                if (ParseHelper.structure[ParseHelper.structure.length - 1] instanceof span_1.Span) {
                    sb = ParseHelper.structure[ParseHelper.structure.length - 1];
                }
                else {
                    sb = new span_1.Span();
                    ParseHelper.structure.push(sb);
                }
                sb.fontAttributes = sb.fontAttributes | enums.FontAttributes.Bold;
                break;
            case "link":
                var link = new span_1.Span();
                link.underline = 1;
                link.foregroundColor = new color_1.Color("#BB1919");
                ParseHelper.structure.push(link);
                break;
            case "url":
                ParseHelper._isUrlIn = true;
                break;
            case "image":
                var img = new image_1.Image();
                img.stretch = enums.Stretch.aspectFill;
                img.height = 150;
                img.src = ParseHelper._getImageSourceFromRelations(attr.id);
                ParseHelper.structure.push(img);
                break;
            case "list":
                var lst = new stack_layout_1.StackLayout();
                lst.cssClass = "List";
                lst.orientation = enums.Orientation.vertical;
                ParseHelper.structure.push(lst);
                break;
            case "listItem":
                var bullet = new span_1.Span();
                bullet.text = "●  ";
                var lbl = new label_1.Label();
                lbl.textWrap = true;
                lbl.cssClass = "ListItem";
                lbl.formattedText = new formatted_string_1.FormattedString();
                lbl.formattedText.spans.push(bullet);
                ParseHelper.structure.push(lbl);
                break;
            default:
                console.log("UNKNOWN TAG " + elementName);
                break;
        }
    };
    ParseHelper._handleEndElement = function (elementName) {
        switch (elementName) {
            case "body":
                break;
            case "paragraph":
            case "listItem":
            case "crosshead":
                var label = ParseHelper.structure.pop();
                ParseHelper.structure[ParseHelper.structure.length - 1].addChild(label);
                break;
            case "image":
                var img = ParseHelper.structure.pop();
                ParseHelper.structure[ParseHelper.structure.length - 1].addChild(img);
                break;
            case "italic":
            case "bold":
            case "link":
                // Added check for nested bold/italic tags
                if (ParseHelper.structure[ParseHelper.structure.length - 1] instanceof span_1.Span) {
                    var link = ParseHelper.structure.pop();
                    ParseHelper.structure[ParseHelper.structure.length - 1].formattedText.spans.push(link);
                    break;
                }
            case "url":
                ParseHelper._isUrlIn = false;
                break;
            case "list":
                var sl = ParseHelper.structure.pop();
                ParseHelper.structure[ParseHelper.structure.length - 1].addChild(sl);
                break;
        }
    };
    ParseHelper._handleText = function (text) {
        if (text === "")
            return;
        var structureTop = ParseHelper.structure[ParseHelper.structure.length - 1];
        if (ParseHelper._isUrlIn) {
        }
        else if (structureTop instanceof label_1.Label) {
            var span = new span_1.Span();
            span.text = text;
            structureTop.formattedText.spans.push(span);
        }
        else if (structureTop instanceof span_1.Span) {
            structureTop.text = text;
        }
        else {
            console.log("UNKNOWN TOP", structureTop);
        }
    };
    ParseHelper.xmlParserCallback = function (event) {
        try {
            switch (event.eventType) {
                case xml.ParserEventType.StartElement:
                    ParseHelper._handleStartElement(event.elementName, event.attributes);
                    break;
                case xml.ParserEventType.Text:
                    ParseHelper._handleText(event.data);
                    break;
                case xml.ParserEventType.EndElement:
                    ParseHelper._handleEndElement(event.elementName);
                    break;
            }
        }
        catch (e) {
            console.log("ERROR", e);
        }
    };
    ParseHelper._isUrlIn = false;
    return ParseHelper;
}());
exports.ParseHelper = ParseHelper;
//# sourceMappingURL=parse-helper.js.map