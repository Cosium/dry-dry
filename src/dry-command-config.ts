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
    private readonly commandProxyArgs: string[];
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
     * Load the dry command configuration from the provided cli arguments
     */
    private loadConfig(): void {
        const unprocessedArgs: string[] = this.rawArgs;
        while (unprocessedArgs.length > 0) {
            const currentArg: string = unprocessedArgs.shift();
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
                    let arg = unprocessedArgs.shift();
                    Logger.setLevel(arg);
                    this.commandProxyArgs.push(currentArg);
                    if (arg.toUpperCase() === 'TRACE') {
                        arg = 'silly';
                    }
                    if (arg.toUpperCase() === 'DEBUG') {
                        arg = 'verbose';
                    }
                    if (arg.toUpperCase() === 'ERROR') {
                        arg = 'silent';
                    }
                    this.commandProxyArgs.push(arg);
                    break;
                }
                case DryOption.SILENT:
                case DryOption.S: {
                    Logger.setLevel('error');
                    this.commandProxyArgs.push(currentArg);
                    break;
                }
                case DryOption.QUIET:
                case DryOption.Q: {
                    Logger.setLevel('warn');
                    this.commandProxyArgs.push(currentArg);
                    break;
                }
                case DryOption.D: {
                    Logger.setLevel('info');
                    this.commandProxyArgs.push(currentArg);
                    break;
                }
                case DryOption.VERBOSE:
                case DryOption.DD: {
                    Logger.setLevel('debug');
                    this.commandProxyArgs.push(currentArg);
                    break;
                }
                case DryOption.DDD: {
                    Logger.setLevel('trace');
                    this.commandProxyArgs.push(currentArg);
                    break;
                }
                default: {
                    this.commandProxyArgs.push(currentArg);
                }
            }
        }
    }
}
