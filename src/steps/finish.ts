import { DryContext } from '../dry-context';
import { DryStep } from '../dry-step';
import { Logger } from '../logger';

/**
 * Dry step (empty) only here to log the end of the lifecycle
 */
export class Finish extends DryStep {
    private static logger: Logger = Logger.getLogger('dry.Finish');

    public execute(context: DryContext): Promise<DryContext> {
        return new Promise<DryContext>((resolve, reject) => {
            Finish.logger.info('All steps executed successfully');
            resolve(context);
        });
    }
}
