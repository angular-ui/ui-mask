# ui-mask [![Build Status](https://travis-ci.org/angular-ui/ui-mask.svg?branch=master)](https://travis-ci.org/angular-ui/ui-mask) [![npm version](https://badge.fury.io/js/angular-ui-mask.svg)](http://badge.fury.io/js/angular-ui-mask) [![Bower version](https://badge.fury.io/bo/angular-ui-mask.svg)](http://badge.fury.io/bo/angular-ui-mask) [![Join the chat at https://gitter.im/angular-ui/ui-mask](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/angular-ui/ui-mask?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Apply a mask on an input field so the user can only type pre-determined pattern.

## Requirements

- AngularJS

## Usage


You can get it from [Bower](http://bower.io/)

```sh
bower install angular-ui-mask
```

Load the script files in your application:

```html
<script type="text/javascript" src="bower_components/angular/angular.js"></script>
<script type="text/javascript" src="bower_components/angular-ui-mask/dist/mask.js"></script>
```

Add the specific module to your dependencies:

```javascript
angular.module('myApp', ['ui.mask', ...])
```

### Customizing
You can customize several behaviors of ui-mask by taking advantage of the `ui-options` object. Declare `ui-options` as an additional attribute on the same element where you declare `ui-mask`.

Inside of `ui-options`, you can customize these three properties:

* `maskDefinitions` - default: `{
                '9': /\d/,
                'A': /[a-zA-Z]/,
                '*': /[a-zA-Z0-9]/
            }`,
* `clearOnBlur` - default: `true`,
* `eventsToHandle` - default: `['input', 'keyup', 'click', 'focus']`

When customizing `eventsToHandle` or `clearOnBlur`, the value you supply will replace the default. To customize `eventsToHandle`, be sure to replace the entire array.

Whereas, `maskDefinitions` is an object, so any custom object you supply will be merged together with the defaults using `angular.extend()`. This allows you to override the defaults selectively, if you wish.

#### maskDefinitions
The keys in `maskDefinitions` represent the special tokens/characters used in your mask declaration to delimit acceptable ranges of inputs. For example, we use '9' here to accept any numeric values for a phone number: `ui-mask="(999) 999-9999"`. The values associated with each token are regexen. Each regex defines the ranges of values that will be acceptable as inputs in the position of that token.


## Development

We use Karma and jshint to ensure the quality of the code.  The easiest way to run these checks is to use gulp:

```sh
npm install -g gulp-cli
npm install && bower install
gulp
```

The karma task will try to open Firefox and Chrome as browser in which to run the tests.  Make sure this is available or change the configuration in `karma.conf.js`


### Gulp watch

`gulp watch` will automatically test your code and build a release whenever source files change.

### How to release

Use gulp to bump version, build and create a tag. Then push to GitHub:

````sh
gulp release [--patch|--minor|--major]
git push --tags origin master # push everything to GitHub
````

Travis will take care of testing and publishing to npm's registry (bower will pick up the change automatically). Finally [create a release on GitHub](https://github.com/angular-ui/ui-mask/releases/new) from the tag created by Travis.
