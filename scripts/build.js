const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const cppDir = path.join(rootDir, 'cpp');
const binDir = path.join(cppDir, 'bin');
const extension = process.platform === 'win32' ? '.exe' : '';

const algorithms = [
  ['algorithm1-greedy.cpp', 'algo1'],
  ['algorithm2-dfs.cpp', 'algo2'],
  ['algorithm3-unionfind.cpp', 'algo3'],
  ['algorithm4-heap.cpp', 'algo4'],
];

fs.mkdirSync(binDir, { recursive: true });

for (const [sourceFile, outputName] of algorithms) {
  const sourcePath = path.join(cppDir, sourceFile);
  const outputPath = path.join(binDir, `${outputName}${extension}`);

  console.log(`Building ${outputName}...`);
  execFileSync(
    'g++',
    ['-std=c++17', '-Wall', '-O2', '-o', outputPath, sourcePath],
    { stdio: 'inherit' }
  );
}

console.log('C++ algorithms built successfully.');
