import * as childProcess from 'child_process';
import Process = NodeJS.Process;

/**
 * The command line interface.
 * Allows to execute command lines on the system.
 */
export class Cli {
    /**
     * @param {NodeJS.Process} process The main process
     */
    private constructor(private readonly process: Process) {}

    /**
     * @param {NodeJS.Process} process The main process
     * @return {Cli} A new command line interface
     */
    public static of(process: Process): Cli {
        return new Cli(process);
    }

    /**
     * Executes the provided command line on the system
     * @param {string} commandLine The command line to execute
     * @return {Promise<void>} A resolved promise in case of success, rejected in case of failure
     */
    public execute(commandLine: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const child = childProcess.spawn(commandLine, [], { env: this.process.env, shell: true, stdio: 'inherit' });
            child.on('error', (err) => reject(err));
            child.on('close', (code) => (code === 0 ? resolve() : reject(code)));
        });
    }
}
