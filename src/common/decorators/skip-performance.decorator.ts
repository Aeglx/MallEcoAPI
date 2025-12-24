import { SetMetadata } from '@nestjs/common';

export const SKIP_PERFORMANCE_KEY = 'skipPerformance';
export const SkipPerformance = () => SetMetadata(SKIP_PERFORMANCE_KEY, true);