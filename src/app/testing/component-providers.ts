import { EnvironmentProviders, Provider, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

type RouteParams = Record<string, string>;

/**
 * Shared TestBed providers for shallow component specs. Mirrors the providers
 * the app supplies at bootstrap (minus SSR/hydration) so components that inject
 * HttpClient, Router or global services can be created without a live backend.
 *
 * Pass route/query params to satisfy components that read `ActivatedRoute`.
 */
export function provideComponentTestProviders(
  routeParams: RouteParams = {},
  queryParams: RouteParams = {},
): (Provider | EnvironmentProviders)[] {
  const paramMap = convertToParamMap(routeParams);
  const queryParamMap = convertToParamMap(queryParams);
  const snapshot = { params: routeParams, queryParams, paramMap, queryParamMap };

  return [
    provideZonelessChangeDetection(),
    provideHttpClient(),
    provideHttpClientTesting(),
    provideRouter([]),
    {
      provide: ActivatedRoute,
      useValue: {
        snapshot,
        params: of(routeParams),
        queryParams: of(queryParams),
        paramMap: of(paramMap),
        queryParamMap: of(queryParamMap),
        pathFromRoot: [{ snapshot }],
        data: of({}),
        firstChild: null,
        children: [],
        parent: null,
        root: null,
      },
    },
  ];
}
