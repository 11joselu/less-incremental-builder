const expect = require('chai').expect;
const { unlinkSync, existsSync } = require('fs');
const through = require('through2').obj;
const path = require('path');
const sinon = require('sinon');

const { createLessFile, createStream } = require('../test-functions');
const FileManager = require('../../lib/compiler/FileManager');

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
    manager = new FileManager(inputFile, outputFile, cwd);
  });

  it('Should create a correct instance', () => {
    expect(manager).to.be.an.instanceOf(FileManager);
    expect(manager)
      .to.be.an('object')
      .to.have.own.property('inputFile', inputFile)
      .that.is.a('string');
    expect(manager)
      .to.be.an('object')
      .to.have.own.property('outputFile', outputFile)
      .that.is.a('string');
    expect(manager)
      .to.be.an('object')
      .to.have.own.property('cwd', cwd)
      .that.is.a('string');
    expect(manager)
      .to.be.an('object')
      .to.have.own.property('rootFile')
      .that.is.a('null');
  });

  it('Should validate main file', () => {
    expect(manager.isMainFile(inputFile)).to.be.true;
    expect(manager.isMainFile(outputFile)).to.be.false;
  });

  it('Should return dirname from output file', () => {
    expect(manager.getOutputDir()).to.equal(path.dirname(outputFile));
  });

  it('Should get an empty hash', () => {
    expect(manager.getFileHash('asd')).to.be.undefined;
  });

  it('Should find hash an replace content', ended => {
    expect(manager.replaceContentInMainFile('', '')).to.be.false;
    const getFileHashStub = sinon
      .stub(manager, 'getFileHash')
      .returns(Date.now());

    const getRootFileContentStringStub = sinon
      .stub(manager, 'getRootFileContentString')
      .returns('Tested content');

    const overrideRootBufferContentStub = sinon
      .stub(manager, 'overrideRootBufferContent')
      .returns(undefined);

    manager.replaceContentInMainFile('', 'content');

    expect(getFileHashStub.calledOnce).to.be.true;
    expect(getRootFileContentStringStub.calledOnce).to.be.true;
    expect(overrideRootBufferContentStub.calledOnce).to.be.true;

    ended();
  });

  it('Should replace correct content by a hashed match', () => {
    const hash = Date.now();
    const getRootFileContentStringStub = sinon
      .stub(manager, 'getRootFileContentString')
      .returns(`/*${hash}*/.test{color:red}/*${hash}*/`);

    const newReplacement = '.replaced {}';
    const newContent = manager.getReplacedContent(hash, newReplacement);

    expect(getRootFileContentStringStub.calledOnce).to.be.true;
    expect(newContent).to.include(newReplacement);
  });

  describe('Test streams', () => {
    let stream;

    beforeEach(() => {
      stream = createStream(manager.getInputFile());
    });

    it('Should set correct rootFile', ended => {
      stream
        .pipe(
          through(function(file, enc, done) {
            expect(manager.isRootFileEmpty()).to.be.true;
            manager.setRootFile(file);
            done();
          })
        )
        .on('finish', () => {
          expect(manager.isRootFileEmpty()).to.be.false;
          ended();
        });
    });

    it('Should get content as a string from rootFile', ended => {
      let currentFile = null;
      stream
        .pipe(
          through(function(file, enc, done) {
            manager.setRootFile(file);
            currentFile = file;
            done();
          })
        )
        .on('finish', () => {
          expect(manager.getRootFileContentString()).to.have.string(
            currentFile.contents.toString()
          );
          ended();
        });
    });

    it('Should get content as a buffer object from rootFile', ended => {
      let currentFile = null;

      stream
        .pipe(
          through(function(file, enc, done) {
            currentFile = file;
            manager.setRootFile(file);
            done();
          })
        )
        .on('finish', () => {
          expect(manager.getBufferFromRootFile()).to.eql(currentFile.contents);
          ended();
        });
    });

    it('Should override content inside rootFile', ended => {
      let newContent = 'tested';
      let contentBuffer = new Buffer(newContent);

      stream
        .pipe(
          through(function(file, enc, done) {
            manager.setRootFile(file);
            manager.overrideRootBufferContent(newContent);
            done();
          })
        )
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

  describe('Test override content functions', () => {
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

    it('Should replace new content by hash', ended => {
      const getFileHashStub = sinon.stub(manager, 'getFileHash').returns(hash);

      stream
        .pipe(
          through(function(file, enc, done) {
            manager.setRootFile(file);
            done();
          })
        )
        .on('finish', () => {
          const newContent = '.tested{color: tomato;}';
          const replaced = manager.replaceContentInMainFile(hash, newContent);

          expect(getFileHashStub.calledOnce).to.be.true;
          expect(replaced).to.be.true;
          expect(manager.getRootFileContentString()).to.have.string(newContent);

          ended();
        });
    });

    it('Should NOT replace content when hash not found', ended => {
      stream
        .pipe(
          through(function(file, enc, done) {
            manager.setRootFile(file);
            done();
          })
        )
        .on('finish', () => {
          hash = '';
          manager.replaceContentInMainFile(hash, '');
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
