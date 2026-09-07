import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild, inject } from '@angular/core';
import { BrandLogoComponent } from './brand-logo';

@Component({
  selector: 'app-particle-logo',
  imports: [BrandLogoComponent],
  template: `<div class="logo-field" aria-label="GOZU Sistemas Digitales"><canvas #surface aria-hidden="true"></canvas><app-brand-logo></app-brand-logo></div>`,
  styles: [`
    :host { display:block; width:270px; max-width:100%; }
    .logo-field { position:relative; height:94px; display:grid; place-items:center; }
    canvas { position:absolute; inset:0; width:100%; height:100%; z-index:1; }
    app-brand-logo { pointer-events:none; }
    :host(.ready) app-brand-logo { opacity:0; }
    @media(prefers-reduced-motion:reduce) { canvas { display:none; } :host(.ready) app-brand-logo { opacity:1; } }
  `],
})
export class ParticleLogoComponent implements AfterViewInit, OnDestroy {
  @ViewChild('surface') surface!: ElementRef<HTMLCanvasElement>;
  private readonly zone = inject(NgZone);
  private readonly host = inject(ElementRef<HTMLElement>);
  private dispose = () => {};
  private destroyed = false;

  async ngAfterViewInit() {
    if (matchMedia('(max-width: 767px), (prefers-reduced-motion: reduce)').matches) return;
    await document.fonts.ready;
    if (!this.destroyed) this.zone.runOutsideAngular(() => this.start());
  }

  private start() {
    const canvas = this.surface.nativeElement;
    const context = canvas.getContext('2d');
    const mask = document.createElement('canvas');
    mask.width = 270; mask.height = 94;
    const ink = mask.getContext('2d', { willReadFrequently: true });
    if (!context || !ink) return;
    // Reconstruct the approved open G, blue terminal and Manrope wordmark.
    ink.strokeStyle = '#111827'; ink.lineWidth = 6;
    ink.beginPath(); ink.arc(58, 47, 22, .65, Math.PI * 2 - .75); ink.stroke();
    ink.fillStyle = '#3f69e1'; ink.fillRect(57, 46, 24, 6); ink.fillRect(75, 46, 6, 19);
    ink.fillStyle = '#111827'; ink.font = '800 40px Manrope, sans-serif';
    ink.fillText('OZU', 91, 61);
    const end = 91 + ink.measureText('OZU').width;
    ink.fillStyle = '#e44747'; ink.beginPath(); ink.arc(end + 8, 58, 3.8, 0, Math.PI * 2); ink.fill();
    const pixels = ink.getImageData(0, 0, 270, 94).data;
    const dots: { x:number; y:number; tx:number; ty:number; vx:number; vy:number; color:string }[] = [];
    for (let y = 16; y < 78; y += 2.4) for (let x = 29; x < 244; x += 2.4) {
      const i = (Math.floor(y) * 270 + Math.floor(x)) * 4;
      if (pixels[i + 3] < 150) continue;
      dots.push({ x:135 + (Math.random()-.5)*260, y:47+(Math.random()-.5)*90, tx:x, ty:y, vx:0, vy:0, color:`rgb(${pixels[i]},${pixels[i+1]},${pixels[i+2]})` });
    }
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = 270*dpr; canvas.height = 94*dpr;
    context.setTransform(dpr,0,0,dpr,0,0);
    this.host.nativeElement.classList.add('ready');
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, last = 0, visible = true;
    let mouse: {x:number;y:number} | undefined;
    const draw = (time:number) => {
      frame = 0;
      if (!visible || document.hidden || motion.matches) return;
      const dt = Math.min((time-last)/16.67 || 1, 2); last = time;
      context.clearRect(0,0,270,94);
      let moving = false;
      for (const p of dots) {
        p.vx += (p.tx-p.x)*.024*dt; p.vy += (p.ty-p.y)*.024*dt;
        if (mouse) {
          const dx=p.x-mouse.x, dy=p.y-mouse.y, distance=Math.hypot(dx,dy);
          if (distance>.1 && distance<37) {
            const force=(1-distance/37)*1.5*dt;
            p.vx+=dx/distance*force; p.vy+=dy/distance*force;
          }
        }
        p.vx*=Math.pow(.79,dt); p.vy*=Math.pow(.79,dt);
        p.x+=p.vx*dt; p.y+=p.vy*dt;
        moving ||= Math.abs(p.tx-p.x)+Math.abs(p.ty-p.y)+Math.abs(p.vx)+Math.abs(p.vy)>.08;
        context.fillStyle=p.color; context.beginPath(); context.arc(p.x,p.y,1.05,0,Math.PI*2); context.fill();
      }
      if (moving || mouse) frame=requestAnimationFrame(draw);
    };
    const resume = () => {
      if (!visible || document.hidden || motion.matches) { cancelAnimationFrame(frame); frame=0; mouse=undefined; }
      else if (!frame) { last=performance.now(); frame=requestAnimationFrame(draw); }
    };
    const move = (event:PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const rect=canvas.getBoundingClientRect();
      mouse={x:(event.clientX-rect.left)*270/rect.width,y:(event.clientY-rect.top)*94/rect.height}; resume();
    };
    const leave = () => { mouse=undefined; resume(); };
    const observer = new IntersectionObserver(([entry]) => { visible=entry.isIntersecting; resume(); });
    observer.observe(canvas);
    canvas.addEventListener('pointermove',move,{passive:true}); canvas.addEventListener('pointerleave',leave);
    document.addEventListener('visibilitychange',resume); motion.addEventListener('change',resume);
    resume();
    this.dispose=()=> { cancelAnimationFrame(frame); observer.disconnect(); canvas.removeEventListener('pointermove',move); canvas.removeEventListener('pointerleave',leave); document.removeEventListener('visibilitychange',resume); motion.removeEventListener('change',resume); };
  }
  ngOnDestroy() { this.destroyed=true; this.dispose(); }
}
