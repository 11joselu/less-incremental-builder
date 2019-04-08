const {
  assert,
  expect
} = require('chai');
const Parser = require('../../lib/compiler/Parser');

describe('Test Parser', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser([], process.cwd());
  });

  it('Should create a correct instance', () => {
    expect(parser).to.be.an('object').to.have.own.property('cwd', process.cwd()).that.is.a('string');
    expect(parser).to.be.an('object').to.have.own.property('paths').that.is.a('array');
    expect(parser.map).to.be.an.instanceOf(Map);
    expect(parser.getLessPlugin()).to.be.an('array').that.is.not.empty;
    expect(parser.getLessPlugin()[0]).to.have.own.property('install').that.is.a('function');
  });

  it('Should render styles', () => {
    const toBuild = '';
    const resultPromise = parser.render(toBuild);
    expect(resultPromise).to.be.a('promise');
    resultPromise.then(({
      css
    }) => {
      assert.equal(css, toBuild);
    });
  });

  it('Should push new path inside array of paths', () => {
    const newPath = 'static';
    parser.pushNewPath(newPath);
    expect(parser.getPaths()).to.include(newPath);
    parser.pushNewPath(newPath);
    expect(parser.getPaths()).to.include(newPath);
  });

  it('Should get empty key inside map', () => {
    expect(parser.getFileHash('')).to.be.a('undefined');
  });

});
