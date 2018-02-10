import * as childProcess from 'child_process';
import Process = NodeJS.Process;

/**
 * The command line interface.
 * Allows to execute command lines on the system.
 */
export class Cli {
    /**
     * @param {NodeJS.Process} process The main process
     * @return {Cli} A new command line interface
     */
    public static of(process: Process): Cli {
        return new Cli(process);
    }

    /**
     * @param {NodeJS.Process} process The main process
     */
    private constructor(private readonly process: Process) {}

    /**
     * Executes the provided command line on the system
     * @param {string} commandLine The command line to execute
     * @return {Promise<void>} A resolved promise in case of success, rejected in case of failure
     */
    public execute(commandLine: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const child = childProcess.exec(commandLine, (error: Error | null) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
            child.stderr.pipe(this.process.stderr);
            child.stdout.pipe(this.process.stdout);
            this.process.stdin.pipe(child.stdin);
        });
    }
}
