

# Tagbar

[Demo](https://mrtcode.github.io/tagbar/demo.html)

![](https://mrtcode.github.io/tagbar/images/tagbar.png)

Write tags

Insert/remove tags

* No dependencies
* Has an autosuggester
* Supports touch devices

## Usage

Download [Tagbar](https://github.com/mrtcode/tagbar/releases) and include `tagbar.js` and `tagbar.css` files on your page.

```
    <link rel="stylesheet" href="tagbar.css">
    <script src="tagbar.js"></script>
```

Alternatively, you can require it as a module if you use Browserify

```js
    var tagbar = require('./tagbar.js');
```

Create a tagbar inside a container. Pass an element or element id as a container parameter.

```html
<div id="container-id"></div>
```

```js
    var tagbar = new Tagbar({
        container: 'container-id',
    });

    tagbar.setTags(['creative', 'holidays']);

    var tags = tagbar.getTags();
```

Attach event handlers

```js
var tagbar = new Tagbar({
    container: 'container-id',
    onAdd: function (tag) {
        console.log(tag);
    },
    onRemove: function (tag) {
      console.log(tag);
    },
    onSuggest: function (query, callback) {
      callback(['suggestion1', 'suggestion2', 'suggestion3']);
    }
  });
```







