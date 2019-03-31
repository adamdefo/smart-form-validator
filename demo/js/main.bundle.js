/*!
 * classie v1.0.1
 * class helper functions
 * from bonzo https://github.com/ded/bonzo
 * MIT license
 * 
 * classie.has( elem, 'my-class' ) -> true/false
 * classie.add( elem, 'my-new-class' )
 * classie.remove( elem, 'my-unwanted-class' )
 * classie.toggle( elem, 'my-class' )
 */

(function( window ) {

	'use strict';
	
	// class helper functions from bonzo https://github.com/ded/bonzo
	
	function classReg( className ) {
	  return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
	}
	
	// classList support for class management
	// altho to be fair, the api sucks because it won't accept multiple classes at once
	var hasClass, addClass, removeClass;
	
	if ( 'classList' in document.documentElement ) {
	  hasClass = function( elem, c ) {
		return elem.classList.contains( c );
	  };
	  addClass = function( elem, c ) {
		elem.classList.add( c );
	  };
	  removeClass = function( elem, c ) {
		elem.classList.remove( c );
	  };
	}
	else {
	  hasClass = function( elem, c ) {
		return classReg( c ).test( elem.className );
	  };
	  addClass = function( elem, c ) {
		if ( !hasClass( elem, c ) ) {
		  elem.className = elem.className + ' ' + c;
		}
	  };
	  removeClass = function( elem, c ) {
		elem.className = elem.className.replace( classReg( c ), ' ' );
	  };
	}
	
	function toggleClass( elem, c ) {
	  var fn = hasClass( elem, c ) ? removeClass : addClass;
	  fn( elem, c );
	}
	
	var classie = {
	  // full names
	  hasClass: hasClass,
	  addClass: addClass,
	  removeClass: removeClass,
	  toggleClass: toggleClass,
	  // short names
	  has: hasClass,
	  add: addClass,
	  remove: removeClass,
	  toggle: toggleClass
	};
	
	// transport
	if ( typeof define === 'function' && define.amd ) {
	  // AMD
	  define( classie );
	} else if ( typeof exports === 'object' ) {
	  // CommonJS
	  module.exports = classie;
	} else {
	  // browser global
	  window.classie = classie;
	}
	
})(window);
/**
 * Умный валидатор форм
 * @author Aleksey Kondratyev
 */
