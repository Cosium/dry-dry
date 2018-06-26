import { Cli } from './cli';
import { CommandProxy } from './command-proxy';

enum DryOption {
    PackagerCommand = '--dry-packager',
    KeepPackageJson = '--dry-keep-package-json',
    SavePackageJsonTo = '--dry-save-package-json-to',
    LogLevel = '--loglevel',
    LogD = '-d',
    LogDD = '-dd',
    LogDDD = '-ddd',
    Verbose = '--verbose',
}

/**
 * Dry command configuration object
 */
export class DryCommandConfig {
    private static readonly DEFAULT_PACKAGER_COMMAND = 'npm';
    private commandProxy: CommandProxy;
    private readonly commandProxyArgs: string[];
    private keepPackageJson: boolean;
    private savePackageJson: boolean;
    private savePackageJsonToTarget: string;
    private debugEnabled: boolean;

    /**
     * @param {Cli} cli The CLI to use
     */
    constructor(private readonly cli: Cli, private readonly rawArgs: string[]) {
        this.commandProxy = new CommandProxy(cli, DryCommandConfig.DEFAULT_PACKAGER_COMMAND);
        this.keepPackageJson = false;
        this.savePackageJson = false;
        this.debugEnabled = false;
        this.commandProxyArgs = [];
        this.loadConfig();
    }

    public getCommandProxy(): CommandProxy {
        return this.commandProxy;
    }

    public getCommandProxyArgs(): string[] {
        return this.commandProxyArgs;
    }

    public isPackageJsonKept(): boolean {
        return this.keepPackageJson;
    }

    public isPackageJsonCopied(): boolean {
        return this.savePackageJson;
    }

    public getPackageJsonCopyTarget(): string {
        return this.savePackageJsonToTarget;
    }

    public isDebugEnabled(): boolean {
        return this.debugEnabled;
    }

    /**
     * Load the dry command configuration from the provided cli arguments
     */
    private loadConfig(): void {
        const unprocessedArgs: string[] = this.rawArgs;
        while (unprocessedArgs.length > 0) {
            const currentArg: string = unprocessedArgs.shift();
            switch (currentArg) {
                case DryOption.PackagerCommand: {
                    const arg = unprocessedArgs.shift();
                    this.commandProxy = new CommandProxy(this.cli, arg);
                    break;
                }
                case DryOption.KeepPackageJson: {
                    this.keepPackageJson = true;
                    break;
                }
                case DryOption.SavePackageJsonTo: {
                    const arg = unprocessedArgs.shift();
                    this.savePackageJson = true;
                    this.savePackageJsonToTarget = arg;
                    break;
                }
                case DryOption.LogLevel: {
                    unprocessedArgs.shift();
                    this.debugEnabled = true;
                    break;
                }
                case DryOption.Verbose:
                case DryOption.LogD:
                case DryOption.LogDD:
                case DryOption.LogDDD:
                    this.debugEnabled = true;
                    break;
                default: {
                    this.commandProxyArgs.push(currentArg);
                }
            }
        }
    }
}
