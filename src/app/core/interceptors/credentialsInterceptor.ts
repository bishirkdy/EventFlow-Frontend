import { HttpInterceptor, HttpInterceptorFn } from "@angular/common/http";

export const credentialsInterceptor : HttpInterceptorFn = (req , next ) => {
    const requestWithCredentials = req.clone({
        withCredentials: true
    });
    return next(requestWithCredentials);
}