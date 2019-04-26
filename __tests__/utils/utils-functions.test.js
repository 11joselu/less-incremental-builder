const expect = require('chai').expect;
const utils = require('../../lib/utils-functions');
const fs = require('fs');
const path = require('path');
const DirectoryAlreadyExistsException = require('../../lib/exceptions/DirectoryAlreadyExistsException');

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

  it('Should handle correct promises functions', async () => {
    let [error] = await utils.promiseHandler(Promise.reject(new Error('')));
    expect(error).to.be.instanceOf(Error);
    [error] = await utils.promiseHandler(Promise.resolve(new Error('')));
    expect(error).to.be.instanceOf(Error);
    const [, data] = await utils.promiseHandler(Promise.resolve(true));
    expect(data).to.be.true;
  });

  after(() => {
    fs.rmdirSync(path.dirname(path.join(dir, 'test')));
  });
});
