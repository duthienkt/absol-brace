import Dom from 'absol/src/HTML5/Dom';
import Shape from "absol-svg/js/svg/Shape";
var BCore = new Dom();
BCore.install(Shape);
export var _ = BCore._;
export var $ = BCore.$;
export var $$ = BCore.$$;

export default BCore;
