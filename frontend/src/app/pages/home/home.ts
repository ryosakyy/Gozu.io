import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of, timeout } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { Lead, ServiceOffering } from '../../core/models';
import { BrandLogoComponent } from '../../shared/brand-logo/brand-logo';
import { ParticleLogoComponent } from '../../shared/brand-logo/particle-logo';
import type { gsap } from 'gsap';
import type { ScrollSmoother } from 'gsap/ScrollSmoother';

interface GozuPlan {
  name: string; audience: string; monthlyPrice: number; setupPrice: number; featured?: boolean;
  badge: string; description: string; features: string[];
}
interface WebPlan { name: string; price: number; time: string; description: string; features: string[]; featured?: boolean; }
interface DemoSlide {
  kicker: string; title: string; description: string; image: string; alt: string;
  tags: string[]; key: string;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, ReactiveFormsModule, BrandLogoComponent, ParticleLogoComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomePage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('heroParticles') private heroParticles?: ElementRef<HTMLCanvasElement>;
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  private animationContext?: gsap.Context;
  private motionMedia?: ReturnType<typeof gsap.matchMedia>;
  private smoother?: ScrollSmoother;
  private navigationController?: AbortController;
  private destroyParticleField?: () => void;
  private destroyed = false;
  private refreshScroll?: () => void;
  readonly whatsapp = '51967953115';
  readonly heroTitlePrimary = Array.from('WEB QUE VENDE.');
  readonly heroTitleSecondary = Array.from('Software que opera.');
  readonly badgeLetters = Array.from('GOZU \u00b7 SOFTWARE + WEB \u00b7 PER\u00da \u00b7').map((character, index, letters) => ({
    character: character === ' ' ? '\u00a0' : character,
    angle: (360 / letters.length) * index,
  }));
  menuOpen = signal(false);
  submitting = signal(false);
  sent = signal(false);
  quoteError = signal(false);
  quoteWhatsAppUrl = signal('');
  annualBilling = signal(false);
  activeDemo = signal(0);
  selectedModules = signal<string[]>([]);
  private demoTouchStartX?: number;
  services = signal<ServiceOffering[]>([
    { name: 'Web corporativa', category: 'Presencia digital', description: 'Sitios rápidos, claros y preparados para generar consultas.', monthlyPrice: 89 },
    { name: 'Ecommerce y catálogo QR', category: 'Ventas', description: 'Productos, filtros, carrito, pedidos y conexión con inventario.', monthlyPrice: 149 },
    { name: 'POS e inventario', category: 'Operación', description: 'Caja, stock, movimientos, alertas, usuarios y reportes.', monthlyPrice: 189 },
    { name: 'SaaS a medida', category: 'Desarrollo', description: 'Arquitectura multiempresa y módulos según tus procesos.', monthlyPrice: 399 },
  ]);
  readonly modules = ['Landing page', 'Web corporativa', 'Ecommerce', 'Catálogo administrable', 'Blog o CMS', 'SEO técnico', 'Google Analytics', 'Formularios y CRM', 'Sistema de gestión', 'POS y ventas', 'Productos e inventario', 'Compras y proveedores', 'Portal de clientes', 'Automatización de procesos', 'Integración con API', 'Clientes e historial', 'Aplicación para equipo de campo', 'Caja y pagos', 'Roles y permisos', 'Paneles y reportes', 'Sucursales', 'Facturación SUNAT'];
  readonly technologies = ['Angular', 'React', 'TypeScript', 'Bootstrap', 'Java', 'Spring Boot', 'PostgreSQL', 'Docker', 'REST APIs', 'Cloud'];
  readonly demoSlides: DemoSlide[] = [
    { kicker: 'EJEMPLO · INVENTARIO Y POS', title: 'Stock, ventas y caja bajo control.', description: 'Productos, movimientos, alertas, compras, permisos y reportes en una experiencia clara para el equipo.', image: '/images/inventory.webp', alt: 'Ejemplo de inventario, ventas y control de stock', tags: ['Inventario', 'POS', 'Reportes'], key: 'inventario' },
    { kicker: 'EJEMPLO · POLLERÍA Y RESTAURANTE', title: 'Pedidos, cocina y entrega conectados.', description: 'Una operación rápida desde la toma del pedido hasta producción, cobro y seguimiento del cliente.', image: '/images/restaurant.webp', alt: 'Ejemplo de pedidos y operación para una pollería o restaurante', tags: ['Pedidos', 'Cocina', 'Delivery'], key: 'polleria' },
    { kicker: 'EJEMPLO · AGENDA Y SERVICIOS', title: 'Reservas sin desorden ni cruces.', description: 'Agenda, profesionales, clientes, recordatorios y estados visibles desde un solo lugar.', image: '/images/barber.webp', alt: 'Ejemplo de agenda y atención para barberías', tags: ['Reservas', 'Clientes', 'WhatsApp'], key: 'agenda' },
  ];
  readonly webPlans: WebPlan[] = [
    { name: 'Landing que convierte', price: 890, time: '7–10 días hábiles', description: 'Una campaña o servicio explicado con claridad y una acción principal medible.', features: ['Estrategia y estructura UX', 'Diseño responsive propio', 'Copy base y formulario', 'SEO técnico, analítica y publicación'] },
    { name: 'Web corporativa', price: 1690, time: '2–3 semanas', featured: true, description: 'El centro digital de una empresa: servicios, confianza, contenido y captación.', features: ['Hasta 7 páginas o secciones', 'CMS o contenido administrable', 'Casos, blog o catálogo', 'GA4, Search Console y eventos clave'] },
    { name: 'Ecommerce conectado', price: 2990, time: '3–5 semanas', description: 'Catálogo, pedidos y pagos con una operación preparada para crecer.', features: ['Productos, variantes y filtros', 'Carrito, checkout y pagos', 'Inventario o sistema conectado', 'Capacitación y lanzamiento guiado'] },
  ];
  readonly webMetrics = [
    { code: 'LCP', target: '≤ 2.5 s', label: 'Carga principal', detail: 'Meta técnica recomendada por Core Web Vitals.' },
    { code: 'INP', target: '≤ 200 ms', label: 'Respuesta al usuario', detail: 'Interacciones ágiles en dispositivos reales.' },
    { code: 'CLS', target: '≤ 0.1', label: 'Estabilidad visual', detail: 'Contenido que no salta mientras carga.' },
    { code: 'EVENTOS', target: '100%', label: 'Acciones medibles', detail: 'WhatsApp, formularios, planes y oportunidades.' },
  ];
  readonly webModules = ['Landing page', 'Web corporativa', 'Ecommerce', 'Catálogo administrable', 'Blog o CMS', 'SEO técnico', 'Google Analytics', 'Search Console', 'Formularios y CRM', 'WhatsApp medido', 'Hosting y mantenimiento', 'Optimización continua'];
  readonly plans: GozuPlan[] = [
    { name: 'Base operativa', audience: 'Para ordenar un proceso principal', monthlyPrice: 149, setupPrice: 990, badge: 'Empieza enfocado', description: 'Configuramos módulos reutilizables alrededor del flujo que más control necesita.', features: ['Hasta 5 usuarios y 1 local', 'Roles y reportes esenciales', 'Carga inicial guiada y capacitación', 'Hosting, backups y soporte'] },
    { name: 'Operación conectada', audience: 'Para trabajar de punta a punta', monthlyPrice: 299, setupPrice: 2490, featured: true, badge: 'Mejor relación valor', description: 'Conectamos áreas, datos y automatizaciones sobre una base preparada para evolucionar.', features: ['Hasta 15 usuarios y 3 locales', 'Permisos, trazabilidad y paneles', 'Una integración prioritaria según alcance', 'Soporte prioritario y evolución mensual'] },
    { name: 'Evolución a medida', audience: 'Para procesos únicos o exigentes', monthlyPrice: 599, setupPrice: 5900, badge: 'Arquitectura propia', description: 'Diseño técnico, personalizaciones e integraciones para una operación que no encaja en un sistema genérico.', features: ['Usuarios, sedes y flujos según diagnóstico', 'Backend, frontend y datos personalizados', 'APIs, SUNAT o pagos según alcance', 'Roadmap, monitoreo y soporte continuo'] },
  ];
  quoteForm = this.fb.nonNullable.group({
    name: ['', Validators.required], businessName: ['', Validators.required], phone: ['', Validators.required],
    city: ['Lima'], industry: ['Software a medida o automatización'], usersRange: ['1 a 3 usuarios'],
    locationsRange: ['1 local'], urgency: ['Quiero evaluar la idea'], preferredPlan: ['A medida · Diagnóstico y propuesta'],
    currentSystem: ['Excel, cuaderno o WhatsApp'], volumeRange: ['Hasta 500 operaciones al mes'],
    budgetRange: ['Necesito que GOZU lo estime'], details: [''],
  });

