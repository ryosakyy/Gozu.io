import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'app-brand-logo',
  templateUrl: './brand-logo.html',
  styleUrl: './brand-logo.scss',
})
export class BrandLogoComponent {
  @Input() inverse = false;
  @Input() compact = false;
  @Input() symbolOnly = false;
  @HostBinding('class.inverse') get isInverse() { return this.inverse; }
  @HostBinding('class.compact') get isCompact() { return this.compact; }
  @HostBinding('class.symbol-only') get isSymbolOnly() { return this.symbolOnly; }
}
