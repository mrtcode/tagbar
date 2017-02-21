

# Tagbar

[Demo](https://mrtcode.github.io/tagbar/demo.html)

Write tags

Insert/remove tags

* No dependencies
* Has an autosuggester
* Supports touch devices

## Usage

Download [Tagbar]() and include `tagbar.js` and `tagbar.css` files on your page.

```
    <link rel="stylesheet" href="tagbar.css">
    <script src="tagbar.js"></script>
```

Alternatively, you can require it as a module if you use Browserify

```
    var tagbar = require('./tagbar.js');
```

Create a tagbar inside a container. Pass an element or element id as a container.

```
    var tagbar = new Tagbar({
        container: 'container-id',
    });

    tagbar.setTags(['creative', 'holidays']);

    var tags = tagbar.getTags();
```

Attach event handlers

```
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







