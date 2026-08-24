import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WhatsappService {
  buildLink(phoneNumber: string, message: string): string {
    const digitsOnly = phoneNumber.replace(/[^0-9]/g, '');
    return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
  }

  buildProductMessage(opts: {
    storeName: string;
    productName: string;
    price: number;
    variant?: string | null;
    quantity?: number;
  }): string {
    const price = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(opts.price);

    const lines = [
      `Hola ${opts.storeName}! Quiero comprar:`,
      `${opts.quantity && opts.quantity > 1 ? `${opts.quantity}x ` : ''}${opts.productName}${
        opts.variant ? ` (${opts.variant})` : ''
      }`,
      `Precio: ${price}`,
      `¿Está disponible?`,
    ];
    return lines.join('\n');
  }
}
