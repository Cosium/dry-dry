import { DryFeature } from './dry-feature';
import { DryPackagerDescriptor } from './dry-packager-descriptor';
import { DryLifecyclePhase, DryStep } from './dry-step';
import { EnableLogging } from './features/enable-logging';
import { EnableLoggingLevel } from './features/enable-logging-level';
import { KeepPackageJson } from './features/keep-package-json';
import { SavePackageJson } from './features/save-package-json';
import { JsonUtils } from './json-utils';
import { BuildDryPackage } from './steps/build-dry-package';
import { BuildNpmPackage } from './steps/build-npm-package';
import { DeleteNpmPackage } from './steps/delete-npm-package';
import { ExecuteProxy } from './steps/execute-proxy';
import { Finish } from './steps/finish';
import { SaveNpmPackage } from './steps/save-npm-package';
import { Start } from './steps/start';
import { UpdateNpmPackage } from './steps/update-npm-package';

export enum DryOption {
    PACKAGER_COMMAND = '--dry-packager',
    KEEP_PACKAGE_JSON = '--dry-keep-package-json',
    SAVE_PACKAGE_JSON_TO = '--dry-save-package-json-to',
    LOG_LEVEL = '--loglevel',
    Q = '-q',
    QUIET = '--quiet',
    D = '-d',
    DD = '-dd',
    DDD = '-ddd',
    S = '-s',
    SILENT = '--silent',
    VERBOSE = '--verbose',
}

/**
 * Dry command configuration object
 */
export class DryCommandConfig {
    private static DEFAULT_PACKAGER: string = 'npm';

    private packagerDescriptor: DryPackagerDescriptor;
    private readonly commandProxyArgs: string[];
    private readonly installParentCommandProxyArgs: string[];
    private readonly steps: DryStep[];
    private readonly availableFeatures: DryFeature[];

    /**
     * @param {Cli} cli The CLI to use
     */
    constructor(private readonly rawArgs: string[]) {
        this.steps = [];
        this.availableFeatures = [];
        this.commandProxyArgs = [];
        this.installParentCommandProxyArgs = [];
        this.initializeDefaultSteps();
        this.initializeAvailableFeatures();
        this.loadConfig();
    }

    /**
     * Compute and order the list of dry steps and activated features
     * @return {DryStep[]} the ordered list of steps and features
     */
    public getOrderedStepsAndFeatures(): DryStep[] {
        const executionSteps: DryStep[] = this.steps.concat(this.availableFeatures.filter((f) => f.isActive()));

        return executionSteps.sort((left, right) => {
            if (left.getLifecyclePhase() === right.getLifecyclePhase()) {
                return left.getOrderInPhase() - right.getOrderInPhase();
            } else {
                return left.getLifecyclePhase() - right.getLifecyclePhase();
            }
        });
    }

    /**
     * Contains the parameters not already handled by dry
     * or those handled by dry but still sent to the package manager proxy command
     * @return {string[]} the packager proxy arguments
     */
    public getCommandProxyArgs(): string[] {
        return this.commandProxyArgs;
    }

    /**
     * Contains the parameters not already handled by dry
     * or those handled by dry but still sent to the package manager proxy command
     * and allowed in the dependency resolver install parent command
     * @return {string[]} the install parant command proxy arguments
     */
    public getInstallParentCommandProxyArgs(): string[] {
        return this.installParentCommandProxyArgs;
    }

    /**
     * get the current packager descriptor
     * @return {DryPackagerDescriptor} the packager descriptor
     */
    public getPackagerDescriptor(): DryPackagerDescriptor {
        return this.packagerDescriptor;
    }

    /**
     * Initialize the list of available features and define their position in the dry lifecycle
     */
    private initializeAvailableFeatures(): void {
        this.availableFeatures.push(new EnableLogging(DryLifecyclePhase.START));
        this.availableFeatures.push(new EnableLoggingLevel(DryLifecyclePhase.START));
        this.availableFeatures.push(new KeepPackageJson(DryLifecyclePhase.PRE_CLEAN));
        this.availableFeatures.push(new SavePackageJson(DryLifecyclePhase.PRE_CLEAN));
    }

    /**
     * Initialize the list of default steps and define their position in the dry lifecycle
     */
    private initializeDefaultSteps(): void {
        this.steps.push(new Start(DryLifecyclePhase.START));
        this.steps.push(new BuildDryPackage(DryLifecyclePhase.BUILD_DRY_PACKAGE));
        this.steps.push(new BuildNpmPackage(DryLifecyclePhase.BUILD_NPM_PACKAGE));
        this.steps.push(new SaveNpmPackage(DryLifecyclePhase.PRE_EXECUTE_PROXY));
        this.steps.push(new ExecuteProxy(DryLifecyclePhase.EXECUTE_PROXY));
        this.steps.push(new UpdateNpmPackage(DryLifecyclePhase.POST_EXECUTE_PROXY));
        this.steps.push(new DeleteNpmPackage(DryLifecyclePhase.CLEAN));
        this.steps.push(new Finish(DryLifecyclePhase.FINISH));
    }

    /**
     * Lookup into provided arguments to find the possible custom package manager to use
     * if not found then loads the default one
     */
    private loadPackagerDescriptor(unprocessedArgs: string[]): void {
        let packagerPath: string;
        // first find custom packager if any
        const packagerIndex: number = unprocessedArgs.findIndex((arg) => arg.toLowerCase() === DryOption.PACKAGER_COMMAND);
        if (packagerIndex !== -1) {
            // custom packager found
            const packagerArg = unprocessedArgs[packagerIndex + 1];
            packagerPath = DryPackagerDescriptor.resolveDescriptor(process.cwd(), packagerArg);
            unprocessedArgs.splice(packagerIndex, 2);
        } else {
            packagerPath = DryPackagerDescriptor.resolveDescriptor(process.cwd(), DryCommandConfig.DEFAULT_PACKAGER);
        }

        this.packagerDescriptor = JsonUtils.loadObject(packagerPath, DryPackagerDescriptor);
    }

    /**
     * Load the dry command configuration from the provided cli arguments
     */
    private loadConfig(): void {
        const unprocessedArgs: string[] = this.rawArgs;
        this.loadPackagerDescriptor(unprocessedArgs);

        while (unprocessedArgs.length > 0) {
            const currentArg: string = unprocessedArgs.shift().toLowerCase();
            const feature: DryFeature = this.availableFeatures.find((f) => f.isTriggered(currentArg));
            let arg: string;

            if (feature !== undefined) {
                arg = feature.consumeArgumentValue(currentArg, unprocessedArgs);
            }

            if (feature === undefined || feature.isMappingToProxyAllowed()) {
                this.packagerDescriptor.mapArguments(
                    currentArg,
                    arg,
                    unprocessedArgs,
                    this.commandProxyArgs,
                    this.installParentCommandProxyArgs,
                );
            }
        }
    }
}
