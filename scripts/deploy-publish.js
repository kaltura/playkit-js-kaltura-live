#!/usr/bin/env node

const fs = require('fs-extra');
const chalk = require('chalk');
const path = require('path');
const {spawnSync} = require('child_process');
const os = require("os");
var inquirer = require('inquirer');

const extraArgs = process.argv.splice(2);

const rootFolder = path.resolve(__dirname, '../');
const packageJsonPath = path.resolve(rootFolder, 'package.json');

function runSpawn(command, args, extra = {}) {
  const stdio = typeof extra.stdio === 'string' ? [extra.stdio,extra.stdio, 'pipe'] :
    Array.isArray(extra.stdio) && extra.stdio.length === 3 ? [extra.stdio[0], extra.stdio[1], 'pipe'] : 'inherit' // 'pipe'
  const result = spawnSync(command, args, { ...extra, stdio});

  if (result.status === null || result.status !== 0) {
    throw new Error(result.stderr || 'general error');
  }

  return result;
}

function showSummary() {
  const version = getPluginVersion();

  console.log(chalk`
    {green Successfully published plugin to npm}
     
    Version :${version}
  `);
}


async function promptWelcome() {
  const version = getPluginVersion();
  const isNext = version.indexOf('next') !== -1;

  console.log(chalk`{bgCyan {bold Welcome!}}
This script will publish version {bold ${version}} to npm.
`);
  const answers = await inquirer.prompt(
    [{
      name: 'ready',
      type: 'confirm',
      message: 'Are you ready to begin?'
    },
      {
        name: 'confirmVersion',
        type: 'confirm',
        message: `Are you trying to publish version ${version}?`
      },
      {
        name: 'tag',
        type: 'rawlist',
        choices: ['Latest', 'Next'],
        message: `What is the type of version you want to publish?`,
        when: answers => answers.confirmVersion
      }]
  );

  if (!answers.ready) {
    console.log('See you next time....');
    return false;
  }

  if (!answers.confirmVersion) {
    console.log(chalk.red(`Cannot continue with the publish. Current version is set to ${version} (Did you remember to prepare the requested version?)`));
    return false;
  }

  if (answers.tag === 'Latest' && isNext) {
    console.log(chalk.red(`Cannot continue with the publish. Current version is tagged as 'next'.`));
    return false;
  }

  if (answers.tag === 'Next' && !isNext) {
    console.log(chalk.red(`Cannot continue with the publish. Current version is tagged as 'latest'.`));
    return false;
  }

  return true;
}

function getPluginVersion() {
  const playerPackageJson = fs.readJsonSync(packageJsonPath);
  return playerPackageJson['version'];
}

(async function() {
  try {

    if (!await promptWelcome()) {
      return;
    }

    console.log(chalk.blue(`delete dist folder and node_modules`));
    runSpawn('npm', ['run','reset'], { cwd: rootFolder});
    console.log(chalk.blue(`install dependencies`));
    runSpawn('npm', ['install'], { cwd: rootFolder});
    console.log(chalk.blue(`build code`));
    runSpawn('npm', ['run', 'build'], { cwd: rootFolder});
    console.log(chalk.blue(`publish to npm`));
    runSpawn('npm', ['publish', '--access', 'public', ...extraArgs], { cwd: rootFolder});

    showSummary();
  } catch (err) {
    console.error(err);
  }
})();


