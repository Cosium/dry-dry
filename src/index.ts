#!/usr/bin/env node
import { Cli } from "./cli";
import { DependencyResolver } from "./dependency-resolver";
import { DryPackage } from "./dry-package";
import { NpmCommandProxy } from "./npm-command-proxy";

const cli = Cli.of(process);
const npmCommandProxy = new NpmCommandProxy(cli, process);
const dependencyResolver = new DependencyResolver(cli);

DryPackage.readFromDisk(dependencyResolver)
    .buildNpmPackage()
    .then((npmPackage) => {
        npmPackage.beforeNpmRun();
        return npmCommandProxy.proxy().then(() => npmPackage.afterNpmRun());
    })
    .then(() => process.exit(), () => process.exit(1));
