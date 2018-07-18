import { DryOption } from './dry-command-config';
import { DryContext } from './dry-context';
import { DryLifecyclePhase, DryStep } from './dry-step';
import { Logger } from './logger';

/**
 * Base class responsible for defining basic functions of a dry feature
 */
export abstract class DryFeature extends DryStep {
    private static featureLogger: Logger = Logger.getLogger('dry.DryFeature');

    /**
     * List of DryOption triggering this feature
     */
    protected triggeredBy: DryOption[];
    /**
     * The DryOption that triggered this feature
     */
    protected activeTrigger: string;
    /**
     * The argument value required by this feature if needArgumentValue === true, undefined otherwise
     */
    protected argumentValue: string;
    /**
     * Indicate if this feature need to extract another arguments from the provided args
     */
    protected needArgumentValue: boolean;
    /**
     * Indicate if this feature consume arguments that can be handled by the package manager proxy
     * if false : the argument is only handled by dry and won't be transmited to the proxy
     * if true : the argument can be transmited to the proxy
     */
    protected allowMappingToProxy: boolean;

    /**
     * Construct a new feature
     * @param {DryLifecyclePhase} phase the phase when this feature will be executed
     * @param {number} orderInPhase the number used for ordering steps and features executed in the same phase
     */
    public constructor(phase: DryLifecyclePhase, orderInPhase: number = 100) {
        super(phase, orderInPhase);
        this.setActive(false);
    }

    /**
     * Indicate if the feature can be triggered by the argument
     * @param {string} argument the value compared to any dry option values in triggeredBy
     * @return {boolean} true if the feature can be activated
     */
    public isTriggered(argument: string): boolean {
        const result: boolean = this.triggeredBy.some((opt) => opt === argument);
        return result;
    }

    /**
     * Indicate if the arguments can be transmitted to the package manager command
     * @return {boolean} true if the arguments can be transmitted
     */
    public isMappingToProxyAllowed(): boolean {
        return this.allowMappingToProxy;
    }

    /**
     * This function will consume an argument from the list of unprocessed arguments
     * if needArgumentValue === true if not nothing i consumed
     * @param {string} dryOption the argument triggering this feature (isTriggered must be true)
     * @param {string[]} unprocessedArgs the list of unprocessed arguments received by dry
     * @return {string} the argument value if any else undefined
     */
    public consumeArgumentValue(dryOption: string, unprocessedArgs: string[]): string {
        if (this.needArgumentValue === true) {
            this.argumentValue = unprocessedArgs.shift();
        }
        this.activeTrigger = dryOption;
        this.active = true;

        DryFeature.featureLogger.info(
            `${DryLifecyclePhase[this.phase]} (order: ${this.orderInPhase}) : Feature is now active ${this.constructor.name}`,
        );
        return this.argumentValue;
    }

    /**
     * This function will execute the feature and must be provided by extending classes
     * @param {DryContext} context the context of the feature
     * @return {Promise<DryContext>} the feature's execution promise
     */
    protected abstract execute(context: DryContext): Promise<DryContext>;
}
