import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatorService } from '@core/translator/translator.service';
import { Subscription } from 'rxjs';

import { UserService } from '../../shared/services/user.service';
import { ConfirmEmail } from '../../shared/view-model/confirm-email.model';
import { ProblemDetails } from '../../shared/view-model/default-response.model';

@Component({
    selector: "app-dashboard",
    templateUrl: "./confirm-email.component.html",
    providers: [UserService, TranslatorService]
})
export class ConfirmEmailComponent implements OnInit, OnDestroy {

    public confirmEmailSub: Subscription;
    public errors: Array<string>;
    public confirmEmail: ConfirmEmail;
    public showButtonLoading: boolean;
    public emailConfirmed: boolean;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authService: UserService, public translator: TranslatorService) {

    }

    public ngOnDestroy() {
        this.confirmEmailSub.unsubscribe();
    }

    public ngOnInit() {
        this.emailConfirmed = false;
        this.showButtonLoading = true;
        this.errors = [];
        this.confirmEmail = new ConfirmEmail();
        this.confirmEmailSub = this.route
            .queryParams
            .subscribe(params => {
                // Defaults to 0 if no query param provided.
                console.log(params);
                if (params == null || params.code == null || params.user == null) {
                    this.router.navigate(["/login"]);
                    return;
                }
                this.confirmEmail.code = params.code;
                this.authService.confirmEmail(params.user.toString(), this.confirmEmail).subscribe(
                    registerResult => {
                        if (registerResult.data.succeeded) this.emailConfirmed = true;
                        else registerResult.data.errors.forEach(i => this.errors.push(i.description));

                        this.showButtonLoading = false;
                        setTimeout(() => {
                            this.router.navigate(["/login"]);
                        }, 1000);
                    },
                    response => {
                        this.errors = [];
                        this.errors = ProblemDetails.GetErrors(response).map(a => a.value);
                        this.showButtonLoading = false;
                    }
                );
            });

    }
}
