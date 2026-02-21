import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MenuVisibilityService {
  private readonly http = inject(HttpClient);
  private hiddenItemsSubject = new BehaviorSubject<Set<string>>(new Set<string>());

  hiddenItems: Observable<Set<string>> = this.hiddenItemsSubject.asObservable();

  constructor() {
    this.loadFromApi();
  }

  getHiddenItems(): Set<string> {
    return new Set(this.hiddenItemsSubject.value);
  }

  isVisible(key: string): boolean {
    return !this.hiddenItemsSubject.value.has(key);
  }

  toggleItem(key: string): void {
    const current = this.getHiddenItems();
    if (current.has(key)) {
      current.delete(key);
    } else {
      current.add(key);
    }
    this.update(current);
  }

  hideItem(key: string): void {
    const current = this.getHiddenItems();
    current.add(key);
    this.update(current);
  }

  showItem(key: string): void {
    const current = this.getHiddenItems();
    current.delete(key);
    this.update(current);
  }

  showAll(): void {
    this.update(new Set<string>());
  }

  hideAll(keys: string[]): void {
    this.update(new Set<string>(keys));
  }

  resetToDefault(): void {
    this.showAll();
  }

  private update(hidden: Set<string>): void {
    this.hiddenItemsSubject.next(hidden);
    this.saveToApi(hidden);
  }

  private loadFromApi(): void {
    this.http.get<string[]>('/api/menu-config/hidden').subscribe({
      next: (keys) => {
        this.hiddenItemsSubject.next(new Set<string>(keys));
      },
      error: (err) => {
        console.warn('Failed to load menu visibility from API:', err);
      }
    });
  }

  private saveToApi(hidden: Set<string>): void {
    this.http.put<string[]>('/api/menu-config/hidden', [...hidden]).subscribe({
      error: (err) => {
        console.warn('Failed to save menu visibility to API:', err);
      }
    });
  }
}
