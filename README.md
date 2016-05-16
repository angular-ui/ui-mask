# ui-mask [![Build Status](https://travis-ci.org/angular-ui/ui-mask.svg?branch=master)](https://travis-ci.org/angular-ui/ui-mask) [![npm version](https://badge.fury.io/js/angular-ui-mask.svg)](http://badge.fury.io/js/angular-ui-mask) [![Bower version](https://badge.fury.io/bo/angular-ui-mask.svg)](http://badge.fury.io/bo/angular-ui-mask) [![Join the chat at https://gitter.im/angular-ui/ui-mask](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/angular-ui/ui-mask?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Apply a mask on an input field so the user can only type pre-determined pattern.

## Requirements

- AngularJS

## Usage


### Bower

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

### NPM (CommonJS, ES6 module)

Also you can use it as CommonJS or ES6 module with any build system that supports those type of modules (Webpack, SystemJS, JSPM etc):

```sh
npm install angular-ui-mask
```

And then include it with

```javascript
// CommonJS
var uiMask = require('angular-ui-mask');
angular.module('myApp', [uiMask, ...]);
```

```javascript
// ES6 module
import uiMask from 'angular-ui-mask';
angular.module('myApp', [uiMask, ...]);
```

### Customizing
You can customize several behaviors of ui-mask by taking advantage of the `ui-options` object. Declare `ui-options` as an additional attribute on the same element where you declare `ui-mask`.

Inside of `ui-options`, you can customize these five properties:

* `maskDefinitions` - default: `{
                '9': /\d/,
                'A': /[a-zA-Z]/,
                '*': /[a-zA-Z0-9]/
            }`,
* `clearOnBlur` - default: `true`,
* `clearOnBlurPlaceholder` - default: `false`,
* `eventsToHandle` - default: `['input', 'keyup', 'click', 'focus']`
* `addDefaultPlaceholder` - default: `true`
* `escChar` - default: `'\\'`
* `allowInvalidValue` - default: `false`

When customizing `eventsToHandle`, `clearOnBlur`, or `addDefaultPlaceholder`, the value you supply will replace the default. To customize `eventsToHandle`, be sure to replace the entire array.

Whereas, `maskDefinitions` is an object, so any custom object you supply will be merged together with the defaults using `angular.extend()`. This allows you to override the defaults selectively, if you wish.

When setting `clearOnBlurPlaceholder` to `true`, it will show the placeholder text instead of the empty mask. It requires the `ui-mask-placeholder` attribute to be set on the input to display properly.

If the `escChar` (\\ by default) is encountered in a mask, the next character will be treated as a literal and not a mask definition key.  To disable the `escChar` feature completely, set `escChar` to `null`.

When `allowInvalidValue` is set to true, apply value to `$modelValue` even if it isn't valid. By default, if you write an invalid value, the model will stay `undefined`.

#### Global customization
In addition to customizing behaviors for a specific element, you can also customize the behaviors globally. To do this, simply use the `uiMaskConfig` provider in your app configuration. Example:

```javascript
app.config(['uiMask.ConfigProvider', function(uiMaskConfigProvider) {
  uiMaskConfigProvider.maskDefinitions({'A': /[a-z], '*': /[a-zA-Z0-9]/});
  uiMaskConfigProvider.clearOnBlur(false);
  uiMaskConfigProvider.eventsToHandle(['input', 'keyup', 'click']);
}
```

#### maskDefinitions
The keys in `maskDefinitions` represent the special tokens/characters used in your mask declaration to delimit acceptable ranges of inputs. For example, we use '9' here to accept any numeric values for a phone number: `ui-mask="(999) 999-9999"`. The values associated with each token are regexen. Each regex defines the ranges of values that will be acceptable as inputs in the position of that token.

#### modelViewValue
If this is set to true, then the model value bound with `ng-model` will be the same as the `$viewValue` meaning it will contain any static mask characters present in the mask definition. This will not set the model value to a `$viewValue` that is considered invalid.

#### uiMaskPlaceholder
Allows customizing the mask placeholder when a user has focused the input element and while typing in their value

#### uiMaskPlaceholderChar
Allows customizing the mask placeholder character. The default mask placeholder is `_`.

Set this attribute to the word `space` if you want the placeholder character to be whitespace.

#### addDefaultPlaceholder
The default placeholder is constructed from the `ui-mask` definition so a mask of `999-9999` would have a default placeholder of `___-____`; unless you have overridden the default placeholder character.

## Testing

Most of the testing is done using Karma to run the tests and SauceLabs to provide the different browser environments to test against.

Mobile testing and debugging uses BrowserStack for its abilities to remotely debug mobile devices from a browser.

[<img alt="BrowserStack" src="logos/browser-stack.png" height="53" width="250" />](https://www.browserstack.com)

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
