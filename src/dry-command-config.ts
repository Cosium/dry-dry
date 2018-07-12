import { DryPackagerDescriptor } from './dry-packager-descriptor';
import { JsonUtils } from './json-utils';
import { Logger } from './logger';

enum DryOption {
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
    private keepPackageJson: boolean;
    private savePackageJson: boolean;
    private savePackageJsonToTarget: string;

    /**
     * @param {Cli} cli The CLI to use
     */
    constructor(private readonly rawArgs: string[]) {
        this.keepPackageJson = false;
        this.savePackageJson = false;
        this.commandProxyArgs = [];
        this.installParentCommandProxyArgs = [];
        this.loadConfig();
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
     * Indicate if the generated package.json file is deleted when the command is finished
     * By default 'false' but can be changed using the option --dry-keep-package-json
     * @return {boolean} package.json is kept
     */
    public isPackageJsonKept(): boolean {
        return this.keepPackageJson;
    }

    /**
     * Indicate if the generated package.json file is copied to a provided location when the command is finished
     * By default no copy done but can be changed using the option --dry-save-package-json-to <copy_location>
     * @return {boolean} package.json is copied
     */
    public isPackageJsonCopied(): boolean {
        return this.savePackageJson;
    }

    /**
     * if the generated package.json file is copied to a provided location using --dry-save-package-json-to <copy_location>
     * It holds the value of <copy_location>
     * @return {string} package.json copy location
     */
    public getPackageJsonCopyTarget(): string {
        return this.savePackageJsonToTarget;
    }

    /**
     * get the current packager descriptor
     * @return {DryPackagerDescriptor} the packager descriptor
     */
    public getPackagerDescriptor(): DryPackagerDescriptor {
        return this.packagerDescriptor;
    }

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
            switch (currentArg) {
                case DryOption.KEEP_PACKAGE_JSON: {
                    this.keepPackageJson = true;
                    break;
                }
                case DryOption.SAVE_PACKAGE_JSON_TO: {
                    const arg = unprocessedArgs.shift();
                    this.savePackageJson = true;
                    this.savePackageJsonToTarget = arg;
                    break;
                }
                case DryOption.LOG_LEVEL: {
                    const arg = unprocessedArgs.shift();
                    Logger.setLevel(arg);
                    this.packagerDescriptor.mapArguments(
                        currentArg,
                        arg,
                        unprocessedArgs,
                        this.commandProxyArgs,
                        this.installParentCommandProxyArgs,
                    );
                    break;
                }
                case DryOption.SILENT:
                case DryOption.S: {
                    Logger.setLevel('error');
                    this.packagerDescriptor.mapArguments(
                        currentArg,
                        undefined,
                        unprocessedArgs,
                        this.commandProxyArgs,
                        this.installParentCommandProxyArgs,
                    );
                    break;
                }
                case DryOption.QUIET:
                case DryOption.Q: {
                    Logger.setLevel('warn');
                    this.packagerDescriptor.mapArguments(
                        currentArg,
                        undefined,
                        unprocessedArgs,
                        this.commandProxyArgs,
                        this.installParentCommandProxyArgs,
                    );
                    break;
                }
                case DryOption.D: {
                    Logger.setLevel('info');
                    this.packagerDescriptor.mapArguments(
                        currentArg,
                        undefined,
                        unprocessedArgs,
                        this.commandProxyArgs,
                        this.installParentCommandProxyArgs,
                    );
                    break;
                }
                case DryOption.VERBOSE:
                case DryOption.DD: {
                    Logger.setLevel('debug');
                    this.packagerDescriptor.mapArguments(
                        currentArg,
                        undefined,
                        unprocessedArgs,
                        this.commandProxyArgs,
                        this.installParentCommandProxyArgs,
                    );
                    break;
                }
                case DryOption.DDD: {
                    Logger.setLevel('trace');
                    this.packagerDescriptor.mapArguments(
                        currentArg,
                        undefined,
                        unprocessedArgs,
                        this.commandProxyArgs,
                        this.installParentCommandProxyArgs,
                    );
                    break;
                }
                default: {
                    this.packagerDescriptor.mapArguments(
                        currentArg,
                        undefined,
                        unprocessedArgs,
                        this.commandProxyArgs,
                        this.installParentCommandProxyArgs,
                    );
                }
            }
        }
    }
}
