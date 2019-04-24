const expect = require('chai').expect;

const Renderer = require('../../lib/compiler/Renderer');
const FileManager = require('../../lib/compiler/FileManager');

describe('Test Renderer', () => {
  let renderer;

  beforeEach(() => {
    const manager = new FileManager('test.less', 'test.css', process.cwd());
    renderer = new Renderer(manager, []);
  });

  it('Should create a correct instance', () => {
    expect(renderer.getManager()).to.be.an.instanceof(FileManager);

    expect(renderer)
      .to.be.an('object')
      .to.have.own.property('paths')
      .that.is.a('array');
    expect(renderer.getHasherPlugin()).to.be.an('object');
    expect(renderer.getHasherPlugin())
      .to.have.own.property('install')
      .that.is.a('function');
  });

  it('Should render styles', () => {
    const toBuild = '';
    const resultPromise = renderer.render(toBuild);
    expect(resultPromise).to.be.a('promise');
    resultPromise.then(({ css }) => {
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
});

describe('Test Renderer with config file', () => {
  it('Should create a correct file object', () => {
    const manager = new FileManager('test.less', 'test.css', process.cwd());
    const renderer = new Renderer(manager, [], {});
    const lessOptions = renderer.getLessOptions();
    expect(lessOptions).to.be.an('object');
    expect(lessOptions).to.have.own.property('paths');
    expect(lessOptions).to.have.own.property('plugins');
  });

  it('Should create a correct file object with paths attributes', () => {
    const manager = new FileManager('test.less', 'test.css', process.cwd());
    const renderer = new Renderer(manager, [], { paths: ['tested'] });
    const lessOptions = renderer.getLessOptions();
    expect(lessOptions.paths)
      .to.be.an('array')
      .that.includes('tested');
  });

  it('Should create a correct file object with plugins attributes', () => {
    const manager = new FileManager('test.less', 'test.css', process.cwd());
    const renderer = new Renderer(manager, [], { plugins: ['tested'] });
    const lessOptions = renderer.getLessOptions();
    expect(lessOptions.plugins)
      .to.be.an('array')
      .that.includes('tested');
  });

  it('Should throw erros with not correct file object', () => {
    const manager = new FileManager('test.less', 'test.css', process.cwd());
    expect(() => {
      new Renderer(manager, [], { paths: 'tested' });
    }).to.throw();

    expect(() => {
      new Renderer(manager, [], { plugins: 'tested' });
    }).to.throw();
  });
});
