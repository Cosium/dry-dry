import { DryContext } from './dry-context';
import { Logger } from './logger';

/**
 * Enumeate the dry lifecycle phases
 * The phase's value is used for ordering
 */
export enum DryLifecyclePhase {
    START = 0,

    PRE_BUILD_DRY_PACKAGE = 1000,
    BUILD_DRY_PACKAGE = 2000,
    POST_BUILD_DRY_PACKAGE = 3000,

    PRE_BUILD_NPM_PACKAGE = 4000,
    BUILD_NPM_PACKAGE = 5000,
    POST_BUILD_NPM_PACKAGE = 6000,

    PRE_EXECUTE_PROXY = 7000,
    EXECUTE_PROXY = 8000,
    POST_EXECUTE_PROXY = 9000,

    PRE_CLEAN = 10000,
    CLEAN = 11000,
    POST_CLEAN = 12000,

    FINISH = Number.MAX_SAFE_INTEGER,
}
/**
 * Abstract class describing a dry step
 */
export abstract class DryStep {
    private static stepLogger: Logger = Logger.getLogger('dry.DryStep');

    /**
     * Indicate if this step will be executed
     */
    protected active: boolean = true;

    /**
     * Construct a new step
     * @param {DryLifecyclePhase} phase the phase when this step will be executed
     * @param {number} orderInPhase the number used for ordering steps and features executed in the same phase
     */
    public constructor(protected phase: DryLifecyclePhase, protected orderInPhase: number = 100) {}

    public isActive(): boolean {
        return this.active;
    }

    /**
     * Set if this step will be executed
     * @param {boolean} active true if the step must be executed
     */
    public setActive(active: boolean): void {
        this.active = active;
    }

    /**
     * Return in which phase this step will be executed
     * @return {DryLifecyclePhase} the execution phase
     */
    public getLifecyclePhase(): DryLifecyclePhase {
        return this.phase;
    }

    /**
     * Return the order number
     * @return {number} the order number
     */
    public getOrderInPhase(): number {
        return this.orderInPhase;
    }

    /**
     * Method called by the dry command executor to execute the step
     * @param {DryContext} context the execution context
     */
    public exec(context: DryContext): Promise<DryContext> {
        if (this.isActive()) {
            DryStep.stepLogger.info(
                `${DryLifecyclePhase[this.phase]} (order: ${this.orderInPhase}) : Executing step ${this.constructor.name}`,
            );
            return this.execute(context);
        } else {
            DryStep.stepLogger.info(
                `${DryLifecyclePhase[this.phase]} (order: ${this.orderInPhase}) : Skipping step ${this.constructor.name}`,
            );
            return Promise.resolve(context);
        }
    }

    /**
     * This function will execute the step and must be provided by extending classes
     * @param {DryContext} context the context of the feature
     * @return {Promise<DryContext>} the feature's execution promise
     */
    protected abstract execute(context: DryContext): Promise<DryContext>;
}
