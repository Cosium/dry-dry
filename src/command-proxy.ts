import { Cli } from './cli';

/**
 * Responsible for the requested npm command propagation
 */
export class CommandProxy {
    /**
     * @param {Cli} cli The CLI to use
     */
    constructor(private readonly cli: Cli) {}

    /**
     * Propagate the command received by dry to npm
     * @param {string[]} args the command arguments
     * @return {Promise<void>} Resolved promise on success, rejected promise on failure.
     */
    public proxy(args: string[]): Promise<void> {
        return this.cli.execute(`npm ${args.join(' ')}`);
    }
}
