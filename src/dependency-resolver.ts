import { Cli } from './cli';
import { DryDependencies } from './dry-dependencies';
import { Logger } from './logger';

/**
 * Resolves dry dependencies
 */
export class DependencyResolver {
    private static logger: Logger = Logger.getLogger('dry.DependencyResolver');

    /**
     * @param {Cli} cli The cli to use
     */
    constructor(private readonly cli: Cli) {}

    /**
     * Resolves provided dry dependencies by fetching them if necessary.
     * The resolution success means that all requested depencies are available in the current work directory.
     * @param {DryDependencies} dependencies The dependencies to resolve
     * @return {Promise<void>} A resolved promise on success, rejected promise on failure.
     */
    public resolve(dependencies: DryDependencies): Promise<void> {
        const args: string[] = [];

        DependencyResolver.logger.info('Resolving dependencies...');

        Object.keys(dependencies).forEach((dependencyName) => {
            const dependencyVersion = dependencies[dependencyName];

            DependencyResolver.logger.debug(`Resolving name: ${dependencyName} version: ${dependencyVersion}`);
            if (dependencyVersion && dependencyVersion.indexOf(':') !== -1) {
                args.push(dependencyVersion);
            } else {
                let arg = dependencyName;
                if (dependencyVersion) {
                    arg += '@' + dependencyVersion;
                }
                args.push(arg);
            }
        });
        if (args.length === 0) {
            DependencyResolver.logger.info('Nothing to resolve!');
            return Promise.resolve();
        }
        const cmd: string = 'npm install --no-save ' + args.join(' ');

        DependencyResolver.logger.debug(`Resolving with command: ${cmd}`);
        return this.cli.execute(cmd);
    }
}
