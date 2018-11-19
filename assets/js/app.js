var smartFormValidator = new SmartFormValidator('.form-validate');

var url = 'api/ip_adress.php';
var json = getFormValues('form-feedback');

makeRequest('POST', url, json).then(function (response) {
    var res = JSON.parse(response);
}).catch(function (err) {
    console.error('Упс! Что-то пошло не так.', err.statusText);
});