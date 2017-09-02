import { ChangeDetectionStrategy, Component, Injectable, Input, NgModule } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/takeWhile';
import 'rxjs/add/operator/finally';
import { CommonModule } from '@angular/common';

/**
 * Helper
 */
const clamp = (n, min, max) => {
    if (n < min) {
        return min;
    }
    if (n > max) {
        return max;
    }
    return n;
};
class NgProgressService {
    constructor() {
        /**
         * Progress state
         */
        this.state = new Subject();
        /**
         * Trickling stream
         */
        this.trickling = new Subject();
        this.progress = 0;
        this.maximum = 1;
        this.minimum = 0.08;
        this.speed = 200;
        this.trickleSpeed = 300;
        this.pendingProgress = 0;
        this.trickling.switchMap(() => {
            return Observable
                .timer(0, this.trickleSpeed)
                .takeWhile(() => this.isStarted())
                .do(() => this.inc());
        }).subscribe();
    }
    /**
     * @return {?}
     */
    begin() {
        this.pendingProgress++;
        this.start();
    }
    /**
     * @return {?}
     */
    end() {
        this.pendingProgress--;
        if (this.pendingProgress <= 0) {
            this.done();
        }
    }
    /**
     * @return {?}
     */
    reset() {
        this.pendingProgress = 0;
        this.done();
    }
    /**
     * Start
     * @return {?}
     */
    start() {
        if (!this.isStarted()) {
            this.set(this.minimum);
        }
        this.trickling.next();
    }
    /**
     * Done
     * @return {?}
     */
    done() {
        /** if started complete the progress */
        if (this.isStarted()) {
            this.set(.3 + .5 * Math.random());
            this.set(this.maximum);
        }
    }
    /**
     * Increment Progress
     * @param {?=} amount
     * @return {?}
     */
    inc(amount) {
        let /** @type {?} */ n = this.progress;
        /** if it hasn't start, start */
        if (!this.isStarted()) {
            this.start();
        }
        else {
            if (typeof amount !== 'number') {
                if (n >= 0 && n < 0.2) {
                    amount = 0.1;
                }
                else if (n >= 0.2 && n < 0.5) {
                    amount = 0.04;
                }
                else if (n >= 0.5 && n < 0.8) {
                    amount = 0.02;
                }
                else if (n >= 0.8 && n < 0.99) {
                    amount = 0.005;
                }
                else {
                    amount = 0;
                }
            }
            n = clamp(n + amount, 0, 0.994);
            this.set(n);
        }
    }
    /**
     * Set progress state
     * @param {?} n
     * @return {?}
     */
    set(n) {
        this.progress = clamp(n, this.minimum, this.maximum);
        this.updateState(this.progress, true);
        /** if progress completed */
        if (n === this.maximum) {
            const /** @type {?} */ hide = () => {
                /**
                 *  reset progress
                 *  Keep it { 0, false } to fadeOut progress-bar after complete
                 */
                this.progress = 0;
                this.updateState(this.progress, false);
            };
            const /** @type {?} */ complete = () => {
                /**
                 * complete progressbar
                 * { 1, false } to complete progress-bar before hiding
                 */
                this.updateState(this.progress, false);
                setTimeout(hide, this.speed);
            };
            setTimeout(complete, this.speed);
        }
    }
    /**
     * Is progress started
     * @return {?}
     */
    isStarted() {
        return this.progress > 0 && this.progress < this.maximum;
    }
    /**
     * Update Progressbar State
     * @param {?} progress
     * @param {?} isActive
     * @return {?}
     */
    updateState(progress, isActive) {
        this.state.next({
            active: isActive,
            value: progress
        });
    }
}
NgProgressService.decorators = [
    { type: Injectable },
];
/**
 * @nocollapse
 */
NgProgressService.ctorParameters = () => [];

class NgProgressInterceptor {
    /**
     * @param {?} progressService
     */
    constructor(progressService) {
        this.progressService = progressService;
    }
    /**
     * @param {?} req
     * @param {?} next
     * @return {?}
     */
    intercept(req, next) {
        this.progressService.begin();
        return next.handle(req).finally(() => {
            this.progressService.end();
        });
    }
}
NgProgressInterceptor.decorators = [
    { type: Injectable },
];
/**
 * @nocollapse
 */
NgProgressInterceptor.ctorParameters = () => [
    { type: NgProgressService, },
];

