import { Job, JobMaterial, Material } from "../../types/crm";
import { ValidationError } from "./validation";

export class BusinessRuleEngine {
  // Job scheduling rules
  static validateJobScheduling(job: Partial<Job>, existingJobs: Job[]): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check for scheduling conflicts
    if (job.assigned_to && job.start_date && job.end_date) {
      const conflicts = existingJobs.filter(existingJob =>
        existingJob.assigned_to?.some(userId => job.assigned_to?.includes(userId)) &&
        existingJob.status === 'in_progress' &&
        this.dateRangesOverlap(
          { start: job.start_date!, end: job.end_date! },
          { start: existingJob.start_date!, end: existingJob.end_date! }
        )
      );

      if (conflicts.length > 0) {
        errors.push({
          field: 'schedule',
          message: `Scheduling conflict detected with job: ${conflicts[0].title}`
        });
      }
    }

    return errors;
  }

  // Pricing rules
  static validateJobPricing(job: Partial<Job>): ValidationError[] {
    const errors: ValidationError[] = [];

    // Minimum job value
    if (job.budget && job.budget < 50) {
      errors.push({
        field: 'budget',
        message: 'Job budget must be at least $50'
      });
    }

    return errors;
  }

  // Material availability rules
  static validateMaterialAllocation(
    jobMaterials: JobMaterial[],
    availableMaterials: Material[]
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const jobMaterial of jobMaterials) {
      const material = availableMaterials.find(m => m.id === jobMaterial.material_id);

      if (!material) {
        errors.push({
          field: `material_${jobMaterial.material_id}`,
          message: 'Material not found'
        });
        continue;
      }

      if (material.current_stock < jobMaterial.quantity) {
        errors.push({
          field: `material_${jobMaterial.material_id}`,
          message: `Insufficient stock. Available: ${material.current_stock}, Required: ${jobMaterial.quantity}`
        });
      }
    }

    return errors;
  }

  private static dateRangesOverlap(
    range1: { start: string; end: string },
    range2: { start: string; end: string }
  ): boolean {
    const start1 = new Date(range1.start);
    const end1 = new Date(range1.end);
    const start2 = new Date(range2.start);
    const end2 = new Date(range2.end);

    return start1 <= end2 && start2 <= end1;
  }
}
