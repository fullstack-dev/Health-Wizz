import { Injectable } from '@angular/core';
import { HttpService } from './http-service';
import { HwUser } from '../models/user';
import { TokenService } from './token-service';
import { Observable, BehaviorSubject, Subject } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
@Injectable()

export class UserService {
	public userIdSubject = new Subject<string>();
	public $userId = this.userIdSubject.asObservable();
	public loginSubject = new Subject<string>();
	public $loginObserver = this.loginSubject.asObservable();
	private baseUrl = '${}/profile';
	public isUserSession: boolean = null;
	public userProfile: any;
	public userId: string;
	public userProfilePic: any;
	public walletAddress: string;
	public _myPurse: any;
	constructor(
		private http: HttpService,
		private tokenService: TokenService
	) {
		// this.userIdObs = <BehaviorSubject<String>>new BehaviorSubject("");
	}

	// public isLoggedIn():Promise<boolean> {
	// 	let promise = new Promise((resolve, reject)=>{
	// 		resolve(this.tokenService.get() !== null);
	// 	})
	// 	return promise;
	// }

	// public getCurrentUser(): Observable<String> {
	// 	return this.userIdObs.asObservable();
	// }

	// public getUserSession(): Observable<String> {
	// 	return this.getCurrentUser()
	// 		.takeWhile(() => !this.isUserSession)
	// 		.skipWhile(user => {
	// 			if (this.userIdObs) {
	// 				this.isUserSession = true;
	// 			}
	// 			return this.userIdObs == undefined;
	// 		})
	// 		.take(1);
	// }

	// getRegistrationStage(): boolean {
	// 	let result: boolean;
	// 	this.user.subscribe(user => result = user.registrationState != 'complete');
	// 	return !result;
	// }

	// public canCompleteSignup(): Boolean {
	// 	let result = this.user.getValue().canCompleteSignup;
	// 	return result;
	// }

	// public pendingEmailConfirmation(): Boolean {
	// 	let result: Boolean;
	// 	this.user.subscribe(user => result = user.pendingEmailConfirmation);
	// 	result = this.user.getValue().pendingEmailConfirmation;
	// 	return result;
	// }

	// public load(): Observable<HwUser> {
	// 	let obs = this.http.get(this.baseUrl + '?token=' + this.tokenService.get())
	// 		.map(res => new HwUser(res.json()))
	// 		.share();

	// 	obs.subscribe(user => {
	// 		this.user.next(user);
	// 		//
	// 	});
	// 	return obs;
	// }

	// public update(user: HwUser): Observable<HwUser> {
	// 	let data = user.toJson();
	// 	let url = this.baseUrl + '?token=' + this.tokenService.get();
	// 	let obs = this.http.put(url, data)
	// 		.map(res => new HwUser(res.json()))
	// 		.share();

	// 	obs.subscribe(updatedUser => {
	// 		this.user.next(updatedUser);
	// 		//
	// 	},
	// 		err => {
	// 			return err;
	// 		});
	// 	return obs;
	// }

	// public logout() {
	// 	this.tokenService.reset();
	// 	this.user.next(new HwUser());
	// 	this.isUserSession = null;
	// 	return true;
	// }

	set myPurse(data: any) {
		this._myPurse = data;
	}

	get myPurse() {
		return this._myPurse;
	}

	public delete(user: HwUser) {
		return this.http.delete(this.baseUrl + '?token=' + this.tokenService.get())
			.map(res => res.json());
	}

	public setProfile(profile: any) {
		this.userProfile = profile;
	}

	public getProfile() {
		return this.userProfile;
	}

	public setProfilePic(picUrl: any) {
		this.userProfilePic = picUrl;
	}

	public getProfilePic() {
		return this.userProfilePic;
	}

	// public resolveUserId(userId: string) {
	// 	this.userIdSubject.next(userId);
	// }

	public setUserId(userId: string) {
		this.userId = userId;
		// this.userIdSubject.next(userId);
		this.updateLoginState(userId);
	}

	public getUserId() {
		return this.userId;
	}

	public updateLoginState(userId: string) {
		this.loginSubject.next(userId);
	}

}