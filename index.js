import ace from './BraceExternal/FBrace';

import BCore from "./components/BCore";
import Dom from 'absol/src/HTML5/Dom';
import BraceDiff from './BraceDiff/BraceDiff';


var AbsolBrace = {
    core: BCore,
    ace: ace
};


//test
Dom.documentReady.then(function () {
    BraceDiff({
        element: '.test0'
    });
});

export default AbsolBrace;