class ProgressBarComponent {
    /**
     * Styles for progressbar
     * @return {?}
     */
    barStyles() {
        let /** @type {?} */ styles = {
            transition: `all ${this.speed}ms ${this.ease}`,
            backgroundColor: this.color
        };
        /**
         * Get positioning value
         */
        const n = (!this.state.value) ? {
            leftToRightIncreased: -100,
            leftToRightReduced: 0,
            rightToLeftIncreased: 100,
            rightToLeftReduced: 0
        }[this.direction] : this.toPercentage(this.state.value);
        switch (this.positionUsing) {
            case 'translate3d':
                styles = Object.assign({}, styles, {
                    transform: `translate3d(${n}%,0,0)`,
                    '-webkit-transform': `translate3d(${n}%,0,0)`,
                    '-moz-transform': `translate3d(${n}%,0,0)`,
                    '-o-transform': `translate3d(${n}%,0,0)`,
                    '-ms-transform': `translate3d(${n}%,0,0)`
                });
                break;
            case 'translate':
                styles = Object.assign({}, styles, {
                    transform: `translate(${n}%,0)`,
                    '-webkit-transform': `translate(${n}%,0)`,
                    '-moz-transform': `translate(${n}%,0)`,
                    '-o-transform': `translate(${n}%,0)`,
                    '-ms-transform': `translate(${n}%,0)`
                });
                break;
            default:
                styles = Object.assign({}, styles, {
                    marginLeft: `${n}%`
                });
        }
        return styles;
    }
    /**
     * Styles for progressbar tail
     * @return {?}
     */
    shadowStyles() {
        return {
            boxShadow: `0 0 10px ${this.color}, 0 0 5px ${this.color}`
        };
    }
    /**
     * @param {?} n
     * @return {?}
     */
    toPercentage(n) {
        return ({
            leftToRightIncreased: -1 + n,
            leftToRightReduced: -n,
            rightToLeftIncreased: 1 - n,
            rightToLeftReduced: n
        }[this.direction]) * 100;
    }
    /**
     * @return {?}
     */
    spinnerClasses() {
        return {
            leftToRightIncreased: 'clockwise',
            leftToRightReduced: 'anti-clockwise',
            rightToLeftIncreased: 'anti-clockwise',
            rightToLeftReduced: 'clockwise'
        }[this.direction];
    }
}
ProgressBarComponent.decorators = [
    { type: Component, args: [{
                selector: 'ng-progress-bar',
                template: `
  <div class="ng-progress" *ngIf="state" [class.active]="state.active" [class.thick]="thick">
    <div class="bar" [ngStyle]="barStyles()">
      <div class="bar-shadow" [ngStyle]="shadowStyles()"></div>
    </div>
    <div *ngIf="showSpinner" class="spinner" [ngClass]="spinnerClasses()">
      <div class="spinner-icon" [style.borderTopColor]="color" [style.borderLeftColor]="color"></div>
    </div>
  </div>`,
                styles: [`
  .ng-progress {
    z-index: 999999;
    top: 0;
    left: 0;
    width: 100%;
    position: fixed;
    zoom: 1;
    filter: alpha(opacity=0);
    opacity: 0;
    transition: opacity 200ms linear;
  }

  .active {
    filter: alpha(opacity=100);
    opacity: 1;
    transition: none;
  }

  .bar {
    position: absolute;
    width: 100%;
    height: 2px;
  }

  .thick .bar {
    height: 3px;
  }

  .bar-shadow {
    display: block;
    position: absolute;
    right: 0;
    top: -3px;
    width: 100px;
    height: 100%;
    opacity: 1.0;
    -webkit-transform: rotate(3deg);
    -ms-transform: rotate(3deg);
    -moz-transform: rotate(3deg);
    transform: rotate(3deg);
  }


  .thick .bar-shadow {
    top: -4px;
    -webkit-transform: rotate(4deg);
    -ms-transform: rotate(4deg);
    -moz-transform: rotate(4deg);
    transform: rotate(4deg);
  }

  .thick .spinner-icon {
    width: 24px;
    height: 24px;
    border: solid 3px transparent;
  }

  /* Remove these to get rid of the spinner */
  .spinner {
    display: block;
    position: fixed;
    z-index: 1031;
    top: 15px;
    right: 15px;
  }

  .spinner-icon {
    width: 18px;
    height: 18px;
    box-sizing: border-box;

    border: solid 2px transparent;
    border-radius: 50%;

    -webkit-animation: nprogress-spinner 400ms linear infinite;
    -moz-animation: nprogress-spinner 400ms linear infinite;
    animation: nprogress-spinner 400ms linear infinite;
  }

  .anti-clockwise .spinner-icon {
    -webkit-animation-direction: reverse;
    -moz-animation-direction: rotate(0deg);
    animation-direction: reverse;
  }

  @-webkit-keyframes nprogress-spinner {
    0% {
      -webkit-transform: rotate(0deg);
      -moz-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      -moz-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }

  @keyframes nprogress-spinner {
    0% {
      -webkit-transform: rotate(0deg);
      -moz-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      -moz-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }`],
                changeDetection: ChangeDetectionStrategy.OnPush
            },] },
];
/**
 * @nocollapse
 */
