import { Injectable } from '@angular/core';
import { getFontOption } from './fonts';

@Injectable({ providedIn: 'root' })
export class FontLoaderService {
  private loaded = new Set<string>();

  ensureLoaded(fontKey: string | null | undefined): void {
    const font = getFontOption(fontKey);
    if (this.loaded.has(font.key)) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = font.googleFontsUrl;
    link.dataset['fontKey'] = font.key;
    document.head.appendChild(link);
    this.loaded.add(font.key);
  }
}
