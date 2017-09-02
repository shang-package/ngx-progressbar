import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/takeWhile';
export declare class NgProgressService {
    /** Progress state */
    state: Subject<{}>;
    /** Trickling stream */
    trickling: Subject<{}>;
    progress: number;
    maximum: number;
    minimum: number;
    speed: number;
    trickleSpeed: number;
    private pendingProgress;
    constructor();
    /** Start */
    start(): void;
    /** Done */
    done(): void;
    begin(): void;
    end(): void;
    reset(): void;
    /** Increment Progress */
    inc(amount?: any): void;
    /** Set progress state */
    set(n: any): void;
    /**
     * Is progress started
     * @return {boolean}
     */
    isStarted(): boolean;
    /** Update Progressbar State */
    private updateState(progress, isActive);
}
