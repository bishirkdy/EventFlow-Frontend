import { EnvironmentProviders, Provider } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

const DEFAULT_PARAMS = {
  eventId: '1',
  id: '1',
  pageId: '1',
  sectionId: '1',
  sessionId: '1',
  venueId: '1',
};

/**
 * Shared providers for component specs: a stubbed route, a router and a mocked
 * HTTP backend so root-provided services never reach the network.
 */
export function provideComponentTestProviders(
  params: Record<string, string> = DEFAULT_PARAMS,
  queryParams: Record<string, string> = {},
): (Provider | EnvironmentProviders)[] {
  const paramMap = convertToParamMap(params);
  const queryParamMap = convertToParamMap(queryParams);
  const routeStub = {
    paramMap: of(paramMap),
    queryParamMap: of(queryParamMap),
    parent: null,
    snapshot: { paramMap, queryParamMap },
    pathFromRoot: [] as unknown[],
  };
  routeStub.pathFromRoot.push(routeStub);

  return [
    provideRouter([]),
    provideHttpClient(),
    provideHttpClientTesting(),
    { provide: ActivatedRoute, useValue: routeStub },
  ];
}
