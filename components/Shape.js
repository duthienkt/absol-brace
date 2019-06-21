import Svg from 'absol/src/HTML5/Svg';
import BCore from './BCore';

function Shape() {
    var res = Svg.ShareInstance._('path');
    return res;
};

Shape.prototype.begin = function () {
    this.buildingPath = '';
    return this;
};

Shape.prototype.end = function () {
    this.attr('d', this.buildingPath);
    return this;
};


Shape.prototype.moveTo = function (x, y) {
    this.buildingPath += 'M' + x + ' ' + y;
    return this;
};

Shape.prototype.closePath = function () {
    this.buildingPath += 'z';
    return this;
}

Shape.prototype.lineTo = function (x, y) {
    this.buildingPath += 'L' + x + ' ' + y;
    return this;
};


Shape.prototype.arcTo = function (x, y, rx, ry, lf, sf, xRotate) {
    ry = ry || rx;
    lf = lf || 0;
    sf = sf || 0;
    xRotate = xRotate || 0;
    this.buildingPath += 'A' + [rx, ry, xRotate, lf, sf, x, y].join(' ');
    return this;
};

Shape.prototype.curveTo = function (x, y, x0, y0, x1, y1) {
    this.buildingPath += 'C' + [x0, y0, x1, y1, x, y].join(' ');
    return this;
};

BCore.install('shape', Shape);