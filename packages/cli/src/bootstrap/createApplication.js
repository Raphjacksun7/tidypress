import { Application } from '../application/Application.js'
import { BuildCommand } from '../commands/build.js'
import { CleanCommand } from '../commands/clean.js'
import { ContextCommand } from '../commands/context.js'
import { DeployCommand } from '../commands/deploy.js'
import { DevCommand } from '../commands/dev.js'
import { InitCommand } from '../commands/init.js'
import { PreviewCommand } from '../commands/preview.js'
import {
  ArtifactOnlyDeployStrategy,
  ExternalTargetDeployStrategy,
  LocalCopyDeployStrategy,
} from '../deployment/DeployStrategies.js'
import { BuildService } from '../services/BuildService.js'
import { CleanService } from '../services/CleanService.js'
import { ConfigLoader } from '../services/ConfigLoader.js'
import { ContextService } from '../services/ContextService.js'
import { DeployService } from '../services/DeployService.js'
import { EngineManager } from '../services/EngineManager.js'
import { ScaffoldService } from '../services/ScaffoldService.js'

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
  const buildService = new BuildService({ configLoader, engineManager })
  const contextService = new ContextService({ configLoader })
  const cleanService = new CleanService({ configLoader, engineManager })
  const deployService = new DeployService({
    strategies: [
      new ArtifactOnlyDeployStrategy({ io }),
      new LocalCopyDeployStrategy(),
      new ExternalTargetDeployStrategy({ io }),
    ],
  })

  return new Application({
    version,
    projectRoot,
    io,
    commands: {
      init: new InitCommand({ scaffoldService, io }),
      dev: new DevCommand({ configLoader, engineManager }),
      build: new BuildCommand({ buildService }),
      preview: new PreviewCommand({ configLoader, engineManager }),
      clean: new CleanCommand({ cleanService, io }),
      context: new ContextCommand({ contextService, io }),
      deploy: new DeployCommand({ buildService, deployService, io }),
    },
  })
}
