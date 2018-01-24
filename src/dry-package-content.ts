import {DryPackageDescriptor} from "./dry-package-descriptor";

/**
 * The content descriptor of the DryPackage
 */
export interface DryPackageContent {
    /**
     * The dry part of the DryPackage content
     */
    dry?: DryPackageDescriptor;
}