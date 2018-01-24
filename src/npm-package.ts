import {DryPackage} from "./dry-package";
import * as fs from "fs";
import {JsonUtils} from "./json-utils";

/**
 * npm 'package.json' component
 */
export class NpmPackage {

    /**
     * @type {string} The location of this NpmPackage
     */
    private readonly location = './package.json';
    /**
     * The content of this NpmPackage
     */
    private readonly content: any;

    /**
     * @param {DryPackage} dryPackage The DryPackage from which this NpmPackage originates
     */
    constructor(private readonly dryPackage: DryPackage) {
        this.content = this.dryPackage.content;
        delete this.content['dry'];
    }

    /**
     * Called before npm command proxy
     */
    beforeNpmRun(): void {
        if (!this.dryPackage.exists()) {
            return;
        }
        fs.writeFileSync(this.location, JsonUtils.prettyStringify(this.content));
    }

    /**
     * Called after npm command proxy
     */
    afterNpmRun(): void {
        let fileContent = '{}';
        try {
            fileContent = fs.readFileSync(this.location, 'utf8');
        } catch (e) {

        }
        this.dryPackage.applyDiff(this.content, JSON.parse(fileContent));
        try {
            fs.unlinkSync(this.location);
        } catch (e) {

        }
    }
}