import { DryContext } from '../dry-context';
import { DryStep } from '../dry-step';
import { Logger } from '../logger';

/**
 * Dry step (empty) only here to log the start of the lifecycle
 */
export class Start extends DryStep {
    private static logger: Logger = Logger.getLogger('dry.Start');

    public execute(context: DryContext): Promise<DryContext> {
        return new Promise<DryContext>((resolve, reject) => {
            Start.logger.info('Dry lifecycle started');
            resolve(context);
        });
    }
}
