import { Cli } from './cli';
import Process = NodeJS.Process;

/**
 * Responsible for the requested npm command propagation
 */
export class NpmCommandProxy {
    private readonly rawArgs: string[];

    /**
     * @param {Cli} cli The CLI to use
     * @param {NodeJS.Process} process The main process
     */
    constructor(private readonly cli: Cli, process: Process) {
        this.rawArgs = process.argv.slice(2);
    }

    /**
     * Propagate the command received by dry to npm
     * @return {Promise<void>} Resolved promise on success, rejected promise on failure.
     */
    public proxy(): Promise<void> {
        return this.cli.execute(`npm ${this.rawArgs.join(' ')}`);
    }
}
