import * as fs from 'fs';
import * as deepDiff from 'deep-diff';
import {DryPackageContent} from './dry-package-content';
import {JsonUtils} from './json-utils';
import {DependencyResolver} from './dependency-resolver';
import {NpmPackage} from './npm-package';
import * as merge from 'deepmerge';

/**
 * The dry package (i.e. package-dry.json) is the pendant of the npm package (i.e. package.json).
 * A dry package is an npm package added of a DryPackageDescriptor.
 */
export class DryPackage {

    private static readonly PACKAGE_DRY_JSON = 'package-dry.json';

    private constructor(private readonly dependencyResolver: DependencyResolver,
                        private readonly location: string,
                        private _content: DryPackageContent & any) {

    };

    static readFromDisk(dependencyResolver: DependencyResolver): DryPackage {
        const location = './' + DryPackage.PACKAGE_DRY_JSON;
        let fileContent = '{}';
        try {
            fileContent = fs.readFileSync(location, 'utf8');
        } catch (e) {
        }
        const baseDryPackage = JSON.parse(fileContent);
        return new DryPackage(dependencyResolver, location, baseDryPackage);
    }

    /**
     * Merge DryPackage content into the current DryPackage content
     * @param {DryPackage} dryPackage The DryPackage content to append
     */
    private merge(dryPackage: DryPackage): void {
        this._content = merge(this._content, dryPackage._content);
    }

    applyDiff(oldContent: any, newContent: any): void {
        const diffs = deepDiff.diff(oldContent, newContent);
        if (!diffs) {
            return;
        }
        diffs.forEach(diff => deepDiff.applyChange(this._content, this._content, diff));
        fs.writeFileSync(this.location, JsonUtils.prettyStringify(this._content));
    }

    exists(): boolean {
        return fs.existsSync(this.location);
    }

    /**
     * Builds a NpmPackage
     * @return {Promise<NpmPackage>} The NpmPackage
     */
    buildNpmPackage(): Promise<NpmPackage> {
        return this.doBuildNpmPackage();
    }

    /**
     * Recursive method.
     * Walks the DryPackage tree to build a full NpmPackage.
     *
     * @param {DryPackage} currentPackage The DryPackage to walk
     * @param {DryPackage[]} collectedPackages The walked DryPackages
     * @return {Promise<NpmPackage>} The full NpmPackage
     */
    private doBuildNpmPackage(currentPackage?: DryPackage, collectedPackages?: DryPackage[]): Promise<NpmPackage> {
        currentPackage = currentPackage || this;
        collectedPackages = collectedPackages || [];

        collectedPackages.push(currentPackage);

        return currentPackage
            .getParent()
            .then<NpmPackage>(parent => {
                if (parent) {
                    return this.doBuildNpmPackage(parent, collectedPackages);
                } else {
                    const mergedPackage = collectedPackages.pop();
                    while (collectedPackages.length > 0) {
                        mergedPackage.merge(collectedPackages.pop());
                    }
                    return new NpmPackage(mergedPackage);
                }
            });
    }

    private getParent(): Promise<DryPackage> {
        const dry = this._content.dry;
        if (!dry) {
            return Promise.resolve(null);
        }
        if (!dry.extends) {
            return Promise.resolve(null);
        }
        let promise = Promise.resolve();
        if (dry.dependencies) {
            promise = this.dependencyResolver.resolve(dry.dependencies);
        }
        return promise
            .then(() => new DryPackage(this.dependencyResolver, this.location, require(dry.extends)));
    }

    get content(): DryPackageContent & any {
        return JSON.parse(JSON.stringify(this._content));
    }

}