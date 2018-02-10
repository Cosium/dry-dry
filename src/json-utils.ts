/**
 * JSON utilities
 */
export class JsonUtils {
    /**
     * Generates a JSON string using the NpmPackage JSON style.
     * @param obj
     * @return {string} Pretty stringifies JSON
     */
    public static prettyStringify(obj: object): string {
        return JSON.stringify(obj, null, 2) + '\n';
    }
}
