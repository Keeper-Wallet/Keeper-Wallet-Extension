describe('Password management', () => {
    describe('Create password', () => {
        it('Минимальная длина пароля 8 символов');
        it('Можно вставить пароль из буфера обмена');
        it('Пароли в обоих полях должны совпадать');
    });

    describe('Change password', () => {
        it('Минимальная длина пароля 8 символов');
        it('Можно вставить пароль из буфера обмена');
        it('Пароли в обоих полях должны совпадать');
        it('Новый пароль не может совпадать со старым');
        it('После успешной смены пароля всплывает подсказка "Password changed"');
    });

    describe('Logout', () => {});
    describe('Incorrect password login', () => {});
    describe('Correct password login', () => {});
    describe('Password reset', () => {});
});
