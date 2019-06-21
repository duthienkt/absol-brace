import ace from '../BraceExternal/FBrace';
import Dom from 'absol/src/HTML5/Dom';
import BCore from '../components/BCore';

import { randomIdent } from 'absol/src/String/stringGenerate';

import './diff.css'

import '../components/Shape';

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
 * @param {BraceDiffOption} option 
 */

function BraceDiff(option) {
    if (!(this instanceof BraceDiff)) return new BraceDiff(option);
    this._option = option;
    this.editorLeft = null;
    this.editorRight = null;
    this.$element = null;
    this.diffWorker = option.diffWorker;
    this._changeTimeOut = false;
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
    this.$element.updateSize = this.updateGap.bind(this);
    Dom.addToResizeSystem(this.$element);
    this.$leftPreCtn = _('.brace-diff-left-container').addTo(this.$element);
    this.$rightPreCtn = _('.brace-diff-right-container').addTo(this.$element);
    this.$middleToolCtn = _('.brace-diff-middle-tool-container').addTo(this.$element);
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

    this.$poolLeftToolBtn = [];
    this.$poolRightToolBtn = [];
    this.updateForegroundSize();

    this._setupEditors();
    return this;
};

BraceDiff.prototype._setupEditors = function () {
    var self = this;
    this.editorLeft.setOptions({
        mode: 'ace/mode/javascript'
    });
    this.editorRight.setOptions({
        mode: 'ace/mode/javascript'
    });

    this.editorLeft.on('change', this.handleChange.bind(this));
    this.editorRight.on('change', this.handleChange.bind(this));

    this.editorLeft.getSession().on('changeScrollTop', function (scroll) {
        self.updateGap();
    });
    this.editorRight.getSession().on('changeScrollTop', function (scroll) {
        self.updateGap();
    });
};


BraceDiff.prototype.updateForegroundSize = function () {
    var bound = this.$foreGround.getBoundingClientRect();
    this.$canvas.attr({
        width: bound.width + 'px',
        height: bound.height + 'px'
    });
};

BraceDiff.prototype.updateDiffLine = function (diffData) {



    var self = this;
    this.$activeGaps.forEach(function (elt) { elt.remove(); self.$poolGap.push(elt) });
    this.$activeGaps = [];


    diffData.trapeziumes.forEach(function (trp) {
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


        }
    });
    this.$updateGap = function () {
        var leftScrollTop = self.editorLeft.renderer.scrollTop;
        var rightScrollTop = self.editorRight.renderer.scrollTop;
        var lineHeight = this.editorLeft.renderer.lineHeight;
        var bound = this.$foreGround.getBoundingClientRect();
        var diffWidth = bound.width;
        var editorWidth = this.$leftPre.getBoundingClientRect().width;
        var editorDist = diffWidth - 2 * editorWidth;

        diffData.trapeziumes.forEach(function (trp) {
            if (trp.$gap)
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

        });
    }
    this.$updateGap();
};



BraceDiff.prototype.updateGap = function () {
    //donothing
    if (this.$updateGap)
        this.$updateGap();
};

BraceDiff.prototype.handleChange = function () {
    if (this._changeTimeOut) {
        clearTimeout(this._changeTimeOut);
    }
    var self = this;
    this._changeTimeOut = setTimeout(function () {
        self._changeTimeOut = false;
        var leftData = self.editorLeft.getValue();
        var rightData = self.editorRight.getValue();
        self.diffWorker.invoke('diffByLine', leftData, rightData).then(self.updateDiffLine.bind(self));
    }, 5);
}



BraceDiff.prototype.getEditors = function () {
    return [this.editorLeft, this.editorRight];
}


export default BraceDiff;