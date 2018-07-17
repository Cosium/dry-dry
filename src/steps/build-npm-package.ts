import { DryContext } from '../dry-context';
import { DryStep } from '../dry-step';

/**
 * Dry step responsible for build the npm package from the dry package object
 */
export class BuildNpmPackage extends DryStep {
    public execute(context: DryContext): Promise<DryContext> {
        return new Promise<DryContext>((resolve, reject) => {
            context
                .getDryPackage()
                .buildNpmPackage()
                .then((npmPackage) => {
                    context.setNpmPackage(npmPackage);
                    resolve(context);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }
}
