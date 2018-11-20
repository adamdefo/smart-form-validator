/**
 * Валидатор форм
 * @author Adam Defo
 */
(function(window) {

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

		// инпуты, селекты, чекбоксы, радиобатоны
		this.$formElements = [].slice.call(this.$el.querySelectorAll('.form__el'));
		this.formElements = [];

		this.$submitBtn = this.$el.querySelector('.js-submit');

		this.requiredElements = [];

		this.errors = 0;

		this._init();
	};

	SmartFormValidator.prototype._params = {};

	SmartFormValidator.prototype._init = function () {
		this.$submitBtn.disabled = true;
		this._initFormElements();
	};

	// создаст для каждого элемента формы свой объект
	SmartFormValidator.prototype._initFormElements = function () {
		var self = this;
		this.$formElements.forEach(function (el, id) {
			self.formElements.push({
				id,
				$el: el,
				name: el.name,
				type: el.getAttribute('data-type'),
				required: el.hasAttribute('_required'),
				rule: null,
				error: null
			});
			self._addEvent(el);
		});
	};

	SmartFormValidator.prototype._addEvent = function (el) {
		var self = this;
		el.addEventListener('change', function () {
			self._validate();
		});
	};

	SmartFormValidator.prototype._validate = function () {
		var self = this;
		this.errors = 0;

		this.formElements.filter(function (el) {
			return el.required; 
		}).forEach(function(el) {
			if (!self._validateElement(el)) {
				el.error = true;
				self.errors++;
			} else {
				el.error = false;
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
		this.formElements.forEach(function(el) {
			if (el.error) {
				classie.add(el.$el, '_error');
				// console.log(this.name, this.previousElementSibling)
			} else {
				classie.remove(el.$el, '_error');
				// console.log(this.name, this.previousElementSibling)
			}
		});

		this.$submitBtn.disabled = this.errors > 0;
	};

	SmartFormValidator.prototype.resetForm = function () {
		this.$formElements.forEach(function(el) {
			el.value = '';
			classie.remove(el, '_error');
		});
		this.$submitBtn.disabled = true;
	};

	window.SmartFormValidator = SmartFormValidator;

})(window);