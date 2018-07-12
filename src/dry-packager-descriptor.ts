import * as fs from 'fs';
import { JsonObject, JsonProperty } from 'json2typescript';
import * as path from 'path';
import { ArgumentMapping } from './argument-mapping';

/**
 * Hold the description of a nodejs packager and how it integrates with dry
 */
@JsonObject
export class DryPackagerDescriptor {
    private static PACKAGER_TEMPLATES_PATH: string = '../packagerDescriptorTemplates';
    /**
     * Hold the package manager cli name
     */
    @JsonProperty('packageManager') private packageManager: string = undefined;
    /**
     * Hold the command pattern used by DependencyResolver to install the parent dependency
     */
    @JsonProperty('installParentCommandTemplate') private installParentCommandTemplate: string = undefined;
    /**
     * If true a backup is done on package.json before executing the install parent command
     * and a restore is done after execution
     * (mainly created for packager like yarn which does not have a --no-save option)
     */
    @JsonProperty('preventPackageJsonChangeFromParentInstall', Boolean, true)
    private preventPackageJsonChangeFromParentInstall: boolean = false;
    /**
     * The list of arguments handled by this package manager
     * and how to transform dry arguments to fit into this package manager
     */
    @JsonProperty('mappedArguments', [ArgumentMapping])
    private mappedArguments: ArgumentMapping[] = [];

    /**
     * simple constructor
     */
    // tslint:disable:no-empty
    constructor() {}

    public static resolveDescriptor(cwd: string, file: string): string {
        const customPackagerPath: string = path.resolve(path.join(cwd, file));
        const dryPackagerPath: string = path.resolve(`${__dirname}/${DryPackagerDescriptor.PACKAGER_TEMPLATES_PATH}/${file}.json`);

        if (fs.existsSync(customPackagerPath)) {
            // a json packager descriptor is provided
            return customPackagerPath;
        } else if (fs.existsSync(dryPackagerPath)) {
            // a json packager key is provided
            return dryPackagerPath;
        } else {
            throw new Error(`Unable to load any packager descriptor! Invalid key or path ${file}`);
        }
    }

    /**
     * The packager command to use
     */
    public getPackageManager(): string {
        return this.packageManager;
    }

    /**
     * The packager install parent command template (Ex: For npm 'npm install --no-save {0}')
     */
    public getInstallParentCommandTemplate(): string {
        return this.installParentCommandTemplate;
    }

    /**
     * Return the list of mapped argument
     * @return {ArgumentMapping[]} the list of mapped arguments
     */
    public getMappedArguments(): ArgumentMapping[] {
        return this.mappedArguments;
    }

    /**
     * A backup/restore is executed on the package.json file if any before and after
     * executing the packager install parent command
     * A workaround for yarn or any packager without '--no-save' option
     */
    public isPackageJsonBackupRestoreNeeded(): boolean {
        return this.preventPackageJsonChangeFromParentInstall;
    }

    /**
     * Map the received arguments and populates the output arguments to be used by
     * the install parent command and the proxified command.
     * If no mapping found the arguments are simply accumulated into 'outputArgs'
     * @param {string} arg the current argument
     * @param {string} argValue the current argument associated value if already extracted/shifted from inputArgs
     * @param {string[]} inputArgs the remaining input arguments to be processed.
     * if argValue is undefined and the found mapping need a value it will be shifted from it
     * @param {string[]} outputArgs the mapped arguments are accumulated in this array
     * @param {string[]} installParentOutputArgs the mapped arguments dedicated to the install parent
     * command are accumulated in this array
     */
    public mapArguments(arg: string, argValue: string, inputArgs: string[], outputArgs: string[], installParentOutputArgs: string[]): void {
        if (this.isArgumentMapped(arg)) {
            this.resolveMappedArguments(arg, argValue, inputArgs, outputArgs, installParentOutputArgs);
        } else {
            outputArgs.push(arg);

            if (argValue !== undefined) {
                outputArgs.push(argValue);
            }
        }
    }

    /**
     * Check if the argument can be handled by this mapping
     * @return {boolean} True if this mapping can handle the argument.
     */
    private isArgumentMapped(arg: string): boolean {
        if (
            arg === undefined ||
            arg === null ||
            arg.trim() === '' ||
            this.mappedArguments === undefined ||
            this.mappedArguments.length === 0
        ) {
            return false;
        }
        return this.mappedArguments.some((argMap) => argMap.isArgumentMapped(arg));
    }

    /**
     * ArgumentMapping lookup and map the received arguments and populates the output arguments to be used by
     * the install parent command and the proxified command.
     * @param {string} arg the current argument
     * @param {string} argValue the current argument associated value if already extracted/shifted from inputArgs
     * @param {string[]} inputArgs the remaining input arguments to be processed.
     * if argValue is undefined and the found mapping need a value it will be shifted from it
     * @param {string[]} outputArgs the mapped arguments are accumulated in this array
     * @param {string[]} installParentOutputArgs the mapped arguments dedicated to the install parent
     * command are accumulated in this array
     */
    private resolveMappedArguments(
        arg: string,
        argValue: string,
        inputArgs: string[],
        outputArgs: string[],
        installParentOutputArgs: string[],
    ): void {
        const argumentMapping: ArgumentMapping = this.mappedArguments.find((argMap) => argMap.isArgumentMapped(arg));

        if (argumentMapping.isExpectingArgumentValue() === true && argValue === undefined) {
            argValue = inputArgs.shift();
        }

        const mappedArgs: string[] = argumentMapping.resolveMappedArguments(arg, argValue);
        mappedArgs.forEach((newArg) => outputArgs.push(newArg));
        if (argumentMapping.isAllowedArgInInstallParentCommand() === true) {
            mappedArgs.forEach((newArg) => installParentOutputArgs.push(newArg));
        }
    }
}
