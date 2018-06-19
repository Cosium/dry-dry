import * as deepDiff from 'deep-diff';
import * as merge from 'deepmerge';
import * as fs from 'fs';

import { DependencyResolver } from './dependency-resolver';
import { DryPackageContent } from './dry-package-content';
import { JsonUtils } from './json-utils';
import { NpmPackage } from './npm-package';

// TODO: consider adding a type to 'any'
// tslint:disable-next-line:no-any
export type WeakDryPackageContent = DryPackageContent & any;

/**
 * The dry package (i.e. package-dry.json) is the pendant of the npm package (i.e. package.json).
 * A dry package is an npm package added of a DryPackageDescriptor.
 */
export class DryPackage {
    private static readonly PACKAGE_DRY_JSON = 'package-dry.json';

    private constructor(
        private readonly dependencyResolver: DependencyResolver,
        private readonly location: string,
        // tslint:disable-next-line:variable-name
        private _content: WeakDryPackageContent,
    ) {}

    public static readFromDisk(dependencyResolver: DependencyResolver): DryPackage {
        const location = './' + DryPackage.PACKAGE_DRY_JSON;
        let fileContent = '{}';
        try {
            fileContent = fs.readFileSync(location, 'utf8');
        } catch (e) {
            // TODO: Bad practice to silence exception
        }
        const baseDryPackage = JSON.parse(fileContent);
        return new DryPackage(dependencyResolver, location, baseDryPackage);
    }

    public applyDiff(oldContent: WeakDryPackageContent, newContent: WeakDryPackageContent): void {
        const diffs = deepDiff.diff(oldContent, newContent);
        if (!diffs) {
            return;
        }
        diffs.forEach((diff) => deepDiff.applyChange(this._content, this._content, diff));
        fs.writeFileSync(this.location, JsonUtils.prettyStringify(this._content));
    }

    public exists(): boolean {
        return fs.existsSync(this.location);
    }

    /**
     * Builds a NpmPackage
     * @return {Promise<NpmPackage>} The NpmPackage
     */
    public buildNpmPackage(): Promise<NpmPackage> {
        return this.doBuildNpmPackage();
    }

    /**
     * Merge DryPackage content into the current DryPackage content
     * @param {DryPackage} dryPackage The DryPackage content to append
     */
    private merge(dryPackage: DryPackage): void {
        this._content = merge(this._content, dryPackage._content);
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

        return currentPackage.getParent().then<NpmPackage>((parent) => {
            if (parent) {
                return this.doBuildNpmPackage(parent, collectedPackages);
            } else {
                const mergedPackage = collectedPackages.pop();
                while (collectedPackages.length > 0) {
                    mergedPackage.merge(collectedPackages.pop());
                }
                mergedPackage.resolveInheritedDependencies();
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
        return promise.then(() => new DryPackage(this.dependencyResolver, this.location, require(dry.extends)));
    }

    public get content(): WeakDryPackageContent {
        return JSON.parse(JSON.stringify(this._content));
    }

    /**
     * This method will resolve inherited version of dependencies
     * and then delete provided version configuration properties
     */
    private resolveInheritedDependencies(): void {
        let dependencies = this._content.dependencies;
        let dependenciesMgmt = this._content.dependenciesManagement;
        this.resolveInheritance(dependencies, dependenciesMgmt);

        dependencies = this._content.devDependencies;
        dependenciesMgmt = this._content.devDependenciesManagement;
        this.resolveInheritance(dependencies, dependenciesMgmt);

        delete this._content.dependenciesManagement;
        delete this._content.devDependenciesManagement;
    }

    /**
     * This method will replace any value equals to "inherit" provided
     * in dependencies parameter by the value of the same key provided
     * in dependenciesManagement parameter
     * @param {any} dependencies object containing a list of key/value
     * @param {any} dependenciesManagement object containing a list of key/value
     */
    private resolveInheritance(dependencies: { [s: string]: string; }, dependenciesManagement: { [s: string]: string; }): void {
        if (dependencies && dependenciesManagement) {
            for (const key in dependencies) {
                if (dependencies.hasOwnProperty(key)) {
                    const inherit = 'inherit'.toUpperCase() === dependencies[key].toUpperCase();
                    if (inherit) {
                        const inheritedVersion = dependenciesManagement[key];

                        if (inheritedVersion) {
                            dependencies[key] = inheritedVersion;
                        } else {
                            const message = 'Package ' + key + ' must inherit a version but none are provided!';
                            throw message;
                        }
                    }
                }
            }
        }
    }
}
