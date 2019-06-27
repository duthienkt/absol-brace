import ace from '../BraceExternal/FBrace';
import Dom from 'absol/src/HTML5/Dom';
import BCore from '../components/BCore';

import { randomIdent } from 'absol/src/String/stringGenerate';

import './diff.css'

import '../components/Shape';
import '../components/Icons';
import EventEmitter from 'absol/src/HTML5/EventEmitter';

import Trapeziume from 'absol-diff/struct/Trapezium';
import IFrameBridge from 'absol/src/Network/IFrameBridge';

import diffWorker_js_txt from './diffworker.js.txt';

const Range = ace.acequire('ace/range').Range;

var $ = BCore.$;
var _ = BCore._;

/**
 * @typedef {Object} BraceDiffOption
 * @property {String} element selector query | HTML element
 * @property {BraceDiffOptionLeft} left
 * @property {BraceDiffOptionLeft} right
 * @property {IFrameBridge} diffWorker
 *  
 * 
 *  
 * @param {BraceDiffOption} props 
 */

function BraceDiff(props) {
    if (!(this instanceof BraceDiff)) return new BraceDiff(props);
    EventEmitter.call(this);
    this.ready = false;
    this.props = props;
    this.props.left = this.props.left || {};
    this.props.right = this.props.right || {};

    this.editorLeft = null;
    this.editorRight = null;
    this.$element = null;
    this.diffWorker = props.diffWorker;
    if (!this.diffWorker) {
        var workerUrl = (URL || webkitURL).createObjectURL(new Blob([diffWorker_js_txt], { type: 'application/javascript' }));
        this.diffWorker = new IFrameBridge(new Worker(workerUrl));
    }
    this.lastFocusEditor = null;
    this._changeTimeOut = false;
    this._attachedTo(props.element);

}

Object.defineProperties(BraceDiff.prototype, Object.getOwnPropertyDescriptors(EventEmitter.prototype));
BraceDiff.prototype.constructor = BraceDiff;


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
    this.$element.updateSize = function () {
        this.updateForegroundSize();
        this.updateGap(this);
    }.bind(this);
    Dom.addToResizeSystem(this.$element);
    this.$leftPreCtn = _('.brace-diff-left-container').addTo(this.$element);
    this.$rightPreCtn = _('.brace-diff-right-container').addTo(this.$element);
    this.$middleToolCtn = _('.brace-diff-middle-tool-container').addTo(this.$element);
    this.$middleTool = _('.brace-diff-middle-tool').addTo(this.$middleToolCtn);
    this._leftPreId = randomIdent(20);
    this._rightPreId = randomIdent(20);
    this.$leftPre = _('pre.brace-diff-left#' + this._leftPreId).addTo(this.$leftPreCtn);
    this.$rightPre = _('pre.brace-diff-left#' + this._rightPreId).addTo(this.$rightPreCtn);
    this.editorLeft = ace.edit(this._leftPreId);
    this.editorRight = ace.edit(this._rightPreId);
    this.$foreGround = _('.brace-diff-foreground').addTo(this.$element);

    this.$canvas = _('svg').addTo(this.$foreGround);
    this.$poolGap = [];
    this.$activeGaps = [];


    this.$poolLeftArrowBtn = [];
    this.$poolRightArrowBtn = [];
    this.$activePickLeftBtn = [];
    this.$activePickRightBtn = [];
    this.updateForegroundSize();

    this._setupEditors();
    this.ready = true;
    this.emit('ready', { target: this }, this);
    return this;
};

BraceDiff.prototype._setupEditors = function () {
    var self = this;
    this.editorLeft.setOptions(Object.assign({}, this.props.option, this.props.left.option));
    this.editorRight.setOptions(Object.assign({}, this.props.option, this.props.right.option));
    this.editorLeft.$blockScrolling = Infinity;
    this.editorRight.$blockScrolling = Infinity;
    this.editorLeft.on('change', this.handleChange.bind(this));
    this.editorRight.on('change', this.handleChange.bind(this));

    if (this.props.left.value) {
        this.editorLeft.setValue(this.props.left.value);
    }
    if (this.props.right.value) {
        this.editorRight.setValue(this.props.right.value);
    }

    this.editorLeft.getSession().on('changeScrollTop', function (scroll) {
        self.updateGap();
    });
    this.editorRight.getSession().on('changeScrollTop', function (scroll) {
        self.updateGap();
    });

    this.editorLeft.on('focus', function (data) {
        self.lastFocusEditor = self.editorLeft;
    });

    this.editorRight.on('focus', function (data) {
        self.lastFocusEditor = self.editorRight;
    });
    if (this.props.right.focus)
        this.editorRight.focus();
    else
        this.editorLeft.focus();
};



