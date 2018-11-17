/**
 * Валидатор форм
 * @author Adam Defo
 */
(function() {

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
		this.$formElements = this.$el.querySelectorAll('.form__el');
		this.formElements = [];

		this._init();
	};

	SmartFormValidator.prototype._params = {};

	SmartFormValidator.prototype._init = function () {
		this._initFormElements();
	};

	// создаст для каждого элемента формы свой объект
	SmartFormValidator.prototype._initFormElements = function () {
		var self = this;
		this.$formElements.forEach(function (el, index) {
			self.formElements.push({
				id: index,
			});
		});
	};

	SmartFormValidator.prototype._initCtrls = function () {
	};

	SmartFormValidator.prototype._initEvents = function () {
	};

	SmartFormValidator.prototype._validate = function () {
	};

	SmartFormValidator.prototype._outError = function () {
	};

})();