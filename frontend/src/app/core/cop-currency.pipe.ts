import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'copCurrency' })
export class CopCurrencyPipe implements PipeTransform {
  private formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });

  transform(value: number): string {
    return this.formatter.format(value ?? 0);
  }
}
