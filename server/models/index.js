/** @deprecated Import from specific modules — barrel kept for scripts and legacy imports. */
export { COLLECTIONS, USER_SETTINGS_FIELDS } from '../config/collections.js';
export { validateAppData } from '../schemas/appDataSchema.js';
export {
  extractUserSettings,
  extractCustomCategories,
  toUserDocument,
  fromUserDocument,
  prepareUserSettingsForStorage,
} from './User.js';
export { UserRepository, UserDataRepository } from '../repositories/userRepository.js';
export { TransactionRepository } from '../repositories/transactionRepository.js';
export { DebtRepository } from '../repositories/debtRepository.js';
export {
  SavingsRepository,
  SavingsEntryRepository,
} from '../repositories/savingsRepository.js';
export { UserCategoryRepository } from '../repositories/userCategoryRepository.js';
export { AppDataService } from '../services/appDataService.js';
export { AdminRepository } from '../repositories/adminRepository.js';
export { AppConfigRepository, DEFAULT_APP_CONFIG } from '../repositories/appConfigRepository.js';
export { AuditLogRepository } from '../repositories/auditLogRepository.js';
export { ensureIndexes, initCollections } from '../config/dbIndexes.js';
