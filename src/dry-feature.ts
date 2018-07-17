import { DryOption } from './dry-command-config';
import { DryContext } from './dry-context';
import { DryLifecyclePhase, DryStep } from './dry-step';
import { Logger } from './logger';

/**
 * Base class responsible for defining basic functions of a dry feature
 */
export abstract class DryFeature extends DryStep {
    private static featureLogger: Logger = Logger.getLogger('dry.DryFeature');

    protected triggeredBy: DryOption[];
    protected activeTrigger: string;
    protected argumentValue: string;
    protected needArgumentValue: boolean;
    protected allowMappingToProxy: boolean;

    public constructor(phase: DryLifecyclePhase, orderInPhase: number = 100) {
        super(phase, orderInPhase);
        this.setActive(false);
    }

    public isTriggered(argument: string): boolean {
        const result: boolean = this.triggeredBy.some((opt) => opt === argument);
        return result;
    }

    public isMappingToProxyAllowed(): boolean {
        return this.allowMappingToProxy;
    }

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

    protected abstract execute(context: DryContext): Promise<DryContext>;
}
