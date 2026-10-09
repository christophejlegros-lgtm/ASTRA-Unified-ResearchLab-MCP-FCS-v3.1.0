import fs from 'node:fs';
const read = p => fs.readFileSync(p,'utf8');
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const versions = {
  package: pkg.version, lock: lock.version, lockRoot: lock.packages[''].version,
  source: read('src/version.ts').match(/ASTRA_VERSION\s*=\s*'([^']+)'/)[1],
  citation: read('CITATION.cff').match(/^version:\s*(\S+)/m)[1],
  zenodo: JSON.parse(read('.zenodo.json')).version,
};
if (new Set(Object.values(versions)).size !== 1) {
  console.error(JSON.stringify(versions)); process.exit(1);
}
console.log('Consistent local candidate version: '+pkg.version);