BraceDiff.prototype.updateForegroundSize = function () {
    var bound = this.$foreGround.getBoundingClientRect();
    this.$canvas.attr({
        width: bound.width + 'px',
        height: bound.height + 'px'
    });
};


/**
 * @param {Trapeziume} trapeziume
 */
BraceDiff.prototype.pickLeft = function (trapeziume) {
    if (!this.diffData) return;
    //todo
    var newTextLines = this.diffData.lLines.slice(trapeziume.left.start, trapeziume.left.end);

    if (newTextLines.length == 0) {
        var removeRange;
        if (trapeziume.right.end >= this.diffData.rLines.length) {
            //remove to end
            removeRange = new Range(trapeziume.right.start - 1, Number.MAX_VALUE, trapeziume.right.end, 0);
        }
        else {
            removeRange = new Range(trapeziume.right.start, 0, trapeziume.right.end, 0);
        }
        this.editorRight.getSession().remove(removeRange);
    }
    else {
        var newText = newTextLines.join('\n');
        var replaceRange = new Range(trapeziume.right.start, 0, trapeziume.right.end - 1, Number.MAX_VALUE);
        if (trapeziume.right.start >= this.diffData.rLines.length) {
            newText = '\n' + newText;//newLine
        }
        else if (newText.length == 0 && trapeziume.right.start == trapeziume.right.end) {
            replaceRange = new Range(trapeziume.right.start, 0, trapeziume.right.end, 0);
            newText = '\n'

        }
        this.editorRight.getSession().replace(replaceRange, newText);
    }
};

/**
 * @param {Trapeziume} trapeziume
 */
BraceDiff.prototype.pickRight = function (trapeziume) {
    if (!this.diffData) return;
    //todo
    var newTextLines = this.diffData.rLines.slice(trapeziume.right.start, trapeziume.right.end);

    if (newTextLines.length == 0) {
        var removeRange;
        if (trapeziume.left.end >= this.diffData.lLines.length) {
            //remove to end
            removeRange = new Range(trapeziume.left.start - 1, Number.MAX_VALUE, trapeziume.left.end, 0);
        }
        else {
            removeRange = new Range(trapeziume.left.start, 0, trapeziume.left.end, 0);
        }
        this.editorLeft.getSession().remove(removeRange);
    }
    else {
        var replaceRange = new Range(trapeziume.left.start, 0, trapeziume.left.end - 1, Number.MAX_VALUE);
        var newText = newTextLines.join('\n');
        if (trapeziume.left.start >= this.diffData.lLines.length) {
            newText = '\n' + newText;//newLine
        }
        else if (newText.length == 0 && trapeziume.left.start == trapeziume.left.end) {
            replaceRange = new Range(trapeziume.left.start, 0, trapeziume.left.end, 0);
            newText = '\n';
        }
        this.editorLeft.getSession().replace(replaceRange, newText);
    }
};

BraceDiff.prototype.updateDiffLine = function (diffData) {
    this.diffData = diffData;

    this.iniGap();
    this.updateGap();
};

BraceDiff.prototype.getCurrentTrapeziume = function () {
    if (!this.diffData) return
    var cursorLeftPos = this.editorLeft.getCursorPosition();
    var cursorRightPos = this.editorRight.getCursorPosition();
    var trapeziumes = this.diffData.trapeziumes;
    var trapeziume = null;
    // if (this.lastFocusEditor == this.editorRight) {
    //     for (var i = 0; i < trapeziumes.length; ++i) {
    //         if (trapeziume.right.start >= ){

    //         }
    //     }
    // }
    // else {

    // }

    return trapeziume;
};

BraceDiff.prototype._createLeftArrowBtn = function () {
    return _({
        tag: 'button',
        class: ['brace-diff-arrow', 'pick-right'],
        child: 'md-arraw-left-bold'
    });
};

BraceDiff.prototype._createRightArrowBtn = function () {
    return _({
        tag: 'button',
        class: ['brace-diff-arrow', 'pick-left'],
        child: 'md-arraw-right-bold'
    });
};

