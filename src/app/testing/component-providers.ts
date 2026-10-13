import type { EnvironmentProviders, Provider } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  ParamMap,
  provideRouter,
} from '@angular/router';
import { Observable, of } from 'rxjs';

/**
 * `ActivatedRoute.paramMap` is both an Observable *and* a ParamMap, so the stub
 * has to be both: specs/components pipe it (`route.paramMap.pipe(...)`) and read
 * values straight off it (`route.paramMap.get(...)`).
 */
function paramMapStream(value: Record<string, string>): Observable<ParamMap> & ParamMap {
  const paramMap = convertToParamMap(value);
  return Object.assign(of(paramMap), {
    get: (key: string) => paramMap.get(key),
    has: (key: string) => paramMap.has(key),
    getAll: (key: string) => paramMap.getAll(key),
    keys: paramMap.keys,
  });
}

/**
 * Shared TestBed providers for component specs: a real Router (so navigation
 * can be spied on), a stubbed ActivatedRoute and a mock HTTP backend so no
 * request ever reaches the network.
 */
export function provideComponentTestProviders(
  route: Partial<ActivatedRoute> = {},
  queryParams: Record<string, string> = {},
): (Provider | EnvironmentProviders)[] {
  const params = paramMapStream({});
  const queryParamMap = paramMapStream(queryParams);

  const stub: Record<string, unknown> = {
    snapshot: {
      paramMap: convertToParamMap({}),
      queryParamMap: convertToParamMap(queryParams),
      queryParams,
      params: {},
      data: {},
      url: [],
      routeConfig: null,
      fragment: null,
    },
    paramMap: params,
    queryParamMap,
    queryParams: of(queryParams),
    params: of({}),
    data: of({}),
    url: of([]),
    fragment: null,
    outlet: 'primary',
    routeConfig: null,
    parent: null,
    children: [],
    firstChild: null,
  };
  stub['pathFromRoot'] = [stub];

  Object.assign(stub, route);

  return [
    provideHttpClient(),
    provideHttpClientTesting(),
    provideRouter([]),
    { provide: ActivatedRoute, useValue: stub as unknown as ActivatedRoute },
  ];
}
