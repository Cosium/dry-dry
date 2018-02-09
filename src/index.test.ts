import * as fs from 'fs';
import * as fsExtra from 'fs-extra';
import * as childProcess from 'child_process';
import * as path from 'path';
import {expect} from 'chai';
import {DryPackageContent} from "./dry-package-content";
import deepEqual = require('deep-equal');

describe('index', () => {

    const dryIndexJs = path.resolve('dist/index.js');
    const testDir = path.resolve('dist-test');

    const mkdirIfNotExist = (dir: string): void => {
        if (fs.existsSync(dir)) {
            return;
        }
        fsExtra.mkdirsSync(dir);
    };
    const readJson = (file: string): any => JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
    const writeJson = (file: string, obj: any): any => fs.writeFileSync(path.resolve(file), JSON.stringify(obj, null, 2) + '\n');

    beforeEach(() => {
        fsExtra.removeSync(testDir);
        mkdirIfNotExist(testDir);
    });

    describe('dry commands match npm commands', () => {
        const executeAndAssertSame = (commands: string[], packageJson: boolean, lock: boolean) => {
            const withNpmDir = path.resolve(`${testDir}/with-npm/foo`);
            mkdirIfNotExist(withNpmDir);
            const withDryDir = path.resolve(`${testDir}/with-dry/foo`);
            mkdirIfNotExist(withDryDir);

            commands.forEach(command => childProcess.execSync(`npm ${command}`, {cwd: withNpmDir}));
            commands.forEach(command => childProcess.execSync(`node ${dryIndexJs} ${command}`, {cwd: withDryDir}));

            if (packageJson) {
                expect(deepEqual(readJson(`${withDryDir}/package-dry.json`), readJson(`${withNpmDir}/package.json`))).to.be.true;
            }
            if (lock) {
                expect(deepEqual(readJson(`${withDryDir}/package-lock.json`), readJson(`${withNpmDir}/package-lock.json`))).to.be.true;
            }
        };

        it('init -f', () => executeAndAssertSame(['init -f'], true, false)).timeout(30000);
        it('init -f && install', () => executeAndAssertSame(['init -f', 'install'], true, true)).timeout(30000);
        it('init -f && install && pack', () => executeAndAssertSame(['init -f', 'install', 'pack'], true, true)).timeout(30000);
    });

    describe('dry inheritance', () => {

        it('inherits foo script when foo is defined in dry package parent', () => {
            // Build parent
            const parentProject = path.resolve(`${testDir}/parent`);
            mkdirIfNotExist(parentProject);
            childProcess.execSync(`node ${dryIndexJs} init -f`, {cwd: parentProject});
            const parentDryPackage = readJson(path.resolve(`${parentProject}/package-dry.json`));
            parentDryPackage.scripts.foo = 'npm help';
            writeJson(`${parentProject}/package-dry.json`, parentDryPackage);
            childProcess.execSync(`node ${dryIndexJs} pack`, {cwd: parentProject});

            // Build child
            const childProject = path.resolve(`${testDir}/child`);
            mkdirIfNotExist(childProject);
            childProcess.execSync(`node ${dryIndexJs} init -f`, {cwd: childProject});
            const childDryPackage: DryPackageContent = readJson(path.resolve(`${childProject}/package-dry.json`));
            childDryPackage.dry = {
                extends: 'parent/package-dry.json',
                dependencies: {
                    parent: 'file:../parent/parent-1.0.0.tgz'
                }
            };
            writeJson(`${childProject}/package-dry.json`, childDryPackage);

            // Run the script
            childProcess.execSync(`node ${dryIndexJs} run foo`, {cwd: childProject});

            expect(fs.existsSync(`${childProject}/package.json`)).to.be.false;
        }).timeout(30000);

    });
});