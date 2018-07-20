import { Cli } from './cli';
import { DependencyResolver } from './dependency-resolver';
import { DryCommandConfig } from './dry-command-config';
import { DryPackage } from './dry-package';
import { DryStep } from './dry-step';
import { NpmPackage } from './npm-package';

/**
 * Hold the data needed by the execution
 * DryPackage and NpmPackage will be populated during the dry lifecycle
 */
export class DryContext {
    private executionSteps: DryStep[];
    private dryPackage: DryPackage;
    private npmPackage: NpmPackage;

    /**
     * Construct a new dry context
     * @param {Cli} cli the subprocess wrapper
     * @param {DependencyResolver} dependencyResolver the parent resolver
     * @param {DryCommandConfig} dryConfig the dry configuration created from arguments
     */
    public constructor(private readonly cli: Cli, private dependencyResolver: DependencyResolver, private dryConfig: DryCommandConfig) {}

    /**
     * Dry execution steps and features
     * @return {DryStep[]} the list of steps and features to execute
     */
    public getExecutionSteps(): DryStep[] {
        return this.executionSteps;
    }

    /**
     * Set the Dry execution steps and features
     * @param {DryStep[]} executionSteps the list of steps and features to execute
     */
    public setExecutionSteps(executionSteps: DryStep[]): void {
        this.executionSteps = executionSteps;
    }

    /**
     * Get the dry package. Undefined until the end of DryLifecyclePhase.BUILD_DRY_PACKAGE
     * @return {DryPackage} the builded dry package
     */
    public getDryPackage(): DryPackage {
        return this.dryPackage;
    }

    /**
     * Set the dry package at the end of DryLifecyclePhase.BUILD_DRY_PACKAGE
     * @param {DryPackage} dryPackage the builded dry package
     */
    public setDryPackage(dryPackage: DryPackage): void {
        this.dryPackage = dryPackage;
    }

    /**
     * Get the npm package. Undefined until the end of DryLifecyclePhase.BUILD_NPM_PACKAGE
     * @return {NpmPackage} the builded npm package
     */
    public getNpmPackage(): NpmPackage {
        return this.npmPackage;
    }

    /**
     * Set the npm package at the end of DryLifecyclePhase.BUILD_NPM_PACKAGE
     * @param {NpmPackage} npmPackage the builded npm package
     */
    public setNpmPackage(npmPackage: NpmPackage): void {
        this.npmPackage = npmPackage;
    }

    /**
     * Get the builded dry configuration
     * @return {DryCommandConfig} the builded configuration
     */
    public getDryCommandConfig(): DryCommandConfig {
        return this.dryConfig;
    }

    /**
     * Get the parent dependency resolver
     * @return {DependencyResolver} the dependency resolver
     */
    public getDependencyResolver(): DependencyResolver {
        return this.dependencyResolver;
    }

    /**
     * Get the sub process execution wrapper
     * @return {Cli} the sub process execution wrapper
     */
    public getCli(): Cli {
        return this.cli;
    }
}