BraceDiff.prototype.iniGap = function () {
    if (!this.diffData) return;
    var diffData = this.diffData;
    var self = this;
    this.$activeGaps.forEach(function (elt) { elt.remove(); self.$poolGap.push(elt) });
    this.$activePickLeftBtn.forEach(function (elt) { elt.remove(); self.$poolLeftArrowBtn.push(elt) });
    this.$activePickRightBtn.forEach(function (elt) { elt.remove(); self.$poolRightArrowBtn.push(elt) });
    this.$activeGaps = [];
    this.$activePickLeftBtn = [];
    this.$activePickRightBtn = [];


    diffData.trapeziumes.forEach(function (trp, i, trapeziumes) {
        if (trp.color == -1) {
            var $gap;
            if (self.$poolGap.length > 0) {
                $gap = self.$poolGap.pop();
            }
            else {
                $gap = _('shape.brace-diff-gap');
            }
            $gap.addTo(self.$canvas);
            self.$activeGaps.push($gap);
            trp.$gap = $gap;

            //left
            var $pickLeftBtn;
            var $pickRightBtn;
            if (self.$poolLeftArrowBtn.length > 0) {
                $pickLeftBtn = self.$poolLeftArrowBtn.pop();
            }
            else {
                $pickLeftBtn = self._createRightArrowBtn();
            }

            $pickLeftBtn.addTo(self.$middleTool);
            self.$activePickLeftBtn.push($pickLeftBtn);
            trp.$pickLeftBtn = $pickLeftBtn;
            $pickLeftBtn.onclick = function () {
                self.pickLeft(trp);
                $gap.remove();
                $pickLeftBtn.remove();
                $pickRightBtn.remove();
            }

            //right
            if (self.$poolRightArrowBtn.length > 0) {
                $pickRightBtn = self.$poolRightArrowBtn.pop();
            }
            else {
                $pickRightBtn = self._createLeftArrowBtn();
            }

            $pickRightBtn.addTo(self.$middleTool);
            self.$activePickRightBtn.push($pickRightBtn);
            trp.$pickRightBtn = $pickRightBtn;
            $pickRightBtn.onclick = function () {
                self.pickRight(trp);
                $gap.remove();
                $pickLeftBtn.remove();
                $pickRightBtn.remove();
            }
        }
    });

};

BraceDiff.prototype.updateGap = function () {
    //donothing
    if (!this.diffData) return;
    var diffData = this.diffData;
    var self = this;
    var leftScrollTop = self.editorLeft.renderer.scrollTop;
    var rightScrollTop = self.editorRight.renderer.scrollTop;
    var lineHeight = this.editorLeft.renderer.lineHeight;
    var bound = this.$foreGround.getBoundingClientRect();
    var diffWidth = bound.width;
    var editorWidth = this.$leftPre.getBoundingClientRect().width;
    var editorDist = diffWidth - 2 * editorWidth;

    diffData.trapeziumes.forEach(function (trp) {
        if (trp.$gap) {
            trp.$gap.begin()
                .moveTo(0, - leftScrollTop + trp.left.start * lineHeight)
                .lineTo(editorWidth, - leftScrollTop + trp.left.start * lineHeight)
                .curveTo(diffWidth - editorWidth, - rightScrollTop + trp.right.start * lineHeight,
                    editorWidth + editorDist / 2, - leftScrollTop + trp.left.start * lineHeight,
                    diffWidth - editorWidth - editorDist / 2,
                    - rightScrollTop + trp.right.start * lineHeight
                )
                .lineTo(diffWidth, - rightScrollTop + trp.right.start * lineHeight)
                .lineTo(diffWidth, - rightScrollTop + trp.right.end * lineHeight)
                .lineTo(diffWidth - editorWidth, - rightScrollTop + trp.right.end * lineHeight)

                .curveTo(editorWidth, - leftScrollTop + trp.left.end * lineHeight,
                    diffWidth - editorWidth - editorDist / 2, - rightScrollTop + trp.right.end * lineHeight,
                    editorWidth + editorDist / 2, - leftScrollTop + trp.left.end * lineHeight
                )

                .lineTo(0, - leftScrollTop + trp.left.end * lineHeight)
                .closePath()
                .end();
            trp.$pickLeftBtn.addStyle('top', ((- leftScrollTop + trp.left.start * lineHeight) + (- leftScrollTop + trp.left.end * lineHeight)) / 2 - 7 + 'px');
            trp.$pickRightBtn.addStyle('top', ((- rightScrollTop + trp.right.start * lineHeight) + (- rightScrollTop + trp.right.end * lineHeight)) / 2 - 7 + 'px');
        }
    });
};



BraceDiff.prototype.handleChange = function () {
    if (this._changeTimeOut) {
        clearTimeout(this._changeTimeOut);
    }
    var self = this;
    this._changeTimeOut = setTimeout(function () {
        var currentSession = Math.random();
        self._workSession = currentSession;
        if (self._inWorking) return;
        self._inWorking = true;
        self._changeTimeOut = false;
        var leftData = self.editorLeft.getValue();
        var rightData = self.editorRight.getValue();
        self.diffWorker.invoke('diffByLine', leftData, rightData).then(function(result){
            self.updateDiffLine(result);
            self._inWorking = false;
            if (currentSession != self._workSession) self.handleChange();
        });
    }, 5);
};



BraceDiff.prototype.getEditors = function () {
    return [this.editorLeft, this.editorRight];
};

BraceDiff.prototype.destroy = function(){
    this.editorLeft.destroy();
    this.editorRight.destroy();
    this.destroyed = true;
};

export default BraceDiff;