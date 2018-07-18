import { DryCommandConfig } from './dry-command-config';
import { DryContext } from './dry-context';
import { Logger } from './logger';

/**
 * Responsible for executing the dry lifecycle and execute steps and features accordingly
 */
export class DryCommandExecutor {
    private static logger: Logger = Logger.getLogger('dry.DryCommandExecutor');

    /**
     * @param {DryContext} dryContext The execution context
     */
    constructor(private readonly dryContext: DryContext) {}

    /**
     * Execute the dry command received
     * @return {Promise<void>} Resolved promise on success, rejected promise on failure.
     */
    public execute(): Promise<DryContext> {
        DryCommandExecutor.logger.info('Dry command execution started');
        const cfg: DryCommandConfig = this.dryContext.getDryCommandConfig();

        this.dryContext.setExecutionSteps(cfg.getOrderedStepsAndFeatures());

        let stepPromise: Promise<DryContext> = Promise.resolve(this.dryContext);

        this.dryContext.getExecutionSteps().forEach((step) => {
            stepPromise = stepPromise.then((ctx) => step.exec(ctx));
        });
        return stepPromise;
    }
}
