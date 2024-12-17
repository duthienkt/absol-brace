import { $, $$, _ } from "../../components/BCore";
import OnsScreenWindow from "absol-acomp/js/OnsScreenWindow";
import WindowBox from "absol-acomp/js/WindowBox";
import FlexiconButton from "absol-acomp/js/FlexiconButton";
import { keyboardEventToKeyBindingIdent } from "absol/src/Input/keyboard";
import 'absol-acomp/css/common.css';
import { getScreenSize } from "absol/src/HTML5/Dom";
import Modal from "absol-acomp/js/Modal";
import { hitElement } from "absol/src/HTML5/EventEmitter";

function openGoToDialog(editor) {
    var zIndex = 0;
    var maxZIndex = 0;

    var container = editor.container;
    var c = container;
    var screenSize = getScreenSize();
    while (c) {
        zIndex = parseFloat(getComputedStyle(c).zIndex);
        if (!isNaN(zIndex)) maxZIndex = Math.max(maxZIndex, zIndex);
        c = c.parentElement;
    }
    var editorBound = container.getBoundingClientRect();

    var cursor = editor.getCursorPosition();


    var modal = _({
        tag: Modal,
        style: { zIndex: maxZIndex + 1000 },
        child: {
            tag: OnsScreenWindow,
            style: {
                width: 'auto',
                height: 'auto',
                minWidth: '228px',
                minHeight: '102px',
                zIndex: maxZIndex + 1005,
                top: Math.max(0, Math.min(screenSize.height - 50, editorBound.top + editorBound.height / 2 - 50)) + 'px',
                left: Math.max(0, Math.min(screenSize.width - 276, editorBound.left + editorBound.width / 2 - 276 / 2)) + 'px'
            }
        }
    });

    /***
     *
     * @type {WindowBox}
     */
    var windowBox = _({
        elt: $(WindowBox.tag, modal),
        class: 'ace_window_box',
        style: {
            fontSize: '14px'
        },
        child: [
            {
                style: { padding: '5px', whiteSpace: 'nowrap' },
                child: [
                    '<span>Line[:Column] </span>',
                    {
                        tag: 'input',
                        class: 'as-text-input',
                        attr: { type: 'text' },
                        style: { width: '180px' },
                        props: {
                            value: [cursor.row + 1, cursor.column + 1].join(':')
                        }
                    }
                ]
            },
            {
                style: { padding: '5px', whiteSpace: 'nowrap', textAlign: 'center' },
                child: [
                    {
                        tag: FlexiconButton,
                        class: 'primary',
                        style: { minWidth: '80px', marginRight: '20px' },
                        props: {
                            text: 'OK'
                        }
                    },
                    {
                        tag: FlexiconButton,
                        style: { minWidth: '80px' },

                        props: {
                            text: 'CANCEL'
                        }
                    }
                ]
            },


        ],
        props: {
            windowActions: [
                { icon: '<span class="material-icons close">close</span>', name: 'close' }
            ]
        },
        on: {
            action: (event) => {
                if (event.actionData.name === 'close') {
                    cancel();
                }
            }
        }
    });

    var finish = () => {
        modal.selfRemove();
    }
    var cancel = () => {
        finish();
        editor.focus();
    };

    var ok = () => {
        var textParts = numInput.value.split(':').map(t => t.trim());
        var pos = null;
        var r, c;
        if (textParts.length === 1 || textParts.length === 2) {
            r = parseInt(textParts[0]);
            if (textParts.length === 2) {
                c = parseInt(textParts[1]);
            }
            else {
                c = 1;
            }

            if (!isNaN(r) && !isNaN(c)) {
                pos = [Math.max(r, 1), Math.max(c, 1)];
            }
        }

        if (pos) {
            finish();
            editor.gotoLine(pos[0], pos[1] - 1);
            editor.focus();
        }
        else {
            numInput.focus();
            numInput.select();
        }
    }

    windowBox.windowTitle = "Go To Line:Column";
    modal.addTo(document.body);
    var numInput = $('.as-text-input', windowBox);
    var $buttons = $$(FlexiconButton.tag, windowBox);
    $buttons[0].on('click', ok);
    $buttons[1].on('click', cancel);
    modal.on('mouseup', event => {
        if (hitElement(numInput, event) || hitElement($buttons[0], event) || hitElement($buttons[1], event)) return;
        setTimeout(() => {
            if (modal.parentElement) {
                numInput.focus();
                numInput.select();
            }
        }, 50);
    });
    [numInput].concat($buttons).forEach((ctrElt, i, arr) => {
        ctrElt.on('keydown', event => {
            var nextElt;
            var key = keyboardEventToKeyBindingIdent(event);
            if (key === 'tab') {
                event.preventDefault();
                nextElt = arr[(i + 1) % arr.length];
                if (nextElt.$input) {
                    nextElt.$input.focus();
                    nextElt.$input.select();
                }
                else {
                    nextElt.focus();
                }
            }
            else if (key === 'enter') {
                setTimeout(ok, 100);

            }
            else if (key === 'escape') {
                cancel();
            }
        })
    });


    setTimeout(() => {
        numInput.focus();
        numInput.select();
    }, 100);


}

export var GoToCommand = {
    name: "goto",
    exec: openGoToDialog,
    bindKey: { win: "Ctrl-G", mac: 'Command-G' }
};
