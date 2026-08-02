export interface AppConfig {
  uploads: {
    maxPhotoSizeBytes: number;
    maxVoiceSizeBytes: number;
    maxVoiceDurationSec: number;
  };
  security: {
    passwordMaxAttempts: number;
    passwordLockoutMs: number;
  };
  pagination: {
    dashboardItems: number;
    mediaLibraryItems: number;
  };
  features: {
    maxRsvpGuests: number;
    maxRecipientLength: number;
    maxSenderLength: number;
    maxTitleLength: number;
    maxNoteLength: number;
  };
  rateLimits: {
    cardsPerMinute: number;
    uploadsPerMinute: number;
  };
}

export const APP_CONFIG: AppConfig = {
  uploads: {
    maxPhotoSizeBytes: 10 * 1024 * 1024, // 10MB
    maxVoiceSizeBytes: 5 * 1024 * 1024,  // 5MB
    maxVoiceDurationSec: 60,             // 60 seconds
  },
  security: {
    passwordMaxAttempts: 5,
    passwordLockoutMs: 5 * 60 * 1000,    // 5 minutes
  },
  pagination: {
    dashboardItems: 50,
    mediaLibraryItems: 100,
  },
  features: {
    maxRsvpGuests: 10,
    maxRecipientLength: 100,
    maxSenderLength: 100,
    maxTitleLength: 200,
    maxNoteLength: 2000,
  },
  rateLimits: {
    cardsPerMinute: 5,
    uploadsPerMinute: 10,
  },
};
