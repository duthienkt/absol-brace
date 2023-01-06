import './ace.css';
import FBraceEditor from './FBraceEditor';
import FEditSession from './FEditSession';

var ace = window.ace ||{};

Object.defineProperties(ace.EditSession.prototype, Object.getOwnPropertyDescriptors(FEditSession.prototype));

export default ace;