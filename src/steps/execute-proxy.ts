import { CommandProxy } from '../command-proxy';
import { DryCommandConfig } from '../dry-command-config';
import { DryContext } from '../dry-context';
import { DryStep } from '../dry-step';

/**
 * Dry step responsible for executing the proxified package manager call
 */
export class ExecuteProxy extends DryStep {
    /** @inheritdoc */
    public execute(context: DryContext): Promise<DryContext> {
        return new Promise<DryContext>((resolve, reject) => {
            const cfg: DryCommandConfig = context.getDryCommandConfig();
            const packageManager: string = cfg.getPackagerDescriptor().getPackageManager();
            const commandProxy: CommandProxy = new CommandProxy(context.getCli(), packageManager);
            const commandProxyArgs: string[] = cfg.getCommandProxyArgs();
            const callProxy: boolean = commandProxyArgs.length !== 0;

            if (callProxy === true) {
                commandProxy
                    .proxy(commandProxyArgs)
                    .then(() => resolve(context))
                    .catch((err) => reject(err));
            } else {
                resolve(context);
            }
        });
    }
}
