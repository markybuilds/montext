import { ContextService } from "./contextService";

/**
 * BoundariesService
 *
 * Responsible for:
 * - Taking a raw project goal
 * - Producing optimized_project_goal, inbounds, outerbounds
 * - Seeding an initial tasks.md
 */
export class BoundariesService {
  constructor(private readonly context: ContextService) {}

  async generate(projectGoal: string): Promise<void> {
    // Implementation should:
    // 1. Derive optimized goal from projectGoal
    // 2. Generate 20 inbounds + 20 outerbounds
    // 3. Write:
    //    - context/optimized_project_goal.md
    //    - context/inbounds.md
    //    - context/outerbounds.md
    //    - context/tasks.md (initial tasks)
    // All via ContextService.atomicWrite
    // ...existing code...
  }
}
