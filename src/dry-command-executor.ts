import Process = NodeJS.Process;
import { Cli } from './cli';
import { DryCommandConfig } from './dry-command-config';
import { NpmCommandProxy } from './npm-command-proxy';
import { NpmPackage } from './npm-package';

/**
 * Responsible for the requested dry specific command interception
 */
export class DryCommandExecutor {
    private readonly rawArgs: string[];
    private readonly dryCommandConfig: DryCommandConfig;

    /**
     * @param {Cli} cli The CLI to use
     * @param {NodeJS.Process} process The main process
     */
    constructor(private readonly cli: Cli, process: Process) {
        this.rawArgs = process.argv.slice(2);
        this.dryCommandConfig = new DryCommandConfig(this.rawArgs);
    }

    /**
     * Execute the dry command received
     * @return {Promise<void>} Resolved promise on success, rejected promise on failure.
     */
    public execute(npmPackage: NpmPackage): Promise<void> {
        const commandProxy: NpmCommandProxy = new NpmCommandProxy(this.cli);
        const commandProxyArgs: string[] = this.dryCommandConfig.getCommandProxyArgs();
        const callProxy: boolean = commandProxyArgs.length !== 0;

        this.runBeforeProxy(npmPackage);

        const promise: Promise<void> = callProxy ? commandProxy.proxy(commandProxyArgs) : Promise.resolve(null);

        return promise.then(() => this.runAfterProxy(npmPackage));
    }

    private runBeforeProxy(npmPackage: NpmPackage): void {
        npmPackage.save();
    }

    private runAfterProxy(npmPackage: NpmPackage): void {
        npmPackage.update();

        if (this.dryCommandConfig.isPackageJsonCopied()) {
            const location: string = this.dryCommandConfig.getPackageJsonCopyTarget();
            npmPackage.saveTo(location);
        }

        if (!this.dryCommandConfig.isPackageJsonKept()) {
            npmPackage.delete();
        }
    }
}
