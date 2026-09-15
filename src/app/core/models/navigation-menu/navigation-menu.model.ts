export interface NavigationMenuModel {
  id: string;
  eventId: string;
  name: string;
  location: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateNavigationMenuRequest {
  name: string;
  location: string;
}

export interface UpdateNavigationMenuRequest {
  name: string;
  location: string;
}