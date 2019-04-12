const expect = require('chai').expect;
const validateParams = require('../../lib/validator/paramsValidator');
const RequiredParamException = require('../../lib/exceptions/RequiredParamException');
const NotValidOutputFileException = require('../../lib/exceptions/NotValidOutputFileException');

describe('Validate app arguments', () => {
  it('Should throw an exception when src param is empty', () => {
    expect(validateParams).to.throw(RequiredParamException);
  });

  it('Should throw an exception when output param is empty', () => {
    expect(() => {
      validateParams('test.less');
    }).to.throw(RequiredParamException);
  });

  it('Should throw an exception when output param is not a css file', () => {
    expect(() => {
      validateParams('test.less', 'is_a_dir/');
    }).to.throw(NotValidOutputFileException);
  });

  it('Should pass validation', () => {
    expect(validateParams('test.less', 'style.css')).to.be.true;
  });
});
