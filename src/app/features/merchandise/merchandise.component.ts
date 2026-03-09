import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

interface MerchItem {
  id: number;
  name: string;
  description: string;
  price: number;
  icon: string;
  category: string;
  sizes?: string[];
  colors?: string[];
  image?: string;
}

interface CartItem {
  item: MerchItem;
  quantity: number;
  size?: string;
  color?: string;
}

@Component({
  selector: 'app-merchandise',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, BadgeModule, DropdownModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="merch-container">
      <div class="header-section">
        <h1>Retreat Merchandise</h1>
        <p>NorCal Men's Retreat 2026 — Official Gear</p>
      </div>

      <!-- Category Filter -->
      <div class="category-bar">
        <button *ngFor="let cat of categories" class="cat-btn" [class.active]="activeCategory === cat"
                (click)="filterByCategory(cat)">{{ cat }}</button>
      </div>

      <!-- Product Grid -->
      <div class="product-grid">
        <div class="product-card" *ngFor="let item of filteredItems">
          <div class="product-image">
            <i [class]="'pi ' + item.icon"></i>
            <span class="product-category">{{ item.category }}</span>
          </div>
          <div class="product-info">
            <h3>{{ item.name }}</h3>
            <p class="product-desc">{{ item.description }}</p>
            <div class="product-price">\${{ item.price.toFixed(2) }}</div>

            <div class="product-options">
              <div class="option-row" *ngIf="item.sizes && item.sizes.length > 0">
                <label>Size</label>
                <div class="size-pills">
                  <button *ngFor="let size of item.sizes" class="size-pill"
                          [class.selected]="getSelection(item.id, 'size') === size"
                          (click)="setSelection(item.id, 'size', size)">{{ size }}</button>
                </div>
              </div>
              <div class="option-row" *ngIf="item.colors && item.colors.length > 0">
                <label>Color</label>
                <div class="color-pills">
                  <button *ngFor="let color of item.colors" class="color-pill"
                          [class.selected]="getSelection(item.id, 'color') === color"
                          [style.background]="getColorHex(color)"
                          [title]="color"
                          (click)="setSelection(item.id, 'color', color)"></button>
                </div>
              </div>
            </div>

            <div class="product-actions">
              <div class="qty-control">
                <button pButton icon="pi pi-minus" class="p-button-text p-button-sm"
                        (click)="decrementQty(item.id)" [disabled]="getQty(item.id) <= 1"></button>
                <span class="qty-value">{{ getQty(item.id) }}</span>
                <button pButton icon="pi pi-plus" class="p-button-text p-button-sm"
                        (click)="incrementQty(item.id)"></button>
              </div>
              <button pButton label="Add to Cart" icon="pi pi-shopping-cart"
                      class="add-btn" (click)="addToCart(item)"></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Cart Sidebar -->
      <div class="cart-overlay" *ngIf="cartOpen" (click)="cartOpen = false">
        <div class="cart-panel" (click)="$event.stopPropagation()">
          <div class="cart-header">
            <h2><i class="pi pi-shopping-cart"></i> Your Cart</h2>
            <button pButton icon="pi pi-times" class="p-button-text p-button-rounded"
                    (click)="cartOpen = false"></button>
          </div>
          <div class="cart-empty" *ngIf="cart.length === 0">
            <i class="pi pi-shopping-cart"></i>
            <p>Your cart is empty</p>
          </div>
          <div class="cart-items" *ngIf="cart.length > 0">
            <div class="cart-item" *ngFor="let ci of cart; let i = index">
              <div class="cart-item-icon"><i [class]="'pi ' + ci.item.icon"></i></div>
              <div class="cart-item-details">
                <strong>{{ ci.item.name }}</strong>
                <span class="cart-item-meta" *ngIf="ci.size || ci.color">
                  {{ ci.size ? ci.size : '' }}{{ ci.size && ci.color ? ' / ' : '' }}{{ ci.color ? ci.color : '' }}
                </span>
                <span class="cart-item-price">\${{ (ci.item.price * ci.quantity).toFixed(2) }}</span>
              </div>
              <div class="cart-item-qty">
                <button pButton icon="pi pi-minus" class="p-button-text p-button-sm"
                        (click)="updateCartQty(i, -1)"></button>
                <span>{{ ci.quantity }}</span>
                <button pButton icon="pi pi-plus" class="p-button-text p-button-sm"
                        (click)="updateCartQty(i, 1)"></button>
              </div>
              <button pButton icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm"
                      (click)="removeFromCart(i)"></button>
            </div>
          </div>
          <div class="cart-footer" *ngIf="cart.length > 0">
            <div class="cart-total">
              <span>Total</span>
              <strong>\${{ cartTotal.toFixed(2) }}</strong>
            </div>
            <button pButton label="Checkout" icon="pi pi-credit-card"
                    class="checkout-btn w-full" (click)="checkout()"></button>
            <p class="checkout-note"><i class="pi pi-lock"></i> Secured by Stripe</p>
          </div>
        </div>
      </div>

      <!-- Floating Cart Button -->
      <button class="cart-fab" (click)="cartOpen = true" *ngIf="cart.length > 0">
        <i class="pi pi-shopping-cart"></i>
        <span class="cart-badge">{{ cartItemCount }}</span>
      </button>
    </div>
  `,
  styles: [`
    $dark-teal: #1a3a4a;
    $deep-teal: #1e4d5e;
    $sunset-orange: #d4782f;
    $warm-amber: #c8923a;
    $golden-glow: #e8a832;
    $cream-text: #f0e6d0;

    .merch-container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }

    .header-section {
      text-align: center; padding: 3rem 2rem;
      background: linear-gradient(180deg, #1a3a4a 0%, #2a5a6a 30%, #c8923a 70%, #d4782f 100%);
      color: #f0e6d0; border-radius: 12px; margin-bottom: 2rem;
      box-shadow: 0 4px 12px rgba(26, 58, 74, 0.3);
      h1 { font-size: 2.5rem; font-weight: 700; margin: 0 0 0.75rem 0; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
      p { font-size: 1.1rem; margin: 0; opacity: 0.9; }
    }

    .category-bar {
      display: flex; gap: 0.5rem; justify-content: center;
      margin-bottom: 2rem; flex-wrap: wrap;
    }

    .cat-btn {
      padding: 0.5rem 1.25rem; border-radius: 20px; border: 2px solid #1a3a4a;
      background: transparent; color: #1a3a4a; font-weight: 600; cursor: pointer;
      transition: all 0.2s; font-size: 0.9rem;
      &:hover { background: rgba(26, 58, 74, 0.08); }
      &.active { background: #1a3a4a; color: #f0e6d0; }
    }

    .product-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem; margin-bottom: 2rem;
    }

    .product-card {
      background: white; border-radius: 12px; overflow: hidden;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08); transition: all 0.3s;
      &:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
    }

    .product-image {
      position: relative; height: 180px;
      background: linear-gradient(135deg, #1a3a4a 0%, #2a6a7a 100%);
      display: flex; align-items: center; justify-content: center;
      i { font-size: 4rem; color: rgba(240, 230, 208, 0.8); }
    }

    .product-category {
      position: absolute; top: 0.75rem; right: 0.75rem;
      background: rgba(232, 168, 50, 0.9); color: white;
      padding: 0.2rem 0.65rem; border-radius: 12px;
      font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
    }

    .product-info {
      padding: 1.25rem;
      h3 { margin: 0 0 0.4rem 0; color: #1a3a4a; font-size: 1.1rem; }
      .product-desc { color: #6c757d; font-size: 0.85rem; margin: 0 0 0.75rem 0; line-height: 1.4; }
      .product-price { font-size: 1.4rem; font-weight: 800; color: #d4782f; margin-bottom: 0.75rem; }
    }

    .product-options { margin-bottom: 0.75rem; }

    .option-row {
      margin-bottom: 0.5rem;
      label { display: block; font-size: 0.75rem; font-weight: 600; color: #1a3a4a; margin-bottom: 0.3rem; text-transform: uppercase; letter-spacing: 0.5px; }
    }

    .size-pills { display: flex; gap: 0.35rem; flex-wrap: wrap; }

    .size-pill {
      padding: 0.3rem 0.7rem; border: 1.5px solid #ccc; border-radius: 6px;
      background: white; cursor: pointer; font-size: 0.8rem; font-weight: 600;
      color: #555; transition: all 0.2s;
      &:hover { border-color: #1a3a4a; color: #1a3a4a; }
      &.selected { background: #1a3a4a; color: #f0e6d0; border-color: #1a3a4a; }
    }

    .color-pills { display: flex; gap: 0.4rem; }

    .color-pill {
      width: 26px; height: 26px; border-radius: 50%; border: 2.5px solid #ddd;
      cursor: pointer; transition: all 0.2s;
      &:hover { transform: scale(1.15); }
      &.selected { border-color: #1a3a4a; box-shadow: 0 0 0 2px #e8a832; }
    }

    .product-actions {
      display: flex; align-items: center; gap: 0.75rem;
    }

    .qty-control {
      display: flex; align-items: center; gap: 0.25rem;
      border: 1px solid #ddd; border-radius: 8px; padding: 0.15rem;
      .qty-value { min-width: 28px; text-align: center; font-weight: 700; color: #1a3a4a; }
    }

    .add-btn {
      flex: 1;
    }

    ::ng-deep .merch-container .add-btn.p-button {
      background: linear-gradient(135deg, #1a3a4a 0%, #1e4d5e 100%); border: none;
      &:hover { background: linear-gradient(135deg, #d4782f 0%, #e8a832 100%); }
    }

    /* Cart FAB */
    .cart-fab {
      position: fixed; bottom: 2rem; right: 2rem; width: 60px; height: 60px;
      border-radius: 50%; border: none; cursor: pointer;
      background: linear-gradient(135deg, #d4782f, #e8a832);
      color: white; font-size: 1.5rem; box-shadow: 0 4px 16px rgba(212, 120, 47, 0.4);
      display: flex; align-items: center; justify-content: center;
      transition: all 0.3s; z-index: 999;
      &:hover { transform: scale(1.1); box-shadow: 0 6px 24px rgba(212, 120, 47, 0.5); }
    }

    .cart-badge {
      position: absolute; top: -4px; right: -4px;
      background: #e53935; color: white; font-size: 0.75rem; font-weight: 700;
      min-width: 22px; height: 22px; border-radius: 11px;
      display: flex; align-items: center; justify-content: center;
      padding: 0 4px;
    }

    /* Cart Overlay */
    .cart-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.4); z-index: 1100;
      display: flex; justify-content: flex-end;
      animation: fadeIn 0.2s ease;
    }

    .cart-panel {
      width: 100%; max-width: 420px; background: white; height: 100%;
      display: flex; flex-direction: column;
      animation: slideLeft 0.25s ease;
    }

    .cart-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1.25rem 1.5rem;
      background: linear-gradient(135deg, #1a3a4a 0%, #1e4d5e 100%); color: #f0e6d0;
      h2 { margin: 0; font-size: 1.2rem; display: flex; align-items: center; gap: 0.5rem;
        i { color: #e8a832; }
      }
    }

    ::ng-deep .cart-header .p-button.p-button-text { color: #f0e6d0 !important; }

    .cart-empty {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; justify-content: center; color: #999;
      i { font-size: 3rem; margin-bottom: 1rem; }
      p { font-size: 1.1rem; }
    }

    .cart-items { flex: 1; overflow-y: auto; padding: 1rem; }

    .cart-item {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.75rem; border-radius: 8px; margin-bottom: 0.5rem;
      background: rgba(26, 58, 74, 0.03);
      transition: background 0.2s;
      &:hover { background: rgba(26, 58, 74, 0.06); }
    }

    .cart-item-icon {
      width: 44px; height: 44px; border-radius: 10px;
      background: linear-gradient(135deg, #1a3a4a, #2a6a7a);
      display: flex; align-items: center; justify-content: center;
      i { color: #f0e6d0; font-size: 1.1rem; }
    }

    .cart-item-details {
      flex: 1; display: flex; flex-direction: column;
      strong { color: #1a3a4a; font-size: 0.9rem; }
      .cart-item-meta { font-size: 0.75rem; color: #999; }
      .cart-item-price { font-size: 0.85rem; font-weight: 700; color: #d4782f; }
    }

    .cart-item-qty {
      display: flex; align-items: center; gap: 0.15rem;
      span { min-width: 20px; text-align: center; font-weight: 700; font-size: 0.9rem; color: #1a3a4a; }
    }

    .cart-footer {
      padding: 1.25rem 1.5rem; border-top: 1px solid #eee;
    }

    .cart-total {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 1rem;
      span { font-size: 1rem; color: #666; }
      strong { font-size: 1.5rem; color: #d4782f; }
    }

    ::ng-deep .cart-footer .checkout-btn.p-button {
      background: linear-gradient(135deg, #d4782f, #e8a832) !important; border: none;
      font-weight: 700; font-size: 1.05rem; padding: 0.75rem;
      &:hover { background: linear-gradient(135deg, #1a3a4a 0%, #1e4d5e 100%) !important; }
    }

    .checkout-note {
      text-align: center; font-size: 0.8rem; color: #999; margin: 0.75rem 0 0;
      i { margin-right: 0.25rem; }
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }

    @media (max-width: 768px) {
      .header-section { padding: 2rem 1rem; h1 { font-size: 1.8rem; } }
      .product-grid { grid-template-columns: 1fr; }
      .cart-panel { max-width: 100%; }
    }
  `]
})
export class MerchandiseComponent {
  private messageService: MessageService;

  cartOpen = false;
  activeCategory = 'All';
  cart: CartItem[] = [];

  private selections: Map<number, { size?: string; color?: string; qty: number }> = new Map();

  categories = ['All', 'Apparel', 'Drinkware', 'Accessories'];

  merchItems: MerchItem[] = [
    {
      id: 1, name: 'Retreat T-Shirt', category: 'Apparel', price: 25.00,
      description: 'Official NorCal Men\'s Retreat 2026 t-shirt. Soft cotton blend with retreat logo.',
      icon: 'pi-star', sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
      colors: ['Black', 'Navy', 'Forest']
    },
    {
      id: 2, name: 'Retreat Hoodie', category: 'Apparel', price: 45.00,
      description: 'Heavyweight hoodie with embroidered retreat logo. Perfect for cool redwood evenings.',
      icon: 'pi-cloud', sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
      colors: ['Black', 'Charcoal', 'Navy']
    },
    {
      id: 3, name: 'Retreat Cap', category: 'Apparel', price: 20.00,
      description: 'Adjustable snapback cap with embroidered retreat logo.',
      icon: 'pi-sun', colors: ['Black', 'Navy', 'Khaki']
    },
    {
      id: 4, name: 'Ceramic Mug', category: 'Drinkware', price: 15.00,
      description: '15oz ceramic mug with retreat logo. Dishwasher and microwave safe.',
      icon: 'pi-heart',
      colors: ['White', 'Black']
    },
    {
      id: 5, name: 'Travel Tumbler', category: 'Drinkware', price: 28.00,
      description: '20oz insulated stainless steel tumbler. Keeps drinks hot 6hrs, cold 12hrs.',
      icon: 'pi-flag',
      colors: ['Black', 'Navy', 'Forest']
    },
    {
      id: 6, name: 'Water Bottle', category: 'Drinkware', price: 22.00,
      description: '24oz BPA-free water bottle with retreat branding. Clip-on carabiner included.',
      icon: 'pi-bolt',
      colors: ['Black', 'Navy']
    },
    {
      id: 7, name: 'Sticker Pack', category: 'Accessories', price: 8.00,
      description: 'Set of 6 vinyl die-cut stickers featuring retreat designs. Weatherproof.',
      icon: 'pi-palette'
    },
    {
      id: 8, name: 'Retreat Pen Set', category: 'Accessories', price: 10.00,
      description: 'Set of 3 premium ballpoint pens with retreat branding. Blue ink.',
      icon: 'pi-pencil'
    },
    {
      id: 9, name: 'Wristband', category: 'Accessories', price: 5.00,
      description: 'Silicone wristband with "Standing in the Gap" engraving.',
      icon: 'pi-circle',
      colors: ['Black', 'Navy', 'Orange']
    },
    {
      id: 10, name: 'Tote Bag', category: 'Accessories', price: 18.00,
      description: 'Durable canvas tote bag with retreat logo. Great for carrying your retreat essentials.',
      icon: 'pi-briefcase',
      colors: ['Natural', 'Black']
    }
  ];

  constructor(messageService: MessageService) {
    this.messageService = messageService;
  }

  get filteredItems(): MerchItem[] {
    if (this.activeCategory === 'All') return this.merchItems;
    return this.merchItems.filter(item => item.category === this.activeCategory);
  }

  get cartTotal(): number {
    return this.cart.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);
  }

  get cartItemCount(): number {
    return this.cart.reduce((sum, ci) => sum + ci.quantity, 0);
  }

  filterByCategory(cat: string): void {
    this.activeCategory = cat;
  }

  getSelection(itemId: number, key: 'size' | 'color'): string | undefined {
    return this.selections.get(itemId)?.[key];
  }

  setSelection(itemId: number, key: 'size' | 'color', value: string): void {
    const current = this.selections.get(itemId) || { qty: 1 };
    current[key] = value;
    this.selections.set(itemId, current);
  }

  getQty(itemId: number): number {
    return this.selections.get(itemId)?.qty || 1;
  }

  incrementQty(itemId: number): void {
    const current = this.selections.get(itemId) || { qty: 1 };
    current.qty = (current.qty || 1) + 1;
    this.selections.set(itemId, current);
  }

  decrementQty(itemId: number): void {
    const current = this.selections.get(itemId) || { qty: 1 };
    if (current.qty > 1) current.qty--;
    this.selections.set(itemId, current);
  }

  addToCart(item: MerchItem): void {
    const sel = this.selections.get(item.id) || { qty: 1 };

    if (item.sizes && item.sizes.length > 0 && !sel.size) {
      this.messageService.add({ severity: 'warn', summary: 'Select Size', detail: 'Please select a size' });
      return;
    }
    if (item.colors && item.colors.length > 0 && !sel.color) {
      this.messageService.add({ severity: 'warn', summary: 'Select Color', detail: 'Please select a color' });
      return;
    }

    const existing = this.cart.find(ci =>
      ci.item.id === item.id && ci.size === sel.size && ci.color === sel.color
    );

    if (existing) {
      existing.quantity += sel.qty || 1;
    } else {
      this.cart.push({ item, quantity: sel.qty || 1, size: sel.size, color: sel.color });
    }

    this.messageService.add({
      severity: 'success', summary: 'Added to Cart',
      detail: `${item.name} added to your cart`
    });
  }

  updateCartQty(index: number, delta: number): void {
    this.cart[index].quantity += delta;
    if (this.cart[index].quantity <= 0) this.cart.splice(index, 1);
  }

  removeFromCart(index: number): void {
    this.cart.splice(index, 1);
  }

  checkout(): void {
    this.messageService.add({
      severity: 'info', summary: 'Coming Soon',
      detail: 'Merchandise checkout will be available soon!'
    });
  }

  getColorHex(color: string): string {
    const map: Record<string, string> = {
      'Black': '#222',
      'Navy': '#1a2744',
      'Forest': '#1a4a2a',
      'Charcoal': '#444',
      'White': '#f5f5f5',
      'Khaki': '#c3b091',
      'Orange': '#d4782f',
      'Natural': '#e8dcc8'
    };
    return map[color] || '#999';
  }
}
