function FBraceEditor() {
    // this.on('change', function(){
    //     console.log(new Error())
    // });
    // console.log(this)
}

FBraceEditor.prototype.$onLineCountChange = function () {
    // console.log(this);
};


FBraceEditor.prototype.getLineCount = function () {
    var session = this.getSession();
    return session.$rowLengthCache.length;
};

export default FBraceEditor;