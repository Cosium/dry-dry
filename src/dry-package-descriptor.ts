import { DryDependencies } from "./dry-dependencies";

/**
 * The dry specific part of the DryPackage.
 */
export interface DryPackageDescriptor {
    /**
     * The extended DryPackage file.
     * Can be a relative path or an absolute path.
     *
     * Use an absolute path like 'foo/package-dry.json' to resolve to a npm module.
     * The module must be part of 'dependencies' part.
     */
    extends?: string;
    /**
     * The needed dry dependencies.
     */
    dependencies?: DryDependencies;
}
