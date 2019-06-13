import IFrameBridge from 'absol/src/Network/IFrameBridge';

import * as Diff from 'absol-diff';

var brige = IFrameBridge.getInstance();
brige.diffByLine = function (a, b) {
    return Diff.diffByLineText(a, b);
}


brige.diffByWord = function (a, b) {
    return Diff.diffSingleText(a, b);
}