;(function(window) {

	'use strict';

	var extend = function (a, b) {
		for (var key in b) {
			a[key] = b[key];
		}
		return a;
	};

	/**
	 * 
	 * @param {*} selector селектор формы
	 * @param {*} params наименование селекторов для контролов, лейблов и т.д.
	 * @param {*} settings дополнительные настройки
	 */
	var SmartFormValidator = function (selector, params, settings) {
		if (!this._checkSelector(selector)) {
			return;
		}

		this.$el = document.querySelector(selector);

		this._params = extend(this._params, params);

		// лейблы у контролов
		this.$formLabels = [].slice.call(this.$el.querySelectorAll(this._params.selectorFormLabels));

		// инпуты, селекты, чекбоксы, радиобатоны
		this.$formControls = [].slice.call(this.$el.querySelectorAll(this._params.selectorFormControls));
		this.inputs = {};

		// кнопка Отправить
		this.$submitBtn = this.$el.querySelector(this._params.selectorSubmitBtn);
		this.$submitBtn.disabled = this._params.disableSubmitBtn;

		this.errors = 0;

		this.timer = null;
		this.timerValidate = null;

		this.init();
	};

	SmartFormValidator.prototype._checkSelector = function (selector) {
		return document.querySelector(selector);
	};

	SmartFormValidator.prototype._params = {
		selectorFormLabels: '.form__label',
		selectorFormControls: '.form__control',
		selectorErrorDiv: '.form__error',
		selectorSubmitBtn: '.js-form-submit',
		classNameActive: 'form__item_active',
		classNameFocused: 'form__item_focused',
		classNameError: 'form__item_error',
		defaultErrorText: 'необходимо заполнить',
		invalidErrorText: 'неверный формат',
		displayError: false,
		disableSubmitBtn: false,
		regExp: {
			email: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
			phone: /^(\+7|8)([0-9]{3})([0-9]{3})([0-9]{2})([0-9]{2})$/
		},
		customValidation: {},
		timerDelay: 1000
	};

	SmartFormValidator.prototype.init = function () {
		this._initEventForLabels();
		this._initFormCtrls();
	};

	SmartFormValidator.prototype._initEventForLabels = function () {
		var ths = this;
		this.$formLabels.forEach(function (label) {
			ths._addEventForLabel(label);
		});
	};

	SmartFormValidator.prototype._addEventForLabel = function (label) {
		var ths = this;
		label.addEventListener('click', function () {
			var parent = this.parentNode;
			classie.add(parent, ths._params.classNameActive);
			classie.add(parent, ths._params.classNameFocused);

			var input = this.previousElementSibling;
			input.focus();
		});
	};

	// создаст для каждого элемента формы свой объект
	SmartFormValidator.prototype._initFormCtrls = function () {
		var ths = this;
		this.$formControls.forEach(function (el, id) {
			if (!ths.inputs.hasOwnProperty(el.name)) {
				var input = {
					id: id,
					$el: el,
					type: el.type, // text, select, checkbox
					field: el.getAttribute('data-field'), // тип поля: телефон, email и т.д.
					name: el.name,
					value: el.value,
					required: el.hasAttribute('_required'),
					rule: null,
					error: false,
					errorText: null,
					changed: false, // прим. при валидации, чтобы не проставлять ошибку у других элементов, значение которых не менялось)
					active: false, // инпут в фокусе или имеет значение
					focused: false,
					valid: false,
					timer: null, // таймер для валидации, который запускается если в инпут ввели что-то, и после его заполняют
				}
				ths.inputs[el.name] = input
			}
			ths._addInputEvent(el);
		});
	};

	SmartFormValidator.prototype._addInputEvent = function (el) {
		var ths = this;
		var input = this.inputs[el.name];

		if (el.type === 'text') {
			el.addEventListener('focus', function () {
				var parent = this.parentNode;
				if (!classie.has(parent, ths._params.classNameActive)) {
					classie.add(parent, ths._params.classNameActive);
				}
				if (!classie.has(parent, ths._params.classNameFocused)) {
					classie.add(parent, ths._params.classNameFocused);
				}
			});
			
			el.addEventListener('keyup', function () {
				clearTimeout(ths.timer);
				if (!input.changed) {
					ths.timer = setTimeout(function () {
						ths._setInputStatusChanged(input.name);
					}, ths._params.timerDelay);
				}

				ths._createTimerValidation(input);
				ths._validate();
			});
	
			el.addEventListener('blur', function () {
				var parent = this.parentNode;
				if (!this.value) {
					classie.remove(parent, ths._params.classNameActive);
				}
				classie.remove(parent, ths._params.classNameFocused);
				ths._destroyTimerValidation();
				ths._validate();
			});
		} else if (el.type === 'checkbox') {
			el.addEventListener('change', function () {
				ths._validate();
			});
		}
	};

	SmartFormValidator.prototype._setInputStatusChanged = function (inputName) {
		if (!this.inputs[inputName].changed) {
			this.inputs[inputName].changed = true;
		}
	};

	// создает таймер валидации для инпута
	SmartFormValidator.prototype._createTimerValidation = function (input) {
		var ths = this;
		var delay = (input.$el.value && input.changed && !input.valid) ? 100 : this._params.timerDelay;

		this._destroyTimerValidation();
		if (input.$el.value && input.required && !input.valid) {
			this.timerValidate = setInterval(function () {
				ths._validate();
			}, delay);
		}
	};

	// уничтожает таймер валидации
	SmartFormValidator.prototype._destroyTimerValidation = function () {
		clearInterval(this.timerValidate);
	};

	// запускает валидацию инпутов
	SmartFormValidator.prototype._validate = function () {
		for (var inputName in this.inputs) {
			var input = this.inputs[inputName];
			
			if (input.required) {
				// получаем результат валидации
				var v = this._validateInput(input);
				if (v.errorText) {
					input.error = true;
					input.errorText = v.errorText;
					input.valid = false;
				} else {
					input.error = false;
					input.errorText = '';
					input.valid = true;
				}
			}
		}

		this._outErrors();
	};

	// проверяет инпуты, в зависимости от их типа (емаил, телефон, урл и т.д.)
	SmartFormValidator.prototype._validateInput = function (input) {
		var ths = this;
		switch (input.field) {
			case 'checkbox':
				return (function(value) {
					return { errorText: value ? null : ths._params.defaultErrorText, value: value };
				})(input.$el.checked);
			default:
				return (function(input) {
					return ths._getError(input);
				})(input);
		}
	};

	SmartFormValidator.prototype._getError = function (input) {
		var errorObj = { errorText: '', value: input.$el.value.trim() };
		// если в инпуте ничего нет
		if (this._defineErrorType(input) === 'empty') {
			errorObj.errorText =(this._params.customValidation.hasOwnProperty(input.field) && this._params.customValidation[input.field].hasOwnProperty('empty')) 
				? this._params.customValidation[input.field]['empty'].errorText
				: this._params.defaultErrorText;
		} else { // если в инпут что-то введено
			// проверим есть ли кастомные настройки для этого инпута
			if (this._params.customValidation.hasOwnProperty(input.field)) {
				// проверяю есть ли у инпута в кастомных настройках ключ на обработку введенных значений
				if (this._params.customValidation[input.field].hasOwnProperty('invalid')) {
					if (this._params.customValidation[input.field].invalid.hasOwnProperty('regExp')) {
						errorObj.errorText = this._params.customValidation[input.field].invalid.regExp.test(input.$el.value) 
							? null 
							: this._params.customValidation[input.field].invalid.errorText;
					} else {
						errorObj.errorText = this._params.regExp[input.field].test(input.$el.value) 
							? null 
							: this._params.customValidation[input.field].invalid.errorText;
					}
				} else { // если нет, то попробуем проверить по дефолтным регуляркам
					errorObj.errorText = this._checkInputValueByRegExp(input);
				}
			} else { // если нет, то будем использовать дефолтные регулярки
				errorObj.errorText = this._checkInputValueByRegExp(input);
			}
		}
		// возвращаем текст ошибки
		return errorObj;
	};

	// проверяет дефолтной регуляркой значение у инпута при наличие регулярки в настройках
	SmartFormValidator.prototype._checkInputValueByRegExp = function (input) {
		// проверяем есть ли для такого инпута стандартная регулярка
		if (this._checkDefaultRegExp(input)) {
			return this._params.regExp[input.field].test(input.$el.value) ? null : this._params.invalidErrorText;
		}
		// если в regExp нет ключа input.field, то в это поле можно ввести все что угодно
		return null;
	};

	// проверяет есть ли дефолтная регулярка
	SmartFormValidator.prototype._checkDefaultRegExp = function (input) {
		return this._params.regExp.hasOwnProperty(input.field);
	};

	// определяет тип ошибки
	SmartFormValidator.prototype._defineErrorType = function (input) {
		// если в инпуте есть что-то, то ошибка будет ссылаться на регулярное выражение, иначе на ошибку при пустом значение
		return input.$el.value.trim() ? 'invalid' : 'empty';
	};

	// выводит ошибки и проставляет классы родительскому контейнеру
	SmartFormValidator.prototype._outErrors = function () {
		this.errors = 0;

		for (var inputName in this.inputs) {
			var input = this.inputs[inputName];
			var parent = input.$el.parentNode;
			var $errorDiv = parent.querySelector(this._params.selectorErrorDiv);

			if (input.error) {
				this.errors++;
			}

			if (input.error && input.changed) {
				if ($errorDiv && this._params.displayError) {
					$errorDiv.innerText = input.errorText;
				}
				classie.add(parent, this._params.classNameError);
				classie.add(input.$el, '_error');
			} else {
				if ($errorDiv) {
					$errorDiv.innerText = '';
				}
				classie.remove(parent, this._params.classNameError);
				classie.remove(input.$el, '_error');
			}

			if (!input.error && input.valid && input.changed) {
				classie.add(parent, this._params.classNameActive);
			}
		}

		if (this._params.disableSubmitBtn) {
			this.$submitBtn.disabled = this.errors > 0;
		}
	};

	// сбрасывает значения формы и все классы с ошибками (example: может быть вызвана после успешной отправки формы)
	SmartFormValidator.prototype.resetForm = function () {
		var ths = this;
		this.$formControls.forEach(function(el) {
			el.value = '';
			classie.remove(el, '_error');
			classie.remove(el.$el.parentNode, ths._params.classNameError);
			classie.remove(el.$el.parentNode, ths._params.classNameActive);
		});
		this.$submitBtn.disabled = this._params.disableSubmitBtn;
	};

	window.SmartFormValidator = SmartFormValidator;

})(window);
var callbackForm = new SmartFormValidator(
    '.js-modal-form-callback',
    {
        customValidation: {
            name: {
                empty: {
                    errorText: 'необходимо заполнить блин'
                },
            },
            phone: {
                empty: {
                    errorText: 'необходимо заполнить телефон'
                },
                invalid: {
                    //regExp: /^(\+7|8)([0-9]{1})([0-9]{3})([0-9]{2})([0-9]{2})$/,
                    errorText: 'неверно вводите номер телефона'
                }
            },
            email: {
                empty: {
                    errorText: 'необходимо заполнить email'
                },
                invalid: {
                    errorText: 'не сможем отправить письмо по этому адресу. email должен быть следующего формата, например, mymail@mailbox.ru'
                }
            }
        },
        disableSubmitBtn: false,
        displayError: true
    });