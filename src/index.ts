#!/usr/bin/env node
import { Cli } from './cli';
import { DependencyResolver } from './dependency-resolver';
import { DryCommandConfig } from './dry-command-config';
import { DryCommandExecutor } from './dry-command-executor';
import { DryContext } from './dry-context';
import { Logger } from './logger';

const cli = Cli.of(process);
const dryCommandConfig = new DryCommandConfig(process.argv.slice(2));
const dependencyResolver = new DependencyResolver(cli, dryCommandConfig);
const dryContext = new DryContext(cli, dependencyResolver, dryCommandConfig);

const logger: Logger = Logger.getLogger('dry.DryCommandExecutor');

new DryCommandExecutor(dryContext).execute().then(
    () => {
        process.exit();
    },
    (err) => {
        logger.error(err);
        process.exit(1);
    },
);
