# AbsolBrace

## BraceDiff

`main.js`
```js
import AbsolBrace from "absol-brace";
var differ = AbsolBrace.BraceDiff({ element: '.test0' });    
```

`index.html`
```html
<script src="./dist/absol-brace.js"></script>
<style>
    .test0 {
        height: 80%;
        background-color: rgba(230, 230, 230, 0.9)
    }
</style>
<div class="test0"></div>
<script>
    var differ = AbsolBrace.BraceDiff({ element: '.test0' });
</script>
```