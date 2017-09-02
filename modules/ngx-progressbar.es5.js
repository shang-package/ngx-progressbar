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
var clamp = function (n, min, max) {
    if (n < min) {
        return min;
    }
    if (n > max) {
        return max;
    }
    return n;
};
var NgProgressService = (function () {
    function NgProgressService() {
        var _this = this;
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
        this.trickling.switchMap(function () {
            return Observable
                .timer(0, _this.trickleSpeed)
                .takeWhile(function () { return _this.isStarted(); })
                .do(function () { return _this.inc(); });
        }).subscribe();
    }
    /**
     * @return {?}
     */
    NgProgressService.prototype.begin = function () {
        this.pendingProgress++;
        this.start();
    };
    /**
     * @return {?}
     */
    NgProgressService.prototype.end = function () {
        this.pendingProgress--;
        if (this.pendingProgress <= 0) {
            this.done();
        }
    };
    /**
     * @return {?}
     */
    NgProgressService.prototype.reset = function () {
        this.pendingProgress = 0;
        this.done();
    };
    /**
     * Start
     * @return {?}
     */
    NgProgressService.prototype.start = function () {
        if (!this.isStarted()) {
            this.set(this.minimum);
        }
        this.trickling.next();
    };
    /**
     * Done
     * @return {?}
     */
    NgProgressService.prototype.done = function () {
        /** if started complete the progress */
        if (this.isStarted()) {
            this.set(.3 + .5 * Math.random());
            this.set(this.maximum);
        }
    };
    /**
     * Increment Progress
     * @param {?=} amount
     * @return {?}
     */
    NgProgressService.prototype.inc = function (amount) {
        var /** @type {?} */ n = this.progress;
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
    };
    /**
     * Set progress state
     * @param {?} n
     * @return {?}
     */
    NgProgressService.prototype.set = function (n) {
        var _this = this;
        this.progress = clamp(n, this.minimum, this.maximum);
        this.updateState(this.progress, true);
        /** if progress completed */
        if (n === this.maximum) {
            var /** @type {?} */ hide_1 = function () {
                /**
                 *  reset progress
                 *  Keep it { 0, false } to fadeOut progress-bar after complete
                 */
                _this.progress = 0;
                _this.updateState(_this.progress, false);
            };
            var /** @type {?} */ complete = function () {
                /**
                 * complete progressbar
                 * { 1, false } to complete progress-bar before hiding
                 */
                _this.updateState(_this.progress, false);
                setTimeout(hide_1, _this.speed);
            };
            setTimeout(complete, this.speed);
        }
    };
    /**
     * Is progress started
     * @return {?}
     */
    NgProgressService.prototype.isStarted = function () {
        return this.progress > 0 && this.progress < this.maximum;
    };
    /**
     * Update Progressbar State
     * @param {?} progress
     * @param {?} isActive
     * @return {?}
     */
    NgProgressService.prototype.updateState = function (progress, isActive) {
        this.state.next({
            active: isActive,
            value: progress
        });
    };
    return NgProgressService;
}());
NgProgressService.decorators = [
    { type: Injectable },
];
/**
 * @nocollapse
 */
NgProgressService.ctorParameters = function () { return []; };
var NgProgressInterceptor = (function () {
    /**
     * @param {?} progressService
     */
    function NgProgressInterceptor(progressService) {
        this.progressService = progressService;
    }
    /**
     * @param {?} req
     * @param {?} next
     * @return {?}
     */
    NgProgressInterceptor.prototype.intercept = function (req, next) {
        var _this = this;
        this.progressService.begin();
        return next.handle(req).finally(function () {
            _this.progressService.end();
        });
    };
    return NgProgressInterceptor;
}());
NgProgressInterceptor.decorators = [
    { type: Injectable },
];
/**
 * @nocollapse
 */
