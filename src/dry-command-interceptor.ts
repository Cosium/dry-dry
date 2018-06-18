import * as fs from 'fs';
import * as path from 'path';
import Process = NodeJS.Process;
import { Cli } from './cli';
import { NpmCommandProxy } from './npm-command-proxy';

/**
 * Responsible for the requested dry specific command interception
 */
export class DryCommandInterceptor {
    private readonly rawArgs: string[];
    private npmCommandProxy:NpmCommandProxy;
    private drySpecificArgs:Array<string> = ["saveTo"];
    /**
     * @param {Cli} cli The CLI to use
     * @param {NodeJS.Process} process The main process
     */
    constructor(private readonly cli: Cli, process: Process) {
        this.rawArgs = process.argv.slice(2);
        this.npmCommandProxy = new NpmCommandProxy(cli, this.rawArgs);
    }

    /**
     * Propagate the command received by dry to npm
     * @return {Promise<void>} Resolved promise on success, rejected promise on failure.
     */
    public proxy(): Promise<void> {

        let intercept:boolean = this.rawArgs.length > 0 && this.drySpecificArgs.indexOf(this.rawArgs[0]) > -1;

        if (intercept){
            let arg1:string = this.rawArgs[0];
            let arg2:string = this.rawArgs.length > 1 ? this.rawArgs[1] : undefined;

            switch(arg1){
                case this.drySpecificArgs[0]:{//saveTo
                    return this.saveTo(arg2);
                }
            }
            return undefined;
        } else {
            return this.cli.execute(`npm ${this.rawArgs.join(' ')}`);
        }
    }

    private saveTo(target:string):Promise<void> {
        const packageJson: any = JSON.parse(fs.readFileSync(path.resolve('./package.json'), 'utf8'));
        fs.writeFileSync(path.resolve(target), JSON.stringify(packageJson, null, 2) + '\n')
        return Promise.resolve();
    }
}
