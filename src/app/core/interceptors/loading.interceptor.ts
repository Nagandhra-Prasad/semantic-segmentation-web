import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { SKIP_GLOBAL_LOADER } from '../http/http-context';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const isApi = req.url.includes('/api/');
  const skip = req.context.get(SKIP_GLOBAL_LOADER);

  if (!isApi || skip) {
    return next(req);
  }

  const loading = inject(LoadingService);
  loading.trackStart();

  return next(req).pipe(
    finalize(() => loading.trackEnd()),
  );
};
