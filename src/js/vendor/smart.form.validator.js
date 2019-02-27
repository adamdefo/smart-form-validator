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

		this.$submitBtn;

		this.errors = 0;

		this._init();
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
		regExp: {
			email: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
			phone: /^(\+7|8)([0-9]{3})([0-9]{3})([0-9]{2})([0-9]{2})$/
		},
		customValidation: {}
	};

	SmartFormValidator.prototype._init = function () {
		this._initEventForLabels();
		this._initSubmitBtn();
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

	SmartFormValidator.prototype._initSubmitBtn = function () {
		this.$submitBtn = this.$el.querySelector(this._params.selectorSubmitBtn);
		this.$submitBtn.disabled = true;
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
					valid: false
				}
				ths.inputs[el.name] = input
			}
			ths._addInputEvent(el);
		});
	};

	SmartFormValidator.prototype._addInputEvent = function (el) {
		var ths = this;

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
				ths._setInputStatusChanged(this.name);
				ths._validate();
			});
	
			el.addEventListener('blur', function () {
				var parent = this.parentNode;
				if (!this.value) {
					classie.remove(parent, ths._params.classNameActive);
				}
				classie.remove(parent, ths._params.classNameFocused);
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

	// запускает валидацию инпутов и в случае успешной проверки разблокирует кнопку отправки формы
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
					return { errorText: null, value: value };
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

		this.$submitBtn.disabled = this.errors > 0;
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
		this.$submitBtn.disabled = true;
	};

	window.SmartFormValidator = SmartFormValidator;

})(window);