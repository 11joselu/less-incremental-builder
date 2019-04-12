const expect = require('chai').expect;
const loadGraph = require('../../lib/graph/loader');
const { unlinkSync } = require('fs');
const { createLessFile } = require('../test-functions');

describe('Test Graph loader', () => {
  let file;

  beforeEach(() => {
    file = createLessFile();
  });

  it('Should create a graph object', () => {
    const graph = loadGraph(file.path);
    expect(graph).to.be.an('object');
  });

  it("Should have 'index' attribute", () => {
    const graph = loadGraph(file.path);
    expect(graph.index)
      .to.be.an('object')
      .to.have.property(file.path);
  });

  it("Should have 'loadPaths' attribute", () => {
    const graph = loadGraph(file.path);
    expect(graph).to.have.property('loadPaths');
    expect(graph.loadPaths)
      .to.be.an('array')
      .that.includes(process.cwd());
  });

  it('Should add imports inside file object key', () => {
    const graph = loadGraph(file.path);
    const graphFile = graph.index[file.path];
    expect(graphFile)
      .to.be.an('object')
      .to.have.property('imports');
    expect(graphFile.imports)
      .to.be.an('array')
      .that.includes(file.path);
  });

  it('Should add all importedBy inside file object key', () => {
    const graph = loadGraph(file.path);
    const graphFile = graph.index[file.path];
    expect(graphFile)
      .to.be.an('object')
      .to.have.property('importedBy');
    expect(graphFile.importedBy)
      .to.be.an('array')
      .that.includes(file.path);
  });

  afterEach(() => {
    unlinkSync(file.path);
  });
});
