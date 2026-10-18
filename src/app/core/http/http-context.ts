import { HttpContext, HttpContextToken } from '@angular/common/http';

/** When true, the global loading overlay is not shown for this request. */
export const SKIP_GLOBAL_LOADER = new HttpContextToken<boolean>(() => false);

export function silentLoaderContext(): HttpContext {
  return new HttpContext().set(SKIP_GLOBAL_LOADER, true);
}
