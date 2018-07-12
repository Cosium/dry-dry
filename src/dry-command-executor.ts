import { Cli } from './cli';
import { CommandProxy } from './command-proxy';
import { DryCommandConfig } from './dry-command-config';
import { Logger } from './logger';
import { NpmPackage } from './npm-package';

/**
 * Responsible for the requested dry specific command interception
 */
export class DryCommandExecutor {
    private static logger: Logger = Logger.getLogger('dry.DryCommandExecutor');

    /**
     * @param {Cli} cli The CLI to use
     * @param {NodeJS.Process} process The main process
     */
    constructor(private readonly cli: Cli, private readonly dryCommandConfig: DryCommandConfig) {}

    /**
     * Execute the dry command received
     * @return {Promise<void>} Resolved promise on success, rejected promise on failure.
     */
    public execute(npmPackage: NpmPackage): Promise<void> {
        DryCommandExecutor.logger.info('Dry command execution started');
        const packageManager: string = this.dryCommandConfig.getPackagerDescriptor().getPackageManager();
        const commandProxy: CommandProxy = new CommandProxy(this.cli, packageManager);
        const commandProxyArgs: string[] = this.dryCommandConfig.getCommandProxyArgs();
        const callProxy: boolean = commandProxyArgs.length !== 0;

        this.runBeforeProxy(npmPackage);

        const promise: Promise<void> = callProxy ? commandProxy.proxy(commandProxyArgs) : Promise.resolve(null);

        return promise.then(() => this.runAfterProxy(npmPackage));
    }

    private runBeforeProxy(npmPackage: NpmPackage): void {
        DryCommandExecutor.logger.info('Running pre execution steps');
        npmPackage.save();
    }

    private runAfterProxy(npmPackage: NpmPackage): void {
        DryCommandExecutor.logger.info('Running post execution steps');
        npmPackage.update();

        if (this.dryCommandConfig.isPackageJsonCopied()) {
            const location: string = this.dryCommandConfig.getPackageJsonCopyTarget();
            npmPackage.saveTo(location);
        }

        if (!this.dryCommandConfig.isPackageJsonKept()) {
            npmPackage.delete();
        }
        DryCommandExecutor.logger.info('Dry command execution finished');
    }
}