ProgressBarComponent.ctorParameters = () => [];
ProgressBarComponent.propDecorators = {
    'state': [{ type: Input },],
    'positionUsing': [{ type: Input },],
    'ease': [{ type: Input },],
    'speed': [{ type: Input },],
    'showSpinner': [{ type: Input },],
    'direction': [{ type: Input },],
    'thick': [{ type: Input },],
    'color': [{ type: Input },],
};

class ProgressComponent {
    /**
     * @param {?} progress
     */
    constructor(progress) {
        this.progress = progress;
        /**
         * Progress options
         */
        this.ease = 'linear';
        this.positionUsing = 'margin';
        this.showSpinner = true;
        this.direction = 'leftToRightIncreased';
        this.color = '#CC181E';
        this.thick = false;
        this.maximum = 1;
        this.minimum = 0.08;
        this.speed = 200;
        this.trickleSpeed = 300;
    }
    /**
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        const /** @type {?} */ minChng = changes.minimum;
        const /** @type {?} */ maxChng = changes.maximum;
        const /** @type {?} */ spdChng = changes.speed;
        const /** @type {?} */ tklSpdChng = changes.trickleSpeed;
        const /** @type {?} */ tglChng = changes.toggle;
        if (minChng) {
            if (typeof minChng.currentValue !== 'undefined' && minChng.currentValue !== minChng.previousValue) {
                if (minChng.currentValue < 0 || minChng.currentValue > 1) {
                    throw 'Input [minimum] must be between 0 and 1';
                }
                else {
                    this.progress.minimum = minChng.currentValue;
                }
            }
        }
        if (maxChng) {
            if (typeof maxChng.currentValue !== 'undefined' && maxChng.currentValue !== maxChng.previousValue) {
                if (maxChng.currentValue < 0 || maxChng.currentValue > 1) {
                    throw 'Input [maximum] must be between 0 and 1';
                }
                else {
                    this.progress.maximum = maxChng.currentValue;
                }
            }
        }
        if (spdChng) {
            if (typeof spdChng.currentValue !== 'undefined' && spdChng.currentValue !== spdChng.previousValue) {
                this.progress.speed = spdChng.currentValue;
            }
        }
        if (tklSpdChng) {
            if (typeof tklSpdChng.currentValue !== 'undefined' && tklSpdChng.currentValue !== tklSpdChng.previousValue) {
                this.progress.trickleSpeed = tklSpdChng.currentValue;
            }
        }
        if (tglChng) {
            if (typeof tglChng.currentValue !== 'undefined' && tglChng.currentValue !== tglChng.previousValue) {
                if (tglChng.currentValue) {
                    this.progress.start();
                }
                else {
                    this.progress.done();
                }
            }
        }
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this.progress.state.unsubscribe();
        this.progress.trickling.unsubscribe();
    }
}
ProgressComponent.decorators = [
    { type: Component, args: [{
                selector: 'ng-progress',
                template: `
  <ng-progress-bar
    [speed]="speed"
    [positionUsing]="positionUsing"
    [ease]="ease"
    [showSpinner]="showSpinner"
    [direction]="direction"
    [color]="color"
    [thick]="thick"
    [state]="progress.state | async"
  ></ng-progress-bar>`,
                styles: [`
  :host {
    z-index: 999999;
    pointer-events: none;
    position: relative;
  }`],
                changeDetection: ChangeDetectionStrategy.OnPush
            },] },
];
/**
 * @nocollapse
 */
ProgressComponent.ctorParameters = () => [
    { type: NgProgressService, },
];
ProgressComponent.propDecorators = {
    'ease': [{ type: Input },],
    'positionUsing': [{ type: Input },],
    'showSpinner': [{ type: Input },],
    'direction': [{ type: Input },],
    'color': [{ type: Input },],
    'thick': [{ type: Input },],
    'maximum': [{ type: Input },],
    'minimum': [{ type: Input },],
    'speed': [{ type: Input },],
    'trickleSpeed': [{ type: Input },],
    'toggle': [{ type: Input },],
};

class NgProgressModule {
}
NgProgressModule.decorators = [
    { type: NgModule, args: [{
                declarations: [
                    ProgressComponent,
                    ProgressBarComponent
                ],
                exports: [
                    ProgressComponent
                ],
                imports: [
                    CommonModule
                ],
                providers: [
                    NgProgressService
                ]
            },] },
];
/**
 * @nocollapse
 */
NgProgressModule.ctorParameters = () => [];

/**
 * Generated bundle index. Do not edit.
 */

export { NgProgressService, NgProgressInterceptor, NgProgressModule, ProgressBarComponent as ɵb, ProgressComponent as ɵa };
//# sourceMappingURL=ngx-progressbar.js.map
