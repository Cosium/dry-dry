import { Cli } from './cli';
import { DependencyResolver } from './dependency-resolver';
import { DryCommandConfig } from './dry-command-config';
import { DryPackage } from './dry-package';
import { DryStep } from './dry-step';
import { NpmPackage } from './npm-package';

export class DryContext {
    private executionSteps: DryStep[];
    private dryPackage: DryPackage;
    private npmPackage: NpmPackage;

    public constructor(private readonly cli: Cli, private dependencyResolver: DependencyResolver, private dryConfig: DryCommandConfig) {}

    public getExecutionSteps(): DryStep[] {
        return this.executionSteps;
    }

    public setExecutionSteps(executionSteps: DryStep[]): void {
        this.executionSteps = executionSteps;
    }

    public getDryPackage(): DryPackage {
        return this.dryPackage;
    }

    public setDryPackage(dryPackage: DryPackage): void {
        this.dryPackage = dryPackage;
    }

    public getNpmPackage(): NpmPackage {
        return this.npmPackage;
    }

    public setNpmPackage(npmPackage: NpmPackage): void {
        this.npmPackage = npmPackage;
    }

    public getDryCommandConfig(): DryCommandConfig {
        return this.dryConfig;
    }

    public getDependencyResolver(): DependencyResolver {
        return this.dependencyResolver;
    }

    public getCli(): Cli {
        return this.cli;
    }
}
