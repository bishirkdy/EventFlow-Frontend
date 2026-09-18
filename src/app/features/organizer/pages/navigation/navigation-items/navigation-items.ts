import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavigationItemService } from '../../../../../core/services/navigation-item/navigation-item.service';
import { ToastrService } from 'ngx-toastr';
import { NavigationItemModel } from '../../../../../core/models/navigation-item/navigation-item.model';
import { CreateNavigationItemRequest } from '../../../../../core/models/navigation-item/create-navigation-item';
import { UpdateNavigationItemRequest } from '../../../../../core/models/navigation-item/update-navigation-item';

@Component({
  selector: 'app-navigation-items',
  imports: [],
  templateUrl: './navigation-items.html',
  styleUrl: './navigation-items.css',
})
export class NavigationItems {
  private route = inject(ActivatedRoute);
  private navigationItemService = inject(NavigationItemService);
  private toastr = inject(ToastrService);

  items = signal<NavigationItemModel[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.loadItems();
  }

  private getMenuId(): string | null {
    return this.route.snapshot.paramMap.get('menuId');
  }

  // GET
  loadItems(): void {
    const menuId = this.getMenuId();

    if (!menuId) {
      this.toastr.error('Navigation menu ID not found.');
      this.loading.set(false);
      return;
    }

    this.navigationItemService.getItems(menuId).subscribe({
      next: response => {
        this.items.set(response.data);
        this.loading.set(false);
      },
      error: error => {
        console.error(error);
        this.toastr.error('Failed to load navigation items.');
        this.loading.set(false);
      },
    });
  }

  // GET BY ID
  getItem(itemId: string): void {
    const menuId = this.getMenuId();

    if (!menuId) {
      this.toastr.error('Navigation menu ID not found.');
      return;
    }

    this.navigationItemService
      .getItemById(menuId, itemId)
      .subscribe({
        next: response => {
          console.log(response.data);
        },
        error: error => {
          console.error(error);
          this.toastr.error('Failed to load navigation item.');
        },
      });
  }

  // CREATE
  createItem(request: CreateNavigationItemRequest): void {
    const menuId = this.getMenuId();

    if (!menuId) {
      this.toastr.error('Navigation menu ID not found.');
      return;
    }

    this.navigationItemService
      .createItem(menuId, request)
      .subscribe({
        next: response => {
          this.items.update(items => [
            ...items,
            response.data,
          ]);

          this.toastr.success(
            'Navigation item created successfully.'
          );
        },
        error: error => {
          console.error(error);
          this.toastr.error(
            'Failed to create navigation item.'
          );
        },
      });
  }

  // UPDATE
  updateItem(
    itemId: string,
    request: UpdateNavigationItemRequest
  ): void {
    const menuId = this.getMenuId();

    if (!menuId) {
      this.toastr.error('Navigation menu ID not found.');
      return;
    }

    this.navigationItemService
      .updateItem(menuId, itemId, request)
      .subscribe({
        next: response => {
          this.items.update(items =>
            items.map(item =>
              item.id === itemId
                ? response.data
                : item
            )
          );

          this.toastr.success(
            'Navigation item updated successfully.'
          );
        },
        error: error => {
          console.error(error);
          this.toastr.error(
            'Failed to update navigation item.'
          );
        },
      });
  }

  // DELETE
  deleteItem(itemId: string): void {
    const menuId = this.getMenuId();

    if (!menuId) {
      this.toastr.error('Navigation menu ID not found.');
      return;
    }

    this.navigationItemService
      .deleteItem(menuId, itemId)
      .subscribe({
        next: () => {
          this.items.update(items =>
            items.filter(item => item.id !== itemId)
          );

          this.toastr.success(
            'Navigation item deleted successfully.'
          );
        },
        error: error => {
          console.error(error);
          this.toastr.error(
            'Failed to delete navigation item.'
          );
        },
      });
  }
}
