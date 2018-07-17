import { DryContext } from '../dry-context';
import { DryStep } from '../dry-step';

/**
 * Dry step responsible for deleting the generated package.json file
 */
export class DeleteNpmPackage extends DryStep {
    public execute(context: DryContext): Promise<DryContext> {
        return new Promise<DryContext>((resolve, reject) => {
            context.getNpmPackage().delete();
            resolve(context);
        });
    }
}
