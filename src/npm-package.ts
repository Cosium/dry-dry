import * as fs from 'fs';

import { DryPackage } from './dry-package';
import { JsonUtils } from './json-utils';

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
    // tslint:disable-next-line:no-any
    private readonly content: any;

    /**
     * @param {DryPackage} dryPackage The DryPackage from which this NpmPackage originates
     */
    constructor(private readonly dryPackage: DryPackage) {
        this.content = this.dryPackage.content;
        // tslint:disable-next-line:no-string-literal
        delete this.content['dry'];
    }

    /**
     * Called before npm command proxy
     */
    public beforeNpmRun(): void {
        if (!this.dryPackage.exists()) {
            return;
        }
        fs.writeFileSync(this.location, JsonUtils.prettyStringify(this.content));
    }

    /**
     * Called after npm command proxy
     */
    public afterNpmRun(): void {
        let fileContent = '{}';
        try {
            fileContent = fs.readFileSync(this.location, 'utf8');
        } catch (e) {
            // TODO
        }
        this.dryPackage.applyDiff(this.content, JSON.parse(fileContent));
        try {
            fs.unlinkSync(this.location);
        } catch (e) {
            // TODO
        }
    }
}
