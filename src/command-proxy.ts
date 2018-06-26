import { Cli } from './cli';

/**
 * Responsible for the requested npm command propagation
 */
export class CommandProxy {
    /**
     * @param {Cli} cli The CLI to use
     */
    constructor(private readonly cli: Cli, private readonly command: string) {}

    /**
     * Propagate the command received by dry to npm
     * @return {Promise<void>} Resolved promise on success, rejected promise on failure.
     */
    public proxy(rawArgs: string[]): Promise<void> {
        return this.cli.execute(`${this.command} ${rawArgs.join(' ')}`);
    }
}
