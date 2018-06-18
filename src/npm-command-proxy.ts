import { Cli } from './cli';
import Process = NodeJS.Process;

/**
 * Responsible for the requested npm command propagation
 */
export class NpmCommandProxy {
    private readonly rawArgs: string[];

    /**
     * @param {Cli} cli The CLI to use
     * @param {string[]} args the arguments
     */
    constructor(private readonly cli: Cli, args: string[]) {
        this.rawArgs = args;
    }

    /**
     * Propagate the command received by dry to npm
     * @return {Promise<void>} Resolved promise on success, rejected promise on failure.
     */
    public proxy(): Promise<void> {
        return this.cli.execute(`npm ${this.rawArgs.join(' ')}`);
    }
}
