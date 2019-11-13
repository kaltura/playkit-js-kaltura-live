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
const binPath = path.resolve(rootFolder, 'node_modules', '.bin');



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
  const tagName = `v${version}`;

  const isNext = version.indexOf('next') !== -1;

  console.log(chalk`
    {green Successfully created new plugin version}
     
    Version :${version}
  
    Before committing please test version.  
      
    To abort changes run:
    {bold git reset --hard}
    
    To commit changes to github run:
    {bold git commit -am "chore: publish version ${version}"}
    {bold git tag -a ${tagName} -m "${tagName}"}
    {bold git push --follow-tags}  
    
    Then, publish to npm:
    {bold npm run ${isNext ? 'deploy:next:publish-to-npm' : 'deploy:publish-to-npm'} -- --skip-rebuild}
  `);
}


async function promptWelcome() {
  console.log(chalk`{bgCyan {bold Welcome!}}
This script will prepare the next plugin version.
`);
  const answers = await inquirer.prompt(
    [{
      name: 'ready',
      type: 'confirm',
      message: 'Are you ready to begin?'
    },
      {
        name: 'contrib',
        type: 'confirm',
        message: 'Did you work with local version of contrib libraries?'
      },
      {
        name: 'contribLatest',
        type: 'confirm',
        message: 'Did you or someone else published those changes to npm?',
        when: answers => answers.contrib,
        default: false
      }]
  );

  if (!answers.ready) {
    console.log('See you next time....');
    return false;
  }

  if (answers.contrib) {
    if (!answers.contribLatest) {
      console.log(chalk.red('Cannot continue with the deployment. Please publish contrib first and try again'));
      return false;
    }

    console.log(chalk.blue(`update contrib dependencies to latest`));
    runSpawn('npm', ['run','contrib:latest'], { cwd: rootFolder});

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
    console.log(chalk.blue(`build code and run open analyzer`));
    runSpawn('npm', ['run', 'analyze'], { cwd: rootFolder});
    console.log(chalk.blue(`run standard version`));
    runSpawn(path.resolve(binPath, 'standard-version'), extraArgs, {cwd: rootFolder});
    console.log(chalk.blue(`git stage all changes`));
    runSpawn('git', ['add','*'], {cwd: rootFolder});

    showSummary();
  } catch (err) {
    console.error(err);
  }
})();


