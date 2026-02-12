/**
 * Initialize Templates
 *
 * Utility to check and seed default templates on app initialization.
 * Ensures built-in templates are available in IndexedDB.
 */

import { templateStorage } from '@/services/storage/templateStorage';
import { seedDefaultTemplates } from './defaultTemplates';

/**
 * Check if default templates need to be seeded
 */
export async function needsTemplateSeeding(): Promise<boolean> {
  try {
    const templates = await templateStorage.getAll();

    // If no templates exist, need to seed
    if (templates.length === 0) {
      return true;
    }

    // Check if any built-in templates are missing
    const builtInIds = [
      'template-database-postgres',
      'template-database-mongodb',
      'template-service-rest',
      'template-service-microservice',
      'template-queue',
      'template-cache',
      'template-storage',
      'template-external-api',
      'template-external-system',
      'template-component-ui',
      'template-component-library',
      'template-container-webapp',
      'template-container-mobile',
      'template-user',
      'template-admin',
    ];

    const existingIds = templates.map((t) => t.id);
    const missingTemplates = builtInIds.filter((id) => !existingIds.includes(id));

    return missingTemplates.length > 0;
  } catch (error) {
    console.error('Error checking template seeding status:', error);
    return true; // Assume seeding needed on error
  }
}

/**
 * Initialize templates with defaults if needed
 */
export async function initializeTemplates(): Promise<void> {
  try {
    const needsSeeding = await needsTemplateSeeding();

    if (needsSeeding) {
      console.log('Seeding default templates...');
      const defaultTemplates = await seedDefaultTemplates();
      await templateStorage.bulkSave(defaultTemplates);
      console.log(`Seeded ${defaultTemplates.length} default templates`);
    } else {
      console.log('Default templates already exist, skipping seed');
    }
  } catch (error) {
    console.error('Failed to initialize templates:', error);
    throw error;
  }
}

/**
 * Force re-seed all default templates
 * Use this for testing or when templates need to be refreshed
 */
export async function forceReseedTemplates(): Promise<void> {
  try {
    console.log('Force re-seeding default templates...');

    // Get all default templates
    const defaultTemplates = await seedDefaultTemplates();

    // Delete existing default templates
    const builtInIds = defaultTemplates.map((t) => t.id);
    await templateStorage.bulkDelete(builtInIds);

    // Save fresh copies
    await templateStorage.bulkSave(defaultTemplates);

    console.log(`Re-seeded ${defaultTemplates.length} default templates`);
  } catch (error) {
    console.error('Failed to force reseed templates:', error);
    throw error;
  }
}

/**
 * Get template initialization status
 */
export async function getTemplateInitializationStatus(): Promise<{
  isInitialized: boolean;
  templateCount: number;
  builtInCount: number;
  customCount: number;
}> {
  try {
    const templates = await templateStorage.getAll();
    const builtInCount = templates.filter((t) => t.author === 'System').length;
    const customCount = templates.filter((t) => t.author !== 'System').length;

    return {
      isInitialized: templates.length > 0,
      templateCount: templates.length,
      builtInCount,
      customCount,
    };
  } catch (error) {
    console.error('Error getting template status:', error);
    return {
      isInitialized: false,
      templateCount: 0,
      builtInCount: 0,
      customCount: 0,
    };
  }
}
