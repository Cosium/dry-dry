import { DryContext } from '../dry-context';
import { DryStep } from '../dry-step';

/**
 * Dry step responsible to update the npm package object from the possibly updated package.json file
 */
export class UpdateNpmPackage extends DryStep {
    /** @inheritdoc */
    public execute(context: DryContext): Promise<DryContext> {
        return new Promise<DryContext>((resolve, reject) => {
            context.getNpmPackage().update();
            resolve(context);
        });
    }
}
