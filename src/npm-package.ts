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
        // tslint:disable-next-line:no-string-literal
        delete this.content['dependencyManagement'];
    }

    /**
     * Save the current NpmPackage to the default location './package.json'
     */
    public save(): void {
        this.saveTo(this.location);
    }

    /**
     * Save the current NpmPackage to the provided location
     * @param {string} location the target location
     */
    public saveTo(location: string): void {
        if (!this.dryPackage.exists()) {
            return;
        }
        fs.writeFileSync(location, JsonUtils.prettyStringify(this.content));
    }

    /**
     * Update the NpmPackage from the file './package.json'
     */
    public update(): void {
        let fileContent = '{}';
        try {
            fileContent = fs.readFileSync(this.location, 'utf8');
        } catch (e) {
            // TODO
        }
        this.dryPackage.applyDiff(this.content, JSON.parse(fileContent));
    }

    /**
     * Delete the file './package.json' representing the NpmPackage if it exists
     */
    public delete(): void {
        try {
            fs.unlinkSync(this.location);
        } catch (e) {
            // TODO
        }
    }
}
