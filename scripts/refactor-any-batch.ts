import * as fs from 'fs';
import * as path from 'path';

/**
 * Batch refactoring helper pour éliminer les 'any'
 * Patterns à remplacer:
 * - Record<string, any> → Record<string, unknown>
 * - parameter: any → parameter: unknown
 * - : any{ → : unknown{
 * - Promise<any> → Promise<unknown>
 */
class AnyRefactor {
  private filePath: string;
  private changeCount = 0;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  refactor(): boolean {
    try {
      let content = fs.readFileSync(this.filePath, 'utf-8');
      const originalContent = content;

      // Pattern 1: Record<string, any> → Record<string, unknown>
      content = content.replace(/Record<string,\s*any>/g, () => {
        this.changeCount++;
        return 'Record<string, unknown>';
      });

      // Pattern 2: parameter: any → parameter: unknown
      content = content.replace(/(\w+):\s*any(?=[,\):])/g, (match, paramName) => {
        this.changeCount++;
        return `${paramName}: unknown`;
      });

      // Pattern 3: Promise<any> → Promise<unknown>
      content = content.replace(/Promise<any>/g, () => {
        this.changeCount++;
        return 'Promise<unknown>';
      });

      // Pattern 4: any[] → unknown[]
      content = content.replace(/any\[\]/g, () => {
        this.changeCount++;
        return 'unknown[]';
      });

      // Only write if changes were made
      if (content !== originalContent) {
        fs.writeFileSync(this.filePath, content);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error refactoring ${this.filePath}:`, error);
      return false;
    }
  }

  getChangeCount(): number {
    return this.changeCount;
  }
}

// Main
const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: ts-node refactor-any-batch.ts <file-path>');
  process.exit(1);
}

const refactor = new AnyRefactor(filePath);
const changed = refactor.refactor();
const changes = refactor.getChangeCount();

if (changed) {
  console.log(`✓ ${path.basename(filePath)}: ${changes} changes made`);
} else {
  console.log(`○ ${path.basename(filePath)}: no changes needed`);
}
