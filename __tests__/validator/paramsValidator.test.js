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
      validateParams({
        src: 'test.less'
      });
    }).to.throw(RequiredParamException);
  });

  it('Should throw an exception when output param is not a css file', () => {
    expect(() => {
      validateParams({
        src: 'test.less',
        output: 'is_a_dir/'
      })
    }).to.throw(NotValidOutputFileException);
  });

  it('Should pass validation', () => {
    expect(validateParams({
      src: 'test.less',
      output: 'style.css'
    })).to.be.an('undefined');
  });
});
