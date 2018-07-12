import { JsonObject, JsonProperty } from 'json2typescript';
import { JsonConverter } from 'json2typescript/src/json2typescript/json-convert-decorators';
import { JsonCustomConvert } from 'json2typescript/src/json2typescript/json-custom-convert';

@JsonConverter
class ArgValueMapConverter implements JsonCustomConvert<Map<string, string[]>> {
    // tslint:disable:no-any
    public serialize(map: Map<string, string[]>): any {
        return JSON.stringify(map);
    }
    // tslint:disable:no-any
    public deserialize(map: any): Map<string, string[]> {
        const tsMap: Map<string, string[]> = new Map<string, string[]>();
        Object.getOwnPropertyNames(map).forEach((key) => tsMap.set(key, map[key]));
        return tsMap;
    }
}

/**
 * Responsible for the requested npm command propagation
 */
@JsonObject
export class ArgumentMapping {
    /**
     * The list of arguments handled by this mapping
     */
    @JsonProperty('arguments', [String])
    private arguments: string[] = [];
    /**
     * Define if the argument expect another sub argument
     */
    @JsonProperty('expectSubArgument', Boolean, true)
    private expectSubArgument: boolean = false;
    /**
     * Does this mapping also apply to DependencyResolver packager call
     */
    @JsonProperty('allowArgInInstallParentCommand', Boolean, true)
    private allowArgInInstallParentCommand: boolean = false;

    /**
     * Without any arguments this mapping apply (aka: expectSubArgument = false)
     */
    @JsonProperty('mappedTo', [String], true)
    private mappedTo: string[] = undefined;

    /**
     * With arguments this mapping apply (aka: expectSubArgument = true)
     */
    @JsonProperty('mappedArgumentValues', ArgValueMapConverter, true)
    private mappedArgumentValues: Map<string, string[]> = undefined;

    /**
     * simple constructor
     */
    // tslint:disable:no-empty
    constructor() {}

    /**
     * Indicate if this argument expect an associated value
     * @return {boolean} expect associated value
     */
    public isExpectingArgumentValue(): boolean {
        return this.expectSubArgument;
    }

    /**
     * Indicate if this argument mapping can be applied to the install parent command
     * executed by dependecny-resolver
     * @return {boolean} can populate install parent command arguments
     */
    public isAllowedArgInInstallParentCommand(): boolean {
        return this.allowArgInInstallParentCommand;
    }

    /**
     * Check if the argument can be handled by this mapping
     * @return {boolean} True if this mapping can handle the argument.
     */
    public isArgumentMapped(arg: string): boolean {
        if (arg === undefined || arg === null || arg.trim() === '') {
            return false;
        }
        return this.arguments.some((item) => item.toLowerCase() === arg.toLowerCase());
    }

    /**
     * Map the received arguments and return the mapped arguments
     * @param {string} arg the current argument
     * @param {string} argValue the current argument associated value if already extracted/shifted from inputArgs
     * @return {string[]} the mapped arguments or the input arguments if no mapping found
     */
    public resolveMappedArguments(arg: string, argValue: string): string[] {
        if (this.expectSubArgument === true && argValue === undefined) {
            throw new Error(`The argument ${arg} expect a value, but received nothing`);
        }
        if (this.expectSubArgument === true && this.mappedArgumentValues === undefined) {
            throw new Error(`The argument ${arg} has a value ${argValue}, but no mapping was provided in mappedArgumentValues`);
        }
        if (this.expectSubArgument === false && this.mappedTo === undefined) {
            throw new Error(`The argument ${arg} exists in descriptor but no mapping was provided in mappedTo`);
        }

        let outArgs: string[] = this.expectSubArgument === false ? this.mappedTo : this.mappedArgumentValues.get(argValue.toLowerCase());

        if (outArgs === undefined) {
            // if nothing is mapped, propagate old args
            outArgs = [arg];
            if (argValue !== undefined) {
                outArgs.push(argValue);
            }
        }
        return outArgs;
    }
}
