/**
 * Валидатор форм
 * @author Adam Defo
 */
;(function(window) {

	'use strict';

	var extend = function (a, b) {
		for (var key in b) {
			if (b.hasOwnProperty(key)) {
				a[key] = b[key];
			}
		}
		return a;
	};

	var SmartFormValidator = function (selector, params) {

		this._params = extend({}, this._params);
		extend(this._params, params);

		this.$el = document.querySelector(selector);

		// лейблы у контролов
		this.$formLabels = [].slice.call(this.$el.querySelectorAll(this._params.selectorFormLabels));

		// инпуты, селекты, чекбоксы, радиобатоны
		this.$formControls = [].slice.call(this.$el.querySelectorAll(this._params.selectorFormControls));
		this.formControls = [];

		this.$submitBtn;

		this.requiredElements = [];

		this.errors = 0;

		this._init();
	};

	SmartFormValidator.prototype._params = {
		selectorFormLabels: '.form__label',
		selectorFormControls: '.form-control',
		selectorSubmitBtn: '.js-form-submit',
		classNameActive: 'form__item_active',
		classNameFocused: 'form__item_focused',
		classNameError: 'form__item_error',
	};

	SmartFormValidator.prototype._init = function () {
		this._initFormLabels();
		this._initFormElements();
		this._initSubmitBtn();
	};

	SmartFormValidator.prototype._initSubmitBtn = function () {
		this.$submitBtn = this.$el.querySelector(this._params.selectorSubmitBtn);
		this.$submitBtn.disabled = true;
	};

	SmartFormValidator.prototype._initFormLabels = function () {
		var self = this;
		this.$formLabels.forEach(function (label) {
			self._addEventForLabel(label);
		});
	};

	SmartFormValidator.prototype._addEventForLabel = function (label) {
		var self = this;
		label.addEventListener('click', function () {
			var parent = this.parentNode;
			classie.add(parent, self._params.classNameActive);
			classie.add(parent, self._params.classNameFocused);

			var input = this.previousElementSibling;
			input.focus();
		});
	};

	// создаст для каждого элемента формы свой объект
	SmartFormValidator.prototype._initFormElements = function () {
		var self = this;
		this.$formControls.forEach(function (el, id) {
			self.formControls.push(
				{
					id: id,
					$el: el,
					name: el.name,
					value: el.value,
					type: el.getAttribute('data-type'),
					required: el.hasAttribute('_required'),
					rule: null,
					error: false,
					changed: false, // прим. при валидации, чтобы не проставлять ошибку у других элементов, значение которых не менялось)
					active: false, // инпут в фокусе или имеет значение
					valid: false,
				}
			);
			self._addEvent(el);
		});
	};

	SmartFormValidator.prototype._findFormControl = function (name) {
		for (var i = 0; i < this.formControls.length; i++) {
			if (this.formControls[i].name === name) {
				this.formControls[i].changed = true;
				i = this.formControls.length;
			}
		}
	};

	SmartFormValidator.prototype._checkValueFormControl = function (ctrl) {
		return ctrl.value;
	};

	SmartFormValidator.prototype._addEvent = function (el) {
		var self = this;

		el.addEventListener('focus', function () {
			var parent = this.parentNode;
			if (!classie.has(parent, self._params.classNameActive)) {
				classie.add(parent, self._params.classNameActive);
			}
			if (!classie.has(parent, self._params.classNameFocused)) {
				classie.add(parent, self._params.classNameFocused);
			}
		});
		
		el.addEventListener('keyup', function () {
			self._findFormControl(this.name);
			self._validate();
		});

		el.addEventListener('blur', function () {
			// self._validate();
			if (!this.value) {
				var parent = this.parentNode;
				classie.remove(parent, self._params.classNameActive);
				classie.remove(parent, self._params.classNameFocused);
			}
		});
	};

	SmartFormValidator.prototype._validate = function () {
		var self = this;
		this.errors = 0;

		this.formControls.filter(function (el) {
			return el.required; 
		}).forEach(function(el) {
			if (!self._validateElement(el)) {
				el.error = true;
				el.valid = false;
				self.errors++;
			} else {
				el.error = false;
				el.valid = true;
			}
		});

		this._outErrors();
	};

	SmartFormValidator.prototype._validateElement = function (el) {
		switch (el.type) {
			case 'email':
				return (function(email) {
					var reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
						return reg.test(email);
				})(el.$el.value);
			default:
				return (function(value) {
					var error = 0
					if (!value) {
						error++;
					}
					return !error;
				})(el.$el.value);
		}
	};

	SmartFormValidator.prototype._outErrors = function () {
		var self = this;
		this.formControls.forEach(function(el) {
			var parent = el.$el.parentNode;
			if (el.error && el.changed) {
				classie.add(parent, self._params.classNameError);
				classie.add(el.$el, '_error');
			} else {
				classie.remove(parent, self._params.classNameError);
				classie.remove(el.$el, '_error');
			}

			if (!el.error && el.valid && el.changed) {
				classie.add(parent, self._params.classNameActive);
			}
		});

		this.$submitBtn.disabled = this.errors > 0;
	};

	SmartFormValidator.prototype._resetForm = function () {
		var self = this;
		this.$formControls.forEach(function(el) {
			el.value = '';
			classie.remove(el, '_error');
			classie.remove(el.$el.parentNode, self._params.classNameError);
		});
		this.$submitBtn.disabled = true;
	};

	window.SmartFormValidator = SmartFormValidator;

})(window);