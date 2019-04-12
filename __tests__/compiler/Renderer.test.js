const expect = require('chai').expect;

const Renderer = require('../../lib/compiler/Renderer');

describe('Test Renderer', () => {
  let renderer;

  beforeEach(() => {
    renderer = new Renderer([], process.cwd());
  });

  it('Should create a correct instance', () => {
    expect(renderer).to.be.an('object').to.have.own.property('cwd', process.cwd()).that.is.a('string');
    expect(renderer).to.be.an('object').to.have.own.property('paths').that.is.a('array');
    expect(renderer.map).to.be.an.instanceOf(Map);
    expect(renderer.getLessPlugin()).to.be.an('array').that.is.not.empty;
    expect(renderer.getLessPlugin()[0]).to.have.own.property('install').that.is.a('function');
  });

  it('Should render styles', () => {
    const toBuild = '';
    const resultPromise = renderer.render(toBuild);
    expect(resultPromise).to.be.a('promise');
    resultPromise.then(({
      css
    }) => {
      expect(css).to.equal(toBuild);
    });
  });

  it('Should push new path inside array of paths', () => {
    const newPath = 'static';
    renderer.pushNewPath(newPath);
    expect(renderer.getPaths()).to.include(newPath);
    renderer.pushNewPath(newPath);
    expect(renderer.getPaths()).to.include(newPath);
  });

  it('Should get empty key inside map', () => {
    expect(renderer.getFileHash('')).to.be.a('undefined');
  });

});
