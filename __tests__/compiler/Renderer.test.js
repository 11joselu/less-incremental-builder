const expect = require('chai').expect;

const LessRenderer = require('../../lib/compiler/LessRenderer');
const FileManager = require('../../lib/compiler/FileManager');

describe('Test Renderer', () => {
  let lessRenderer;

  beforeEach(() => {
    const manager = new FileManager('test.less', 'test.css', process.cwd());
    lessRenderer = new LessRenderer(manager, []);
  });

  it('Should create a correct instance', () => {
    expect(lessRenderer.getManager()).to.be.an.instanceof(FileManager);

    expect(lessRenderer)
      .to.be.an('object')
      .to.have.own.property('paths')
      .that.is.a('array');
    expect(lessRenderer.getHasherPlugin()).to.be.an('object');
    expect(lessRenderer.getHasherPlugin())
      .to.have.own.property('install')
      .that.is.a('function');
  });

  it('Should render styles', () => {
    const toBuild = '';
    const resultPromise = lessRenderer.render(toBuild);
    expect(resultPromise).to.be.a('promise');
    resultPromise.then(({ css }) => {
      expect(css).to.equal(toBuild);
    });
  });

  it('Should push new path inside array of paths', () => {
    const newPath = 'static';
    lessRenderer.pushNewPath(newPath);
    expect(lessRenderer.getPaths()).to.include(newPath);
    lessRenderer.pushNewPath(newPath);
    expect(lessRenderer.getPaths()).to.include(newPath);
  });
});

describe('Test Renderer with config file', () => {
  it('Should create a correct file object', () => {
    const manager = new FileManager('test.less', 'test.css', process.cwd());
    const lessRenderer = new LessRenderer(manager, [], {});
    const lessOptions = lessRenderer.getLessOptions();
    expect(lessOptions).to.be.an('object');
    expect(lessOptions).to.have.own.property('paths');
    expect(lessOptions).to.have.own.property('plugins');
  });

  it('Should create a correct file object with paths attributes', () => {
    const manager = new FileManager('test.less', 'test.css', process.cwd());
    const lessRenderer = new LessRenderer(manager, [], { paths: ['tested'] });
    const lessOptions = lessRenderer.getLessOptions();
    expect(lessOptions.paths)
      .to.be.an('array')
      .that.includes('tested');
  });

  it('Should create a correct file object with plugins attributes', () => {
    const manager = new FileManager('test.less', 'test.css', process.cwd());
    const lessRenderer = new LessRenderer(manager, [], { plugins: ['tested'] });
    const lessOptions = lessRenderer.getLessOptions();
    expect(lessOptions.plugins)
      .to.be.an('array')
      .that.includes('tested');
  });

  it('Should throw erros with not correct file object', () => {
    const manager = new FileManager('test.less', 'test.css', process.cwd());
    expect(() => {
      new LessRenderer(manager, [], { paths: 'tested' });
    }).to.throw();

    expect(() => {
      new LessRenderer(manager, [], { plugins: 'tested' });
    }).to.throw();
  });
});
