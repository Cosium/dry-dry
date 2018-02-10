/**
 * Only dry requested dependencies should reside in this descriptor.
 */
export interface DryDependencies {
    [key: string]: string;
}
