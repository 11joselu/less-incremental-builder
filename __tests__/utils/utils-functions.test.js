const expect = require('chai').expect;
const utils = require('../../lib/utils-functions');
const fs = require('fs');
const path = require('path');
const createGraph = require('../../lib/graph/create');
const DirectoryAlreadyExistsException = require('../../lib/exceptions/DirectoryAlreadyExistsException');

const { createLessFile } = require('../test-functions');

const dir = path.resolve(process.cwd(), '__tests__', 'build', 'test');

describe('Test utils functions', () => {
  it('Should create recursive folder', () => {
    utils.mkdirp(dir);
    const stats = fs.lstatSync(path.dirname(dir));

    expect(stats.isDirectory()).to.be.true;
  });

  it('Should throw error when directory already exists', () => {
    expect(() => {
      utils.mkdirp(dir);
    }).to.throw(DirectoryAlreadyExistsException);
  });

  it('Should validate if a directory already exists', () => {
    expect(utils.existsDirectory(dir)).to.be.true;
    expect(utils.existsDirectory('notFounded')).to.be.false;
  });

  it('Should create paths for less plugin', () => {
    const file = createLessFile();
    const graph = createGraph(file.path);
    const paths = utils.getPathsForLessPlugin(
      graph,
      process.cwd(),
      'tested.less'
    );

    expect(paths)
      .to.be.an('array')
      .that.include('__tests__/build/');

    fs.unlinkSync(file.path);
  });

  after(() => {
    fs.rmdirSync(path.dirname(path.join(dir, 'test')));
  });
});
