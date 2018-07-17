import { DryOption } from '../dry-command-config';
import { DryContext } from '../dry-context';
import { DryFeature } from '../dry-feature';
import { DryLifecyclePhase } from '../dry-step';
import { Logger } from '../logger';

/**
 * Dry feature responsible for enabling logging. The level is provided through the targeted dry option
 */
export class EnableLogging extends DryFeature {
    public constructor(phase: DryLifecyclePhase, orderInPhase: number = 100) {
        super(phase, orderInPhase);
        this.triggeredBy = [
            DryOption.SILENT,
            DryOption.S,
            DryOption.QUIET,
            DryOption.Q,
            DryOption.D,
            DryOption.VERBOSE,
            DryOption.DD,
            DryOption.DDD,
        ];
        this.needArgumentValue = false;
        this.allowMappingToProxy = true;
    }

    public execute(context: DryContext): Promise<DryContext> {
        return new Promise<DryContext>((resolve, reject) => {
            switch (this.activeTrigger) {
                case DryOption.SILENT:
                case DryOption.S: {
                    Logger.setLevel('error');
                    break;
                }
                case DryOption.QUIET:
                case DryOption.Q: {
                    Logger.setLevel('warn');
                    break;
                }
                case DryOption.D: {
                    Logger.setLevel('info');
                    break;
                }
                case DryOption.VERBOSE:
                case DryOption.DD: {
                    Logger.setLevel('debug');
                    break;
                }
                case DryOption.DDD: {
                    Logger.setLevel('trace');
                    break;
                }
            }
            resolve(context);
        });
    }
}
