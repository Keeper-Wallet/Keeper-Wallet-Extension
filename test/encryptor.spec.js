import { expect, assert } from 'chai';
import { encrypt, decrypt } from '../src/lib/encryprtor';

describe('encryptor', () => {
  const obj1 = { nonce: 123, secret: 'abracadabra' };
  const obj2 = { publicKey: 'some key' };
  const obj3 = ['smth1', 'smth2'];
  const pass1 = 'nonsecurepassword';
  const pass2 = '!Mor3S3curEPasSw0rD!';
  const pass3 = 'm31xn1309vm,m139jnjbmn91jbxc123xcl;k-01dnf';

  it('Should encrypt and decrypt JSON serializable objects', () => {
    expect(decrypt(encrypt(obj1, pass1), pass1)).to.eql(obj1);
    expect(decrypt(encrypt(obj2, pass2), pass2)).to.eql(obj2);
    expect(decrypt(encrypt(obj3, pass3), pass3)).to.eql(obj3);
  });

  it('Should throw on no password', () => {
    expect(() => encrypt(obj3)).to.throw('Password is required');
  });

  it('Should throw on invalid password', () => {
    expect(() => decrypt(encrypt(obj3, pass3), pass1)).to.throw(
      'Invalid password'
    );
  });

  // Previously had different error message for short password
  it('Should throw on short invalid password', () => {
    expect(() => decrypt(encrypt(obj3, pass3), 'asd')).to.throw(
      'Invalid password'
    );
  });
});
