import { DryOption } from '../dry-command-config';
import { DryContext } from '../dry-context';
import { DryFeature } from '../dry-feature';
import { DryLifecyclePhase } from '../dry-step';
import { Logger } from '../logger';

/**
 * Dry feature responsible for enabling logging. The level is provided through an argument
 */
export class EnableLoggingLevel extends DryFeature {
    /** @inheritdoc */
    public constructor(phase: DryLifecyclePhase, orderInPhase: number = 100) {
        super(phase, orderInPhase);
        this.triggeredBy = [DryOption.LOG_LEVEL];
        this.needArgumentValue = true;
        this.allowMappingToProxy = true;
    }

    /** @inheritdoc */
    public execute(context: DryContext): Promise<DryContext> {
        return new Promise<DryContext>((resolve, reject) => {
            Logger.setLevel(this.argumentValue);
            resolve(context);
        });
    }
}