NgProgressInterceptor.ctorParameters = function () { return [
    { type: NgProgressService, },
]; };
var ProgressBarComponent = (function () {
    function ProgressBarComponent() {
    }
    /**
     * Styles for progressbar
     * @return {?}
     */
    ProgressBarComponent.prototype.barStyles = function () {
        var /** @type {?} */ styles = {
            transition: "all " + this.speed + "ms " + this.ease,
            backgroundColor: this.color
        };
        /**
         * Get positioning value
         */
        var n = (!this.state.value) ? {
            leftToRightIncreased: -100,
            leftToRightReduced: 0,
            rightToLeftIncreased: 100,
            rightToLeftReduced: 0
        }[this.direction] : this.toPercentage(this.state.value);
        switch (this.positionUsing) {
            case 'translate3d':
                styles = Object.assign({}, styles, {
                    transform: "translate3d(" + n + "%,0,0)",
                    '-webkit-transform': "translate3d(" + n + "%,0,0)",
                    '-moz-transform': "translate3d(" + n + "%,0,0)",
                    '-o-transform': "translate3d(" + n + "%,0,0)",
                    '-ms-transform': "translate3d(" + n + "%,0,0)"
                });
                break;
            case 'translate':
                styles = Object.assign({}, styles, {
                    transform: "translate(" + n + "%,0)",
                    '-webkit-transform': "translate(" + n + "%,0)",
                    '-moz-transform': "translate(" + n + "%,0)",
                    '-o-transform': "translate(" + n + "%,0)",
                    '-ms-transform': "translate(" + n + "%,0)"
                });
                break;
            default:
                styles = Object.assign({}, styles, {
                    marginLeft: n + "%"
                });
        }
        return styles;
    };
    /**
     * Styles for progressbar tail
     * @return {?}
     */
    ProgressBarComponent.prototype.shadowStyles = function () {
        return {
            boxShadow: "0 0 10px " + this.color + ", 0 0 5px " + this.color
        };
    };
    /**
     * @param {?} n
     * @return {?}
     */
    ProgressBarComponent.prototype.toPercentage = function (n) {
        return ({
            leftToRightIncreased: -1 + n,
            leftToRightReduced: -n,
            rightToLeftIncreased: 1 - n,
            rightToLeftReduced: n
        }[this.direction]) * 100;
    };
    /**
     * @return {?}
     */
    ProgressBarComponent.prototype.spinnerClasses = function () {
        return {
            leftToRightIncreased: 'clockwise',
            leftToRightReduced: 'anti-clockwise',
            rightToLeftIncreased: 'anti-clockwise',
            rightToLeftReduced: 'clockwise'
        }[this.direction];
    };
    return ProgressBarComponent;
}());
ProgressBarComponent.decorators = [
    { type: Component, args: [{
                selector: 'ng-progress-bar',
                template: "\n  <div class=\"ng-progress\" *ngIf=\"state\" [class.active]=\"state.active\" [class.thick]=\"thick\">\n    <div class=\"bar\" [ngStyle]=\"barStyles()\">\n      <div class=\"bar-shadow\" [ngStyle]=\"shadowStyles()\"></div>\n    </div>\n    <div *ngIf=\"showSpinner\" class=\"spinner\" [ngClass]=\"spinnerClasses()\">\n      <div class=\"spinner-icon\" [style.borderTopColor]=\"color\" [style.borderLeftColor]=\"color\"></div>\n    </div>\n  </div>",
                styles: ["\n  .ng-progress {\n    z-index: 999999;\n    top: 0;\n    left: 0;\n    width: 100%;\n    position: fixed;\n    zoom: 1;\n    filter: alpha(opacity=0);\n    opacity: 0;\n    transition: opacity 200ms linear;\n  }\n\n  .active {\n    filter: alpha(opacity=100);\n    opacity: 1;\n    transition: none;\n  }\n\n  .bar {\n    position: absolute;\n    width: 100%;\n    height: 2px;\n  }\n\n  .thick .bar {\n    height: 3px;\n  }\n\n  .bar-shadow {\n    display: block;\n    position: absolute;\n    right: 0;\n    top: -3px;\n    width: 100px;\n    height: 100%;\n    opacity: 1.0;\n    -webkit-transform: rotate(3deg);\n    -ms-transform: rotate(3deg);\n    -moz-transform: rotate(3deg);\n    transform: rotate(3deg);\n  }\n\n\n  .thick .bar-shadow {\n    top: -4px;\n    -webkit-transform: rotate(4deg);\n    -ms-transform: rotate(4deg);\n    -moz-transform: rotate(4deg);\n    transform: rotate(4deg);\n  }\n\n  .thick .spinner-icon {\n    width: 24px;\n    height: 24px;\n    border: solid 3px transparent;\n  }\n\n  /* Remove these to get rid of the spinner */\n  .spinner {\n    display: block;\n    position: fixed;\n    z-index: 1031;\n    top: 15px;\n    right: 15px;\n  }\n\n  .spinner-icon {\n    width: 18px;\n    height: 18px;\n    box-sizing: border-box;\n\n    border: solid 2px transparent;\n    border-radius: 50%;\n\n    -webkit-animation: nprogress-spinner 400ms linear infinite;\n    -moz-animation: nprogress-spinner 400ms linear infinite;\n    animation: nprogress-spinner 400ms linear infinite;\n  }\n\n  .anti-clockwise .spinner-icon {\n    -webkit-animation-direction: reverse;\n    -moz-animation-direction: rotate(0deg);\n    animation-direction: reverse;\n  }\n\n  @-webkit-keyframes nprogress-spinner {\n    0% {\n      -webkit-transform: rotate(0deg);\n      -moz-transform: rotate(0deg);\n      transform: rotate(0deg);\n    }\n    100% {\n      -webkit-transform: rotate(360deg);\n      -moz-transform: rotate(360deg);\n      transform: rotate(360deg);\n    }\n  }\n\n  @keyframes nprogress-spinner {\n    0% {\n      -webkit-transform: rotate(0deg);\n      -moz-transform: rotate(0deg);\n      transform: rotate(0deg);\n    }\n    100% {\n      -webkit-transform: rotate(360deg);\n      -moz-transform: rotate(360deg);\n      transform: rotate(360deg);\n    }\n  }"],
                changeDetection: ChangeDetectionStrategy.OnPush
            },] },
];
/**
 * @nocollapse
 */
