import * as deepDiff from 'deep-diff';
import * as fs from 'fs';
import { JsonConvert } from 'json2typescript/src/json2typescript/json-convert';
import { OperationMode, ValueCheckingMode } from 'json2typescript/src/json2typescript/json-convert-enums';
import * as path from 'path';
import { DryPackagerDescriptor } from './dry-packager-descriptor';
import { Logger } from './logger';

/**
 * JSON utilities
 */
export class JsonUtils {
    private static logger: Logger = Logger.getLogger('dry.JsonUtils');

    /**
     * Generates a JSON string using the NpmPackage JSON style.
     * @param obj
     * @return {string} Pretty stringifies JSON
     */
    public static prettyStringify(obj: object): string {
        return JSON.stringify(obj, null, 2) + '\n';
    }

    public static loadObject<V>(
        file: string,
        classReference: {
            new (): V;
        },
    ): V {
        // Choose your settings
        // Check the detailed reference in the chapter "JsonConvert class properties and methods"
        // from json2typescript
        const jsonConvert: JsonConvert = new JsonConvert();
        jsonConvert.operationMode = JsonUtils.logger.isDebugEnabled() ? OperationMode.LOGGING : OperationMode.ENABLE;
        jsonConvert.ignorePrimitiveChecks = false; // don't allow assigning number to string etc.
        jsonConvert.valueCheckingMode = ValueCheckingMode.DISALLOW_NULL; // never allow null

        // tslint:disable:no-any
        const jsons: any[] = [];
        let json: any = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));

        jsons.push(json);
        while (json.extends !== undefined) {
            const newPath: string = DryPackagerDescriptor.resolveDescriptor(path.dirname(file), json.extends);
            json = JSON.parse(fs.readFileSync(newPath, 'utf8'));
            jsons.push(json);
        }

        json = {};
        jsons.reverse().forEach((newJson) => {
            const diffs = deepDiff.diff(json, newJson);
            if (!diffs) {
                return;
            }
            diffs.filter((diff) => diff.kind !== 'D').forEach((diff) => deepDiff.applyChange(json, newJson, diff));
        });

        return jsonConvert.deserialize(json, classReference);
    }
}
