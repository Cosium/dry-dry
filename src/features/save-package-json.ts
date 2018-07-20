import { DryOption } from '../dry-command-config';
import { DryContext } from '../dry-context';
import { DryFeature } from '../dry-feature';
import { DryLifecyclePhase } from '../dry-step';

/**
 * Dry feature feature responsible for saving a copy of package.json to a provided location
 */
export class SavePackageJson extends DryFeature {
    /** @inheritdoc */
    public constructor(phase: DryLifecyclePhase, orderInPhase: number = 100) {
        super(phase, orderInPhase);
        this.triggeredBy = [DryOption.SAVE_PACKAGE_JSON_TO];
        this.needArgumentValue = true;
        this.allowMappingToProxy = false;
    }

    /** @inheritdoc */
    public execute(context: DryContext): Promise<DryContext> {
        return new Promise<DryContext>((resolve, reject) => {
            const location: string = this.argumentValue;
            context.getNpmPackage().saveTo(location);
            resolve(context);
        });
    }
}
