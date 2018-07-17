import { DryContext } from '../dry-context';
import { DryStep } from '../dry-step';

/**
 * Dry step responsible to save the npm package to the package.json file
 */
export class SaveNpmPackage extends DryStep {
    public execute(context: DryContext): Promise<DryContext> {
        return new Promise<DryContext>((resolve, reject) => {
            try {
                context.getNpmPackage().save();
                resolve(context);
            } catch (err) {
                reject(err);
            }
        });
    }
}