ProgressBarComponent.ctorParameters = function () { return []; };
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
var ProgressComponent = (function () {
    /**
     * @param {?} progress
     */
    function ProgressComponent(progress) {
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
    ProgressComponent.prototype.ngOnChanges = function (changes) {
        var /** @type {?} */ minChng = changes.minimum;
        var /** @type {?} */ maxChng = changes.maximum;
        var /** @type {?} */ spdChng = changes.speed;
        var /** @type {?} */ tklSpdChng = changes.trickleSpeed;
        var /** @type {?} */ tglChng = changes.toggle;
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
    };
    /**
     * @return {?}
     */
    ProgressComponent.prototype.ngOnDestroy = function () {
        this.progress.state.unsubscribe();
        this.progress.trickling.unsubscribe();
    };
    return ProgressComponent;
}());
ProgressComponent.decorators = [
    { type: Component, args: [{
                selector: 'ng-progress',
                template: "\n  <ng-progress-bar\n    [speed]=\"speed\"\n    [positionUsing]=\"positionUsing\"\n    [ease]=\"ease\"\n    [showSpinner]=\"showSpinner\"\n    [direction]=\"direction\"\n    [color]=\"color\"\n    [thick]=\"thick\"\n    [state]=\"progress.state | async\"\n  ></ng-progress-bar>",
                styles: ["\n  :host {\n    z-index: 999999;\n    pointer-events: none;\n    position: relative;\n  }"],
                changeDetection: ChangeDetectionStrategy.OnPush
            },] },
];
/**
 * @nocollapse
 */
ProgressComponent.ctorParameters = function () { return [
    { type: NgProgressService, },
]; };
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
var NgProgressModule = (function () {
    function NgProgressModule() {
    }
    return NgProgressModule;
}());
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
NgProgressModule.ctorParameters = function () { return []; };
/**
 * Generated bundle index. Do not edit.
 */
export { NgProgressService, NgProgressInterceptor, NgProgressModule, ProgressBarComponent as ɵb, ProgressComponent as ɵa };
//# sourceMappingURL=ngx-progressbar.es5.js.map
