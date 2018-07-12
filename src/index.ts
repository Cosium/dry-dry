#!/usr/bin/env node
import { Cli } from './cli';
import { DependencyResolver } from './dependency-resolver';
import { DryCommandConfig } from './dry-command-config';
import { DryCommandExecutor } from './dry-command-executor';
import { DryPackage } from './dry-package';

const cli = Cli.of(process);
const dryCommandConfig = new DryCommandConfig(process.argv.slice(2));
const dryCommandExecutor = new DryCommandExecutor(cli, dryCommandConfig);
const dependencyResolver = new DependencyResolver(cli, dryCommandConfig);

DryPackage.readFromDisk(dependencyResolver)
    .buildNpmPackage()
    .then((npmPackage) => dryCommandExecutor.execute(npmPackage))
    .then(() => process.exit(), () => process.exit(1));
