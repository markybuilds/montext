import { ContextService } from "./contextService";
import { BoundariesService } from "./boundariesService";
import { CoreEngine } from "./coreEngine";
import * as path from "node:path";

/**
 * MontextOrchestrator
 *
 * Thin entrypoint that wires ContextService, BoundariesService, and CoreEngine
 * according to the behavior described in Montext.md and montext_summary.md.
 */
export class MontextOrchestrator {
  private readonly context: ContextService;
  private readonly boundaries: BoundariesService;
  private readonly engine: CoreEngine;

  constructor(private readonly repoRoot: string) {
    const contextBase = path.join(repoRoot, "context");
    this.context = new ContextService(contextBase);
    this.boundaries = new BoundariesService(this.context);
    this.engine = new CoreEngine(this.context, this.boundaries);
  }

  async run(projectGoal: string): Promise<void> {
    await this.engine.initialize(projectGoal);
    await this.engine.runUntilDone();
  }
}
