import ace from '../BraceExternal/FBrace';
import Dom from 'absol/src/HTML5/Dom';
import BCore from '../components/BCore';

import { randomIdent } from 'absol/src/String/stringGenerate';

import './diff.css'

var $ = BCore.$;
var _ = BCore._;

/**
 * @typedef {Object} BraceDiffOption
 * @property {String} element selector query | HTML element
 * @property {BraceDiffOptionLeft} left
 * @property {BraceDiffOptionLeft} right
 *  
 * 
 *  
 * @param {BraceDiffOption} option 
 */

function BraceDiff(option) {
    if (!(this instanceof BraceDiff)) return new BraceDiff(option);
    this._option = option;
    this.editorLeft = null;
    this.editorRight = null;
    this.$element = null;
    this._attachedTo(option.element);
}


BraceDiff.prototype._attachedTo = function (elt) {
    var _this = this;
    if (typeof elt == 'string') {
        elt = $(elt);
        if (elt) {
            this.edit(elt);
        }
        else {
            throw new Error('Can not find ' + elt);
        }

    }
    else if (Dom.isDomNode(elt)) {
        if ($(elt).isDescendantOf(document.body)) {
            this.edit(elt);
        }
        else {
            _('attachhook').on('error', function (event) {
                this.remove();
                _this.edit(elt);
            }).addTo(elt);
        }
    }
    else
        throw new Error('Invalid element');


};

/**
 * @param {Element} element
 */
BraceDiff.prototype.edit = function (element) {
    this.$element = element.addClass('brace-diff');
    this.$leftPreCtn = _('.brace-diff-left-container').addTo(this.$element);
    this.$rightPreCtn = _('.brace-diff-right-container').addTo(this.$element);
    this._leftPreId = randomIdent(20);
    this._rightPreId = randomIdent(20);
    this.$leftPre = _('pre.brace-diff-left#' + this._leftPreId).addTo(this.$leftPreCtn);
    this.$rightPre = _('pre.brace-diff-left#' + this._rightPreId).addTo(this.$rightPreCtn);
    this.editorLeft = ace.edit(this._leftPreId);
    this.editorRight = ace.edit(this._rightPreId);
    this._setupEditors();
    return this;
};

BraceDiff.prototype._setupEditors = function(){
    this.editorLeft.setOptions({
        mode:'ace/mode/javascript'
    })

    console.log(this.editorLeft)
};


BraceDiff.prototype.getEditors = function () {
    return [this.editorLeft, this.editorRight];
}


export default BraceDiff;