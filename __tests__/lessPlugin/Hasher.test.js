const expect = require('chai').expect;
const Hasher = require('../../lib/lessPlugin/Hasher');
const { hash } = require('../../lib/utils-functions');
const path = require('path');

const filename = 'tested.less';
const extra = {
  fileInfo: {
    filename,
  },
};

const styles = 'body{color: red;}';

describe('Test Hasher plugin', () => {
  let hasher;

  beforeEach(() => {
    hasher = new Hasher(process.cwd(), new Map());
  });

  it('Should create a valid instance', () => {
    expect(hasher)
      .to.be.an('object')
      .to.have.own.property('cwd', process.cwd())
      .that.is.a('string');
    expect(hasher)
      .to.be.an('object')
      .to.have.own.property('map')
      .to.be.an.instanceOf(Map);
  });

  it("Should Hasher contains 'process' function", () => {
    expect(hasher.process).to.not.throw();
  });

  it('Should hash file name', () => {
    const hashed = hash(filename);
    expect(hasher.hashFile(filename)).to.equal(hashed);
  });

  it('Should convert hashed file name to less comment', () => {
    const hashed = hasher.hashFile(filename);
    expect(hasher.toLessComment(hashed)).to.equal(`/*${hashed}*/`);
  });

  it('Should process styles adding hashed file on start and end of file', () => {
    const _file = path.resolve(process.cwd(), filename);
    const hashed = hasher.hashFile(_file);
    const comment = hasher.toLessComment(hashed);
    let expected = comment;
    expected += '\n' + styles + '\n';
    expected += comment;

    hasher.process(styles, extra);
    expect(hasher.process(styles, extra)).to.equal(expected);
  });

  it('Should add filename to map', () => {
    const _file = path.resolve(process.cwd(), filename);
    const hashed = hasher.hashFile(_file);
    hasher.process(styles, extra);

    expect(hasher.getHashedFileByFileName(_file)).to.equal(hashed);
  });
});
