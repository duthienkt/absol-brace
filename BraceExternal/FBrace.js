import './ace.css';


import FBraceEditor from './FBraceEditor';
import FEditSession from './FEditSession';

var aceEdit = ace && ace.edit;

ace.edit = function(){
    var editor = aceEdit.apply(this, arguments);
    Object.defineProperties(editor, Object.getOwnPropertyDescriptors(FBraceEditor.prototype));
    FBraceEditor.call(editor);
    return editor;
};

Object.defineProperties(ace.EditSession.prototype, Object.getOwnPropertyDescriptors(FEditSession.prototype));

export default ace;