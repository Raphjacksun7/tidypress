import { Application } from '../application/Application.js'
import { AddVersionCommand } from '../commands/add-version.js'
import { BuildCommand } from '../commands/build.js'
import { CleanCommand } from '../commands/clean.js'
import { ContextCommand } from '../commands/context.js'
import { DeployCommand } from '../commands/deploy.js'
import { DevCommand } from '../commands/dev.js'
import { DoctorCommand } from '../commands/doctor.js'
import { DomainCommand } from '../commands/domain.js'
import { EditorCommand } from '../commands/editor.js'
import { ExportCommand } from '../commands/export.js'
import { ImportCommand } from '../commands/import.js'
import { InitCommand } from '../commands/init.js'
import { MigrateSectionsCommand } from '../commands/migrate-sections.js'
import { PreviewCommand } from '../commands/preview.js'
import { ReleaseCheckCommand } from '../commands/release-check.js'
import { AiCommand } from '../commands/ai.js'
import {
  ArtifactOnlyDeployStrategy,
  ExternalTargetDeployStrategy,
  LocalCopyDeployStrategy,
} from '../deployment/DeployStrategies.js'
import { createProviderStrategies } from '../deployment/ProviderDeployStrategies.js'
import { DeploymentStrategyRegistry } from '../deployment/DeploymentStrategyRegistry.js'
import { AddVersionService } from '../services/AddVersionService.js'
import { BuildService } from '../services/BuildService.js'
import { CleanService } from '../services/CleanService.js'
import { ConfigLoader } from '../services/ConfigLoader.js'
import { ContextService } from '../services/ContextService.js'
import { DoctorService } from '../services/DoctorService.js'
import { DeployService } from '../services/DeployService.js'
import { DomainSetupService } from '../services/DomainSetupService.js'
import { EngineManager } from '../services/EngineManager.js'
import { ExperimentalFeatureService } from '../services/ExperimentalFeatureService.js'
import { ImportService } from '../services/ImportService.js'
import { ReleaseCheckService } from '../services/ReleaseCheckService.js'
import { ScaffoldService } from '../services/ScaffoldService.js'
import { SectionsMigrationService } from '../services/SectionsMigrationService.js'

/**
 * Creates the fully wired application with explicit service boundaries.
 *
 * @param {{ projectRoot: string, version: string, io?: { info: (message: string) => void, error: (message: string) => void } }} options
 * @returns {Application}
 */
export function createApplication({ projectRoot, version, io = console }) {
  const configLoader = new ConfigLoader()
  const engineManager = new EngineManager()
  const scaffoldService = new ScaffoldService()
  const addVersionService = new AddVersionService({ configLoader })
  const buildService = new BuildService({ configLoader, engineManager })
  const contextService = new ContextService({ configLoader })
  const cleanService = new CleanService({ configLoader, engineManager })
  const doctorService = new DoctorService({ configLoader })
  const experimentalFeatureService = new ExperimentalFeatureService({ configLoader })
  const importService = new ImportService({ configLoader })
  const releaseCheckService = new ReleaseCheckService()
  const sectionsMigrationService = new SectionsMigrationService({ configLoader })
  const deployStrategyRegistry = new DeploymentStrategyRegistry({
    strategies: [
      new ArtifactOnlyDeployStrategy({ io }),
      new LocalCopyDeployStrategy(),
      ...createProviderStrategies({ io }),
      new ExternalTargetDeployStrategy({ io }),
    ],
  })
  const deployService = new DeployService({
    strategyRegistry: deployStrategyRegistry,
  })
  const domainSetupService = new DomainSetupService({ configLoader })

  return new Application({
    version,
    projectRoot,
    io,
    commands: {
      init: new InitCommand({ scaffoldService, io }),
      'migrate-sections': new MigrateSectionsCommand({ sectionsMigrationService, io }),
      'add-version': new AddVersionCommand({ addVersionService, io }),
      dev: new DevCommand({ configLoader, engineManager }),
      build: new BuildCommand({ buildService }),
      preview: new PreviewCommand({ configLoader, engineManager }),
      clean: new CleanCommand({ cleanService, io }),
      context: new ContextCommand({ contextService, io }),
      deploy: new DeployCommand({ buildService, deployService, io }),
      domain: new DomainCommand({ domainSetupService, io }),
      doctor: new DoctorCommand({ doctorService, io }),
      import: new ImportCommand({ importService, io }),
      'release-check': new ReleaseCheckCommand({ releaseCheckService, io }),
      editor: new EditorCommand({ experimentalFeatureService }),
      export: new ExportCommand({ experimentalFeatureService }),
      ai: new AiCommand({ experimentalFeatureService }),
    },
  })
}
