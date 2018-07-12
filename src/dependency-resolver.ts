import * as fs from 'fs';
import * as path from 'path';
import { Cli } from './cli';
import { DryCommandConfig } from './dry-command-config';
import { DryDependencies } from './dry-dependencies';
import { DryPackagerDescriptor } from './dry-packager-descriptor';
import { Logger } from './logger';

/**
 * Resolves dry dependencies
 */
export class DependencyResolver {
    private static logger: Logger = Logger.getLogger('dry.DependencyResolver');

    /**
     * @param {Cli} cli The cli to use
     */
    constructor(private readonly cli: Cli, private readonly dryCommandConfig: DryCommandConfig) {}

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

        const packagerDescriptor: DryPackagerDescriptor = this.dryCommandConfig.getPackagerDescriptor();
        const cmdMappedArgs: string[] = this.dryCommandConfig.getInstallParentCommandProxyArgs();
        const cmdTemplate: string = packagerDescriptor.getInstallParentCommandTemplate();
        const cmd: string = cmdTemplate.replace('{0}', args.join(' ')) + ' ' + cmdMappedArgs.join(' ');

        DependencyResolver.logger.debug(`Resolving with command: ${cmd}`);

        if (packagerDescriptor.isPackageJsonBackupRestoreNeeded() === true) {
            const source: string = path.resolve(process.cwd(), 'package.json');
            const dest: string = path.resolve(process.cwd(), 'package.json.bck');
            if (fs.existsSync(source) === true) {
                // backup package.json
                DependencyResolver.logger.debug(`Backup package.json from ${source} to ${dest}`);
                fs.copyFileSync(source, dest);

                return this.cli.execute(cmd, () => {
                    if (fs.existsSync(source) === true) {
                        fs.unlinkSync(source);
                    }
                    if (fs.existsSync(dest) === true) {
                        // restore package.json
                        DependencyResolver.logger.debug(`Restore package.json from ${dest} to ${source}`);
                        fs.copyFileSync(dest, source);
                        fs.unlinkSync(dest);
                    }
                });
            }
        }
        return this.cli.execute(cmd);
    }
}
