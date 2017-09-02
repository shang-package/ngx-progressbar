import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { NgProgressService } from './progress.service';
import 'rxjs/add/operator/finally';
export declare class NgProgressInterceptor implements HttpInterceptor {
    progressService: NgProgressService;
    constructor(progressService: NgProgressService);
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>;
}
