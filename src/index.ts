#!/usr/bin/env node
import { Cli } from './cli';
import { DependencyResolver } from './dependency-resolver';
import { DryCommandExecutor } from './dry-command-executor';
import { DryPackage } from './dry-package';

const cli = Cli.of(process);
const dryCommandExecutor = new DryCommandExecutor(cli, process);
const dependencyResolver = new DependencyResolver(cli);

DryPackage.readFromDisk(dependencyResolver)
    .buildNpmPackage()
    .then((npmPackage) => dryCommandExecutor.execute(npmPackage))
    .then(() => process.exit(), () => process.exit(1));
