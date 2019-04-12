const expect = require('chai').expect;
const {
  unlinkSync,
  existsSync,
} = require('fs');
const {
  createLessFile,
  createStream
} = require('../test-functions');
const through = require('through2').obj;
const RequiredParamException = require('../../lib/exceptions/RequiredParamException');
const FileManager = require('../../lib/compiler/FileManager');
const path = require('path');

describe('Test FileManager', () => {
  let manager;
  let file;
  let inputFile;
  let outputFile = '../build/output.css';
  let cwd;

  beforeEach(() => {
    file = createLessFile();
    inputFile = file.path;
    cwd = process.cwd();
    manager = new FileManager(inputFile, outputFile, cwd)
  });

  it('Should create a throw Error', () => {
    expect(() => {
      manager = new FileManager();
    }).to.throw(RequiredParamException);
  });

  it('Should create a correct instance', () => {
    expect(manager).to.be.an.instanceOf(FileManager);
    expect(manager).to.be.an('object').to.have.own.property('inputFile', inputFile).that.is.a('string');
    expect(manager).to.be.an('object').to.have.own.property('outputFile', outputFile).that.is.a('string');
    expect(manager).to.be.an('object').to.have.own.property('cwd', cwd).that.is.a('string');
    expect(manager).to.be.an('object').to.have.own.property('rootFile').that.is.a('null');
  });

  it('Should validate main file', () => {
    expect(manager.isMainFile(inputFile)).to.be.true;
    expect(manager.isMainFile(outputFile)).to.be.false;
  });

  it('Should return dirname from output file', () => {
    expect(manager.getOutputDir()).to.equal(path.dirname(outputFile));
  });

  describe('Test streams', () => {
    let stream;

    beforeEach(() => {
      stream = createStream(manager.getInputFile());
    });

    it('Should set correct rootFile', (ended) => {
      stream
        .pipe(through(function (file, enc, done) {
          expect(manager.isRootFileEmpty()).to.be.true;
          manager.setRootFile(file);
          done();
        }))
        .on('finish', () => {
          expect(manager.isRootFileEmpty()).to.be.false;
          ended();
        });
    });

    it('Should get content as a string from rootFile', (ended) => {
      let currentFile = null;
      stream
        .pipe(through(function (file, enc, done) {
          manager.setRootFile(file);
          currentFile = file;
          done();
        }))
        .on('finish', () => {
          expect(manager.getRootFileContentString()).to.have.string(currentFile.contents.toString());
          ended();
        });
    });

    it('Should get content as a buffer object from rootFile', (ended) => {
      let currentFile = null;

      stream
        .pipe(through(function (file, enc, done) {
          currentFile = file;
          manager.setRootFile(file);
          done();
        }))
        .on('finish', () => {
          expect(manager.getBufferFromRootFile()).to.eql(currentFile.contents);
          ended();
        });
    });

    it('Should override content inside rootFile', (ended) => {
      let newContent = 'tested';
      let contentBuffer = new Buffer(newContent);

      stream
        .pipe(through(function (file, enc, done) {
          manager.setRootFile(file);
          manager.overrideRootBufferContent(newContent);
          done();
        }))
        .on('finish', () => {
          expect(manager.getBufferFromRootFile()).to.eql(contentBuffer);
          expect(manager.getRootFileContentString()).to.have.string(newContent);
          ended();
        });
    });

    afterEach(() => {
      if (existsSync(manager.getInputFile())) {
        unlinkSync(manager.getInputFile());
      }
    });
  });

  afterEach(() => {
    if (existsSync(manager.getInputFile())) {
      unlinkSync(manager.getInputFile());
    }
  });

  describe('Test override functions', () => {
    let hash = Date.now();
    let manager;
    let stream;
    let content = '/*' + hash + '*/body{color:red}/*' + hash + '*/';

    beforeEach(() => {
      const file = createLessFile(content);
      const inputFile = file.path;
      const outputFile = '../build/output.css';
      manager = new FileManager(inputFile, outputFile, process.cwd());
      stream = createStream(manager.getInputFile());
    });

    it('Should replace new content by hash', (ended) => {
      stream
        .pipe(through(function (file, enc, done) {
          currentFile = file;
          manager.setRootFile(file);
          done();
        }))
        .on('finish', () => {
          const newContent = '.tested{color: tomato;}';
          manager.replaceContentInRootFileByHash(hash, newContent);
          expect(manager.getRootFileContentString()).to.have.string(newContent);
          ended();
        });
    });

    it('Should replace new content by hash', (ended) => {
      stream
        .pipe(through(function (file, enc, done) {
          currentFile = file;
          manager.setRootFile(file);
          done();
        }))
        .on('finish', () => {
          hash = '';
          manager.replaceContentInRootFileByHash(hash, '');
          expect(manager.getRootFileContentString()).to.equal(content);
          ended();
        });
    });

    afterEach(() => {
      if (existsSync(manager.getInputFile())) {
        unlinkSync(manager.getInputFile());
      }
    });

  });

});
