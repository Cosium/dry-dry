import { DryContext } from './dry-context';
import { Logger } from './logger';

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
 * Responsible for the requested npm command propagation
 */
export abstract class DryStep {
    private static stepLogger: Logger = Logger.getLogger('dry.DryStep');

    protected active: boolean = true;

    public constructor(protected phase: DryLifecyclePhase, protected orderInPhase: number = 100) {}

    public isActive(): boolean {
        return this.active;
    }

    public setActive(active: boolean): void {
        this.active = active;
    }

    public getLifecyclePhase(): DryLifecyclePhase {
        return this.phase;
    }

    public getOrderInPhase(): number {
        return this.orderInPhase;
    }

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

    protected abstract execute(context: DryContext): Promise<DryContext>;
}
