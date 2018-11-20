var smartFormValidator = new SmartFormValidator('.form-validate');

var url = './form.php';

var $submitBtn = document.querySelector('.js-submit');
var $formFeedback = document.getElementById('form-feedback');

$submitBtn.addEventListener('click', function (ev) {
	ev.preventDefault();

	var json = getFormValues('form-feedback');

	createHttpRequest('POST', url, json).then(function (response) {
		var res = JSON.parse(response);
		alert(res.msg);
		smartFormValidator.resetForm();
	}).catch(function (err) {
		console.error('Упс! Что-то пошло не так.', err.statusText);
	});
});