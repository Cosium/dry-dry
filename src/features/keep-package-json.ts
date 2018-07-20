import { DryOption } from '../dry-command-config';
import { DryContext } from '../dry-context';
import { DryFeature } from '../dry-feature';
import { DryLifecyclePhase, DryStep } from '../dry-step';
import { DeleteNpmPackage } from '../steps/delete-npm-package';

/**
 * Dry feature responsible for preventing the deletion of package.json by diasbling the dry step used for deleting package.json
 */
export class KeepPackageJson extends DryFeature {
    /** @inheritdoc */
    public constructor(phase: DryLifecyclePhase, orderInPhase: number = 100) {
        super(phase, orderInPhase);
        this.triggeredBy = [DryOption.KEEP_PACKAGE_JSON];
        this.needArgumentValue = false;
        this.allowMappingToProxy = false;
    }

    /** @inheritdoc */
    public execute(context: DryContext): Promise<DryContext> {
        return new Promise<DryContext>((resolve, reject) => {
            const step: DryStep = context.getExecutionSteps().find((s) => s instanceof DeleteNpmPackage);
            if (step !== undefined) {
                step.setActive(false);
                resolve(context);
            } else {
                reject('StepNotFound DeleteNpmPackage');
            }
        });
    }
}
