<div align="center">
  <img height="100"
    src="https://cdn.worldvectorlogo.com/logos/less.svg">
  <h1>Less Incremental builder</h1>
  <p>Watch, loads a Less file and compiles it to CSS.</p>
</div>

[![Build Status](https://travis-ci.com/11joselu/less-incremental-builder.svg?branch=master)](https://travis-ci.com/11joselu/less-incremental-builder)
[![Coverage Status](https://coveralls.io/repos/github/11joselu/less-incremental-builder/badge.svg?branch=master)](https://coveralls.io/github/11joselu/less-incremental-builder?branch=master)
[![npm version](https://img.shields.io/npm/v/less-incremental-builder.svg)](https://www.npmjs.com/package/less-incremental-builder)

<h2>Install</h2>

```bash
npm install less-incremental-build --save-dev
```

<h2>Usage</h2>

```bash
npm less-incremental-build --src <main_file>.less --output <output>.css
```

## API

#### src

Type: `string`

The main file to find all imports to watch (include himself).

#### output

Type: `string`

Output file to compile less styles. Should be a css file (If not exists, it will be created)

### config

Type: `string`

Path of your custom config file. Do not pass `src` or `output` as argument, should be added inside your custom config file.

<h2>Config File</h2>

See [watcher.config.js](/examples/watcher.config.js)

```bash
npm less-incremental-build --config watcher.config.js
```

<h2>Maintainers</h2>

<table>
  <tr>
    <td>
      <a href="https://github.com/11joselu"><img width="150" height="150" src="https://avatars0.githubusercontent.com/u/8685132?s=460&v=4"></a><br>
      <a href="https://github.com/11joselu">Jose Cabrera</a>
    </td>
  <tr>
</table>

<h2>License</h2>

[MIT](LICENSE.md)
