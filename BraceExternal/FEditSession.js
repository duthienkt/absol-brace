function FEditSession() {

}


FEditSession.prototype.gutterRenderer = {
    getWidth: function (session, lastLineNumber, config) {
       
        return session.getLineCount().toString().length * config.characterWidth;
    },
    getText: function (session, row) {
        return row + 1;
    }
};


FEditSession.prototype.getLineCount = function(){
    return this.$rowLengthCache.length;
};


export default FEditSession;