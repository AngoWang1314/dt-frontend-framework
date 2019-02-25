#!/usr/bin/env node

const inquirer = require('inquirer');
const fs = require('fs')
const path = require('path')
const cmd = require('node-cmd');
const Spinner = require('cli-spinner').Spinner;

const questionFrameworkName = [
	{
		type: 'rawlist',
		name: 'name',
		message: 'What kinds of framework do you want to install?',
		default: 4,
		choices: [
			'desktop',
			'browser',
			'android',
			'ios',
			'wap',
			'MiniProgram'
		]
	}
];

const questionProjectName = [
	{
		type: 'input',
		name: 'name',
		message: 'Please enter the project name:'
	}
];

const coverProjectName = [
	{
		type: 'confirm',
		name: 'name',
		message: 'Do you want to cover the existed project?'
	}
];

function delDir (path) {
    let files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach((file, index) => {
            let curPath = path + '/' + file;
            if (fs.statSync(curPath).isDirectory()) {
                delDir(curPath);        // 递归删除
            } else {
                fs.unlinkSync(curPath); // 删除文件
            }
        });
        fs.rmdirSync(path);
    }
}

var spinner = new Spinner('processing... %s');
spinner.setSpinnerString('|/-\\');
function pullDemoProject (framework_name, project_name) {
	spinner.start();
	const urls = {
		'desktop': 'git@github.com:dt-frontend/desktop.git',
		'browser': 'git@github.com:dt-frontend/browser.git',
		'android': 'git@github.com:dt-frontend/android.git',
		'ios': 'git@github.com:dt-frontend/ios.git',
		'wap': 'git@github.com:dt-frontend/wap.git',
		'MiniProgram': 'git@github.com:dt-frontend/MiniProgram.git'
	};
	cmd.get('git clone ' + urls[framework_name] + ' ' + framework_name + '/' + project_name, function (err, data, stderr) {
		spinner.stop();
		if (err) {
			console.log('\nproduce project failed.');
		}else{
			console.log('\nproduce project finish.');
		}
	});
}

function generateProject (framework, project) {
	if (!fs.existsSync(path.join(__dirname, framework.name))) {
		fs.mkdirSync(framework.name);
	}
	if (!fs.existsSync(path.join(__dirname, framework.name + '/' + project.name))) {
		fs.mkdirSync(framework.name + '/' + project.name);
		pullDemoProject(framework.name, project.name);
	} else {
		inquirer.prompt(coverProjectName).then(function (answer) {
			if (answer) {
				delDir(framework.name + '/' + project.name + '/');
				pullDemoProject(framework.name, project.name);
			}
		});
	}
}

inquirer.prompt(questionFrameworkName).then(function (framework) {
	inquirer.prompt(questionProjectName).then(function (project) {
		generateProject(framework, project);
	});
});