  ngOnInit() {
    this.api.publicServices()
      .pipe(catchError(() => of(null)))
      .subscribe((data) => {
        if (!data) return;
        this.services.set(data);
        window.setTimeout(() => this.refreshScroll?.(), 0);
      });
    this.api.trackSiteEvent('PAGE_VIEW', 'Inicio GOZU', window.location.pathname).subscribe({ error: () => undefined });
  }
  ngAfterViewInit() {
    this.zone.runOutsideAngular(async () => {
      this.setupAnchorNavigation();
      if (window.matchMedia('(max-width: 767px), (prefers-reduced-motion: reduce)').matches) {
        window.requestAnimationFrame(() => this.scrollToHash(window.location.hash, false));
        return;
      }
      const [{ gsap }, { ScrollTrigger }, { ScrollSmoother }] = await Promise.all([
        import('gsap'), import('gsap/ScrollTrigger'), import('gsap/ScrollSmoother'),
      ]);
      if (this.destroyed) return;
      this.refreshScroll = () => ScrollTrigger.refresh();
      this.setupHeroParticleField();
      gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
      this.setupAnchorNavigation();
      this.motionMedia = gsap.matchMedia();
      this.motionMedia.add({
        animate: '(prefers-reduced-motion: no-preference)',
        desktop: '(min-width: 768px)',
        wide: '(min-width: 1280px)',
        precisePointer: '(hover: hover) and (pointer: fine)',
      }, (media) => {
        const conditions = media.conditions as { animate: boolean; desktop: boolean; wide: boolean; precisePointer: boolean };
        if (!conditions.animate || !conditions.desktop) return;

        this.animationContext = gsap.context(() => {
          const belowInitialViewport = (element: HTMLElement) => element.getBoundingClientRect().top > window.innerHeight * .92;
          const premiumDesktop = conditions.desktop && conditions.precisePointer && ScrollTrigger.isTouch === 0;

          if (premiumDesktop) {
            this.smoother = ScrollSmoother.create({
              wrapper: '#smooth-wrapper',
              content: '#smooth-content',
              smooth: .92,
              smoothTouch: 0,
              normalizeScroll: false,
              ignoreMobileResize: true,
            });
            document.documentElement.classList.add('has-smooth-scroll');
          }

          gsap.from('.site-header', { y: -8, opacity: 0, duration: .25, ease: 'power3.out' });
          gsap.from('.site-header .brand-logo-link', { x: -6, opacity: 0, duration: .28, ease: 'power3.out' });
          gsap.from('.site-header nav a, .site-header .header-cta', { y: -10, opacity: 0, duration: .62, stagger: .045, delay: .22, ease: 'power3.out' });
          const primaryLetters = '.hero-letters-primary .hero-letter';
          const secondaryLetters = '.hero-letters-secondary .hero-letter';
          const primaryLine = this.host.nativeElement.querySelector('.hero-letters-primary') as HTMLElement | null;
          const secondaryLine = this.host.nativeElement.querySelector('.hero-letters-secondary') as HTMLElement | null;
          const heroIntro = gsap.timeline({ delay: .04 });
          heroIntro
            .from(primaryLetters, {
              y: '.18em', opacity: 0, duration: .18,
              stagger: { each: .055, from: 'start' }, ease: 'power2.out',
            }, 0)
            .fromTo('.hero-primary-caret', { x: 0, opacity: 1 }, {
              x: () => Math.max(0, (primaryLine?.clientWidth ?? 2) - 2), duration: .78,
              ease: `steps(${this.heroTitlePrimary.length})`,
            }, 0)
            .to('.hero-primary-caret', { opacity: 0, duration: .08 }, .82)
            .from(secondaryLetters, {
              y: '.2em', opacity: 0, duration: .18,
              stagger: { each: .052, from: 'start' }, ease: 'power2.out',
            }, .84)
            .fromTo('.hero-secondary-caret', { x: 0, opacity: 1 }, {
              x: () => Math.max(0, (secondaryLine?.clientWidth ?? 2) - 2), duration: .98,
              ease: `steps(${this.heroTitleSecondary.length})`, immediateRender: false,
            }, .84)
            .to('.hero-secondary-caret', { opacity: 0, duration: .28, ease: 'power2.out' }, 1.86)
            .from('.hero-particles', { opacity: 0, duration: 1.25, ease: 'power2.out' }, .08);
          gsap.from('.hero-copy > :not(h1)', { y: 12, duration: .4, stagger: .03, ease: 'power3.out' });
          gsap.from('[data-hero-layer]', { y: 20, duration: .5, stagger: .04, ease: 'power4.out' });
          gsap.from('.hero-collage figcaption, .collage-badge', { y: 30, scale: .96, opacity: 0, duration: .9, stagger: .12, delay: .72, ease: 'power4.out' });

          const header = this.host.nativeElement.querySelector('.site-header') as HTMLElement | null;
          ScrollTrigger.create({
            trigger: '#smooth-content', start: 'top top', end: 'bottom bottom',
            onUpdate: (self) => {
              header?.classList.toggle('is-scrolled', self.scroll() > 24);
              document.documentElement.style.setProperty('--page-progress', `${self.progress * 100}%`);
            },
          });

          if (premiumDesktop && conditions.wide) {
            gsap.to('[data-hero-layer="main"]', { yPercent: -5, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .8 } });
            gsap.to('[data-hero-layer="top"]', { yPercent: 7, xPercent: -2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .9 } });
            gsap.to('[data-hero-layer="bottom"]', { yPercent: -6, xPercent: 2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });

            gsap.utils.toArray<HTMLElement>('[data-editorial-image]').forEach((figure, index) => {
              if (figure.closest('.demo-gallery')) return;
              const image = figure.querySelector('img');
              if (!image) return;
              gsap.fromTo(image,
                { yPercent: index % 2 ? -4 : -5, scale: 1.02 },
                { yPercent: index % 2 ? 4 : 5, scale: 1.07, ease: 'none', scrollTrigger: { trigger: figure, start: 'top bottom', end: 'bottom top', scrub: .9 } },
              );
            });

            gsap.fromTo('.web-studio-photo img', { yPercent: -5, scale: 1.02 }, { yPercent: 5, scale: 1.08, ease: 'none', scrollTrigger: { trigger: '.web-studio-photo', start: 'top bottom', end: 'bottom top', scrub: 1 } });
            gsap.fromTo('.custom-software-photo img', { yPercent: -5, scale: 1.02 }, { yPercent: 5, scale: 1.08, ease: 'none', scrollTrigger: { trigger: '.custom-software-photo', start: 'top bottom', end: 'bottom top', scrub: 1 } });

          }

          const animationState = (selector: string, state: 'running' | 'paused') => gsap.set(selector, { animationPlayState: state });
          ScrollTrigger.create({ trigger: '.hero', start: 'top bottom', end: 'bottom top', onEnter: () => animationState('.badge-ring', 'running'), onEnterBack: () => animationState('.badge-ring', 'running'), onLeave: () => animationState('.badge-ring', 'paused'), onLeaveBack: () => animationState('.badge-ring', 'paused') });

          gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
            if (!belowInitialViewport(element)) return;
            const trigger = { trigger: element, start: 'top 88%', once: true };

            if (element.classList.contains('section-heading')) {
              const kicker = element.querySelector('.section-kicker');
              const title = element.querySelector('h2');
              const copy = element.children.item(1);
              const timeline = gsap.timeline({ scrollTrigger: trigger });
              if (kicker) timeline.from(kicker, { y: 18, opacity: 0, duration: .62, ease: 'power3.out' });
              if (title) timeline.from(title, { y: 58, opacity: 0, duration: 1.05, ease: 'power4.out' }, '<.06');
              if (copy) timeline.from(copy, { y: 34, opacity: 0, duration: .85, ease: 'power3.out' }, '<.2');
              return;
            }

            if (element.classList.contains('editorial-heading')) {
              const titleParts = element.querySelectorAll('h2 span,h2 em');
              const copy = element.querySelector(':scope > p');
              const timeline = gsap.timeline({ scrollTrigger: trigger });
              timeline.from(titleParts, { y: 70, opacity: 0, duration: 1.05, stagger: .12, ease: 'power4.out' });
              if (copy) timeline.from(copy, { y: 32, opacity: 0, duration: .8, ease: 'power3.out' }, '<.28');
              return;
            }

            gsap.from(element, { y: 44, opacity: 0, duration: 1, immediateRender: false, ease: 'power4.out', onComplete: () => gsap.set(element, { clearProps: 'transform,opacity' }), scrollTrigger: trigger });
          });
          gsap.utils.toArray<HTMLElement>('[data-stagger]').forEach((group) => {
            if (!belowInitialViewport(group)) return;
            gsap.from(group.children, { y: 48, opacity: 0, duration: .95, stagger: .095, immediateRender: false, ease: 'power4.out', onComplete: () => gsap.set(group.children, { clearProps: 'transform,opacity' }), scrollTrigger: { trigger: group, start: 'top 88%', once: true } });
          });
          gsap.utils.toArray<HTMLElement>('.image-reveal').forEach((element) => {
            if (!belowInitialViewport(element)) return;
            gsap.from(element, { clipPath: 'inset(9% 0 9% 0 round 36px)', y: 38, opacity: .35, duration: 1.2, immediateRender: false, ease: 'power4.out', onComplete: () => gsap.set(element, { clearProps: 'clipPath,transform,opacity' }), scrollTrigger: { trigger: element, start: 'top 90%', once: true } });
          });
        }, this.host.nativeElement);

        return () => {
          this.animationContext?.revert();
          this.smoother?.kill();
          this.smoother = undefined;
          this.host.nativeElement.querySelector('.site-header')?.classList.remove('is-scrolled');
          document.documentElement.style.removeProperty('--page-progress');
          document.documentElement.classList.remove('has-smooth-scroll');
        };
      });
      document.fonts.ready.then(() => {
        window.requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          this.scrollToHash(window.location.hash, false);
        });
      });
    });
  }
  private setupHeroParticleField() {
    this.destroyParticleField?.();
    const canvas = this.heroParticles?.nativeElement;
    const hero = canvas?.closest<HTMLElement>('.hero');
    if (!canvas || !hero || window.matchMedia('(prefers-reduced-motion: reduce), (max-width: 767px)').matches) return;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;

    type Particle = {
      x: number; y: number; vx: number; vy: number; baseVx: number; baseVy: number;
      size: number; phase: number; alpha: number; kind: number; color: string;
      angle: number; rotationSpeed: number; depth: number;
    };
    type WakeParticle = {
      x: number; y: number; vx: number; vy: number; life: number; maxLife: number;
      size: number; angle: number; spin: number; color: string;
    };
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let wakeParticles: WakeParticle[] = [];
    let frame = 0;
    let lastPaint = 0;
    let lastWakeAt = 0;
    let visible = true;
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, strength: 0, active: false };

    const palette = ['49,88,202', '49,88,202', '79,111,228', '25,38,64', '25,38,64', '228,71,71'];
    const createParticle = (): Particle => {
      const depth = .42 + Math.random() * .58;
      const baseVx = (Math.random() - .5) * (.035 + depth * .055);
      const baseVy = .012 + Math.random() * (.025 + depth * .045);
      const edgeWeighted = Math.random() < .64;
      const side = Math.random() < .5 ? 0 : 1;
      const x = edgeWeighted
        ? side === 0 ? Math.random() * width * .31 : width * .69 + Math.random() * width * .31
        : Math.random() * width;
      return {
        x,
        y: Math.random() * height,
        vx: baseVx,
        vy: baseVy,
        baseVx,
        baseVy,
        size: .65 + depth * 1.15,
        phase: Math.random() * Math.PI * 2,
        alpha: .28 + depth * .4 + Math.random() * .16,
        kind: Math.random() < .7 ? 1 : 0,
        color: palette[Math.floor(Math.random() * palette.length)],
        angle: -.9 + Math.random() * .55,
        rotationSpeed: (Math.random() - .5) * .0007,
        depth,
      };
    };
    const resize = () => {
      const bounds = hero.getBoundingClientRect();
      width = Math.max(1, Math.round(bounds.width));
      height = Math.max(1, Math.round(hero.offsetHeight));
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(76, Math.max(28, Math.round(width / 20)));
      particles = Array.from({ length: count }, createParticle);
      if (!pointer.x && !pointer.y) {
        pointer.x = pointer.targetX = width / 2;
        pointer.y = pointer.targetY = height * .22;
      }
    };
    const paintNode = (particle: Particle, time: number) => {
      const pulse = .84 + Math.sin(time * .00105 + particle.phase) * .16;
      const alpha = particle.alpha * pulse;
      const trailScale = 5 + particle.depth * 8;
      const speed = Math.hypot(particle.vx, particle.vy);

      if (speed > .12) {
        context.strokeStyle = `rgba(${particle.color},${alpha * .14})`;
        context.lineWidth = .55 + particle.depth * .35;
        context.beginPath();
        context.moveTo(particle.x - particle.vx * trailScale, particle.y - particle.vy * trailScale);
        context.lineTo(particle.x, particle.y);
        context.stroke();
      }

      context.strokeStyle = `rgba(${particle.color},${alpha})`;
      context.fillStyle = `rgba(${particle.color},${alpha})`;
      context.lineWidth = .65 + particle.depth * .7;
      context.lineCap = 'round';
      context.save();
      context.translate(particle.x, particle.y);
      context.rotate(particle.angle);
      if (particle.kind === 0) {
        context.beginPath();
        context.moveTo(-particle.size * 1.25, 0);
        context.lineTo(particle.size * 1.25, 0);
        context.stroke();
      } else if (particle.kind === 1) {
        context.fillStyle = `rgba(${particle.color},${alpha * .13})`;
        context.beginPath();
        context.arc(0, 0, particle.size * 1.7, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = `rgba(${particle.color},${alpha})`;
        context.beginPath();
        context.arc(0, 0, Math.max(.65, particle.size * .34), 0, Math.PI * 2);
        context.fill();
      } else if (particle.kind === 2) {
        const size = particle.size * 1.15;
        context.beginPath();
        context.moveTo(-size, -size * .72);
        context.lineTo(-size, size * .72);
        context.lineTo(size * .25, size * .72);
        context.moveTo(size, -size * .72);
        context.lineTo(size, size * .72);
        context.stroke();
      } else {
        context.beginPath();
        context.moveTo(0, -particle.size);
        context.lineTo(particle.size, 0);
        context.lineTo(0, particle.size);
        context.lineTo(-particle.size, 0);
        context.closePath();
        context.stroke();
      }
      context.restore();
    };
    const render = (time: number) => {
      frame = 0;
      if (!visible || document.hidden) return;
      frame = window.requestAnimationFrame(render);
      if (time - lastPaint < 33) return;
      const elapsed = Math.min(time - lastPaint || 33, 66);
      const step = elapsed / 33;
      lastPaint = time;
      context.clearRect(0, 0, width, height);
      pointer.x += (pointer.targetX - pointer.x) * .16;
      pointer.y += (pointer.targetY - pointer.y) * .16;
      pointer.strength += ((pointer.active ? 1 : 0) - pointer.strength) * .09;

      // Short connections near the pointer keep the field quiet away from interaction.
      if (pointer.strength > .05) {
        context.lineWidth = .55;
        for (let i = 0; i < particles.length; i++) {
          const a = particles[i];
          if (Math.hypot(a.x - pointer.x, a.y - pointer.y) > 180) continue;
          let links = 0;
          for (let j = i + 1; j < particles.length && links < 2; j++) {
            const b = particles[j];
            const distance = Math.hypot(a.x - b.x, a.y - b.y);
            if (distance > 90) continue;
            context.strokeStyle = `rgba(49,88,202,${(1 - distance / 90) * .18 * pointer.strength})`;
            context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y); context.stroke();
            links++;
          }
        }
      }

      particles.forEach((particle) => {
        if (pointer.strength > .01) {
          const dx = particle.x - pointer.x;
          const dy = particle.y - pointer.y;
          const distance = Math.hypot(dx, dy);
          const radius = 175 + particle.depth * 35;
          if (distance > .1 && distance < radius) {
            const falloff = (1 - distance / radius) * pointer.strength;
            const normalX = dx / distance;
            const normalY = dy / distance;
            particle.vx += (normalX * .09 - normalY * .026) * falloff * particle.depth;
            particle.vy += (normalY * .09 + normalX * .026) * falloff * particle.depth;
            particle.angle += normalX * falloff * .009;
          }
        }
        particle.vx += (particle.baseVx - particle.vx) * .025;
        particle.vy += (particle.baseVy - particle.vy) * .025;
        const speed = Math.hypot(particle.vx, particle.vy);
        if (speed > 1.05) {
          particle.vx = (particle.vx / speed) * 1.05;
          particle.vy = (particle.vy / speed) * 1.05;
        }
        particle.x += (particle.vx + Math.sin(time * .00022 + particle.phase) * .012) * step;
        particle.y += (particle.vy + Math.cos(time * .00018 + particle.phase) * .01) * step;
        particle.angle += particle.rotationSpeed * elapsed;
        if (particle.x < -12) particle.x = width + 12;
        if (particle.x > width + 12) particle.x = -12;
        if (particle.y < -12) particle.y = height + 12;
        if (particle.y > height + 12) particle.y = -12;
        paintNode(particle, time);
      });

      wakeParticles = wakeParticles.filter((particle) => {
        particle.life -= elapsed;
        if (particle.life <= 0) return false;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= .976;
        particle.vy *= .976;
        particle.angle += particle.spin;
        const progress = particle.life / particle.maxLife;
        context.save();
        context.translate(particle.x, particle.y);
        context.rotate(particle.angle);
        context.strokeStyle = `rgba(${particle.color},${progress * .58})`;
        context.lineWidth = .7 + progress * .65;
        context.lineCap = 'round';
        context.beginPath();
        context.moveTo(-particle.size * (1.25 + progress), 0);
        context.lineTo(particle.size, 0);
        context.stroke();
        context.restore();
        return true;
      });
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const bounds = hero.getBoundingClientRect();
      const nextX = event.clientX - bounds.left;
      const nextY = event.clientY - bounds.top;
      const deltaX = nextX - pointer.targetX;
      const deltaY = nextY - pointer.targetY;
      const movement = Math.hypot(deltaX, deltaY);
      if (pointer.active && movement > 5 && event.timeStamp - lastWakeAt > 22) {
        const tangentX = movement ? deltaX / movement : 0;
        const tangentY = movement ? deltaY / movement : 0;
        const amount = movement > 26 ? 2 : 1;
        for (let index = 0; index < amount; index += 1) {
          const life = 430 + Math.random() * 310;
          wakeParticles.push({
            x: nextX + (Math.random() - .5) * 9,
            y: nextY + (Math.random() - .5) * 9,
            vx: -tangentX * (.2 + Math.random() * .55) + (Math.random() - .5) * .16,
            vy: -tangentY * (.2 + Math.random() * .55) + (Math.random() - .5) * .16,
            life,
            maxLife: life,
            size: .9 + Math.random() * 1.45,
            angle: Math.atan2(deltaY, deltaX) + (Math.random() - .5) * .7,
            spin: (Math.random() - .5) * .035,
            color: palette[Math.floor(Math.random() * palette.length)],
          });
        }
        if (wakeParticles.length > 28) wakeParticles.splice(0, wakeParticles.length - 28);
        lastWakeAt = event.timeStamp;
      }
      pointer.targetX = nextX;
      pointer.targetY = nextY;
      pointer.active = true;
    };
    const onPointerLeave = () => { pointer.active = false; };

    const resizeObserver = new ResizeObserver(resize);
    const syncPlayback = () => {
      if (!visible || document.hidden) {
        window.cancelAnimationFrame(frame);
        frame = 0;
        pointer.active = false;
        wakeParticles = [];
      } else if (!frame) {
        lastPaint = performance.now();
        frame = window.requestAnimationFrame(render);
      }
    };
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      syncPlayback();
    }, { rootMargin: '180px' });
    resizeObserver.observe(hero);
    visibilityObserver.observe(hero);
    hero.addEventListener('pointermove', onPointerMove, { passive: true });
    hero.addEventListener('pointerleave', onPointerLeave, { passive: true });
    document.addEventListener('visibilitychange', syncPlayback);
    resize();
    frame = window.requestAnimationFrame(render);
    this.destroyParticleField = () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      hero.removeEventListener('pointermove', onPointerMove);
      hero.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', syncPlayback);
      context.clearRect(0, 0, width, height);
    };
  }
  private setupAnchorNavigation() {
    this.navigationController?.abort();
    this.navigationController = new AbortController();
    const signal = this.navigationController.signal;
    this.host.nativeElement.addEventListener('click', (event: Event) => {
      if (!(event instanceof MouseEvent) || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!anchor || anchor.target === '_blank') return;
      const hash = anchor.getAttribute('href');
      if (!hash || hash === '#') return;
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!target) return;
      event.preventDefault();
      if (window.location.hash !== hash) window.history.pushState(null, '', hash);
      this.scrollToHash(hash, true);
    }, { signal });
    window.addEventListener('hashchange', () => this.scrollToHash(window.location.hash, true), { signal });
    window.addEventListener('popstate', () => this.scrollToHash(window.location.hash, true), { signal });
  }
  private scrollToHash(hash: string, smooth: boolean) {
    if (!hash || hash === '#') return;
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!target) return;
    document.querySelectorAll('nav a[aria-current]').forEach((link) => link.removeAttribute('aria-current'));
    document.querySelector(`nav a[href="${hash}"]`)?.setAttribute('aria-current', 'location');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (this.smoother) {
      // Refresh before measuring: refreshing during scrollTo cancels its tween.
      this.refreshScroll?.();
      const destination = this.smoother.offset(target, 'top 86px');
      this.smoother.scrollTo(destination, smooth && !reducedMotion);
      return;
    }
    target.scrollIntoView({ behavior: smooth && !reducedMotion ? 'smooth' : 'auto', block: 'start' });
  }
  ngOnDestroy() {
    this.destroyed = true;
    this.destroyParticleField?.();
    this.navigationController?.abort();
    this.motionMedia?.revert();
    this.animationContext?.revert();
    this.smoother?.kill();
    document.documentElement.classList.remove('has-smooth-scroll');
  }
  toggleModule(module: string) {
    const current = this.selectedModules();
    this.selectedModules.set(current.includes(module) ? current.filter((item) => item !== module) : [...current, module]);
  }
  previousDemo() { this.activeDemo.update((index) => Math.max(0, index - 1)); }
  nextDemo() { this.activeDemo.update((index) => Math.min(this.demoSlides.length - 1, index + 1)); }
  selectDemo(index: number) { this.activeDemo.set(index); }
  onDemoTouchStart(event: TouchEvent) { this.demoTouchStartX = event.changedTouches[0]?.clientX; }
  onDemoTouchEnd(event: TouchEvent) {
    const endX = event.changedTouches[0]?.clientX;
    if (this.demoTouchStartX === undefined || endX === undefined) return;
    const distance = endX - this.demoTouchStartX;
    this.demoTouchStartX = undefined;
    if (Math.abs(distance) < 42) return;
    distance < 0 ? this.nextDemo() : this.previousDemo();
  }
  planPrice(plan: GozuPlan) { return this.annualBilling() ? Math.round((plan.monthlyPrice * 10) / 12) : plan.monthlyPrice; }
  annualTotal(plan: GozuPlan) { return plan.monthlyPrice * 10; }
  selectPlan(plan: GozuPlan) {
    this.quoteForm.controls.preferredPlan.setValue(plan.name);
    this.api.trackSiteEvent('PLAN_SELECT', plan.name).subscribe({ error: () => undefined });
    this.scrollToHash('#contacto', true);
  }
  selectWebPlan(plan: WebPlan) {
    this.quoteForm.patchValue({ industry: 'Página web, ecommerce o presencia digital', preferredPlan: `Web · ${plan.name}`, currentSystem: 'Negocio nuevo, aún sin sistema' });
    this.webModules.slice(0, plan.name.includes('Ecommerce') ? 8 : 6).forEach((module) => {
      if (!this.selectedModules().includes(module)) this.selectedModules.update((items) => [...items, module]);
    });
    this.api.trackSiteEvent('PLAN_SELECT', `Web · ${plan.name}`).subscribe({ error: () => undefined });
    this.scrollToHash('#contacto', true);
  }
  trackCta(label: string) { this.api.trackSiteEvent('CTA_CLICK', label).subscribe({ error: () => undefined }); }
  trackWhatsApp(label = 'WhatsApp flotante') { this.api.trackSiteEvent('WHATSAPP_CLICK', label).subscribe({ error: () => undefined }); }
  submitQuote() {
    if (this.submitting()) return;
    if (this.quoteForm.invalid) { this.quoteForm.markAllAsTouched(); return; }
    this.submitting.set(true);
    this.sent.set(false);
    this.quoteError.set(false);
    const value = this.quoteForm.getRawValue();
    const lead: Lead = { ...value, modules: this.selectedModules().join(', ') || 'Por definir en el diagnóstico' };
      const message = [`Hola GOZU, quiero conversar sobre un proyecto digital.`, ``, `Nombre: ${value.name}`, `Negocio: ${value.businessName}`, `Teléfono: ${value.phone}`, `Ciudad: ${value.city}`, `Tipo de proyecto: ${value.industry}`, `Ruta de referencia: ${value.preferredPlan}`, `Necesidades: ${lead.modules}`, `Usuarios: ${value.usersRange}`, `Locales: ${value.locationsRange}`, `Sistema actual: ${value.currentSystem}`, `Volumen: ${value.volumeRange}`, `Inversión prevista: ${value.budgetRange}`, `Prioridad: ${value.urgency}`, `Detalles: ${value.details || 'Por definir'}`].join('\n');
    this.quoteWhatsAppUrl.set(`https://wa.me/${this.whatsapp}?text=${encodeURIComponent(message)}`);
    this.api.createLead(lead).pipe(timeout(15000)).subscribe({
      next: () => { this.submitting.set(false); this.sent.set(true); },
      error: () => { this.submitting.set(false); this.quoteError.set(true); },
    });
  }
}
