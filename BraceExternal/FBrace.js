import './ace.css';
import FBraceEditor from './FBraceEditor';
import FEditSession from './FEditSession';

var ace = window.ace ||{
    acequire: function (){
        return {
            desc: 'ace is not loaded yet!'
        };
    }
};
if (ace.EditSession)
Object.defineProperties(ace.EditSession.prototype, Object.getOwnPropertyDescriptors(FEditSession.prototype));

export default ace;