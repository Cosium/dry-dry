import { DryContext } from '../dry-context';
import { DryPackage } from '../dry-package';
import { DryStep } from '../dry-step';
import { Logger } from '../logger';

/**
 * Dry step responsible for building the dry package object and populate the dry context with it
 */
export class BuildDryPackage extends DryStep {
    private static logger: Logger = Logger.getLogger('dry.BuildDryPackage');

    public execute(context: DryContext): Promise<DryContext> {
        return new Promise<DryContext>((resolve, reject) => {
            BuildDryPackage.logger.debug('Reading dry package from disk');
            const dryPackage: DryPackage = DryPackage.readFromDisk(context.getDependencyResolver());
            context.setDryPackage(dryPackage);
            resolve(context);
        });
    }
}
