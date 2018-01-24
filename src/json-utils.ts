/**
 * JSON utilities
 */
export class JsonUtils {

    /**
     * Generates a JSON string using the NpmPackage JSON style.
     * @param obj
     * @return {string} Pretty stringifies JSON
     */
    static prettyStringify(obj: any): string {
        return JSON.stringify(obj, null, 2) + '\n';
    }

}