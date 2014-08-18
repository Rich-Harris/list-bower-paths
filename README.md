# list-bower-paths

Get paths for bower modules, from the `main` property of `bower.json` files.


## Why?

If you use bower for dependency management, and have a build process that bundles up an app composed of AMD modules (e.g. with the RequireJS optimizer), you probably need to know the location on disk of the modules you're `require()`ing.

You can run `bower list --path` on the command line, or (if you're using a node.js build tool like [grunt](http://gruntjs.com/) or [gobble](https://github.com/gobblejs)) run it in a child process then capture and parse the result, but *boy* is it slow. You certainly don't want to have to do it each time you build.

This module offers a better way.


## Installation

```
npm install --save-dev list-bower-paths
```


## Usage

Both asynchronous and synchronous modes are supported.

### Async

```js
var lbp = require( 'list-bower-paths' );

// using promises
lpb().then( function ( paths ) {
  console.log( 'bower paths:', paths );
}, handleError );

// using callbacks
lbp( function ( err, paths ) {
  if ( err ) return handleError( err );
  console.log( 'bower paths:', paths );
});
```

### Sync

```js
var lbp = require( 'list-bower-paths' );

var paths = lbp.sync();
console.log( 'bower paths:', paths );
```

### Options

You can pass in an options object as the first argument:

```js
lbp({
  relative: true,
  noext: true
}).then( function ( paths ) {
  console.log( 'bower paths:', paths );
});
```

Supported options are:

* `cwd` - the current working directory. Defaults to the closest directory to `process.cwd()` that contains a [.bowerrc](http://bower.io/docs/config/) file (or `process.cwd()` itself, if no .bowerrc can be found)
* `directory` - in the absence of a .bowerrc file, this is where your bower components are located. Defaults to `bower_components`
* `relative` - defaults to `false`. If `true`, paths are relative to `directory`
* `noext` - defaults to `false`. If `true`, `.js` file extensions are removed (helpful for the RequireJS optimizer, which somehow isn't smart enough to handle file extensions by itself)



## License

Released under the MIT License. Copyright 2014 [Rich Harris](http://twitter.com/rich_harris)
