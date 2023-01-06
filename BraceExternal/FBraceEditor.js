import BCore from "../components/BCore";
import { isDomNode } from "absol/src/HTML5/Dom";
var ace = window.ace ||{};
var aceEdit = ace && ace.edit;

ace.edit = function () {
    return newExtendedEditor({ element: arguments[0] });
};

function newExtendedEditor(props) {
    var element = props.element;
    if (typeof element === "string") {
        element = BCore.$(element) || BCore.$('#' + element);
    }
    if (!element || !isDomNode(element)) {
        throw new Error("Could not file element in options!");
    }

    var editor = aceEdit.apply(ace, [element]);
    Object.defineProperties(editor, Object.getOwnPropertyDescriptors(FBraceEditor.prototype));
    FBraceEditor.call(editor, props);
    return editor;
}

function FBraceEditor(props) {
    //do not new this class
    if (!this || !this.isFBraceEditor) return newExtendedEditor(props);
    this.setOptions(Object.assign({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: false
    }, props.option));
}

FBraceEditor.prototype.isFBraceEditor = true;

FBraceEditor.prototype.$onLineCountChange = function () {
    // console.log(this);
};


FBraceEditor.prototype.getLineCount = function () {
    var session = this.getSession();
    return session.$rowLengthCache.length;
};

export default FBraceEditor;