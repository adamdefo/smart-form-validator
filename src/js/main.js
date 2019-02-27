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
        displayError: true
    });