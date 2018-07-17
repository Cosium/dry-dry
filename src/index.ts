#!/usr/bin/env node
import { Cli } from './cli';
import { DependencyResolver } from './dependency-resolver';
import { DryCommandConfig } from './dry-command-config';
import { DryCommandExecutor } from './dry-command-executor';
import { DryContext } from './dry-context';

const cli = Cli.of(process);
const dryCommandConfig = new DryCommandConfig(process.argv.slice(2));
const dependencyResolver = new DependencyResolver(cli, dryCommandConfig);
const dryContext = new DryContext(cli, dependencyResolver, dryCommandConfig);

new DryCommandExecutor(dryContext).execute().then(() => process.exit(), () => process.exit(1));
