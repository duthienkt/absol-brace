import './ace.css';
import ace from 'brace';
import 'brace/mode/javascript';
import 'brace/mode/php';
import 'brace/mode/json';
import 'brace/mode/text';
import 'brace/mode/html';
import 'brace/mode/xml';
import 'brace/mode/sql';
import 'brace/mode/sh';
import 'brace/mode/css';
import 'brace/mode/scss';
import 'brace/mode/typescript';
import 'brace/mode/jsx';
import 'brace/mode/plain_text';
import 'brace/mode/powershell';

import FBraceEditor from './FBraceEditor';
import FEditSession from './FEditSession';

var aceEdit = ace.edit;

ace.edit = function(){
    var editor = aceEdit.apply(this, arguments);
    Object.defineProperties(editor, Object.getOwnPropertyDescriptors(FBraceEditor.prototype));
    FBraceEditor.call(editor);
    return editor;
};

Object.defineProperties(ace.EditSession.prototype, Object.getOwnPropertyDescriptors(FEditSession.prototype));

export default ace;