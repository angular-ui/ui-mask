describe("uiMask", function () {
  "use strict";

  var formHtml  = "<form name='test'><input name='input' ng-model='x' ui-mask='{{mask}}'></form>";
  var inputHtml = "<input name='input' ng-model='x' ui-mask='{{mask}}' ui-options='options'>";
  var compileElement, scope, config, timeout, uiMaskConfigProvider;

  beforeEach(module("ui.mask"));
  beforeEach(function() {
    angular.module("test",[]).directive("toUpper", function() {
      return {
        priority: 200,
        require: 'ngModel',
        restrict: 'A',
        link: function (scope, iElement, iAttrs, controller) {
          controller.$formatters.push(function(fromModelValue) {
            return angular.uppercase(fromModelValue);
          });
          controller.$parsers.push(function(fromViewValue) {
            return angular.lowercase(fromViewValue);
          });
        }
      }
    })
    .config(['uiMask.ConfigProvider', function(configProvider) {
      uiMaskConfigProvider = configProvider;
    }]);
    module("test");
  });
  beforeEach(inject(function ($rootScope, $compile, uiMaskConfig, $timeout) {
    scope = $rootScope;
    config = uiMaskConfig;
    compileElement = function(html) {
      return $compile(html)(scope);
    };
    timeout = $timeout;
  }));

  describe("initialization", function () {

    it("should not not happen if the mask is undefined or invalid", function() {
      var input = compileElement(inputHtml);
      scope.$apply("x = 'abc123'");
      expect(input.val()).toBe("abc123");
      scope.$apply("mask = '()_abc123'");
      expect(input.val()).toBe("abc123");
    });

    it("should mask the value only if it's valid", function() {
      var input = compileElement(inputHtml);
      scope.$apply("x = 'abc123'");
      scope.$apply("mask = '(A) * 9'");
      expect(input.val()).toBe("(a) b 1");
      scope.$apply("mask = '(A) * 9 A'");
      expect(input.val()).toBe("");
    });

    it("should not dirty or invalidate the input", function() {
      var input = compileElement(inputHtml);
      scope.$apply("x = 'abc123'");
      scope.$apply("mask = '(9) * A'");
      expect(input.hasClass("ng-pristine")).toBeTruthy();
      scope.$apply("mask = '(9) * A 9'");
      expect(input.hasClass("ng-pristine")).toBeTruthy();
    });

    it("should not change the model value", function() {
      scope.$apply("x = 'abc123'");
      scope.$apply("mask = '(A) * 9'");
      expect(scope.x).toBe("abc123");
      scope.$apply("mask = '(A) * 9 A'");
      expect(scope.x).toBe("abc123");
    });

	it("should not dirty or invalidate the input", function() {
      var input = compileElement(inputHtml);
      scope.$apply("x = 'abc123'");
      scope.$apply("mask = '(9) * A'");

      //Test blur
      input.triggerHandler("blur");
      expect(input.hasClass("ng-pristine")).toBeTruthy();
    });

    it("should set ngModelController.$viewValue to match input value", function() {
      compileElement(formHtml);
      scope.$apply("x = 'abc123'");
      scope.$apply("mask = '(A) * 9'");
      expect(scope.test.input.$viewValue).toBe("(a) b 1");
      scope.$apply("mask = '(A) * 9 A'");
      expect(scope.test.input.$viewValue).toBe("");
    });

  });
  describe("with other directives", function() {
    beforeEach(function () {
      compileElement("<form name='test'><input to-upper name='input' ng-model='x' ui-mask='{{mask}}'></form>");
    });
    it("should play nicely", function() {
      scope.$apply("x = 'abc123'");
      scope.$apply("mask = '(A) * 9'");
      expect(scope.x).toBe("abc123");
      expect(scope.test.input.$viewValue).toBe("(A) B 1");
      scope.$apply("mask = '(A)AA'");
      expect(scope.test.input.$viewValue).toBe("(A)BC");
    });
    describe("with model-view-value", function() {
      var input = undefined;
      beforeEach(function () {
        input = compileElement("<form name='test'><input to-upper name='input' ng-model='x' model-view-value='true' ui-mask='{{mask}}'></form>");
        input = input.find('input')
      });
      it("should set the model value to the masked view value parsed by other directive", function() {
        scope.$apply("x = '(a) b 1'");
        scope.$apply("mask = '(A) * 9'");
        expect(scope.test.input.$viewValue).toBe("(A) B 1");
        input.val("(A) C 2").triggerHandler("input").triggerHandler("change");
        scope.$apply();
        expect(scope.x).toBe("(a) c 2");
      });
    });
  });

  describe("user input", function () {
    it("should mask-as-you-type", function() {
      var form  = compileElement(formHtml);
      var input = form.find("input");
      scope.$apply("x = ''");
      scope.$apply("mask = '(A) * 9'");
      input.val("a").triggerHandler("input");
      expect(input.val()).toBe("(a) _ _");
      input.val("ab").triggerHandler("input");
      expect(input.val()).toBe("(a) b _");
      input.val("ab1").triggerHandler("input");
      expect(input.val()).toBe("(a) b 1");
    });

    it("should set ngModelController.$viewValue to match input value", function() {
      var form  = compileElement(formHtml);
      var input = form.find("input");
      scope.$apply("x = ''");
      scope.$apply("mask = '(A) * 9'");
      input.val("a").triggerHandler("input");
      input.triggerHandler("change"); // Because IE8 and below are terrible
      expect(scope.test.input.$viewValue).toBe("(a) _ _");
    });

    it("should maintain $viewValue consistent with input value", function() {
      var form  = compileElement(formHtml);
      var input = form.find("input");
      scope.$apply("x = ''");
      scope.$apply("mask = '99 9'");
      input.val("3333").triggerHandler("input");
      input.val("3333").triggerHandler("input"); // It used to has a bug when pressing a key repeatedly
      timeout(function() {
        expect(scope.test.input.$viewValue).toBe("33 3");
      }, 0, false);
    });

    it("should parse unmasked value to model", function() {
      var form  = compileElement(formHtml);
      var input = form.find("input");
      scope.$apply("x = ''");
      scope.$apply("mask = '(A) * 9'");
      input.val("abc123").triggerHandler("input");
      input.triggerHandler("change"); // Because IE8 and below are terrible
      expect(scope.x).toBe("ab1");
    });

    it("should set model to undefined if masked value is invalid", function() {
      var form  = compileElement(formHtml);
      var input = form.find("input");
      scope.$apply("x = ''");
      scope.$apply("mask = '(A) * 9'");
      input.val("a").triggerHandler("input");
      input.triggerHandler("change"); // Because IE8 and below are terrible
      expect(scope.x).toBeUndefined();
    });

    it("should not set model to an empty mask", function() {
      var form  = compileElement(formHtml);
      var input = form.find("input");
      scope.$apply("x = ''");
      scope.$apply("mask = '(A) * 9'");
      input.triggerHandler("input");
      expect(scope.x).toBe("");
    });

    it("should not setValidity on required to false on a control that isn't required", function() {
      var input = compileElement("<input name='input' ng-model='x' ui-mask='{{mask}}'>");
      scope.$apply("x = ''");
      scope.$apply("mask = '(A) * 9'");
      scope.$apply("required = true");
      expect(input.data("$ngModelController").$error.required).toBeUndefined();
      input.triggerHandler("input");
      expect(scope.x).toBe("");
      expect(input.data("$ngModelController").$error.required).toBeUndefined();

      input = compileElement("<input name='input' ng-model='x' ui-mask='{{mask}}' ng-required='required'>");
      scope.$apply("required = false");
      expect(input.data("$ngModelController").$error.required).toBeUndefined();
      input.triggerHandler("input");
      expect(input.data("$ngModelController").$error.required).toBeUndefined();
      input.triggerHandler("focus");
      input.triggerHandler("blur");
      expect(input.data("$ngModelController").$error.required).toBeUndefined();
      input.val("").triggerHandler("input");
      expect(input.data("$ngModelController").$error.required).toBeUndefined();
    });

    it("should setValidity on required to true when control is required and value is empty", function() {
      var input = compileElement("<input name='input' ng-model='x' ui-mask='{{mask}}' required>");
      expect(input.data("$ngModelController").$error.required).toBeUndefined();
      scope.$apply("x = ''");
      scope.$apply("mask = '(A) * 9'");
      scope.$apply("required = true");
      input.triggerHandler("input");
      expect(input.data("$ngModelController").$error.required).toBe(true);

      input = compileElement("<input name='input' ng-model='x' ui-mask='{{mask}}' ng-required='required'>");
      expect(input.data("$ngModelController").$error.required).toBeUndefined();
      scope.$apply("mask = '(A) A 9'");//change the mask so the $digest cycle runs the initialization code
      input.triggerHandler("input");
      expect(input.data("$ngModelController").$error.required).toBe(true);
    });

    it("should not setValidity on required when control is required and value is non empty", function() {
      var input = compileElement("<input name='input' ng-model='x' ui-mask='{{mask}}' required>");
      expect(input.data("$ngModelController").$error.required).toBeUndefined();
      scope.$apply("x = ''");
      scope.$apply("mask = '(A) * 9'");
      scope.$apply("required = true");
      input.triggerHandler("input");
      expect(input.data("$ngModelController").$error.required).toBe(true);
      input.val("(abc123_) _ _").triggerHandler("input");
      expect(scope.x).toBe("ab1");
      expect(input.data("$ngModelController").$error.required).toBeUndefined();
    });

    it("should set the model value properly when control is required and the mask is undefined", function() {
      var input = compileElement('<input ng-required="true" ui-mask="{{mask}}" ng-model="x" />');
      scope.$apply("x = ''");
      expect(scope.mask).toBeUndefined();
      input.val("12345").triggerHandler("change");
      expect(scope.x).toBe("12345");
    });

    it("should not bleed static mask characters into the value when backspacing", function() {
        var input = compileElement(inputHtml);
        scope.$apply("x = ''");
        scope.$apply("mask = 'QT****'");
        input.triggerHandler('focus');
        expect(input.val()).toBe("QT____");
        //simulate a backspace event
        input.triggerHandler({ type: 'keydown', which: 8 });
        input.triggerHandler({ type: 'keyup', which: 8 });
        expect(input.val()).toBe("QT____");
        expect(scope.x).toBe('');
    });

    it("should set model value properly when the value contains the same character as a static mask character", function() {
        var input = compileElement(inputHtml);
        scope.$apply("mask = '19'");
        input.triggerHandler("input");
        expect(input.val()).toBe("1_");
        input.val("11").triggerHandler("change");
        expect(scope.x).toBe("1");

        scope.$apply("mask = '9991999'");
        scope.$apply("x = ''");
        input.triggerHandler("input");
        expect(input.val()).toBe("___1___");
        input.val("1231456").triggerHandler("change");
        expect(scope.x).toBe("123456");
    });

    it("should mask the input properly with multiple identical mask components", function() {
        var input = compileElement(inputHtml);
        scope.$apply("mask = '99.99.99-999.99'");
        input.val("811").triggerHandler("input");
        expect(input.val()).toBe("81.1_.__-___.__");
    });
  });

  describe("verify change is called", function () {
    var input = undefined;
    var doneCount = 0;

    beforeEach(function (done) {
      input = compileElement(inputHtml);
      scope.$apply("x = ''");
      scope.$apply("mask = '**?9'");
      input.on("change", function () {
        doneCount++;
        done();
      });
      input.val("aa").triggerHandler("input");
      input.triggerHandler("blur");
      input.val("aa").triggerHandler("input");
      input.triggerHandler("blur");
    });

    it("should have triggered change", function () {
      expect(doneCount).toBe(1);
    });
  });

  describe("with model-view-value", function() {
    var input = undefined;
    beforeEach(function () {
      input = compileElement("<form name='test'><input name='input' ng-model='x' model-view-value='true' ui-mask='{{mask}}'></form>");
      input = input.find('input');
    });
    it("should set the mask in the model", function() {
      scope.$apply("x = '(a) b 1'");
      scope.$apply("mask = '(A) * 9'");
      expect(scope.test.input.$viewValue).toBe("(a) b 1");
      input.val("(a) c 2").triggerHandler("input").triggerHandler("change");
      scope.$apply();
      expect(scope.x).toBe("(a) c 2");
    });
  });
  describe("changes from the model", function () {
    it("should set the correct ngModelController.$viewValue", function() {
      compileElement(formHtml);
      scope.$apply("mask = '(A) * 9'");
      scope.$apply("x = ''");
      expect(scope.test.input.$viewValue).not.toBeDefined();
      scope.$apply("x = 'abc'");
      expect(scope.test.input.$viewValue).not.toBeDefined();
      scope.$apply("x = 'abc123'");
      expect(scope.test.input.$viewValue).toBe("(a) b 1");
    });

    it("should accept change model and mask on same $digest", function() {
      compileElement(formHtml);
      scope.$apply(" x='1234'; mask = '99-99';");
      scope.$apply(" x='123';  mask = '99-9';");
      expect(scope.test.input.$viewValue).toBe('12-3');
      expect(scope.x).toBe('123');
    });

    it("should set validity when setting model and mask on same $digest", function() {
      compileElement(formHtml);
      scope.$apply(" x='1234'; mask = '99-99';");
      scope.$apply(" x='123';  mask = '99-9';");
      expect(scope.test.input.$valid).toBe(true);
    });
  });

  describe("default mask definitions", function () {
    it("should accept optional mask after '?'", function (){
      var input = compileElement(inputHtml);

      scope.$apply("x = ''");
      scope.$apply("mask = '**?9'");

      input.val("aa___").triggerHandler("input");
      input.triggerHandler("blur");
      expect(input.val()).toBe("aa_");

      input.val("99a___").triggerHandler("input");
      input.triggerHandler("blur");
      expect(input.val()).toBe("99_");

      input.val("992___").triggerHandler("input");
      input.triggerHandler("blur");
      expect(input.val()).toBe("992");
    });

    it("should limit optional mask to a single character", function() {
      var form  = compileElement(formHtml);
      var input = form.find("input");
      scope.$apply("x = ''");
      scope.$apply("mask = '9?99'");
      input.val("1").triggerHandler("input");
      input.triggerHandler("change"); // Because IE8 and below are terrible
      expect(scope.x).toBeUndefined();
    });
  });

  describe("placeholders", function () {
    it("should have default placeholder functionality", function() {
      var input = compileElement(inputHtml);

      scope.$apply("x = ''");
      scope.$apply("mask = '99/99/9999'");

      expect(input.attr("placeholder")).toBe("__/__/____");
    });

    it("should allow mask substitutions via the placeholder attribute", function() {

      var placeholderHtml = "<input name='input' ng-model='x' ui-mask='{{mask}}' placeholder='MM/DD/YYYY'>",
          input           = compileElement(placeholderHtml);

      scope.$apply("x = ''");
      scope.$apply("mask = '99/99/9999'");

      expect(input.attr("placeholder")).toBe("MM/DD/YYYY");

      input.val("12").triggerHandler("input");

      expect(input.val()).toBe("12/DD/YYYY");
    });

    it("should update mask substitutions via the placeholder attribute", function() {

      var placeholderHtml = "<input name='input' ng-model='x' ui-mask='{{mask}}' placeholder='{{placeholder}}'>",
          input           = compileElement(placeholderHtml);

      scope.$apply("x = ''");
      scope.$apply("mask = '99/99/9999'");
      scope.$apply("placeholder = 'DD/MM/YYYY'");
      expect(input.attr("placeholder")).toBe("DD/MM/YYYY");

      input.val("12").triggerHandler("input");
      expect(input.val()).toBe("12/MM/YYYY");

      scope.$apply("placeholder = 'MM/DD/YYYY'");
      expect(input.val()).toBe("12/DD/YYYY");

      input.triggerHandler("blur");
      expect(input.attr("placeholder")).toBe("MM/DD/YYYY");
    });

    it("should ignore the '?' character", function() {
      var placeholderHtml = "<input type=\"text\" ui-mask=\"99/99/9999 ?99:99\" placeholder=\"DD/MM/YYYY HH:mm\" ng-model=\"myDate\">",
        input = compileElement(placeholderHtml);

      scope.$apply("myDate = ''");
      expect(input.attr("placeholder")).toBe("DD/MM/YYYY HH:mm");
    });

    it("should accept ui-mask-placeholder", function() {
      var placeholderHtml = "<input name='input' ng-model='x' ui-mask='{{mask}}' placeholder='Phone Number' ui-mask-placeholder='(XXX) XXX-XXXX'>",
          input           = compileElement(placeholderHtml);

      scope.$apply("x = ''");
      scope.$apply("mask = '(999) 999-9999'");
      input.triggerHandler("input");
      expect(input.val()).toBe("(XXX) XXX-XXXX");
      expect(input.attr("placeholder")).toBe("Phone Number");
    });

    it("should accept ui-mask-placeholder and not set val when first showing input", function() {
      var placeholderHtml = "<input name='input' ng-model='x' ui-mask='{{mask}}' placeholder='Phone Number' ui-mask-placeholder='(XXX) XXX-XXXX'>",
          input           = compileElement(placeholderHtml);

      scope.$apply("x = ''");
      scope.$apply("mask = '(999) 999-9999'");
      expect(input.val()).toBe("");
      expect(input.attr("placeholder")).toBe("Phone Number");
    });

    it("should interpret empty ui-mask-placeholder", function() {
      var placeholderHtml = "<input name='input' ng-model='x' ui-mask='{{mask}}' placeholder='Phone Number' ui-mask-placeholder>",
          input           = compileElement(placeholderHtml);

      scope.$apply("x = ''");
      scope.$apply("mask = '(999) 999-9999'");
      input.triggerHandler("input");
      expect(input.val()).toBe("(___) ___-____");
      expect(input.attr("placeholder")).toBe("Phone Number");
    });

    it("should accept ui-mask-placeholder-char", function() {
      var placeholderHtml = "<input name='input' ng-model='x' ui-mask='{{mask}}' placeholder='Phone Number' ui-mask-placeholder ui-mask-placeholder-char='X'>",
          input           = compileElement(placeholderHtml);

      scope.$apply("x = ''");
      scope.$apply("mask = '(999) 999-9999'");
      input.triggerHandler("input");
      expect(input.val()).toBe("(XXX) XXX-XXXX");
      expect(input.attr("placeholder")).toBe("Phone Number");
    });

    it("should accept ui-mask-placeholder-char with value `space`", function() {
      var placeholderHtml = "<input name='input' ng-model='x' ui-mask='{{mask}}' placeholder='Phone Number' ui-mask-placeholder ui-mask-placeholder-char='space'>",
          input           = compileElement(placeholderHtml);

      scope.$apply("x = ''");
      scope.$apply("mask = '(999) 999-9999'");
      input.triggerHandler("input");
      expect(input.val()).toBe("(   )    -    ");
      expect(input.attr("placeholder")).toBe("Phone Number");
    });

    it("should not override placeholder value when ui-mask-placeholder is not set and ui-mask-placeholder-char is `space`", function() {
      var placeholderHtml = "<input name='input' ng-model='x' ui-mask='{{mask}}' placeholder='{{placeholder}}' ui-mask-placeholder-char='space'>",
          input           = compileElement(placeholderHtml);

      scope.$apply("x = ''");
      scope.$apply("mask = '99/99/9999'");
      scope.$apply("placeholder = 'DD/MM/YYYY'");
      expect(input.attr("placeholder")).toBe("DD/MM/YYYY");

      input.val("12").triggerHandler("input");
      expect(input.val()).toBe("12/MM/YYYY");

      scope.$apply("placeholder = 'MM/DD/YYYY'");
      expect(input.val()).toBe("12/DD/YYYY");

      input.triggerHandler("blur");
      expect(input.attr("placeholder")).toBe("MM/DD/YYYY");
    });

    it("should allow text input to be the same character as ui-mask-placeholder-char", function() {
      var placeholderHtml = "<input name='input' ng-model='x' ui-mask='(999) 999-9999' placeholder='Phone Number' ui-mask-placeholder-char='5'>",
          input           = compileElement(placeholderHtml);

      scope.$apply();
      input.val("6505265486").triggerHandler("input");
      expect(input.val()).toBe("(650) 526-5486");
    });

    it("should allow text input to be the same character as characters in ui-mask-placeholder", function() {
      var placeholderHtml = "<input name='input' ng-model='x' ui-mask='(999) 999-9999' placeholder='Phone Number' ui-mask-placeholder='(555) 555-5555'>",
          input           = compileElement(placeholderHtml);

      scope.$apply();
      input.val("6505265486").triggerHandler("input");
      expect(input.val()).toBe("(650) 526-5486");
    });
  });

  describe("configuration", function () {
    it("should accept the new mask definition set globally", function() {
      config.maskDefinitions["@"] = /[fz]/;

      var input = compileElement(inputHtml);

      scope.$apply("x = ''");
      scope.$apply("mask = '@193'");
      input.val("f123____").triggerHandler("input");
      input.triggerHandler("blur");
      expect(input.val()).toBe("f123");
    });

    it("should merge the mask definition set globally with the definition set per element", function() {
      scope.options = {
        maskDefinitions: {
          "A": /[A-Z]/,  //make A caps only
          "b": /[a-z]/   //make b lowercase only
        }
      };

      var input = compileElement(inputHtml);

      scope.$apply("x = ''");
      scope.$apply("mask = '@193Ab'");
      input.val("f123cCCc").triggerHandler("input");
      input.triggerHandler("blur");
      expect(input.val()).toBe("f123Cc");
    });

    it("should accept the new events to handle per element", function() {
      scope.options = {
        eventsToHandle: ['keyup']
      };

      var input = compileElement(inputHtml);

      scope.$apply("x = ''");
      scope.$apply("mask = '@99-9'");
      input.val("f111").triggerHandler("input focus click");
      expect(input.val()).toBe("f111");
      input.triggerHandler('keyup');
      expect(input.val()).toBe("f11-1");
    });

    it("should accept the new mask definition set per element", function() {
      delete config.maskDefinitions["@"];

      scope.options = {
        maskDefinitions: {"@": /[fz]/}
      };

      var input = compileElement(inputHtml);

      scope.$apply("x = ''");
      scope.$apply("mask = '@999'");
      input.val("f111____").triggerHandler("input");
      input.triggerHandler("blur");
      expect(input.val()).toBe("f111");
    });
  });

  describe("blurring", function () {
    it("should clear an invalid value from the input", function() {
      var input = compileElement(inputHtml);
      scope.$apply("x = ''");
      scope.$apply("mask = '(9) * A'");
      input.val("a").triggerHandler("input");
      input.triggerHandler("blur");
      expect(input.val()).toBe("");
    });

    it("should clear an invalid value from the ngModelController.$viewValue", function() {
      var form  = compileElement(formHtml);
      var input = form.find("input");
      scope.$apply("x = ''");
      scope.$apply("mask = '(A) * 9'");
      input.val("a").triggerHandler("input");
      input.triggerHandler("blur");
      expect(scope.test.input.$viewValue).toBe("");
    });

    var inputHtmlClearOnBlur = "<input name='input' ng-model='x' ui-mask='{{mask}}' ui-options=\"input.options\">";

    it("should not clear an invalid value if clearOnBlur is false", function() {
      scope.input = {
        options: {clearOnBlur: false}
      };

      var input = compileElement(inputHtmlClearOnBlur);

      scope.$apply("x = ''");
      scope.$apply("mask = '(9) * A'");

      input.val("9a").triggerHandler("input");
      input.triggerHandler("blur");
      expect(input.val()).toBe("(9) a _");
    });

    it("should clear an invalid value if clearOnBlur is true", function() {
      scope.input = {
        options: {clearOnBlur: true}
      };

      var input = compileElement(inputHtmlClearOnBlur);

      scope.$apply("x = ''");
      scope.$apply("mask = '(9) * A'");

      input.val("9a").triggerHandler("input");
      input.triggerHandler("blur");
      expect(input.val()).toBe("");
    });

    var inputHtmlClearOnBlurPlaceholder = "<input name='input' ng-model='x' ui-mask='{{mask}}' ui-options=\"input.options\" ui-mask-placeholder placeholder=\"PLACEHOLDER\">";

    it("should not show placeholder when value is invalid if clearOnBlurPlaceholder is false", function() {
      scope.input = {
        options: {
          clearOnBlur: false,
          clearOnBlurPlaceholder: false
        }
      };

      var input = compileElement(inputHtmlClearOnBlurPlaceholder);

      scope.$apply("x = ''");
      scope.$apply("mask = '(9) * A'");

      input.val("").triggerHandler("input");
      input.triggerHandler("blur");
      expect(input.val()).toBe("(_) _ _");
    });

    it("should show placeholder when value is invalid if clearOnBlurPlaceholder is true", function() {
      scope.input = {
        options: {
          clearOnBlur: false,
          clearOnBlurPlaceholder: true
        }
      };

      var input = compileElement(inputHtmlClearOnBlurPlaceholder);

      scope.$apply("x = ''");
      scope.$apply("mask = '(9) * A'");

      input.val("").triggerHandler("input");
      input.triggerHandler("blur");
      expect(input.val()).toBe("");
      expect(input.attr("placeholder")).toBe("PLACEHOLDER");
    });
  });

  describe("Configuration Provider", function() {
    it("should return default values", inject(function($injector) {
      var service = $injector.invoke(uiMaskConfigProvider.$get);
      expect(service.clearOnBlur).toEqual(true);
      expect(service.clearOnBlurPlaceholder).toEqual(false);
    }));

    it("should merge default values with configured values", inject(function($injector) {
      uiMaskConfigProvider.clearOnBlur(false);
      var service = $injector.invoke(uiMaskConfigProvider.$get);
      expect(service.clearOnBlur).toEqual(false);
      expect(service.clearOnBlurPlaceholder).toEqual(false);
    }));
  });

});
